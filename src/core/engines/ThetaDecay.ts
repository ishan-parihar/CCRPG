/**
 * ThetaDecay — computes per-cell staleness via exponential decay.
 * Spec: foundations/16 §6, foundations/24 §3.2
 */

export interface ThetaParams {
  readonly halfLife: number; // ms — default time for staleness to reach 0.5
  readonly bleedThreshold: number; // 0-1 — staleness above this triggers bleed-through
  readonly lineHalfLives?: Record<string, number>; // per-line half-life overrides
}

export const DEFAULT_THETA_PARAMS: ThetaParams = {
  halfLife: 7 * 24 * 60 * 60 * 1000, // 7 days
  bleedThreshold: 0.7,
  // G.27: Per-line theta decay — different lines decay at different rates
  lineHalfLives: {
    Somatic: 3 * 24 * 60 * 60 * 1000,      // 3 days (body memory fades fast)
    Willpower: 4 * 24 * 60 * 60 * 1000,     // 4 days
    Emotional: 5 * 24 * 60 * 60 * 1000,     // 5 days
    Interpersonal: 5 * 24 * 60 * 60 * 1000, // 5 days
    Cognitive: 7 * 24 * 60 * 60 * 1000,     // 7 days (default)
    Intrapersonal: 7 * 24 * 60 * 60 * 1000, // 7 days
    Moral: 8 * 24 * 60 * 60 * 1000,         // 8 days
    Spiritual: 10 * 24 * 60 * 60 * 1000,    // 10 days (spiritual insights persist)
  },
};

/** Compute staleness score (0 = fresh, 1 = fully decayed) for a single cell. */
export function computeCellStaleness(lastEncounterMs: number, now: number, halfLife: number): number {
  const elapsed = now - lastEncounterMs;
  if (elapsed <= 0) return 0;
  return 1 - Math.pow(0.5, elapsed / halfLife);
}

/** Compute staleness for all cells. Key format: `${line}:${stage}` */
export function computeStaleness(
  timestamps: Readonly<Record<string, number>>,
  now: number,
  params: ThetaParams = DEFAULT_THETA_PARAMS,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key of Object.keys(timestamps)) {
    const [line] = key.split(':');
    const halfLife = params.lineHalfLives?.[line] ?? params.halfLife;
    result[key] = computeCellStaleness(timestamps[key]!, now, halfLife);
  }
  return result;
}

/**
 * Apply urgency power curve to raw staleness.
 * Spec: foundations/24 §3.2.1 - gentle at low decay, steep at high.
 */
export function computeUrgency(staleness: number): number {
  return Math.pow(Math.max(0, Math.min(1, staleness)), 1.5);
}

/** Return cell keys where staleness exceeds bleed-through threshold. */
export function detectBleedThrough(
  timestamps: Readonly<Record<string, number>>,
  now: number,
  params: ThetaParams = DEFAULT_THETA_PARAMS,
): string[] {
  const staleness = computeStaleness(timestamps, now, params);
  return Object.entries(staleness)
    .filter(([_, s]) => s >= params.bleedThreshold)
    .map(([key]) => key);
}
