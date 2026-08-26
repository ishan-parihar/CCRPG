/**
 * Pattern prediction — sequence-completion paradigm.
 * Each trial shows a symbolic sequence; the player picks the next element
 * from four candidates (one correct, three legal decoys).
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

interface PatternState {
  readonly params: NumericParams;
  readonly alphabet: readonly string[];
}

const ALPHABET = ['◆', '●', '▲', '■', '★', '◇', '○', '△'];

export const PATTERN_SPACE: ParamSpace = {
  seqLen: { min: 3, max: 7, step: 1 },
  alphabetSize: { min: 3, max: 8, step: 1 },
  windowMs: { min: 6000, max: 16000, step: 500 },
};

function buildState(rawParams: NumericParams): PatternState {
  const params = clampParams(PATTERN_SPACE, rawParams);
  const size = Math.round(params.alphabetSize ?? 5);
  return { params, alphabet: ALPHABET.slice(0, size) };
}

function shuffled<T>(arr: readonly T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const PatternPredictionParadigm: ParadigmDefinition = {
  id: 'pattern_prediction',
  label: 'Pattern Weave',
  domains: ['Cognitive'],
  timed: false,
  defaultTrials: 8,
  paramSpace: PATTERN_SPACE,

  init: (params) => buildState(params),

  present: (state, _trialIndex, rng): TrialPlan => {
    const s = state as PatternState;
    const seqLen = Math.round(s.params.seqLen ?? 4);

    // Repetition-with-rotation structure keeps sequences learnable.
    const period = Math.max(2, Math.min(4, seqLen - 1));
    const seedSymbols = shuffled(s.alphabet, rng).slice(0, period);
    const shown: string[] = [];
    for (let i = 0; i < seqLen; i++) shown.push(seedSymbols[i % period]!);
    const correctNext = seedSymbols[seqLen % period]!;

    const decoys = shuffled(
      s.alphabet.filter((a) => a !== correctNext),
      rng,
    ).slice(0, 3);
    const choices = shuffled([correctNext, ...decoys], rng);

    return {
      preamble: {
        kind: 'text',
        lines: ['The weave continues…', `${shown.join('  ')}  ?`],
        emphasis: true,
      },
      preambleMs: 250,
      stimulus: { kind: 'fixation', ms: 0 },
      response: {
        mode: 'choice',
        choices: choices.map((c) => ({ id: c, label: c })),
      },
      windowMs: Math.round(s.params.windowMs ?? 10000),
      answerKey: correctNext,
    };
  },

  evaluate: (_state, plan, response): TrialEvaluation => {
    const correctId = typeof plan.answerKey === 'string' ? plan.answerKey : null;
    const picked = response.value;
    const correct = picked !== null && correctId !== null && picked === correctId;
    return {
      correct,
      accuracy: correct ? 1 : 0,
      latencyScore: 0.5,
      note: response.timedOut ? 'the weave faded' : undefined,
    };
  },

  advance: (state) => state,

  isComplete: () => false,
};
