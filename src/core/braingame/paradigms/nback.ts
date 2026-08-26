/**
 * N-back — sequential working-memory paradigm.
 * Unlike the legacy MCQ renderer (whole sequence shown once, count matches),
 * this streams ONE symbol per trial and requires a match/no-match judgment
 * inside the inter-stimulus window — the canonical N-back task.
 */
import type {
  NumericParams,
  ParadigmDefinition,
  ParamSpace,
  Rng,
  TrialEvaluation,
  TrialPlan,
} from '../types.js';
import { clampParams } from '../types.js';

interface NBackState {
  readonly params: NumericParams;
  readonly pool: readonly string[];
  /** Symbols presented so far; index = trial index. Appended by advance(). */
  readonly history: readonly string[];
}

const POOL_BASE = ['◆', '●', '▲', '■', '★', '◇', '○', '△', '◈', '◉', '◎', '✧'];

export const N_BACK_SPACE: ParamSpace = {
  n: { min: 1, max: 4, step: 1 },
  isiMs: { min: 900, max: 2400, step: 100 },
  poolSize: { min: 4, max: 12, step: 1 },
};

function buildState(rawParams: NumericParams, rng: Rng): NBackState {
  const params = clampParams(N_BACK_SPACE, rawParams);
  const poolSize = Math.round(params.poolSize ?? 8);
  const shuffled = [...POOL_BASE];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return { params, pool: shuffled.slice(0, poolSize), history: [] };
}

export const NBackParadigm: ParadigmDefinition = {
  id: 'n_back',
  label: 'Working Memory Stream',
  domains: ['Cognitive'],
  timed: false,
  defaultTrials: 16,
  paramSpace: N_BACK_SPACE,

  init: (params, rng) => buildState(params, rng),

  present: (state, trialIndex, rng): TrialPlan => {
    const s = state as NBackState;
    const n = Math.round(s.params.n ?? 2);

    // ~40% match rate with guaranteed legality: a "match" reuses the n-back
    // symbol; a non-match is drawn excluding it.
    const shouldMatch = trialIndex >= n && rng() < 0.4;
    let glyph: string;
    if (shouldMatch) {
      glyph = s.history[trialIndex - n]!;
    } else {
      const exclude = trialIndex >= n ? s.history[trialIndex - n] : undefined;
      const candidates = s.pool.filter((p) => p !== exclude);
      glyph = candidates[Math.floor(rng() * candidates.length)] ?? s.pool[0]!;
    }

    return {
      preamble: { kind: 'fixation', ms: 350 },
      preambleMs: 350,
      stimulus: { kind: 'symbol', glyph },
      response: { mode: 'key', keys: ['y', 'n'], labels: ['y = match', 'n = no match'] },
      windowMs: 1400,
      answerKey: { isMatch: shouldMatch },
    };
  },

  evaluate: (_state, plan, response): TrialEvaluation => {
    const key = plan.answerKey as { isMatch: boolean } | undefined;
    const isMatch = key?.isMatch ?? false;

    const saidMatch = response.value === 'y';
    const correct = !response.timedOut && ((isMatch && saidMatch) || (!isMatch && !saidMatch));

    return {
      correct,
      accuracy: correct ? 1 : 0,
      latencyScore: 0.5,
      note: response.timedOut ? 'missed' : undefined,
    };
  },

  advance: (state, plan) => {
    const s = state as NBackState;
    const glyph = plan.stimulus.kind === 'symbol' ? plan.stimulus.glyph : '';
    return { ...s, history: [...s.history, glyph] };
  },

  isComplete: () => false,
};
