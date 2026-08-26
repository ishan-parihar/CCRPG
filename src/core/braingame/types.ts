/**
 * BrainGame kernel types — the paradigm contract for real multi-trial
 * cognitive training games. Spec: docs/brain-game-upgrade/03-target-architecture.md §3.1–3.3.
 *
 * Design rules (from the reference synthesis, docs/brain-game-upgrade/01):
 * - Paradigms produce presentation DESCRIPTORS; rendering belongs to adapters.
 * - Per-trial state is immutable — serializable snapshots enable pause/resume
 *   and replay/debug.
 * - Latency is measured in monotonic nanoseconds by the UI port and passed
 *   INTO evaluation; speed paradigms weight it, memory paradigms may ignore it.
 * - No LLM call ever sits inside a trial loop (timing integrity).
 */
import type { Line } from '../domain/Line.js';

/** Deterministic random source (mulberry32-style). Returns [0,1). */
export type Rng = () => number;

/** Create a seeded RNG for reproducible sessions (paramsHash reproducibility). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Parameter space ───────────────────────────────────────────────────

/** One tunable difficulty dimension: bounded, stepped. */
export interface ParamField {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/** A paradigm's tunable dimensions, e.g. { n: {min:1,max:4,step:1}, isiMs: {...} }. */
export type ParamSpace = Readonly<Record<string, ParamField>>;

/** Concrete numeric parameter values for one trial/session. */
export type NumericParams = Readonly<Record<string, number>>;

/** Clamp + snap params to their declared space. Unknown keys are dropped. */
export function clampParams(space: ParamSpace, raw: NumericParams): NumericParams {
  const out: Record<string, number> = {};
  for (const key of Object.keys(space)) {
    const f = space[key]!;
    const v = raw[key] ?? f.min;
    const snapped = Math.round((v - f.min) / f.step) * f.step + f.min;
    out[key] = Math.min(f.max, Math.max(f.min, Number(snapped.toFixed(6))));
  }
  return out;
}

/** Normalize any param map to a 0..1 "difficulty level" using field midpoints as anchors. */
export function paramsToLevel(space: ParamSpace, params: NumericParams): number {
  const keys = Object.keys(space);
  if (keys.length === 0) return 0.5;
  let sum = 0;
  for (const k of keys) {
    const f = space[k]!;
    const v = params[k] ?? f.min;
    sum += f.max === f.min ? 0.5 : (v - f.min) / (f.max - f.min);
  }
  return Math.min(1, Math.max(0, sum / keys.length));
}

/** Map a 0..1 difficulty level onto the parameter space (each dimension scaled independently). */
export function levelToParams(space: ParamSpace, level: number): NumericParams {
  const out: Record<string, number> = {};
  const l = Math.min(1, Math.max(0, level));
  for (const key of Object.keys(space)) {
    const f = space[key]!;
    out[key] = f.min + (f.max - f.min) * l;
  }
  return clampParams(space, out);
}

// ── Stimulus descriptors (rendered by adapters, never by core) ────────

export type StimulusDescriptor =
  | { readonly kind: 'text'; readonly lines: readonly string[]; readonly emphasis?: boolean }
  /** One symbol flashed at screen center (n-back stream item, go/no-go stimulus). */
  | { readonly kind: 'symbol'; readonly glyph: string; readonly color?: 'red'|'green'|'blue'|'yellow'|'magenta'|'cyan' }
  /** A row/column grid of glyphs with one highlighted cell (pattern tasks). */
  | { readonly kind: 'grid'; readonly cells: readonly string[]; readonly columns: number }
  /** Countdown / fixation cross between trials. */
  | { readonly kind: 'fixation'; readonly ms: number };

// ── Response contract ─────────────────────────────────────────────────

export type ResponseSpec =
  | { readonly mode: 'key'; readonly keys: readonly string[]; readonly labels?: readonly string[] }
  | { readonly mode: 'choice'; readonly choices: readonly { readonly id: string; readonly label: string }[] }
  | { readonly mode: 'none' };

/** What the UI port returns after the response window closes. */
export interface CollectedResponse {
  /** The pressed key or chosen id; null on timeout/passive trial. */
  readonly value: string | null;
  /** Monotonic nanoseconds from response-window OPEN to input (null if timed out). */
  readonly latencyNs: bigint | null;
  readonly timedOut: boolean;
}

// ── Trial plan & evaluation ───────────────────────────────────────────

/** Everything the engine needs to run ONE trial of a paradigm. */
export interface TrialPlan {
  /** Shown before/with the response window (e.g. the n-back symbol itself). */
  readonly stimulus: StimulusDescriptor;
  /** Optional pre-stimulus beat (fixation cross / prompt line). */
  readonly preamble?: StimulusDescriptor;
  readonly preambleMs?: number;
  readonly response: ResponseSpec;
  /** Response window in ms. Passive trials use ~0 (engine skips collection). */
  readonly windowMs: number;
  /**
   * Opaque answer key — flows engine→evaluate only. NEVER exposed to the
   * UI port or persisted in presentation data.
   */
  readonly answerKey?: unknown;
}

export interface TrialEvaluation {
  readonly correct: boolean;
  /** 0..1 performance accuracy for this trial. */
  readonly accuracy: number;
  /** 0..1 speed score (1 = fastest band). Untimed paradigms return a neutral 0.5+accuracy blend. */
  readonly latencyScore: number;
  /** Human-readable per-trial micro-feedback (post-trial only; never during timing). */
  readonly note?: string;
}

// ── Paradigm definition (the plugin contract) ─────────────────────────

/**
 * Opaque per-session state. Paradigms own their shape; the engine treats it
 * as an immutable value and persists snapshots verbatim.
 */
export type ParadigmState = unknown;

export interface ParadigmDefinition {
  /** Stable id — reuses TaskType ids where a legacy renderer exists ('n_back', ...). */
  readonly id: string;
  readonly label: string;
  /** Which Mysterium lines this game trains. */
  readonly domains: readonly Line[];
  /** True when per-trial latency is a scored dimension (drives RT weighting). */
  readonly timed: boolean;
  readonly defaultTrials: number;
  readonly paramSpace: ParamSpace;
  init(params: NumericParams, rng: Rng): ParadigmState;
  present(state: ParadigmState, trialIndex: number, rng: Rng): TrialPlan;
  evaluate(
    state: ParadigmState,
    plan: TrialPlan,
    response: CollectedResponse,
  ): TrialEvaluation;
  /** Fold the presented trial into the next immutable state. */
  advance(state: ParadigmState, plan: TrialPlan, response: CollectedResponse): ParadigmState;
  isComplete(state: ParadigmState, trialsCompleted: number): boolean;
}

// ── Session records & summaries ───────────────────────────────────────

/** One completed trial — the event-sourced unit persisted by TrialRecordStore. */
export interface TrialRecord {
  readonly sessionId: string;
  readonly paradigmId: string;
  readonly timestamp: number;
  readonly trialIndex: number;
  readonly params: NumericParams;
  /** Deterministic hash of the session seed + params (reproducibility). */
  readonly paramsHash: string;
  readonly correct: boolean;
  readonly accuracy: number;
  readonly latencyScore: number;
  /** Raw response-window latency in ns (null when timed out or passive). */
  readonly latencyNs: bigint | null;
  /** Adjusted after calibration-offset subtraction, in ms. */
  readonly adjustedLatencyMs: number | null;
}

export interface GameSummary {
  readonly sessionId: string;
  readonly paradigmId: string;
  readonly label: string;
  readonly trialsCompleted: number;
  readonly aborted: boolean;
  readonly accuracyTrend: readonly number[];
  readonly rtMedianMs: number | null;
  readonly paramsStart: NumericParams;
  readonly paramsEnd: NumericParams;
  readonly overallAccuracy: number;
  /** 0..1 composite used by CognitiveIndex updates. */
  readonly performance: number;
  /** Veil-safe felt-sense phrase the agent may quote verbatim. */
  readonly feltSenseHint: string;
}

/** FNV-1a hash → hex string, for deterministic paramsHash values. */
export function fnvHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
