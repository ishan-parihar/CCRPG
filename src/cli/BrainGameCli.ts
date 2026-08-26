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

export function renderDescriptor(d: StimulusDescriptor): string {
  switch (d.kind) {
    case 'symbol': {
      const col = colorFor(d.color);
      const glyph = d.glyph.length <= 2
        ? d.glyph.split('').join(' ')
        : d.glyph;
      return `\n${C.bold}${col}      ${glyph}      ${C.reset}\n`;
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

  constructor(opts: { demoSeed?: number; demoCorrectRate?: number } = {}) {
    this.interactive = Boolean(process.stdin.isTTY) && opts.demoSeed === undefined;
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
    // Preamble beat.
    if (plan.preamble) {
      console.log(renderDescriptor(plan.preamble));
      await sleep(Math.max(0, plan.preambleMs ?? 0));
      if (this.aborted) return timedOut();
    }

    // Stimulus: write WITHOUT trailing newline so the response line can
    // share the row for reflex tasks; flush before starting the clock.
    process.stdout.write(renderDescriptor(plan.stimulus));

    if (plan.response.mode === 'none' || plan.windowMs <= 0) {
      return timedOut();
    }

    // Choice mode renders options under the stimulus.
    if (plan.response.mode === 'choice') {
      plan.response.choices.forEach((c, i) => {
        console.log(`   ${C.cyan}[${i + 1}]${C.reset} ${c.label}`);
      });
    } else if (plan.response.labels?.length) {
      console.log(`   ${C.dim}(keys: ${plan.response.labels.join(' · ')})${C.reset}`);
    }

    const validKeys =
      plan.response.mode === 'key'
        ? new Set(plan.response.keys)
        : new Set(plan.response.choices.map((_, i) => String(i + 1)));

    // Demo / non-TTY path: seeded synthetic responder.
    if (this.demo) {
      const thinkMs = Math.round(200 + this.demo.rng() * 500);
      await sleep(thinkMs);
      const correct = this.demo.rng() < this.demo.correctRate;
      let value: string | null;
      if (plan.response.mode === 'key') {
        value = correct ? plan.response.keys[0]! : plan.response.keys[Math.min(1, plan.response.keys.length - 1)]!;
        if (plan.response.keys.includes('y') || plan.response.keys.includes('n')) {
          value = correct ? 'y' : 'n';
        }
      } else {
        value = correct ? '1' : '2';
      }
      return { value, latencyNs: BigInt(thinkMs) * 1_000_000n, timedOut: false };
    }

    return new Promise<CollectedResponse>((resolve) => {
      const startNs = process.hrtime.bigint();
      const waiter: Waiter = { resolve, startNs, timer: null };
      waiter.timer = setTimeout(() => {
        this.currentWaiter = null;
        resolve({ value: null, latencyNs: null, timedOut: true });
      }, plan.windowMs);
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
  /** Collects the engine's real TrialRecords for telemetry. */
  sink?: (record: TrialRecord) => void;
}

/** Execute one full game session against the terminal. */
export async function runInteractiveGame(
  paradigm: ParadigmDefinition,
  opts: RunGameOptions,
): Promise<GameSummary> {
  const ui = new CliGameUi({ demoSeed: opts.demoSeed, demoCorrectRate: opts.demoCorrectRate });
  const clock = new TrialClock();

  if (!opts.quiet) {
    console.log(`\n${C.bold}${C.magenta}◆ ${paradigm.label}${C.reset} ${C.dim}— ${paradigm.domains.join(', ')}${C.reset}`);
  }

  const engine = new BrainGameEngine({
    paradigm,
    params: opts.difficultyHint !== undefined ? levelishToParams(paradigm, opts.difficultyHint) : {},
    trialCount: opts.trialCount,
    ui,
    clock,
    sink: opts.sink,
  });

  try {
    const summary = await engine.run();
    if (!opts.quiet && !ui.isAborted()) {
      console.log(`\n  ${C.green}◆${C.reset} ${chalk.dim(summary.feltSenseHint)}`);
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

/** Free-play entry used by `train --free <id>` */
export async function trainFree(paradigmId: string, opts: RunGameOptions & { trials?: number }): Promise<number> {
  const paradigm = getParadigm(paradigmId);
  if (!paradigm) {
    console.error(`Unknown game '${paradigmId}'. Available: n_back, stroop, go_no_go, reaction_time, pattern_prediction`);
    return 1;
  }
  const summary = await runInteractiveGame(paradigm, { ...opts, trialCount: opts.trials ?? paradigm.defaultTrials });
  console.log(`\n  ${chalk.dim(`trials ${summary.trialsCompleted} · focus ${Math.round(summary.overallAccuracy * 100)}%`)}`);
  return 0;
}
