/**
 * gameEngine — Svelte-side gameplay service.
 *
 * Wraps the pure-TypeScript core/ engines (GameLoop, EncounterScheduler,
 * AgenticOrchestrator, ConsequenceEngine) into a Svelte-friendly service
 * with reactive state. This is the Svelte replacement for Phaser's
 * main.ts + scene registry.
 *
 * Responsibilities:
 *   1. Boot: load Significator + WorldState from SaveRepository
 *   2. Session: start a session (compute CCI, strategy)
 *   3. Schedule: produce the next 3 encounters
 *   4. Run: execute an encounter via AgenticOrchestrator
 *   5. Apply: persist the result back to Significator + WorldState
 *   6. Persist: save to localStorage + cloud sync
 *
 * The UI calls these methods; the engine emits state changes via gameStore.
 */

import { writable, get } from 'svelte/store';
import type { Significator } from '$core/domain/Significator.js';
import type { WorldState } from '$core/engines/CandidateGeneration.js';
import type { ScheduledEncounter } from '$core/domain/EncounterSpecNew.js';
import type { SessionContext } from '$core/engines/PriorityComputation.js';
import type { SessionState } from '$core/GameLoop.js';
import type { OrchestratorResult, AgenticUIHandler } from '$core/assessments/AgenticOrchestrator.js';
import { startSession, applyResponseOnly } from '$core/GameLoop.js';
import { scheduleNextWithHolonicReturn } from '$core/engines/EncounterScheduler.js';
import { createModuleTaskTypesProvider } from '$core/engines/CandidateGeneration.js';
import { DEFAULT_WEIGHTS } from '$core/engines/PriorityComputation.js';
import { AgenticOrchestrator } from '$core/assessments/AgenticOrchestrator.js';
import { bootModuleRegistry } from '$core/assessments/bootModules.js';
import { SaveRepository } from '$infra/persistence/SaveRepository.js';
import { createKeyValueStore } from '$infra/persistence/createKeyValueStore.js';
import { setSignificator, setLastEncounter } from '$lib/stores/gameStore.js';
import { debouncedSync, flushSync } from '$lib/stores/cloudSyncStore.js';

// ─── Engine state ────────────────────────────────────────────────────

interface EngineState {
  bootstrapped: boolean;
  significator: Significator | null;
  world: WorldState | null;
  session: SessionState | null;
  encounters: ScheduledEncounter[];
  activeEncounter: ScheduledEncounter | null;
  activeOrchestrator: AgenticOrchestrator | null;
  lastResult: OrchestratorResult | null;
  error: string | null;
}

export const engineStore = writable<EngineState>({
  bootstrapped: false,
  significator: null,
  world: null,
  session: null,
  encounters: [],
  activeEncounter: null,
  activeOrchestrator: null,
  lastResult: null,
  error: null,
});

let saveRepo: SaveRepository | null = null;
let moduleTaskTypesProvider: ((moduleRef: string) => Set<string> | undefined) | null = null;
let moduleRegistry: ReturnType<typeof bootModuleRegistry> | null = null;

// ─── Boot ────────────────────────────────────────────────────────────

/**
 * Boot the engine: load Significator + WorldState from persistence.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function bootEngine(): Promise<void> {
  if (get(engineStore).bootstrapped) return;

  try {
    saveRepo = new SaveRepository(createKeyValueStore());

    // Boot module registry (64 assessment modules)
    moduleRegistry = bootModuleRegistry();
    moduleTaskTypesProvider = createModuleTaskTypesProvider(
      (line: string, stage: string) => moduleRegistry?.get(line as never, stage as never),
    );

    // Load Significator + WorldState
    const sig = await saveRepo.loadProfile();
    const world = await saveRepo.loadWorldState();

    if (sig) {
      setSignificator(sig);
    }

    engineStore.update((s) => ({
      ...s,
      bootstrapped: true,
      significator: sig,
      world,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    engineStore.update((s) => ({ ...s, error: `Boot failed: ${msg}` }));
    console.error('[gameEngine] boot failed:', err);
  }
}

// ─── Session ─────────────────────────────────────────────────────────

/**
 * Start a new session. Computes CCI, generates strategy.
 */
export function startGameSession(): void {
  const { significator, world } = get(engineStore);
  if (!significator || !world) {
    engineStore.update((s) => ({ ...s, error: 'Cannot start session: no Significator or WorldState' }));
    return;
  }

  const sessionContext: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 5,
    recentLines: [],
  };

  const session = startSession(significator, sessionContext);
  engineStore.update((s) => ({ ...s, session }));
  scheduleEncounters();
}

/**
 * Schedule the next 3 encounters.
 */
export function scheduleEncounters(): void {
  const { significator, world, session } = get(engineStore);
  if (!significator || !world || !session) return;

  const now = Date.now();
  const encounters = scheduleNextWithHolonicReturn(
    significator,
    world,
    {
      encountersSoFar: session.recentOutcomes.length,
      sessionDurationMs: now - (session.sessionStartMs ?? now),
      targetSessionLength: 5,
      recentLines: [],
    },
    now,
    3,
    DEFAULT_WEIGHTS,
    undefined,
    moduleTaskTypesProvider ?? undefined,
    session.userMatrixModel,
    session.encountersSinceRefresh,
  );

  engineStore.update((s) => ({ ...s, encounters }));
}

