/**
 * BrainGameCli — terminal adapter for the brain-game kernel.
 *
 * Implements GameUiPort (raw-mode keypress collection with monotonic
 * latency measurement) and GameRunnerPort (what the AgenticOrchestrator's
 * run_brain_game tool calls). Also powers `mysterium train --free`.
 *
 * Non-TTY degradation: without a TTY the port auto-switches to a seeded
 * demo policy, so `--headless --json` smoke tests work in CI.
 */
import chalk from 'chalk';
import readline from 'readline';
import { BrainGameEngine, type GameUiPort } from '../core/braingame/BrainGameEngine.js';
import { TrialClock } from '../core/braingame/TrialClock.js';
import type {
  CollectedResponse,
  GameSummary,
  NumericParams,
  Rng,
  StimulusDescriptor,
  TrialPlan,
  TrialRecord,
} from '../core/braingame/types.js';
import { createRng } from '../core/braingame/types.js';
import { getParadigm } from '../core/braingame/registry.js';
import type { ParadigmDefinition } from '../core/braingame/types.js';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
};

function colorFor(name: string | undefined): string {
  switch (name) {
    case 'red': return C.red;
    case 'green': return C.green;
    case 'yellow': return C.yellow;
    case 'blue': return C.blue;
    case 'magenta': return C.magenta;
    case 'cyan': return C.cyan;
    default: return '';
  }
}

