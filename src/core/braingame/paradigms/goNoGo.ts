/**
 * Go/No-Go — impulse regulation paradigm.
 * Multiple "go" glyphs require a fast SPACE press; the designated "no-go"
 * glyph requires withholding. Commissions (pressing on no-go) and omissions
 * (missing a go) both count against accuracy.
 */
import type {
  NumericParams,
  ParadigmDefinition,
  ParamSpace,
  TrialEvaluation,
  TrialPlan,
} from '../types.js';
import { clampParams } from '../types.js';

interface GoNoGoState {
  readonly params: NumericParams;
  readonly goPool: readonly string[];
}

const ALL_GLYPHS = ['⚔', '🛡', '✦', '◈', '◎', '✧'];
const NOGO_GLYPH = '☠';

export const GO_NO_GO_SPACE: ParamSpace = {
  goProbability: { min: 0.6, max: 0.9, step: 0.05 },
  isiMs: { min: 800, max: 1800, step: 100 },
  poolSize: { min: 2, max: 5, step: 1 },
};

function buildState(rawParams: NumericParams): GoNoGoState {
  const params = clampParams(GO_NO_GO_SPACE, rawParams);
  const size = Math.round(params.poolSize ?? 3);
  return { params, goPool: ALL_GLYPHS.slice(0, size) };
}

export const GoNoGoParadigm: ParadigmDefinition = {
  id: 'go_no_go',
  label: 'Impulse Gate',
  domains: ['Cognitive', 'Willpower'],
  timed: true,
  defaultTrials: 14,
  paramSpace: GO_NO_GO_SPACE,

  init: (params) => buildState(params),

  present: (state, _trialIndex, rng): TrialPlan => {
    const s = state as GoNoGoState;
    const isGo = rng() < (s.params.goProbability ?? 0.75);
    const glyph = isGo
      ? s.goPool[Math.floor(rng() * s.goPool.length)]!
      : NOGO_GLYPH;

    return {
      preamble: { kind: 'fixation', ms: 300 },
      preambleMs: 300,
      stimulus: { kind: 'symbol', glyph, color: isGo ? 'cyan' : 'red' },
      response: { mode: 'key', keys: ['space'], labels: ['SPACE on ⚔🛡✦ — withhold on ☠'] },
      windowMs: Math.max(400, Math.round(s.params.isiMs ?? 1200) - 300),
      answerKey: { isGo },
    };
  },

  evaluate: (_state, plan, response): TrialEvaluation => {
    const key = plan.answerKey as { isGo: boolean } | undefined;
    const isGo = key?.isGo ?? true;
    const pressed = !response.timedOut && response.value !== null;

    // Go + pressed = hit; NoGo + withheld = correct rejection.
    const correct = isGo ? pressed : !pressed;
    const ms = response.latencyNs === null ? null : Number(response.latencyNs) / 1e6;

    let latencyScore = 0.5;
    if (isGo) {
      latencyScore = pressed ? (ms !== null && ms < 400 ? 1 : ms !== null && ms < 600 ? 0.7 : 0.4) : 0;
    }

    return {
      correct,
      accuracy: correct ? 1 : 0,
      latencyScore,
      note: !isGo && pressed ? 'commission' : isGo && !pressed ? 'omission' : undefined,
    };
  },

  advance: (state) => state,

  isComplete: () => false,
};