// ─── Encounter execution ─────────────────────────────────────────────

/**
 * Run an encounter via the AgenticOrchestrator. The UI handler is called
 * whenever the orchestrator needs to ask the user a question.
 *
 * Returns the orchestrator result (updated sig, world, scores, feedback).
 */
export async function runEncounter(
  encounter: ScheduledEncounter,
  uiHandler: AgenticUIHandler,
  options: { noLlm?: boolean; forceShadow?: string } = {},
): Promise<OrchestratorResult> {
  const { significator, world } = get(engineStore);
  if (!significator || !world) {
    throw new Error('Cannot run encounter: no Significator or WorldState');
  }

  setLastEncounter(encounter.id);
  engineStore.update((s) => ({ ...s, activeEncounter: encounter, error: null }));

  try {
    const orchestrator = new AgenticOrchestrator({
      encounter,
      significator,
      world,
      history: [],
      conceptIndex: null,
      uiHandler,
      noLlm: options.noLlm ?? false,
      forceShadow: options.forceShadow,
    });

    engineStore.update((s) => ({ ...s, activeOrchestrator: orchestrator }));
    const result = await orchestrator.run();

    // Apply the result to sig + world + session
    await applyEncounterResult(encounter, result);

    engineStore.update((s) => ({
      ...s,
      activeOrchestrator: null,
      activeEncounter: null,
      lastResult: result,
    }));

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    engineStore.update((s) => ({
      ...s,
      activeOrchestrator: null,
      activeEncounter: null,
      error: `Encounter failed: ${msg}`,
    }));
    throw err;
  }
}

/**
 * Apply an encounter result: update sig, world, session; persist.
 */
async function applyEncounterResult(
  encounter: ScheduledEncounter,
  result: OrchestratorResult,
): Promise<void> {
  const state = get(engineStore);
  if (!state.significator || !state.world || !state.session) return;

  const playerResponse = {
    encounterId: encounter.id,
    narrativeSummary: result.narrativeSummary,
    driveDirectionality: extractDriveDirectionality(result),
    shadowSurfaced: result.consequenceRecord.shadowSurfaced ?? null,
    shadowResolvedId: result.consequenceRecord.shadowResolved ?? null,
    energeticDirection: 'Sovereign' as const,
    stageOrientation: 'Homeostatic' as const,
    sourceOfNourishment: 'Ambivalent' as const,
  };

  const { sig: newSig, world: newWorld, sessionState: newSession } = applyResponseOnly(
    state.significator,
    state.world,
    state.session,
    playerResponse,
    encounter,
    Date.now(),
  );

  if (saveRepo) {
    await saveRepo.saveProfile(newSig);
    await saveRepo.saveWorldState(newWorld);
  }

  setSignificator(newSig);
  debouncedSync(newSig);

  engineStore.update((s) => ({
    ...s,
    significator: newSig,
    world: newWorld,
    session: newSession,
  }));

  scheduleEncounters();
}

function extractDriveDirectionality(result: OrchestratorResult): {
  Agency: 'HealthyBalanced' | 'DarkAddicted' | 'DarkAverted' | 'GoldenAddicted' | 'GoldenAverted';
  Communion: 'HealthyBalanced' | 'DarkAddicted' | 'DarkAverted' | 'GoldenAddicted' | 'GoldenAverted';
  Eros: 'HealthyBalanced' | 'DarkAddicted' | 'DarkAverted' | 'GoldenAddicted' | 'GoldenAverted';
  Agape: 'HealthyBalanced' | 'DarkAddicted' | 'DarkAverted' | 'GoldenAddicted' | 'GoldenAverted';
} {
  const ds = result.driveScores;
  const map = (score: number): 'DarkAddicted' | 'HealthyBalanced' | 'GoldenAddicted' =>
    score < 0.4 ? 'DarkAddicted' : score > 0.85 ? 'GoldenAddicted' : 'HealthyBalanced';

  return {
    Agency: map(ds?.agency ?? 0.5),
    Communion: map(ds?.communion ?? 0.5),
    Eros: map(ds?.eros ?? 0.5),
    Agape: map(ds?.agape ?? 0.5),
  };
}

// ─── Decline encounter ──────────────────────────────────────────────

export async function declineEncounter(encounter: ScheduledEncounter): Promise<void> {
  engineStore.update((s) => ({
    ...s,
    encounters: s.encounters.filter((e) => e.id !== encounter.id),
  }));
  const { encounters } = get(engineStore);
  if (encounters.length < 3) {
    scheduleEncounters();
  }
}

// ─── Flush on unload ────────────────────────────────────────────────

export async function flushEngine(): Promise<void> {
  const { significator } = get(engineStore);
  if (significator) {
    await flushSync(significator);
  }
}
