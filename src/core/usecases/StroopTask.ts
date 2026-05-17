/**
 * StroopTask — color-word interference paradigm.
 *
 * The player is shown a color word (e.g. "BLUE") rendered in an INK color
 * that may or may not match (e.g. red ink). The correct response is the
 * INK color, requiring the player to inhibit the automatic urge to read.
 *
 * Trials are typically incongruent (~70%) per the classic Stroop design.
 */

export type StroopColor = 'red' | 'green' | 'blue' | 'yellow';

export interface StroopTrial {
  /** The word shown (semantic). */
  readonly word: StroopColor;
  /** The ink color the word is drawn in. The "correct" answer. */
  readonly ink: StroopColor;
  /** True if word and ink mismatch. */
  readonly incongruent: boolean;
}

export interface StroopResponse {
  /** The color the player chose. null = no response (timed out). */
  readonly chosen: StroopColor | null;
  /** Reaction time in milliseconds. */
  readonly reactionMs: number;
}

export interface StroopOutcome {
  /** True if the chosen color matched the ink. */
  readonly correct: boolean;
  /**
   * Quality of the response:
   *  - 'perfect-parry' : correct AND fast (< perfectMs)
   *  - 'block'         : correct, but slower
   *  - 'fail'          : incorrect or no response
   */
  readonly quality: 'perfect-parry' | 'block' | 'fail';
  /** Damage multiplier to apply to the incoming attack. */
  readonly damageMultiplier: number;
}

export const STROOP_PALETTE: Readonly<Record<StroopColor, number>> = {
  red: 0xff4d6d,
  green: 0x52d273,
  blue: 0x4cc9f0,
  yellow: 0xffd166,
};

const ALL_COLORS: readonly StroopColor[] = ['red', 'green', 'blue', 'yellow'];

/** Generate a single Stroop trial. incongruentRatio defaults to 0.7. */
export function generateStroopTrial(
  rng: () => number = Math.random,
  incongruentRatio: number = 0.7,
): StroopTrial {
  const wantIncongruent = rng() < incongruentRatio;
  const word = ALL_COLORS[Math.floor(rng() * ALL_COLORS.length)]!;
  if (!wantIncongruent) {
    return { word, ink: word, incongruent: false };
  }
  // Pick an ink that is NOT the word.
  const candidates = ALL_COLORS.filter((c) => c !== word);
  const ink = candidates[Math.floor(rng() * candidates.length)]!;
  return { word, ink, incongruent: true };
}

/**
 * Score a Stroop response.
 *
 * - Correct and reaction <= perfectMs → perfect parry: 0× damage.
 * - Correct but slower                → block: 0.4× damage.
 * - Incorrect or null                  → fail: 1.5× damage (critical).
 */
export function scoreStroop(
  trial: StroopTrial,
  response: StroopResponse,
  perfectMs: number = 700,
): StroopOutcome {
  const correct = response.chosen !== null && response.chosen === trial.ink;
  if (!correct) {
    return { correct: false, quality: 'fail', damageMultiplier: 1.5 };
  }
  if (response.reactionMs <= perfectMs) {
    return {
      correct: true,
      quality: 'perfect-parry',
      damageMultiplier: 0,
    };
  }
  return { correct: true, quality: 'block', damageMultiplier: 0.4 };
}
