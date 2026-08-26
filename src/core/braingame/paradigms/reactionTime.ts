/**
 * Reaction time — simple stimulus-onset detection task.
 * Random foreperiod (prevents anticipation), single keypress, RT measured
 * by the UI port from response-window open (= stimulus render completion).
 */
import type {
  NumericParams,
  ParadigmDefinition,
  ParamSpace,
  TrialEvaluation,
  TrialPlan,
} from '../types.js';
import { clampParams } from '../types.js';

interface RtState {
  readonly params: NumericParams;
}

export const REACTION_TIME_SPACE: ParamSpace = {
  delayMinMs: { min: 800, max: 2500, step: 100 },
  delayMaxMs: { min: 2000, max: 5000, step: 100 },
  windowMs: { min: 900, max: 2600, step: 100 },
};

function buildState(rawParams: NumericParams): RtState {
  return { params: clampParams(REACTION_TIME_SPACE, rawParams) };
}

/** Latency → 0..1 speed score. Bands per lumosity.md tolerance guidance. */
export function rtLatencyScore(ms: number | null): number {
  if (ms === null) return 0;
  if (ms < 220) return 1;
  if (ms < 320) return 0.85;
  if (ms < 450) return 0.65;
  if (ms < 650) return 0.45;
  if (ms < 900) return 0.3;
  return 0.15;
}

export const ReactionTimeParadigm: ParadigmDefinition = {
  id: 'reaction_time',
  label: 'Reflex Flash',
  domains: ['Cognitive', 'Somatic'],
  timed: true,
  defaultTrials: 10,
  paramSpace: REACTION_TIME_SPACE,

  init: (params) => buildState(params),

  present: (state, _trialIndex, rng): TrialPlan => {
    const s = state as RtState;
    const lo = Math.round(s.params.delayMinMs ?? 1200);
    const hi = Math.max(lo + 200, Math.round(s.params.delayMaxMs ?? 3500));
    const delay = lo + Math.floor(rng() * (hi - lo));
    return {
      preamble: {
        kind: 'text',
        lines: ['Hold steady…', 'Press SPACE the instant the sigil flashes.'],
      },
      preambleMs: delay,
      stimulus: { kind: 'symbol', glyph: '✦', color: 'cyan' },
      response: { mode: 'key', keys: ['space'], labels: ['SPACE = flash!'] },
      windowMs: Math.round(s.params.windowMs ?? 1800),
    };
  },

  evaluate: (_state, _plan, response): TrialEvaluation => {
    const correct = !response.timedOut && response.value !== null;
    const ms = response.latencyNs === null ? null : Number(response.latencyNs) / 1e6;
    const latencyScore = correct ? rtLatencyScore(ms) : 0;
    return {
      correct,
      accuracy: correct ? 1 : 0,
      latencyScore,
      note: response.timedOut ? 'too slow' : undefined,
    };
  },

  advance: (state) => state,

  isComplete: () => false,
};
