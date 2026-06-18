#!/usr/bin/env npx tsx
/**
 * CCRPG CLI Game Runner — Phase 1
 * Comprehensive headless debugger that runs the full game loop without Phaser.
 * Routes ALL modalities through the AgenticOrchestrator for consistent behaviour.
 *
 * Usage:
 *   npx tsx scripts/cli-game.ts                          # interactive, fallback mode
 *   npx tsx scripts/cli-game.ts --headless               # automated, 20 encounters
 *   npx tsx scripts/cli-game.ts --model=gemma-4-31b-it  # override model
 *   npx tsx scripts/cli-game.ts --headless --json        # AI-agent feedback loop
 *   npx tsx scripts/cli-game.ts --mode=encounter         # single encounter
 *   npx tsx scripts/cli-game.ts --mode=diagnostic        # print system state
 *   npx tsx scripts/cli-game.ts --encounters=5           # custom encounter count
 *   npx tsx scripts/cli-game.ts --verbose                # show full narrative flow
 *   npx tsx scripts/cli-game.ts --json                   # machine-readable JSON output
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// ── Env bootstrap (must come before any project imports) ──────────────
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1]!;
        let val = match[2]!.trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch { /* ignore */ }

// Read --model flag early so it takes precedence over .env before polyfill
const earlyModelOverride = process.argv.slice(2).find(a => a.startsWith('--model='))?.split('=')[1];

// Polyfill import.meta.env for Node so LLMClient works
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_LLM_API_KEY || 'sk-placeholder';
const baseUrl = process.env.VITE_LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const model = earlyModelOverride || process.env.VITE_LLM_MODEL || 'gemma-4-31b-it';

(globalThis as any).import = {
  meta: {
    env: {
      VITE_LLM_BASE_URL: baseUrl,
      VITE_LLM_API_KEY: apiKey,
      VITE_LLM_MODEL: model,
    }
  }
};

// ── Project imports (after env bootstrap) ─────────────────────────────
import { bootRegistries } from '../src/core/registries/boot.js';
import { bootModuleRegistry } from '../src/core/assessments/bootModules.js';
import { createSignificator } from '../src/core/domain/Significator.js';
import { createInitialWorldState, type WorldState } from '../src/core/engines/CandidateGeneration.js';
import type { Significator } from '../src/core/domain/Significator.js';
import type { Line } from '../src/core/domain/Line.js';
import type { Stage } from '../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../src/core/domain/EncounterSpecNew.js';
import type { PlayerResponse } from '../src/core/engines/ConsequenceEngine.js';
import type { SessionContext } from '../src/core/engines/PriorityComputation.js';
import { startSession, tickWithStrategy, endSession, type SessionState } from '../src/core/GameLoop.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '../src/core/assessments/AgenticOrchestrator.js';
import type { ModuleRegistry } from '../src/core/assessments/registry.js';
import type { AskUserQuestionParams, AskUserQuestionResult, UserAnswer } from '../src/core/assessments/agentTypes.js';

import holonsJson from '../src/core/data/red-layer-holons.json';
import type { ConsequenceRecord } from '../src/core/domain/ConsequenceRecord.js';

// ── CLI arg parsing ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const getVal = (name: string): string | undefined =>
  args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];

const HEADLESS = flags.has('--headless');
const VERBOSE = flags.has('--verbose');
const JSON_MODE = flags.has('--json');
const LLM_ACTIVE = apiKey !== 'sk-placeholder';
const ACTIVE_MODEL = getVal('model') ?? model;
const mode = getVal('mode') ?? (flags.has('--mode') ? args[args.indexOf('--mode') + 1] : 'full') ?? 'full';
const encounterCount = parseInt(getVal('encounters') ?? '20', 10);

// ── Helpers ───────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  magenta: '\x1b[35m', cyan: '\x1b[36m', red: '\x1b[31m',
};

function banner(text: string): void {
  if (!JSON_MODE) console.log(`\n${C.bold}${C.cyan}═══ ${text} ═══${C.reset}`);
}

function info(label: string, value: string): void {
  if (!JSON_MODE) console.log(`  ${C.dim}${label}:${C.reset} ${value}`);
}

function success(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.green}✓${C.reset} ${text}`);
}

function warn(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.yellow}⚠${C.reset} ${text}`);
}