export function renderDescriptor(d: StimulusDescriptor, opts: { accessible?: boolean } = {}): string {
  switch (d.kind) {
    case 'symbol': {
      const col = opts.accessible ? '' : colorFor(d.color);
      const glyph = d.glyph.length <= 2
        ? d.glyph.split('').join(' ')
        : d.glyph;
      const suffix = opts.accessible && d.color ? `  [${d.color}]` : '';
      return `\n${C.bold}${col}      ${glyph}${suffix}      ${C.reset}\n`;
    }
    case 'grid': {
      const rows: string[] = [];
      for (let i = 0; i < d.cells.length; i += d.columns) {
        rows.push('   ' + d.cells.slice(i, i + d.columns).join('  '));
      }
      return '\n' + rows.join('\n') + '\n';
    }
    case 'fixation':
      return `\n${C.dim}      +      ${C.reset}`;
    case 'text': {
      const wrap = d.emphasis ? (s: string) => `${C.bold}${s}${C.reset}` : (s: string) => s;
      return '\n' + d.lines.map((l) => `  ${wrap(l)}`).join('\n');
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface Waiter {
  resolve: (r: CollectedResponse) => void;
  startNs: bigint;
  timer: NodeJS.Timeout | null;
}

/**
 * Interactive UI port. One instance per game session; owns stdin raw mode.
 */
export class CliGameUi implements GameUiPort {
  private aborted = false;
  private abortCb: (() => void) | null = null;
  private readonly rl: readline.Interface;
  private readonly interactive: boolean;
  /** Demo policy: [probCorrect, seeded rng] used when non-interactive. */
  private readonly demo?: { correctRate: number; rng: Rng };
  private readonly practice: boolean;
  private readonly windowMsOverride: number | null;
  private readonly accessible: boolean;
  private readonly jsonEvents: boolean;

  constructor(opts: { demoSeed?: number; demoCorrectRate?: number; practice?: boolean; windowMsOverride?: number; accessible?: boolean; jsonEvents?: boolean } = {}) {
    this.interactive = Boolean(process.stdin.isTTY) && opts.demoSeed === undefined;
    this.practice = Boolean(opts.practice);
    this.windowMsOverride = typeof opts.windowMsOverride === 'number' ? opts.windowMsOverride : null;
    this.accessible = Boolean(opts.accessible);
    this.jsonEvents = Boolean(opts.jsonEvents);
    void this.jsonEvents;
    if (!this.interactive) {
      this.demo = {
        correctRate: opts.demoCorrectRate ?? 0.7,
        rng: createRng(opts.demoSeed ?? 1234),
      };
    }
    this.rl = readline.createInterface({ input: process.stdin, terminal: false });
    readline.emitKeypressEvents(process.stdin, this.rl);
    if (this.interactive) {
      try { process.stdin.setRawMode(true); } catch { /* non-tty */ }
    }
    process.stdin.on('keypress', (_str: string, key: { name?: string; sequence?: string; ctrl?: boolean }) => {
      if (key?.ctrl && key?.name === 'c') {
        this.handleAbort();
        return;
      }
      const value = normalizeKey(key);
      if (value !== null) this.resolveKeypress(value);
    });
  }

  public onAbort(cb: () => void): void {
    this.abortCb = cb;
  }

  private handleAbort(): void {
    if (this.aborted) return;
    this.aborted = true;
    this.resolveKeypress(null);
    this.abortCb?.();
  }

  public isAborted(): boolean {
    return this.aborted;
  }

  private currentWaiter: Waiter | null = null;

  private resolveKeypress(value: string | null): void {
    const w = this.currentWaiter;
    if (!w) return;
    this.currentWaiter = null;
    if (w.timer) clearTimeout(w.timer);
    if (value === null) {
      w.resolve({ value: null, latencyNs: null, timedOut: true });
    } else {
      w.resolve({
        value,
        latencyNs: process.hrtime.bigint() - w.startNs,
        timedOut: false,
      });
    }
  }

  public async show(lines: readonly string[]): Promise<void> {
    console.log(lines.map((l) => `  ${C.dim}${l}${C.reset}`).join('\n'));
  }

  public async runTrial(plan: TrialPlan): Promise<CollectedResponse> {
    // Apply accessibility / practice / window overrides to the plan's window
    // without mutating the paradigm's TrialPlan (engine owns trial semantics; UI only stretches the collection window).
    const effectiveWindow = this.windowMsOverride !== null
      ? this.windowMsOverride
      : this.practice
        ? Math.max(plan.windowMs * 3, 8000)
        : plan.windowMs;
    const effectivePlan = effectiveWindow !== plan.windowMs ? { ...plan, windowMs: effectiveWindow } : plan;

    // Preamble beat.
    if (effectivePlan.preamble) {
      console.log(renderDescriptor(effectivePlan.preamble, { accessible: this.accessible }));
      await sleep(Math.max(0, effectivePlan.preambleMs ?? 0));
      if (this.aborted) return timedOut();
    }

    // Stimulus: write WITHOUT trailing newline so the response line can
    // share the row for reflex tasks; flush before starting the clock.
    process.stdout.write(renderDescriptor(effectivePlan.stimulus, { accessible: this.accessible }));

    if (effectivePlan.response.mode === 'none' || effectivePlan.windowMs <= 0) {
      return timedOut();
    }

    // Choice mode renders options under the stimulus.
    if (effectivePlan.response.mode === 'choice') {
      effectivePlan.response.choices.forEach((c: { label: string }, i: number) => {
        console.log(`   ${C.cyan}[${i + 1}]${C.reset} ${c.label}`);
      });
    } else if (effectivePlan.response.mode === 'key' && effectivePlan.response.labels?.length) {
      console.log(`   ${C.dim}(keys: ${effectivePlan.response.labels.join(' · ')})${C.reset}`);
      if (this.accessible && effectivePlan.response.mode === 'key') {
        console.log(`   ${C.dim}(accessible: letter keys map to initials shown in brackets above)${C.reset}`);
      }
    }
    if (this.practice) {
      console.log(`   ${C.dim}(practice — no time pressure)${C.reset}`);
    }

    const validKeys =
      effectivePlan.response.mode === 'key'
        ? new Set(effectivePlan.response.keys)
        : new Set((effectivePlan.response as { choices: readonly { id: string }[] }).choices.map((_: { id: string }, i: number) => String(i + 1)));

    // Demo / non-TTY path: seeded synthetic responder.
    if (this.demo) {
      const thinkMs = Math.round(200 + this.demo.rng() * 500);
      await sleep(thinkMs);
      const correct = this.demo.rng() < this.demo.correctRate;
      let value: string | null;
      if (effectivePlan.response.mode === 'key') {
        value = correct ? effectivePlan.response.keys[0]! : effectivePlan.response.keys[Math.min(1, effectivePlan.response.keys.length - 1)]!;
        if (effectivePlan.response.keys.includes('y') || effectivePlan.response.keys.includes('n')) {
          value = correct ? 'y' : 'n';
        }
      } else {
        value = correct ? '1' : '2';
      }
      return { value, latencyNs: BigInt(thinkMs) * 1_000_000n, timedOut: false };
    }

    // Pipe-safe: when jsonEvents is true, suppress the interactive validKeys hint already rendered above — no extra output here.
    return new Promise<CollectedResponse>((resolve) => {
      const startNs = process.hrtime.bigint();
      const waiter: Waiter = { resolve, startNs, timer: null };
      waiter.timer = setTimeout(() => {
        this.currentWaiter = null;
        resolve({ value: null, latencyNs: null, timedOut: true });
      }, effectivePlan.windowMs);
      this.currentWaiter = waiter;
      void validKeys; // validation happens at evaluation; keys map 1:1
    });
  }

  public cleanup(): void {
    if (this.interactive) {
      try { process.stdin.setRawMode(false); } catch { /* ignore */ }
    }
    this.rl.close();
  }
}

function timedOut(): CollectedResponse {
  return { value: null, latencyNs: null, timedOut: true };
}

/** Map Node keypress info to our canonical key ids. */
function normalizeKey(key: { name?: string; sequence?: string } | undefined): string | null {
  if (!key) return null;
  if (key.name === 'space') return 'space';
  if (key.name === 'return' || key.name === 'enter') return 'enter';
  if (key.name && key.name.length === 1) return key.name.toLowerCase();
  if (key.sequence && /^[a-z0-9]$/.test(key.sequence)) return key.sequence;
  return null;
}

// ── Runner (GameRunnerPort) ──────────────────────────────────────────

export interface RunGameOptions {
  trialCount?: number;
  difficultyHint?: number;
  demoSeed?: number;
  demoCorrectRate?: number;
  quiet?: boolean;
  practice?: boolean;
  windowMsOverride?: number;
  accessible?: boolean;
  jsonEvents?: boolean;
  /** Collects the engine's real TrialRecords for telemetry. */
  sink?: (record: TrialRecord) => void;
}

/** Execute one full game session against the terminal. */
export async function runInteractiveGame(
  paradigm: ParadigmDefinition,
  opts: RunGameOptions,
): Promise<GameSummary> {
  const ui = new CliGameUi({
    demoSeed: opts.demoSeed,
    demoCorrectRate: opts.demoCorrectRate,
    practice: opts.practice,
    windowMsOverride: opts.windowMsOverride,
    accessible: opts.accessible,
    jsonEvents: opts.jsonEvents,
  });
  const clock = new TrialClock();

  if (!opts.quiet) {
    const tags: string[] = [];
    if (opts.practice) tags.push('practice');
    if (opts.accessible) tags.push('accessible');
    const tagStr = tags.length ? ` ${C.dim}[${tags.join(', ')}]${C.reset}` : '';
    const maybeNoColor = opts.jsonEvents || !process.stdout.isTTY
      ? `${paradigm.label} — ${paradigm.domains.join(', ')}${tags.length ? ` [${tags.join(', ')}]` : ''}`
      : `${C.bold}${C.magenta}◆ ${paradigm.label}${C.reset} ${C.dim}— ${paradigm.domains.join(', ')}${C.reset}${tagStr}`;
    console.log(opts.jsonEvents || !process.stdout.isTTY ? `\n${maybeNoColor}` : `\n${maybeNoColor}`);
    if (opts.jsonEvents) {
      console.log(JSON.stringify({ type: 'game_start', paradigmId: paradigm.id, label: paradigm.label, practice: Boolean(opts.practice) }));
    }
  }

  // Build the telemetry sink; when jsonEvents is on, also emit per-trial JSON lines.
  let engineSink: ((r: TrialRecord) => void) | undefined = opts.sink;
  if (opts.jsonEvents) {
    const base = opts.sink;
    engineSink = (r: TrialRecord) => {
      if (base) base(r);
      console.log(JSON.stringify({ type: 'game_trial', paradigmId: r.paradigmId, trialIndex: r.trialIndex, correct: r.correct, latencyMs: r.adjustedLatencyMs }));
    };
  }

  const engine = new BrainGameEngine({
    paradigm,
    params: opts.difficultyHint !== undefined ? levelishToParams(paradigm, opts.difficultyHint) : {},
    trialCount: opts.trialCount,
    ui,
    clock,
    sink: engineSink,
  });

  try {
    const summary = await engine.run();
    if (!opts.quiet && !ui.isAborted()) {
      const line = opts.jsonEvents || !process.stdout.isTTY
        ? `  ${summary.feltSenseHint}`
        : `\n  ${C.green}◆${C.reset} ${chalk.dim(summary.feltSenseHint)}`;
      console.log(line);
      if (opts.jsonEvents) {
        console.log(JSON.stringify({ type: 'game_summary', ...sanitizeSummary(summary) }));
      }
    } else if (opts.jsonEvents && !ui.isAborted()) {
      // Quiet mode still emits the summary event for automation.
      console.log(JSON.stringify({ type: 'game_summary', ...sanitizeSummary(summary) }));
    }
    return summary;
  } finally {
    ui.cleanup();
  }
}

function levelishToParams(p: ParadigmDefinition, level: number): NumericParams {
  const out: Record<string, number> = {};
  const l = Math.min(1, Math.max(0, level));
  for (const [k, f] of Object.entries(p.paramSpace)) {
    out[k] = f.min + (f.max - f.min) * l;
  }
  return out;
}

function sanitizeSummary(s: GameSummary): Record<string, unknown> {
  return {
    sessionId: s.sessionId,
    paradigmId: s.paradigmId,
    label: s.label,
    trialsCompleted: s.trialsCompleted,
    aborted: s.aborted,
    overallAccuracy: Math.round(s.overallAccuracy * 100) / 100,
    rtMedianMs: s.rtMedianMs,
    feltSenseHint: s.feltSenseHint,
  };
}

/** Free-play entry used by `train --free <id>` */
export async function trainFree(paradigmId: string, opts: RunGameOptions & { trials?: number }): Promise<number> {
  const paradigm = getParadigm(paradigmId);
  if (!paradigm) {
    console.error(`Unknown game '${paradigmId}'. Available: n_back, stroop, go_no_go, reaction_time, pattern_prediction`);
    return 1;
  }
  const summary = await runInteractiveGame(paradigm, { ...opts, trialCount: opts.trials ?? paradigm.defaultTrials });
  const plain = !process.stdout.isTTY || opts.jsonEvents;
  const summaryLine = plain
    ? `trials ${summary.trialsCompleted} · ${summary.feltSenseHint}`
    : `trials ${summary.trialsCompleted} · focus ${Math.round(summary.overallAccuracy * 100)}%`;
  console.log(plain ? `\n  ${summaryLine}` : `\n  ${chalk.dim(summaryLine)}`);
  return 0;
}
