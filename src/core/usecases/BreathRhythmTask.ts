/**
 * BreathRhythmTask — breath-paced rhythm paradigm.
 * Player taps in sync with a target rhythm (inhale/exhale cycle).
 */

export interface BreathCycle {
  /** Inhale duration in ms. */
  readonly inhaleMs: number;
  /** Exhale duration in ms. */
  readonly exhaleMs: number;
}

export interface BreathTrial {
  readonly cycle: BreathCycle;
  readonly totalCycles: number;
}

export interface BreathResponse {
  /** Timestamps of player taps (ms from trial start). */
  readonly tapTimestamps: readonly number[];
}

export interface BreathResult {
  /** Mean absolute deviation from ideal tap times (ms). */
  readonly meanDeviationMs: number;
  /** Coherence score in [0, 1]. */
  readonly coherence: number;
}

export function generateBreathTrial(
  inhaleMs: number = 4000,
  exhaleMs: number = 4000,
  totalCycles: number = 4,
): BreathTrial {
  return { cycle: { inhaleMs, exhaleMs }, totalCycles };
}

export function scoreBreath(trial: BreathTrial, response: BreathResponse): BreathResult {
  const cycleMs = trial.cycle.inhaleMs + trial.cycle.exhaleMs;
  // Ideal taps at the start of each exhale
  const idealTaps: number[] = [];
  for (let i = 0; i < trial.totalCycles; i++) {
    idealTaps.push(i * cycleMs + trial.cycle.inhaleMs);
  }

  if (response.tapTimestamps.length === 0) {
    return { meanDeviationMs: cycleMs, coherence: 0 };
  }

  // Match each ideal tap to nearest actual tap
  let totalDeviation = 0;
  for (const ideal of idealTaps) {
    let minDev = Infinity;
    for (const actual of response.tapTimestamps) {
      const dev = Math.abs(actual - ideal);
      if (dev < minDev) minDev = dev;
    }
    totalDeviation += minDev;
  }

  const meanDeviationMs = totalDeviation / idealTaps.length;
  // Coherence: 1.0 at 0 deviation, 0.0 at deviation >= half cycle
  const coherence = Math.max(0, 1 - meanDeviationMs / (cycleMs / 2));

  return { meanDeviationMs: Math.round(meanDeviationMs), coherence };
}
