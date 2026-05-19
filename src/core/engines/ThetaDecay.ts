/**
 * ThetaDecay — computes per-cell staleness via exponential decay.
 * Spec: foundations/16 §6, foundations/24 §3.2
 */

export interface ThetaParams {
  readonly halfLife: number; // ms — time for staleness to reach 0.5
  readonly bleedThreshold: number; // 0-1 — staleness above this triggers bleed-through
}

export const DEFAULT_THETA_PARAMS: ThetaParams = {
  halfLife: 7 * 24 * 60 * 60 * 1000, // 7 days
  bleedThreshold: 0.7,
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
    result[key] = computeCellStaleness(timestamps[key]!, now, params.halfLife);
  }
  return result;
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
