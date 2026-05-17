/**
 * SimonTask — spatial inhibitory control paradigm.
 * Player must respond to the direction of a stimulus, ignoring its position.
 */

export type SimonDirection = 'left' | 'right';

export interface SimonTrial {
  /** The direction the stimulus points (correct answer). */
  readonly direction: SimonDirection;
  /** The screen position (congruent or incongruent with direction). */
  readonly position: SimonDirection;
  readonly congruent: boolean;
}

export interface SimonResponse {
  readonly chosen: SimonDirection | null;
  readonly reactionMs: number;
}

export interface SimonResult {
  readonly correct: boolean;
  readonly congruent: boolean;
  readonly reactionMs: number;
}

export function generateSimonTrial(
  rng: () => number = Math.random,
  incongruentRatio: number = 0.5,
): SimonTrial {
  const direction: SimonDirection = rng() < 0.5 ? 'left' : 'right';
  const congruent = rng() >= incongruentRatio;
  const position: SimonDirection = congruent ? direction : (direction === 'left' ? 'right' : 'left');
  return { direction, position, congruent };
}

export function scoreSimon(trial: SimonTrial, response: SimonResponse): SimonResult {
  return {
    correct: response.chosen === trial.direction,
    congruent: trial.congruent,
    reactionMs: response.reactionMs,
  };
}
