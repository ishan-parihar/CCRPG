/**
 * TrainingRuntime — CLI-side bootstrap for the brain-training subsystem.
 * Owns the service singletons (calibration, trials, cognitive index) over
 * the file-backed KV store, exposes the GameRunnerPort used by
 * run_brain_game, and implements the `train` / `insights` commands.
 *
 * Veil rule: `insights` renders felt-sense language only. Raw numbers stay
 * behind --dev (same convention as glossary --full).
 */
import chalk from 'chalk';
import { Command } from 'commander';
import { FileKeyValueStore } from '../infra/persistence/FileKeyValueStore.js';
import type { KeyValueStore } from '../infra/persistence/KeyValueStore.js';
import { CalibrationStore } from '../core/adaptive/CalibrationStore.js';
import { TrialRecordStore } from '../core/braingame/TrialRecordStore.js';
import { CognitiveIndex, type CognitiveIndexState } from '../core/training/CognitiveIndex.js';
import { planWorkout, FatigueMonitor } from '../core/training/WorkoutPlanner.js';
import { getParadigm } from '../core/braingame/registry.js';
import type { Line } from '../core/domain/Line.js';
import type { TrialRecord } from '../core/braingame/types.js';
import {
  resolveStartLevel,
  type GameRunnerPort,
  type TrainingIntegration,
  type TrainingServices,
} from '../core/assessments/trainingTools.js';
import { runInteractiveGame, trainFree } from './BrainGameCli.js';

const INDEX_KEY = 'cogidx:v1';

let cached: TrainingServices & { kv: KeyValueStore } | null = null;

async function services() {
  if (!cached) {
    const kv = new FileKeyValueStore();
    const calibration = new CalibrationStore(kv);
    const trials = new TrialRecordStore(kv);
    const index = new CognitiveIndex();
    try {
      const raw = await kv.get(INDEX_KEY);
      if (raw) index.load(JSON.parse(raw) as CognitiveIndexState);
    } catch { /* fresh index */ }
    cached = { kv, calibration, trials, index, now: () => Date.now(), persistIndex };
  }
  return cached;
}

/** Persist the index after mutations (called by tool handlers). */
async function persistIndex(): Promise<void> {
  if (!cached) return;
  await cached.kv.set(INDEX_KEY, JSON.stringify(cached.index.getState()));
}

/**
 * Build a per-encounter TrainingIntegration for AgenticOrchestrator.
 * Returns undefined when the terminal can't run games (no games for WebUI).
 */
export async function buildTrainingIntegration(): Promise<TrainingIntegration> {
  const s = await services();
  const runner: GameRunnerPort = {
    async runGame(paradigmId, opts) {
      const paradigm = getParadigm(paradigmId);
      if (!paradigm) throw new Error(`Unknown paradigm '${paradigmId}'`);
      const start = await resolveStartLevel(s, paradigmId, opts.difficultyHint);
      const trials: TrialRecord[] = [];
      const summary = await runInteractiveGame(paradigm, {
        trialCount: opts.trialCount,
        difficultyHint: start.level,
        sink: (r) => trials.push(r),
      });
      return { summary, trials };
    },
  };
  return {
    services: { ...s, fatigue: new FatigueMonitor() },
    runner,
    workout: { plan: null, completed: 0 },
  };
}

// ── mysterium train ──────────────────────────────────────────────────

