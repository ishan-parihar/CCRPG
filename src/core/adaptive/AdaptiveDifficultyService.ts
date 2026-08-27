/**
 * AdaptiveDifficultyService — real-time difficulty adaptation on each
 * paradigm's OWN parameter space (not abstract levels alone).
 *
 * Strategies (docs/foundations/08-psychophysics-and-staircase.md):
 * - WeightedUpDown (default): asymmetric steps — small steps up, larger down;
 *   converges near the 70–80% success band without the rigidity of 1-up/2-down.
 * - CompositeAccuracyRt: speed paradigms also weigh latency score, so merely
 *   correct-but-sluggish performance stops escalating difficulty.
 *
 * Guardrails: forced ease after repeated failure; ceiling hold at max params.
 * Pure functions throughout — synthetic-user simulation tests drive validation.
 */
import type { NumericParams, ParadigmDefinition } from '../braingame/types.js';
import { clampParams, levelToParams, paramsToLevel } from '../braingame/types.js';

export interface AdaptiveState {
  /** Abstract difficulty level 0..1 mapped onto the paradigm's param space. */
  readonly level: number;
  readonly correctStreak: number;
  readonly failStreak: number;
  readonly reversals: number;
  readonly lastDirection: 'up' | 'down' | null;
}

export const DEFAULT_ADAPTIVE_CONFIG = {
  /** Consecutive correct answers before stepping UP. */
  stepUpAfterCorrect: 2,
  /** Consecutive failures before stepping DOWN. */
  stepDownOnFails: 2,
  /** Step size up (smaller — earning difficulty must be slower than losing it). */
  stepUp: 0.05,
  /** Step size down (larger). */
  stepDown: 0.09,
  /** Forced-ease guardrail trigger. */
  forceEaseAfterFails: 3,
  forceEaseStep: 0.16,
  /** Latency threshold for CompositeAccuracyRt escalation. */
  rtEscalateScore: 0.65,
} as const;

export type AdaptiveStrategy = 'weighted_up_down' | 'composite_accuracy_rt';

export function initAdaptiveState(startLevel: number): AdaptiveState {
  return {
    level: Math.min(1, Math.max(0, startLevel)),
    correctStreak: 0,
    failStreak: 0,
    reversals: 0,
    lastDirection: null,
  };
}

/**
 * One adaptation step. `correct` from the trial; `latencyScore` optional
 * (only meaningful for timed paradigms).
 */
export function adapt(
  state: AdaptiveState,
  correct: boolean,
  config: typeof DEFAULT_ADAPTIVE_CONFIG = DEFAULT_ADAPTIVE_CONFIG,
  latencyScore?: number,
  strategy: AdaptiveStrategy = 'weighted_up_down',
): AdaptiveState {
  // Effective result for speed paradigms: correct-but-slow counts as neutral
  // (no escalation), so reflex quality gates difficulty growth.
  const effective =
    strategy === 'composite_accuracy_rt' && correct && latencyScore !== undefined
      ? latencyScore >= config.rtEscalateScore
        ? 'correct'
        : 'neutral'
      : correct
        ? 'correct'
        : 'fail';

  let level = state.level;
  let direction: 'up' | 'down' | null = state.lastDirection;

  if (effective === 'correct') {
    const streak = state.correctStreak + 1;
    if (streak >= config.stepUpAfterCorrect) {
      level = Math.min(1, level + config.stepUp);
      direction = 'up';
    }
    return {
      ...state,
      level,
      correctStreak: streak % Math.max(1, config.stepUpAfterCorrect),
      failStreak: 0,
      reversals:
        direction !== null && state.lastDirection !== null && direction !== state.lastDirection
          ? state.reversals + 1
          : state.reversals,
      lastDirection: direction,
    };
  }

  if (effective === 'fail') {
    const failStreak = state.failStreak + 1;
    const forcedEase = failStreak >= config.forceEaseAfterFails;
    const normalEase = failStreak >= config.stepDownOnFails;
    if (forcedEase || normalEase) {
      level = Math.max(0, level - (forcedEase ? config.forceEaseStep : config.stepDown));
      direction = 'down';
    }
    return {
      ...state,
      level,
      correctStreak: 0,
      failStreak: forcedEase ? 0 : failStreak,
      reversals:
        direction !== null && state.lastDirection !== null && direction !== state.lastDirection
          ? state.reversals + 1
          : state.reversals,
      lastDirection: direction,
    };
  }

  // Neutral: no streak progress either way, no level change.
  return { ...state, correctStreak: 0, failStreak: state.failStreak };
}

/** Map adaptive level onto a paradigm's parameter space. */
export function levelForParadigm(
  p: ParadigmDefinition,
  state: AdaptiveState,
): NumericParams {
  return levelToParams(p.paramSpace, state.level);
}

/** Read the current level back out of concrete params (for persistence). */
export function levelFromParadigm(p: ParadigmDefinition, params: NumericParams): number {
  return paramsToLevel(p.paramSpace, clampParams(p.paramSpace, params));
}

/**
 * Factory for the engine's `adjustDifficulty` hook: closes over mutable
 * adaptive state, feeds back next-trial params.
 */
export function createTrialAdjuster(
  p: ParadigmDefinition,
  initialState: AdaptiveState,
  strategy: AdaptiveStrategy = 'weighted_up_down',
): { adjust: (params: NumericParams, correct: boolean, latencyScore?: number) => NumericParams; state: () => AdaptiveState } {
  let s = initialState;
  return {
    adjust: (_params, correct, latencyScore) => {
      s = adapt(s, correct, DEFAULT_ADAPTIVE_CONFIG, latencyScore, strategy === 'composite_accuracy_rt' ? 'composite_accuracy_rt' : 'weighted_up_down');
      return levelForParadigm(p, s);
    },
    state: () => s,
  };
}

/** Strategy selection per paradigm (timed paradigms use composite). */
export function strategyForParadigm(paradigmId: string): AdaptiveStrategy {
  return paradigmId === 'go_no_go' || paradigmId === 'reaction_time' ? 'composite_accuracy_rt' : 'weighted_up_down';
}
