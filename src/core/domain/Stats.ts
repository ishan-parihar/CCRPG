/**
 * Domain types: cognitive performance profile.
 *
 * Pure TypeScript. No framework dependencies.
 */

/** A snapshot of the player's measured cognitive performance. */
export interface CognitiveProfile {
  /** Rolling N-back accuracy in [0,1]. */
  readonly nBackAccuracy: number;
  /** Highest stable N-back load achieved. */
  readonly nBackLevel: number;
  /** Rolling Stroop accuracy in [0,1]. */
  readonly stroopAccuracy: number;
  /** Average Stroop reaction latency (ms). */
  readonly stroopReactionMs: number;
  /** Total trials completed across sessions. */
  readonly totalTrials: number;
}

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfile = {
  nBackAccuracy: 0,
  nBackLevel: 1,
  stroopAccuracy: 0,
  stroopReactionMs: 0,
  totalTrials: 0,
};