function error(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.red}✗${C.reset} ${text}`);
}

function separator(label: string): void {
  if (!JSON_MODE) console.log(`\n${C.bold}${C.blue}── ${label} ──${C.reset}`);
}

function verbose(label: string, value: string): void {
  if (VERBOSE && !JSON_MODE) console.log(`  ${C.magenta}${label}:${C.reset} ${value}`);
}

const rl = !HEADLESS ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const ask = (q: string): Promise<string> =>
  new Promise(resolve => rl!.question(q, resolve));

// ── Holon loading ─────────────────────────────────────────────────────
function loadHolons(): WorldState {
  const holons = holonsJson as any[];
  return createInitialWorldState(holons);
}

// ── Significator creation (simplified onboarding) ─────────────────────
function createDefaultSignificator(): Significator {
  const allRed: Record<Line, Stage> = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  };
  return createSignificator('cli-player', allRed, 'Red');
}

// ── JSON event emitter for AI-agent consumption ───────────────────────
function emitEvent(type: string, data: Record<string, unknown>): void {
  if (JSON_MODE) {
    process.stdout.write(JSON.stringify({ type, ts: Date.now(), ...data }) + '\n');
  }
}

// ── Print state ───────────────────────────────────────────────────────
function printSignificator(sig: Significator): void {
  info('id', sig.id);
  info('stage', sig.currentStage);
  info('encounters', String(sig.totalEncounters));
  info('sessions', String(sig.totalSessions));
  const lines = Object.entries(sig.altitudes).map(([l, s]) => `${l}:${s}`);
  info('altitudes', lines.join(', '));
}

function printEncounter(enc: ScheduledEncounter): void {
  info('module', enc.moduleRef);
  info('modality', enc.modality);
  info('holon', enc.holonSource);
  info('mode', enc.executionMode);
  info('priority', enc.priority.toFixed(3));
}

// ── AgenticOrchestrator encounter handler (all modalities) ────────────
async function runAgenticEncounter(
  encounter: ScheduledEncounter,
  sig: Significator,
  world: WorldState,
  history: ConsequenceRecord[],
): Promise<{
  outcome: import('../src/core/assessments/AgenticOrchestrator.js').OrchestratorResult;
  response: PlayerResponse;
  narrativeSummary: string;
}> {
  const uiHandler: AgenticUIHandler = {
    askUser: async (params: AskUserQuestionParams): Promise<AskUserQuestionResult> => {
      const answers: UserAnswer[] = [];

      for (const q of params.questions) {
        if (!JSON_MODE) {
          console.log(`\n  ${C.magenta}[${q.header}]${C.reset}`);
          console.log(`  ${C.bold}${q.question}${C.reset}`);
          if (q.options?.length) {
            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              console.log(`    ${C.cyan}[${i + 1}]${C.reset} ${opt.label} — ${opt.description}`);
            }
          }
        }

        emitEvent('ask_user', {
          header: q.header,
          question: q.question,
          options: q.options?.map((o, i) => ({ index: i + 1, label: o.label, description: o.description })),
          allowWriteIn: q.allowWriteIn,
        });

        if (HEADLESS) {
          answers.push({ selectedLabels: q.options?.[0] ? [q.options[0].label] : [] });
        } else {
          const promptText = q.multiSelect
            ? '\n  Select (comma-separated): '
            : '\n  Select: ';
          const answer = await ask(promptText);
          const selections = answer.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          const selectedLabels = selections
            .filter(n => n >= 1 && n <= (q.options?.length ?? 0))
            .map(n => q.options![n - 1]!.label);

          if (q.allowWriteIn || (!q.options?.length && answer.trim())) {
            answers.push({ selectedLabels, writeInValue: answer.trim() || undefined });
          } else {
            answers.push({ selectedLabels });
          }
        }
      }

      return { answers };
    }
  };

  // Always route through AgenticOrchestrator — it handles LLM + fallback internally
  // Look up the assessment module from the registry to inject into the LLM context
  const [encLine, encStage] = encounter.moduleRef.split(':') as [Line, Stage];
  const modRegistry = (globalThis as any).__moduleRegistry as ModuleRegistry | undefined;
  const module = modRegistry?.get(encLine, encStage);

  const orchestrator = new AgenticOrchestrator({
    encounter,
    significator: sig,
    world,
    history,
    conceptIndex: { modules: {} },
    uiHandler,
    module,
  });

  const outcome = await orchestrator.run();

  // Build a PlayerResponse from the orchestrator's consequence record
  const cr = outcome.consequenceRecord;
  const response: PlayerResponse = {
    encounterId: encounter.id,
    energeticDirection: cr.polarityTrace.energeticDirection,
    driveDirectionality: cr.polarityTrace.driveDirectionality,
    stageOrientation: cr.polarityTrace.stageOrientation,
    sourceOfNourishment: cr.polarityTrace.sourceOfNourishment,
    shadowSurfaced: cr.shadowSurfaced,
    shadowResolvedId: cr.shadowResolved,
    narrativeSummary: outcome.narrativeSummary,
  };

  return { outcome, response, narrativeSummary: outcome.narrativeSummary };
}

// ── Diagnostic mode ───────────────────────────────────────────────────
async function runDiagnostic(): Promise<void> {
  banner('CCRPG Diagnostic');

  console.log('\nRegistries:');
  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} assessment modules loaded`);

  console.log('\nHolons:');
  const world = loadHolons();
  const npcCount = world.holons.filter(h => h.kind === 'NPC').length;
  const factionCount = world.holons.filter(h => h.kind === 'Faction').length;
  const locationCount = world.holons.filter(h => h.kind === 'Location').length;
  success(`${world.holons.length} total: ${npcCount} NPCs, ${factionCount} factions, ${locationCount} locations`);

  console.log('\nSignificator:');
  const sig = createDefaultSignificator();
  printSignificator(sig);

  console.log('\nSession:');
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: encounterCount,
    recentLines: [],
  };
  const sessionState = startSession(sig, session);
  info('CCI', sessionState.cci.composite.toFixed(4));
  info('theme', sessionState.strategy.theme);
  info('totalTarget', String(sessionState.strategy.encounterBudget.totalTarget));

  console.log('\nEncounter scheduling:');
  const now = Date.now();
  const { tickResult } = tickWithStrategy(sig, world, session, sessionState, null, null, now);
  if (tickResult.encounter) {
    success('Scheduler produced encounter:');
    printEncounter(tickResult.encounter);
  } else {
    warn('Scheduler returned null — no encounters available');
  }

  console.log(`\n${C.dim}LLM: ${LLM_ACTIVE ? 'active' : 'fallback (placeholder key)'} | Endpoint: ${baseUrl} | Model: ${model}${C.reset}`);
  console.log(`${C.dim}LLM endpoint: ${baseUrl}${C.reset}`);
  console.log(`${C.dim}LLM model: ${model}${C.reset}`);
}

