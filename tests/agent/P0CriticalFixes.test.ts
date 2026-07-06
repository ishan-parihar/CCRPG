/**
 * P0 Critical Fix Regression Tests
 *
 * Tests for the 8 P0 fixes from AGENTIC-SYSTEM-AUDIT.md:
 * P0-1: advanceTransformation no longer double-counts
 * P0-2: no phantom 'avoided' outcomes from scheduling tick
 * P0-3: endSessionAsync awaits TDG hook
 * P0-5: saveAll / loadAll / deleteAllSaves atomic save
 * P0-7: startSession reconstructs transformationState from sig
 * P0-8: ccrpg_select_encounter uses pool + supports executionMode override
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { startSession, tickWithStrategy, applyResponseOnly, endSession, endSessionAsync } from '../../src/core/GameLoop.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { createInitialWorldState } from '../../src/core/engines/CandidateGeneration.js';
import type { PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';
import { reconstructTransformationState } from '../../src/core/engines/TransformationDetector.js';
import { executeCCRPGTool, type ToolContext } from '../../src/core/agent/tools/CCRPGTools.js';
import { saveAll, loadAll, deleteAllSaves, saveGame, saveWorldState } from '../../src/infra/persistence/SaveRepository.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Line } from '../../src/core/domain/Line.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeSig(id = 'p0-player'): ReturnType<typeof createSignificator> {
  return createSignificator(id, makeAltitudes('Red'), 'Red');
}

function makeSession() {
  return { encountersSoFar: 0, sessionDurationMs: 0, targetSessionLength: 10, recentLines: [] };
}

function makeEncounter(): ScheduledEncounter {
  return {
    id: 'p0-enc-1',
    moduleRef: 'Cognitive:Red',
    modality: 'LanguageReflective',
    targetLines: ['Cognitive'],
    stage: 'Red',
    holonSource: 'Cognitive:Red',
    shadowTarget: null,
    polarityMode: 'Exploring',
    difficulty: 0.5,
    sessionPosition: 'peak',
    priority: 0.5,
    driveTarget: null,
    executionMode: 'capacity',
  };
}

function makeResponse(encounterId = 'p0-enc-1'): PlayerResponse {
  return {
    encounterId,
    energeticDirection: 'Radiative',
    driveDirectionality: {
      Agency: 'HealthyBalanced', Communion: 'HealthyBalanced',
      Eros: 'HealthyBalanced', Agape: 'HealthyBalanced',
    },
    stageOrientation: 'Homeostatic',
    sourceOfNourishment: 'Ambivalent',
    shadowSurfaced: null,
    shadowResolvedId: null,
    narrativeSummary: 'P0 test response.',
  };
}

// ─── P0-1: advanceTransformation no longer double-counts ─────────────

describe('P0-1: advanceTransformation no longer double-counts', () => {
  it('tickWithStrategy(response=null) does NOT advance transformation state', () => {
    const sig = makeSig('p0-1-no-advance');
    const world = createInitialWorldState([]);
    let sessionState = startSession(sig, makeSession());

    // Set the sig to have a non-idle transformation phase
    const sigWithPhase = { ...sig, transformationPhase: 'threshold' as const, transformationSessionsInPhase: 2 };
    sessionState = { ...sessionState, transformationState: reconstructTransformationState(sigWithPhase) };

    const beforePhase = sessionState.transformationState.phase;
    const beforeSessions = sessionState.transformationState.sessionsInPhase;

    // Scheduling-only tick (response=null)
    const { sessionState: newState } = tickWithStrategy(sigWithPhase, world, makeSession(), sessionState, null, null, Date.now());

    // The transformation state should NOT have advanced
    expect(newState.transformationState.phase).toBe(beforePhase);
    expect(newState.transformationState.sessionsInPhase).toBe(beforeSessions);
  });

  it('applyResponseOnly DOES advance transformation state (single advance per encounter)', () => {
    const sig = makeSig('p0-1-single-advance');
    const world = createInitialWorldState([]);
    let sessionState = startSession(sig, makeSession());

    // Start at 'threshold' with sessionsInPhase=0. After ONE advance, it should
    // go to sessionsInPhase=1 (still 'threshold'). After TWO advances, it would
    // transition to 'unravelling' with sessionsInPhase=0. We verify that
    // applyResponseOnly advances exactly ONCE — the state should be
    // 'threshold' with sessionsInPhase=1, NOT 'unravelling' (which would
    // indicate a double-advance).
    const sigWithPhase = { ...sig, transformationPhase: 'threshold' as const, transformationSessionsInPhase: 0 };
    sessionState = { ...sessionState, transformationState: reconstructTransformationState(sigWithPhase) };

    const encounter = makeEncounter();
    const response = makeResponse();

    const result = applyResponseOnly(sigWithPhase, world, sessionState, response, encounter, Date.now());

    // After a single advance from (threshold, sessionsInPhase=0):
    //   - sessionsInPhase increments to 1 (still 'threshold', since sessionsInPhase < 1 is false now but >= 1 triggers unravelling)
    // Actually: threshold with sessionsInPhase=0 → sessionsInPhase becomes 1 (the +1 branch).
    // With sessionsInPhase=1 → transitions to unravelling (the >= 1 branch).
    // So after ONE advance from 0: phase='threshold', sessionsInPhase=1.
    // After TWO advances from 0: phase='unravelling', sessionsInPhase=0.
    // We verify we're at phase='threshold' sessionsInPhase=1 (single advance).
    expect(result.sessionState.transformationState.phase).toBe('threshold');
    expect(result.sessionState.transformationState.sessionsInPhase).toBe(1);
  });
});

// ─── P0-2: no phantom 'avoided' outcomes from scheduling tick ─────────

describe('P0-2: no phantom avoided outcomes from scheduling tick', () => {
  it('tickWithStrategy(response=null) does NOT push avoided to recentOutcomes', () => {
    const sig = makeSig('p0-2-no-phantom');
    const world = createInitialWorldState([]);
    const sessionState = startSession(sig, makeSession());

    const { sessionState: newState } = tickWithStrategy(sig, world, makeSession(), sessionState, null, null, Date.now());

    // recentOutcomes should be empty (no phantom 'avoided' entry)
    expect(newState.recentOutcomes.length).toBe(0);
  });

  it('tickWithStrategy(response) DOES push completed to recentOutcomes', () => {
    const sig = makeSig('p0-2-completed');
    const world = createInitialWorldState([]);
    const sessionState = startSession(sig, makeSession());
    const encounter = makeEncounter();
    const response = makeResponse();

    const { sessionState: newState } = tickWithStrategy(sig, world, makeSession(), sessionState, response, encounter, Date.now());

    // Should have exactly 1 'completed' outcome
    expect(newState.recentOutcomes.length).toBe(1);
    expect(newState.recentOutcomes[0]!.outcome).toBe('completed');
  });
});

// ─── P0-3: endSessionAsync awaits TDG hook ───────────────────────────

describe('P0-3: endSessionAsync awaits TDG hook', () => {
  it('endSessionAsync resolves without throw when TDG is not running', async () => {
    const sig = makeSig('p0-3-async');
    const sessionState = startSession(sig, makeSession());

    // P2-1 (UX-R3): endSession now only increments totalSessions when at
    // least one encounter completed. Add a completed outcome so the count
    // advances — this matches the corrected semantics (a session with no
    // activity shouldn't count).
    sessionState.recentOutcomes.push({
      outcome: 'completed' as const,
      quality: 0.7,
      mode: 'capacity' as const,
      shadowIntegrated: false,
    });

    // Should resolve (not reject) — TDG is not running in test env
    const result = await endSessionAsync(sig, sessionState, Date.now());
    expect(result.sig.totalSessions).toBe(sig.totalSessions + 1);
    expect(result.summary).toBeDefined();
  });

  it('endSession (sync) still works for non-TDG callers', () => {
    const sig = makeSig('p0-3-sync');
    const sessionState = startSession(sig, makeSession());

    // P2-1 (UX-R3): same as above — add a completed outcome.
    sessionState.recentOutcomes.push({
      outcome: 'completed' as const,
      quality: 0.7,
      mode: 'capacity' as const,
      shadowIntegrated: false,
    });

    const result = endSession(sig, sessionState, Date.now());
    expect(result.sig.totalSessions).toBe(sig.totalSessions + 1);
  });

  it('P2-1: endSession does NOT increment totalSessions when no encounters completed', () => {
    const sig = makeSig('p0-3-empty');
    const sessionState = startSession(sig, makeSession());
    // No recentOutcomes — session was a no-op (e.g. all encounters crashed).

    const result = endSession(sig, sessionState, Date.now());
    expect(result.sig.totalSessions).toBe(sig.totalSessions); // unchanged
  });
});

// ─── P0-5: Atomic save ───────────────────────────────────────────────

describe('P0-5: Atomic save (saveAll / loadAll / deleteAllSaves)', () => {
  // NOTE: SaveRepository computes CLI_SAVE_DIR at module-load time from
  // os.homedir(), so we can't mock HOME per-test. Instead we use the real
  // save dir, clean up before/after each test, and use unique sig IDs.
  const realSaveDir = path.join(os.homedir(), '.ccrpg');

  beforeEach(() => {
    // Clean any existing saves before each test
    deleteAllSaves();
  });

  afterEach(() => {
    // Clean up after each test so we don't leave test artifacts
    deleteAllSaves();
  });

  it('saveAll writes a single atomic envelope + backward-compat files', () => {
    const sig = makeSig('p0-5-save');
    const world = createInitialWorldState([]);

    saveAll(sig, world);

    // Atomic envelope should exist
    const envelopePath = path.join(realSaveDir, 'save-all.json');
    expect(fs.existsSync(envelopePath)).toBe(true);

    // Backward-compat files should also exist
    const savePath = path.join(realSaveDir, 'save.json');
    const worldPath = path.join(realSaveDir, 'world.json');
    expect(fs.existsSync(savePath)).toBe(true);
    expect(fs.existsSync(worldPath)).toBe(true);
  });

  it('loadAll reads the atomic envelope and returns both sig + world', () => {
    const sig = makeSig('p0-5-load');
    const world = createInitialWorldState([]);

    saveAll(sig, world);
    const loaded = loadAll();

    expect(loaded).not.toBeNull();
    expect(loaded!.sig.id).toBe(sig.id);
    expect(loaded!.world).toBeDefined();
  });

  it('loadAll falls back to individual files when envelope does not exist', () => {
    const sig = makeSig('p0-5-fallback');
    const world = createInitialWorldState([]);

    // Write individual files only (no saveAll → no envelope)
    saveGame(sig);
    saveWorldState(world);

    // Verify the envelope does NOT exist (only individual files)
    const envelopePath = path.join(realSaveDir, 'save-all.json');
    expect(fs.existsSync(envelopePath)).toBe(false);

    const loaded = loadAll();
    expect(loaded).not.toBeNull();
    expect(loaded!.sig.id).toBe(sig.id);
  });

  it('deleteAllSaves removes the atomic envelope + individual files', () => {
    const sig = makeSig('p0-5-delete');
    const world = createInitialWorldState([]);

    saveAll(sig, world);
    deleteAllSaves();

    const envelopePath = path.join(realSaveDir, 'save-all.json');
    const savePath = path.join(realSaveDir, 'save.json');
    const worldPath = path.join(realSaveDir, 'world.json');

    expect(fs.existsSync(envelopePath)).toBe(false);
    expect(fs.existsSync(savePath)).toBe(false);
    expect(fs.existsSync(worldPath)).toBe(false);
  });
});

// ─── P0-7: startSession reconstructs transformationState from sig ───

describe('P0-7: startSession reconstructs transformationState from sig', () => {
  it('reconstructs mid-crucible state from persisted sig fields', () => {
    const sig = makeSig('p0-7-crucible');
    // Simulate a sig that was mid-crucible when the player last exited
    const sigWithCrucible = {
      ...sig,
      transformationPhase: 'crucible' as const,
      transformationSessionsInPhase: 3,
      transformationKnotsResolved: 1,
      transformationTotalKnots: 2,
      transformationTargetStage: 'Amber' as Stage,
    };

    const sessionState = startSession(sigWithCrucible, makeSession());

    // The transformation state should be reconstructed, NOT fresh 'idle'
    expect(sessionState.transformationState.phase).toBe('crucible');
    expect(sessionState.transformationState.sessionsInPhase).toBe(3);
    expect(sessionState.transformationState.knotsResolved).toBe(1);
    expect(sessionState.transformationState.totalKnots).toBe(2);
    expect(sessionState.transformationState.targetStage).toBe('Amber');
  });

  it('falls back to idle when sig has no transformation fields', () => {
    const sig = makeSig('p0-7-idle');
    const sessionState = startSession(sig, makeSession());

    expect(sessionState.transformationState.phase).toBe('idle');
    expect(sessionState.transformationState.sessionsInPhase).toBe(0);
  });

  it('reconstructTransformationState validates phase against known values', () => {
    const sig = makeSig('p0-7-invalid');
    const sigWithInvalidPhase = { ...sig, transformationPhase: 'INVALID_PHASE' };

    const state = reconstructTransformationState(sigWithInvalidPhase);

    // Invalid phase falls back to 'idle'
    expect(state.phase).toBe('idle');
  });
});

// ─── P0-8: ccrpg_select_encounter uses pool + supports executionMode ─

describe('P0-8: ccrpg_select_encounter uses pool + supports executionMode', () => {
  it('selects from the pool, preserving scheduler-provided fields', async () => {
    const sig = makeSig('p0-8-pool');
    const world = createInitialWorldState([]);

    // Build a pool with a shadow-mode encounter
    const pooledEncounter: ScheduledEncounter = {
      ...makeEncounter(),
      executionMode: 'shadow',
      shadowTarget: 'DarkAddiction',
      difficulty: 0.8,
      sessionPosition: 'peak',
      priority: 0.9,
      driveTarget: 'Agency',
    };

    let selectedEnc: ScheduledEncounter | null = null;
    const ctx: ToolContext = {
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [] },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      selectedEncounter: null,
      onEncounterSelected: (enc) => { selectedEnc = enc; },
      onEncounterComplete: () => {},
      encounterPool: [pooledEncounter],
    };

    const result = await executeCCRPGTool('ccrpg_select_encounter', {
      moduleRef: 'Cognitive:Red',
    }, ctx);
    const parsed = JSON.parse(result);

    expect(parsed.status).toBe('selected');
    expect(parsed.source).toBe('pool');
    expect(parsed.executionMode).toBe('shadow');
    expect(parsed.shadowTarget).toBe('DarkAddiction');
    expect(selectedEnc).not.toBeNull();
    expect(selectedEnc!.executionMode).toBe('shadow');
    expect(selectedEnc!.shadowTarget).toBe('DarkAddiction');
    expect(selectedEnc!.difficulty).toBe(0.8);
  });

  it('agent can override executionMode to shadow', async () => {
    const sig = makeSig('p0-8-override');
    const world = createInitialWorldState([]);

    // Pool has a capacity-mode encounter
    const pooledEncounter: ScheduledEncounter = {
      ...makeEncounter(),
      executionMode: 'capacity',
    };

    let selectedEnc: ScheduledEncounter | null = null;
    const ctx: ToolContext = {
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [] },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      selectedEncounter: null,
      onEncounterSelected: (enc) => { selectedEnc = enc; },
      onEncounterComplete: () => {},
      encounterPool: [pooledEncounter],
    };

    await executeCCRPGTool('ccrpg_select_encounter', {
      moduleRef: 'Cognitive:Red',
      executionMode: 'shadow',
    }, ctx);

    // The agent's override should be applied
    expect(selectedEnc).not.toBeNull();
    expect(selectedEnc!.executionMode).toBe('shadow');
  });

  it('falls back to synthesized encounter when moduleRef not in pool', async () => {
    const sig = makeSig('p0-8-fallback');
    const world = createInitialWorldState([]);

    let selectedEnc: ScheduledEncounter | null = null;
    const ctx: ToolContext = {
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [] },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      selectedEncounter: null,
      onEncounterSelected: (enc) => { selectedEnc = enc; },
      onEncounterComplete: () => {},
      encounterPool: [], // empty pool
    };

    const result = await executeCCRPGTool('ccrpg_select_encounter', {
      moduleRef: 'Cognitive:Red',
    }, ctx);
    const parsed = JSON.parse(result);

    expect(parsed.status).toBe('selected');
    expect(parsed.source).toBe('synthesized');
    expect(selectedEnc).not.toBeNull();
  });
});
