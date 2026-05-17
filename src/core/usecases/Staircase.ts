/**
 * Staircase — 1-up/2-down transformed staircase procedure.
 * Converges at the 70.7% threshold per the blueprint.
 */
import type { StaircaseState } from '../domain/PlayerProfile.js';

export interface StaircaseConfig {
  /** Step size for level changes. */
  readonly stepSize: number;
  /** Minimum level floor. */
  readonly minLevel: number;
  /** Maximum level ceiling. */
  readonly maxLevel: number;
  /** Number of reversals to consider converged. */
  readonly convergenceReversals: number;
}

export const DEFAULT_STAIRCASE_CONFIG: StaircaseConfig = {
  stepSize: 1,
  minLevel: 1,
  maxLevel: 10,
  convergenceReversals: 6,
};

/**
 * Update staircase state after a trial.
 * 1-up/2-down: level increases after 1 incorrect, decreases after 2 consecutive correct.
 */
export function updateStaircase(
  state: StaircaseState,
  config: StaircaseConfig,
  correct: boolean,
): StaircaseState {
  const history = [...state.history, correct];

  if (!correct) {
    // 1-up: increase difficulty after 1 incorrect
    const newLevel = Math.min(state.level + config.stepSize, config.maxLevel);
    const reversed = state.lastDirection === 'down';
    return {
      level: newLevel,
      reversals: state.reversals + (reversed ? 1 : 0),
      lastDirection: 'up',
      history,
    };
  }

  // Check for 2 consecutive correct
  const lastTwo = history.slice(-2);
  if (lastTwo.length === 2 && lastTwo[0] && lastTwo[1]) {
    const newLevel = Math.max(state.level - config.stepSize, config.minLevel);
    const reversed = state.lastDirection === 'up';
    return {
      level: newLevel,
      reversals: state.reversals + (reversed ? 1 : 0),
      lastDirection: 'down',
      history,
    };
  }

  // Single correct — no level change
  return { ...state, history };
}

/** Check if the staircase has converged. */
export function hasConverged(state: StaircaseState, config: StaircaseConfig): boolean {
  return state.reversals >= config.convergenceReversals;
}