export async function runTrainCommand(args: string[], jsonMode = false): Promise<number> {
  const parser = new Command();
  parser
    .name('train')
    .option('--free [paradigm]', 'play one game directly, no narrative wrapper')
    .option('--trials <n>', 'override trial count', parseIntSafe)
    .option('--difficulty <x>', 'starting difficulty 0-1', parseFloatSafe)
    .option('--minutes <n>', 'workout length in minutes', parseIntSafe)
    .option('--focus <line>', 'bias the workout toward one line')
    .option('--plan', 'print the planned workout instead of playing')
    .option('--demo [seed]', 'scripted responder for CI smoke tests', parseIntSafe);

  parser.exitOverride();
  try {
    parser.parse(args, { from: 'user' });
  } catch { /* help requested or bad flag — fall through with defaults */ }
  const o = parser.opts<{ free?: string | boolean; trials?: number; difficulty?: number; minutes?: number; focus?: string; plan?: boolean; demo?: number | boolean }>();

  const demoOpts = o.demo !== undefined ? { demoSeed: typeof o.demo === 'number' ? o.demo : 7 } : {};

  // Free play: single game, no planner.
  if (typeof o.free === 'string') {
    return trainFree(o.free, { trials: o.trials, difficultyHint: o.difficulty, ...demoOpts });
  }
  if (o.free === true) {
    console.error('Usage: mysterium train --free <n_back|stroop|go_no_go|reaction_time|pattern_prediction>');
    return 1;
  }

  // Guided workout through the planner.
  const s = await services();
  s.index.applyDecay();
  const focusLine = o.focus as Line | undefined;
  const plan = planWorkout(s.index, { minutes: o.minutes ?? 12, focusLine });

  if (o.plan || jsonMode) {
    const payload = {
      items: plan.items.map((i) => ({ paradigmId: i.paradigmId, minutes: i.estimatedMinutes })),
      totalMinutes: plan.totalMinutes,
    };
    if (jsonMode) {
      console.log(JSON.stringify({ type: 'workout_plan', ...payload }));
    } else {
      console.log(`\n${chalk.bold('Planned workout')} ${chalk.dim(`(~${plan.totalMinutes} min)`)}`);
      for (const item of plan.items) {
        const p = getParadigm(item.paradigmId)!;
        console.log(`  ${chalk.cyan('◆')} ${p.label} ${chalk.dim(`— ${item.rationale}`)}`);
      }
    }
    await persistIndex();
    return 0;
  }

  console.log(`\n${chalk.bold.magenta('A sequence of challenges awaits')} ${chalk.dim(`— about ${plan.totalMinutes} minutes`)}`);
  const fatigue = new FatigueMonitor();
  for (const item of plan.items) {
    const paradigm = getParadigm(item.paradigmId);
    if (!paradigm) continue;
    const start = await resolveStartLevel(s, item.paradigmId, item.targetLevel);
    const summary = await runInteractiveGame(paradigm, {
      trialCount: o.trials,
      difficultyHint: start.level,
    });
    s.index.recordGame([...paradigm.domains], summary.performance);
    const verdict = fatigue.record(summary.overallAccuracy, summary.rtMedianMs);
    if (verdict === 'break') {
      console.log(`\n${chalk.yellow.dim('Rest now. The exercises will keep.')}`);
      break;
    }
  }
  await persistIndex();
  console.log(`\n${chalk.green.dim('The practice is complete. Carry the stillness with you.')}`);
  return 0;
}

// ── mysterium insights ───────────────────────────────────────────────

export async function runInsightsCommand(devMode: boolean): Promise<number> {
  const s = await services();
  s.index.applyDecay();
  const snapshot = s.index.snapshot();
  const recent = await s.trials.recentSessions(5);

  console.log(`\n${chalk.bold.cyan('How your senses have been resting and rising')}${chalk.reset}\n`);
  for (const entry of snapshot) {
    const phrase = s.index.feltSenseFor(entry.line);
    const glyph = entry.trend === 'rising' ? chalk.green('↗') : entry.trend === 'decaying' ? chalk.yellow('↘') : chalk.dim('·');
    const bar = renderBar(entry.score01);
    console.log(`  ${glyph} ${entry.line.padEnd(14)} ${bar}  ${chalk.dim(phrase)}${devMode ? chalk.dim(` (${entry.score01.toFixed(2)}, ${entry.lastPlayedDaysAgo}d)`) : ''}`);
  }

  if (recent.length > 0) {
    console.log(`\n${chalk.dim(`Last practiced: ${recent[0]!.paradigmId.replace(/_/g, ' ')} · ${recent.length} recent session${recent.length === 1 ? '' : 's'}`)}`);
  } else {
    console.log(`\n${chalk.dim('No practices yet — try')} ${chalk.bold('mysterium train')}${chalk.dim(' to begin.')}`);
  }
  console.log('');
  return 0;
}

function renderBar(score01: number): string {
  const cells = Math.round(Math.min(1, Math.max(0, score01)) * 10);
  const filled = '◆'.repeat(cells);
  const hollow = '◇'.repeat(10 - cells);
  return `${chalk.cyan(filled)}${chalk.dim(hollow)}`;
}

function parseIntSafe(v: string): number {
  return Math.abs(parseInt(v, 10));
}
function parseFloatSafe(v: string): number {
  return Math.min(1, Math.max(0, parseFloat(v)));
}