// ── Single encounter mode ─────────────────────────────────────────────
async function runSingleEncounter(): Promise<void> {
  banner('CCRPG Single Encounter');

  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} modules loaded`);

  const sig = createDefaultSignificator();
  const world = loadHolons();
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 1,
    recentLines: [],
  };
  const sessionState = startSession(sig, session);

  const now = Date.now();
  const { tickResult } = tickWithStrategy(sig, world, session, sessionState, null, null, now);

  if (!tickResult.encounter) {
    error('No encounter available');
    return;
  }

  separator('Encounter');
  printEncounter(tickResult.encounter);

  const result = await runAgenticEncounter(tickResult.encounter, sig, world, []);

  separator('Result');
  info('narrative', result.narrativeSummary);
}

// ── Full session mode ─────────────────────────────────────────────────
async function runFullSession(): Promise<void> {
  banner('CCRPG Session Runner');

  // Boot
  if (!JSON_MODE) console.log('\n[1/4] Booting registries...');
  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} assessment modules loaded`);

  // Holons
  if (!JSON_MODE) console.log('\n[2/4] Loading world...');
  const world = loadHolons();
  const npcCount = world.holons.filter(h => h.kind === 'NPC').length;
  success(`${world.holons.length} holons (${npcCount} NPCs)`);

  // Significator
  if (!JSON_MODE) console.log('\n[3/4] Creating Significator...');
  const sig = createDefaultSignificator();
  printSignificator(sig);

  // Session
  if (!JSON_MODE) console.log('\n[4/4] Starting session...');
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: encounterCount,
    recentLines: [],
  };
  let sessionState = startSession(sig, session);

  banner('SESSION START');
  info('CCI', sessionState.cci.composite.toFixed(4));
  info('theme', sessionState.strategy.theme);
  info('target', `${encounterCount} encounters`);

  emitEvent('session_started', {
    cci: sessionState.cci.composite,
    theme: sessionState.strategy.theme,
    targetEncounters: encounterCount,
  });

  let currentSig = sig;
  let currentWorld = world;
  let completedCount = 0;
  const now = Date.now();
  let prevEncounter: ScheduledEncounter | null = null;
  let prevResponse: PlayerResponse | null = null;
  const history: ConsequenceRecord[] = [];

  for (let i = 0; i < encounterCount; i++) {
    separator(`Encounter ${i + 1}/${encounterCount}`);

    // Feed back the PREVIOUS encounter's response to apply consequences
    const { tickResult, sessionState: newState } = tickWithStrategy(
      currentSig,
      currentWorld,
      { ...session, encountersSoFar: i, sessionDurationMs: i * 5000 },
      sessionState,
      prevResponse,
      prevEncounter,
      now + i * 5000,
    );

    currentSig = tickResult.sig;
    currentWorld = tickResult.world;
    sessionState = newState;

    if (!tickResult.encounter) {
      warn('No encounter available — skipping');
      prevEncounter = null;
      prevResponse = null;
      continue;
    }

    printEncounter(tickResult.encounter);

    // Run encounter through AgenticOrchestrator (all modalities)
    try {
      const result = await runAgenticEncounter(
        tickResult.encounter, currentSig, currentWorld, history,
      );

      // Apply consequences from the orchestrator result
      const record = result.outcome.consequenceRecord;
      history.push(record);
      currentSig = result.outcome.updatedSig;
      currentWorld = result.outcome.updatedWorld;

      prevEncounter = tickResult.encounter;
      prevResponse = result.response;

      verbose('narrative', result.narrativeSummary);
      if (VERBOSE) {
        verbose('feedback', result.outcome.finalResult.passed ? 'passed' : 'failed');
        verbose('updatedEncounters', String(currentSig.totalEncounters));
      }

      emitEvent('encounter_completed', {
        encounter: tickResult.encounter.id,
        modality: tickResult.encounter.modality,
        module: tickResult.encounter.moduleRef,
        passed: result.outcome.finalResult.passed,
        narrative: result.narrativeSummary,
        totalEncounters: currentSig.totalEncounters,
      });

      completedCount++;
    } catch (err: any) {
      error(`Encounter failed: ${err.message || err}`);
      emitEvent('encounter_error', { encounter: tickResult.encounter.id, error: err.message });
    }

    // Check transformation
    if (tickResult.transformation) {
      if (!JSON_MODE) console.log(`\n  ${C.magenta}⚡ TRANSFORMATION: ${tickResult.transformation.targetStage}${C.reset}`);
      emitEvent('transformation', { targetStage: tickResult.transformation.targetStage, readiness: tickResult.transformation.readiness });
    }

    // Only show bleed-through for the first encounter (subsequent ones are verbose)
    if (i === 0 && tickResult.bleedThrough.length > 0) {
      info('bleedThrough (first 10)', tickResult.bleedThrough.slice(0, 10).join(', ') + `... (${tickResult.bleedThrough.length} total)`);
    }
  }

  // Session end — apply theta-decay and persist
  const sessionEnd = endSession(currentSig, sessionState, now + encounterCount * 5000);

  banner('SESSION END');
  info('encounters completed', String(completedCount));
  info('total encounters', String(currentSig.totalEncounters));
  info('total sessions', String(sessionEnd.sig.totalSessions));
  info('shadows surfaced', String(sessionEnd.summary.shadowsSurfaced));
  info('shadows resolved', String(sessionEnd.summary.shadowsResolved));

  if (VERBOSE) {
    console.log('\nFinal Significator:');
    printSignificator(sessionEnd.sig);
  }

  emitEvent('session_ended', {
    encountersCompleted: completedCount,
    totalEncounters: currentSig.totalEncounters,
    totalSessions: sessionEnd.sig.totalSessions,
    shadowsSurfaced: sessionEnd.summary.shadowsSurfaced,
    shadowsResolved: sessionEnd.summary.shadowsResolved,
    finalStage: sessionEnd.sig.currentStage,
  });
}

// ── Main ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (!JSON_MODE) {
    console.log(`\n${C.bold}CCRPG CLI Game Runner${C.reset}`);
    console.log(`${C.dim}Mode: ${mode} | Headless: ${HEADLESS} | LLM: ${LLM_ACTIVE ? 'active' : 'fallback'} | Model: ${ACTIVE_MODEL} | Verbose: ${VERBOSE} | JSON: ${JSON_MODE}${C.reset}`);
  }

  try {
    switch (mode) {
      case 'diagnostic':
        await runDiagnostic();
        break;
      case 'encounter':
        await runSingleEncounter();
        break;
      case 'session':
      case 'full':
      default:
        await runFullSession();
        break;
    }
  } catch (err: any) {
    error(`Fatal: ${err.message || err}`);
    if (!JSON_MODE) console.error(err.stack);
    emitEvent('fatal', { error: err.message, stack: err.stack });
  } finally {
    rl?.close();
  }
}

main();
