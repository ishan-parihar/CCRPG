/**
 * GoNoGoTask — behavioural inhibition paradigm.
 * Player must respond to "go" stimuli and withhold on "no-go" stimuli.
 * Standard ratio: 70% go, 30% no-go.
 */

export interface GoNoGoTrial {
  readonly type: 'go' | 'nogo';
}

export interface GoNoGoResponse {
  /** True if the player pressed/tapped. */
  readonly responded: boolean;
  /** Reaction time in ms (only meaningful if responded). */
  readonly reactionMs: number;
}

export interface GoNoGoResult {
  readonly correct: boolean;
  /** 'hit' | 'correct-rejection' | 'miss' | 'false-alarm' */
  readonly outcome: 'hit' | 'correct-rejection' | 'miss' | 'false-alarm';
  readonly reactionMs: number;
}

export function generateGoNoGoTrial(
  rng: () => number = Math.random,
  goRatio: number = 0.7,
): GoNoGoTrial {
  return { type: rng() < goRatio ? 'go' : 'nogo' };
}

export function scoreGoNoGo(trial: GoNoGoTrial, response: GoNoGoResponse): GoNoGoResult {
  if (trial.type === 'go') {
    return {
      correct: response.responded,
      outcome: response.responded ? 'hit' : 'miss',
      reactionMs: response.reactionMs,
    };
  }
  return {
    correct: !response.responded,
    outcome: response.responded ? 'false-alarm' : 'correct-rejection',
    reactionMs: response.reactionMs,
  };
}
