/**
 * Stroop — inhibitory control paradigm.
 * A color word renders in a conflicting ink color; the player names the INK
 * via letter keys. Symbol alternates are always available for colorblind
 * accessibility: every choice id carries BOTH the color name and its initial.
 */
import type {
  NumericParams,
  ParadigmDefinition,
  ParamSpace,
  TrialEvaluation,
  TrialPlan,
} from '../types.js';
import { clampParams } from '../types.js';

interface StroopState {
  readonly params: NumericParams;
}

export interface StroopColor {
  readonly word: string;
  readonly initial: string;
  readonly key: string;
  readonly descriptorColor: 'red' | 'green' | 'blue' | 'yellow' | 'magenta' | 'cyan';
}

export const STROOP_COLORS: readonly StroopColor[] = [
  { word: 'RED', initial: 'R', key: 'r', descriptorColor: 'red' },
  { word: 'GREEN', initial: 'G', key: 'g', descriptorColor: 'green' },
  { word: 'BLUE', initial: 'B', key: 'b', descriptorColor: 'blue' },
  { word: 'YELLOW', initial: 'Y', key: 'y', descriptorColor: 'yellow' },
  { word: 'PURPLE', initial: 'P', key: 'p', descriptorColor: 'magenta' },
  { word: 'ORANGE', initial: 'O', key: 'o', descriptorColor: 'cyan' },
];

export const STROOP_SPACE: ParamSpace = {
  colorCount: { min: 3, max: 6, step: 1 },
  windowMs: { min: 1000, max: 2600, step: 100 },
  conflictRatio: { min: 0.5, max: 1, step: 0.1 },
};

function buildState(rawParams: NumericParams): StroopState {
  return { params: clampParams(STROOP_SPACE, rawParams) };
}

export const StroopParadigm: ParadigmDefinition = {
  id: 'stroop',
  label: 'Ink Naming',
  domains: ['Cognitive'],
  timed: true,
  defaultTrials: 12,
  paramSpace: STROOP_SPACE,

  init: (params) => buildState(params),

  present: (state, _trialIndex, rng): TrialPlan => {
    const s = state as StroopState;
    const count = Math.round(s.params.colorCount ?? 4);
    const colors = STROOP_COLORS.slice(0, count);

    // `ink` = rendered color (the answer); `word` = the text shown.
    const ink = colors[Math.floor(rng() * colors.length)]!;
    let word = ink;
    if (rng() < (s.params.conflictRatio ?? 0.8)) {
      const others = colors.filter((c) => c.word !== ink.word);
      word = others[Math.floor(rng() * others.length)]!;
    }

    return {
      preamble: { kind: 'fixation', ms: 250 },
      preambleMs: 250,
      stimulus: { kind: 'symbol', glyph: word.word, color: ink.descriptorColor },
      response: {
        mode: 'key',
        keys: colors.map((c) => c.key),
        labels: colors.map((c) => `${c.key} = ${c.initial}`),
      },
      windowMs: Math.round(s.params.windowMs ?? 1600),
      answerKey: { inkKey: ink.key },
    };
  },

  evaluate: (_state, plan, response): TrialEvaluation => {
    const key = plan.answerKey as { inkKey: string } | undefined;
    const correct = !response.timedOut && response.value === key?.inkKey;
    const ms = response.latencyNs === null ? null : Number(response.latencyNs) / 1e6;
    const latencyScore = correct
      ? (ms !== null && ms < 700 ? 1 : ms !== null && ms < 1100 ? 0.7 : 0.4)
      : 0;
    return {
      correct,
      accuracy: correct ? 1 : 0,
      latencyScore,
      note: response.timedOut ? 'missed' : undefined,
    };
  },

  advance: (state) => state,

  isComplete: () => false,
};
