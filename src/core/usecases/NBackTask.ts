/**
 * NBackTask — pure generator and scorer for the N-back cognitive paradigm.
 *
 * Builds a sequence of stimulus indices into a small alphabet (e.g. runes)
 * and exposes the deterministic ground truth for "is this trial a target?"
 * (i.e. does the current stimulus match the one n positions back).
 *
 * Includes a tunable target ratio so roughly 30% of trials are matches —
 * the standard balance used in Kirchner-style N-back assessments.
 */

export interface NBackTrial {
  /** Index into the stimulus alphabet. */
  readonly stimulus: number;
  /** True if this trial is an n-back match (player should respond). */
  readonly isTarget: boolean;
}

export interface NBackParams {
  readonly n: number;
  readonly trials: number;
  readonly alphabetSize: number;
  /** Probability a trial is forced to be a target. 0..1. Default 0.3. */
  readonly targetRatio?: number;
}

export interface NBackResult {
  /** Number of correct hits (player struck on a target). */
  readonly hits: number;
  /** Number of correct rejections (player did not strike on non-target). */
  readonly correctRejections: number;
  /** Number of misses (target was missed). */
  readonly misses: number;
  /** Number of false alarms (struck on non-target). */
  readonly falseAlarms: number;
  /** Total trials evaluated. */
  readonly total: number;
  /** Accuracy = (hits + correctRejections) / total in [0,1]. */
  readonly accuracy: number;
  /** Sensitivity (hits / targets) in [0,1]. */
  readonly sensitivity: number;
}

/** Generate a deterministic N-back sequence using the given RNG. */
export function generateNBackSequence(
  params: NBackParams,
  rng: () => number = Math.random,
): NBackTrial[] {
  const { n, trials, alphabetSize } = params;
  const ratio = params.targetRatio ?? 0.3;
  if (trials <= 0) return [];
  if (alphabetSize < 2) {
    throw new Error('alphabetSize must be >= 2');
  }

  const seq: number[] = [];
  for (let i = 0; i < trials; i++) {
    if (i < n) {
      seq.push(Math.floor(rng() * alphabetSize));
      continue;
    }
    // Decide target/non-target.
    const wantTarget = rng() < ratio;
    if (wantTarget) {
      seq.push(seq[i - n]!);
    } else {
      // Pick anything that is NOT the n-back match.
      const banned = seq[i - n]!;
      let pick = Math.floor(rng() * alphabetSize);
      if (pick === banned) {
        pick = (pick + 1) % alphabetSize;
      }
      seq.push(pick);
    }
  }

  return seq.map((stimulus, i) => ({
    stimulus,
    isTarget: i >= n && seq[i - n] === stimulus,
  }));
}

/**
 * Score a player's responses against the trial sequence.
 *
 * @param trials  The generated sequence.
 * @param responses Boolean per-trial: true if player pressed "match" on
 *                  that trial. Length must equal trials.length.
 */
export function scoreNBack(
  trials: readonly NBackTrial[],
  responses: readonly boolean[],
): NBackResult {
  if (responses.length !== trials.length) {
    throw new Error('responses.length must equal trials.length');
  }

  let hits = 0;
  let correctRejections = 0;
  let misses = 0;
  let falseAlarms = 0;
  let totalTargets = 0;

  for (let i = 0; i < trials.length; i++) {
    const t = trials[i]!;
    const r = responses[i]!;
    if (t.isTarget) totalTargets++;
    if (t.isTarget && r) hits++;
    else if (t.isTarget && !r) misses++;
    else if (!t.isTarget && r) falseAlarms++;
    else correctRejections++;
  }

  const total = trials.length;
  const accuracy = total === 0 ? 0 : (hits + correctRejections) / total;
  const sensitivity = totalTargets === 0 ? 0 : hits / totalTargets;
  return {
    hits,
    correctRejections,
    misses,
    falseAlarms,
    total,
    accuracy,
    sensitivity,
  };
}

/**
 * Convert N-back accuracy into a damage multiplier for offensive spells.
 * Sensitivity is weighted higher than raw accuracy because false alarms
 * (commission errors) are the more diagnostic failure mode in N-back.
 *
 * Output is in [0, 1.6]: perfect performance grants up to a 60% bonus.
 */
export function nBackDamageMultiplier(result: NBackResult): number {
  const blended = result.accuracy * 0.4 + result.sensitivity * 0.6;
  // Map [0..1] to [0.2..1.6] (whiff still does some chip damage).
  return 0.2 + blended * 1.4;
}

/**
 * Decide whether to upgrade the player's working spell n-back level.
 * Per blueprint: 100% accuracy on a load over 3 consecutive turns.
 */
export function shouldUpgradeNBack(
  recentAccuracies: readonly number[],
  required: number = 3,
  threshold: number = 1.0,
): boolean {
  if (recentAccuracies.length < required) return false;
  const tail = recentAccuracies.slice(-required);
  return tail.every((a) => a >= threshold);
}
