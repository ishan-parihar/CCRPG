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
import { runInteractiveGame } from './BrainGameCli.js';
import { runExportCommand as runExportImpl, setServicesGetter } from './ExportRuntime.js';

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
    setServicesGetter(() => services());
  }
  return cached;
}

export async function runExportCommand(args: string[]): Promise<number> {
  // Ensure services getter is wired even if this is the first call
  await services();
  return runExportImpl(args);
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
    .option('--demo [seed]', 'scripted responder for CI smoke tests', parseIntSafe)
    .option('--practice', 'non-timed practice mode: no time pressure, latency not scored')
    .option('--window <ms>', 'override response window in ms (configurable stimulus duration)', parseIntSafe)
    .option('--accessible', 'accessible presentation: symbol/text fallbacks for color-dependent stimuli');

  parser.exitOverride();
  try {
    parser.parse(args, { from: 'user' });
  } catch { /* help requested or bad flag — fall through with defaults */ }
  const o = parser.opts<{ free?: string | boolean; trials?: number; difficulty?: number; minutes?: number; focus?: string; plan?: boolean; demo?: number | boolean; practice?: boolean; window?: number; accessible?: boolean }>();

  const demoOpts = o.demo !== undefined ? { demoSeed: typeof o.demo === 'number' ? o.demo : 7 } : {};
  const accessibilityOpts = {
    practice: Boolean(o.practice),
    windowMsOverride: typeof o.window === 'number' ? o.window : undefined,
    accessible: Boolean(o.accessible),
    jsonEvents: jsonMode,
  };

  // Free play: single game, no planner. Persists telemetry + index + calibration (same path as guided workout).
  if (typeof o.free === 'string') {
    const p = getParadigm(o.free);
    if (!p) {
      console.error(`Unknown game '${o.free}'. Available: n_back, stroop, go_no_go, reaction_time, pattern_prediction`);
      return 1;
    }
    const sFree = await services();
    sFree.index.applyDecay();
    const start = await resolveStartLevel(sFree, p.id, o.difficulty);
    const trials: TrialRecord[] = [];
    const summary = await runInteractiveGame(p, {
      trialCount: o.trials ?? p.defaultTrials,
      difficultyHint: start.level,
      ...demoOpts,
      ...accessibilityOpts,
      sink: (r) => trials.push(r),
    });
    // Persist telemetry and index (Veil-safe).
    await sFree.trials.appendSession(trials, {
      sessionId: summary.sessionId,
      paradigmId: summary.paradigmId,
      startedAt: Date.now(),
      trialsCompleted: summary.trialsCompleted,
      accuracy: summary.overallAccuracy,
      rtMedianMs: summary.rtMedianMs,
      performance: summary.performance,
    });
    sFree.index.recordGame([...p.domains], summary.performance);
    const prev = await sFree.calibration.get(p.id);
    const { levelFromParadigm } = await import('../core/adaptive/AdaptiveDifficultyService.js');
    const endLevel = levelFromParadigm(p, summary.paramsEnd as import('../core/braingame/types.js').NumericParams);
    await sFree.calibration.put({
      paradigmId: p.id,
      baselineLevel: prev ? prev.baselineLevel * 0.7 + endLevel * 0.3 : endLevel,
      lastLevel: endLevel,
      calibratedAt: prev?.calibratedAt ?? Date.now(),
      lastPlayedAt: Date.now(),
      sessionsPlayed: (prev?.sessionsPlayed ?? 0) + 1,
    });
    await persistIndex();
    const plainFree = jsonMode || !process.stdout.isTTY;
    const line = plainFree
      ? `trials ${summary.trialsCompleted} · ${summary.feltSenseHint}`
      : `trials ${summary.trialsCompleted} · focus ${Math.round(summary.overallAccuracy * 100)}%`;
    if (!plainFree) console.log(`\n  ${chalk.dim(line)}`);
    else if (!jsonMode) console.log(`\n  ${line}`);
    return 0;
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

  const plainTrain = jsonMode || !process.stdout.isTTY;
  const header = plainTrain
    ? `A sequence of challenges awaits — about ${plan.totalMinutes} minutes`
    : `${chalk.bold.magenta('A sequence of challenges awaits')} ${chalk.dim(`— about ${plan.totalMinutes} minutes`)}`;
  console.log(`\n${header}`);
  const fatigue = new FatigueMonitor();
  for (const item of plan.items) {
    const paradigm = getParadigm(item.paradigmId);
    if (!paradigm) continue;
    const start = await resolveStartLevel(s, item.paradigmId, item.targetLevel);
    const trials: TrialRecord[] = [];
    const summary = await runInteractiveGame(paradigm, {
      trialCount: o.trials,
      difficultyHint: start.level,
      ...demoOpts,
      ...accessibilityOpts,
      sink: (r) => trials.push(r),
    });
    await s.trials.appendSession(trials, {
      sessionId: summary.sessionId,
      paradigmId: summary.paradigmId,
      startedAt: Date.now(),
      trialsCompleted: summary.trialsCompleted,
      accuracy: summary.overallAccuracy,
      rtMedianMs: summary.rtMedianMs,
      performance: summary.performance,
    });
    s.index.recordGame([...paradigm.domains], summary.performance);
    const prev = await s.calibration.get(paradigm.id);
    const { levelFromParadigm } = await import('../core/adaptive/AdaptiveDifficultyService.js');
    const endLevel = levelFromParadigm(paradigm, summary.paramsEnd as import('../core/braingame/types.js').NumericParams);
    await s.calibration.put({
      paradigmId: paradigm.id,
      baselineLevel: prev ? prev.baselineLevel * 0.7 + endLevel * 0.3 : endLevel,
      lastLevel: endLevel,
      calibratedAt: prev?.calibratedAt ?? Date.now(),
      lastPlayedAt: Date.now(),
      sessionsPlayed: (prev?.sessionsPlayed ?? 0) + 1,
    });
    const verdict = fatigue.record(summary.overallAccuracy, summary.rtMedianMs);
    if (verdict === 'break') {
      console.log(`\n${chalk.yellow.dim('Rest now. The exercises will keep.')}`);
      break;
    }
  }
  await persistIndex();
  const doneLine = plainTrain
    ? 'The practice is complete. Carry the stillness with you.'
    : `${chalk.green.dim('The practice is complete. Carry the stillness with you.')}`;
  console.log(`\n${doneLine}`);
  return 0;
}

// ── mysterium insights ───────────────────────────────────────────────

export async function runInsightsCommand(devMode: boolean, rawArgs: string[] = [], jsonModeExplicit = false): Promise<number> {
  // jsonMode may arrive via global --json (cli-game) or via subcommand --json flag.
  const jsonMode = jsonModeExplicit || rawArgs.includes('--json');
  const daysIdx = rawArgs.indexOf('--days');
  const days = daysIdx >= 0 ? Math.max(1, parseInt(String(rawArgs[daysIdx + 1]), 10) || 14) : 14;
  const cutoff = Date.now() - days * 86_400_000;

  const s = await services();
  s.index.applyDecay();
  const snapshot = s.index.snapshot();
  const allRecent = await s.trials.recentSessions(20);
  const recent = allRecent.filter((r) => r.startedAt >= cutoff).slice(0, 10);
  const plain = jsonMode || !process.stdout.isTTY;

  // JSON mode: machine-readable payload for automation / tests.
  if (jsonMode) {
    const payload = {
      type: 'insights',
      days,
      snapshot: snapshot.map((e) => ({
        line: e.line,
        score01: Math.round(e.score01 * 100) / 100,
        trend: e.trend,
        lastPlayedDaysAgo: e.lastPlayedDaysAgo,
        feltSense: s.index.feltSenseFor(e.line),
      })),
      recentSessions: recent.map((r) => ({
        paradigmId: r.paradigmId,
        startedAt: r.startedAt,
        trialsCompleted: r.trialsCompleted,
        accuracy: Math.round(r.accuracy * 100) / 100,
        rtMedianMs: r.rtMedianMs,
      })),
    };
    console.log(JSON.stringify(payload));
    return 0;
  }

  const header = plain
    ? 'How your senses have been resting and rising'
    : `${chalk.bold.cyan('How your senses have been resting and rising')}${chalk.reset}`;
  console.log(`\n${header}${plain ? '' : ''}\n`);
  // Sparkline from recent session accuracies grouped by recency (Veil-safe trend, not raw scores).
  const spark = recent.length >= 2 ? `  ${chalk.dim('trend')} ${renderSparkline(recent.map((r) => r.accuracy).reverse())}  ${chalk.dim(`last ${recent.length} sessions · last ${days}d`)}` : '';
  if (spark) console.log(spark + '\n');

  for (const entry of snapshot) {
    const phrase = s.index.feltSenseFor(entry.line);
    const glyph = plain
      ? (entry.trend === 'rising' ? '↗' : entry.trend === 'decaying' ? '↘' : '·')
      : entry.trend === 'rising' ? chalk.green('↗') : entry.trend === 'decaying' ? chalk.yellow('↘') : chalk.dim('·');
    const bar = plain ? renderBarPlain(entry.score01) : renderBar(entry.score01);
    const devSuffix = devMode ? (plain ? ` (${entry.score01.toFixed(2)}, ${entry.lastPlayedDaysAgo}d)` : chalk.dim(` (${entry.score01.toFixed(2)}, ${entry.lastPlayedDaysAgo}d)`)) : '';
    const phraseOut = plain ? phrase : chalk.dim(phrase);
    console.log(`  ${glyph} ${entry.line.padEnd(14)} ${bar}  ${phraseOut}${devSuffix}`);
  }

  if (recent.length > 0) {
    const lastLine = plain
      ? `Last practiced: ${recent[0]!.paradigmId.replace(/_/g, ' ')} · ${recent.length} recent session${recent.length === 1 ? '' : 's'} (last ${days}d)`
      : chalk.dim(`Last practiced: ${recent[0]!.paradigmId.replace(/_/g, ' ')} · ${recent.length} recent session${recent.length === 1 ? '' : 's'} (last ${days}d)`);
    console.log(`\n  ${lastLine}`);
  } else if (allRecent.length > 0) {
    const msg = plain ? `No practices in the last ${days} days — try mysterium train to begin.` : `${chalk.dim(`No practices in the last ${days} days — try`)} ${chalk.bold('mysterium train')}${chalk.dim(' to begin.')}`;
    console.log(`\n  ${msg} ${plain ? '' : chalk.dim(`(${allRecent.length} older session${allRecent.length === 1 ? '' : 's'} outside window)`)}`);
  } else {
    const msg = plain ? 'No practices yet — try mysterium train to begin.' : `${chalk.dim('No practices yet — try')} ${chalk.bold('mysterium train')}${chalk.dim(' to begin.')}`;
    console.log(`\n  ${msg}`);
  }
  if (!plain) console.log(chalk.dim(`  Tip: mysterium insights --days 30 · mysterium export --format csv`));
  console.log('');
  return 0;
}

function renderBar(score01: number): string {
  const cells = Math.round(Math.min(1, Math.max(0, score01)) * 10);
  const filled = '◆'.repeat(cells);
  const hollow = '◇'.repeat(10 - cells);
  return `${chalk.cyan(filled)}${chalk.dim(hollow)}`;
}

function renderBarPlain(score01: number): string {
  const cells = Math.round(Math.min(1, Math.max(0, score01)) * 10);
  return `[${'='.repeat(cells)}${' '.repeat(10 - cells)}]`;
}

function renderSparkline(values: readonly number[]): string {
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => blocks[Math.min(7, Math.max(0, Math.round(((v - min) / range) * 7)))]!).join('');
}

function parseIntSafe(v: string): number {
  return Math.abs(parseInt(v, 10));
}
function parseFloatSafe(v: string): number {
  return Math.min(1, Math.max(0, parseFloat(v)));
}
