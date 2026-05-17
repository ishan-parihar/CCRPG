/**
 * HeldInputTask — sustained motor control (posture/held-input).
 * Player must hold an input for a target duration, resisting perturbations.
 */

export interface HeldInputTrial {
  /** Target hold duration in ms. */
  readonly targetMs: number;
  /** Whether a perturbation occurs during the hold. */
  readonly hasPerturbation: boolean;
  /** Time at which perturbation occurs (ms from start). */
  readonly perturbationAtMs: number;
}

export interface HeldInputResponse {
  /** Actual duration the player held (ms). */
  readonly heldMs: number;
  /** Whether the player released during perturbation. */
  readonly releasedDuringPerturbation: boolean;
}

export interface HeldInputResult {
  readonly success: boolean;
  /** Ratio of held time to target (clamped to [0, 1]). */
  readonly holdRatio: number;
  readonly resistedPerturbation: boolean;
}

export function generateHeldInputTrial(
  rng: () => number = Math.random,
  targetMs: number = 3000,
  perturbationChance: number = 0.4,
): HeldInputTrial {
  const hasPerturbation = rng() < perturbationChance;
  const perturbationAtMs = hasPerturbation
    ? Math.round(targetMs * (0.3 + rng() * 0.4))
    : 0;
  return { targetMs, hasPerturbation, perturbationAtMs };
}

export function scoreHeldInput(trial: HeldInputTrial, response: HeldInputResponse): HeldInputResult {
  const holdRatio = Math.min(1, response.heldMs / trial.targetMs);
  const success = holdRatio >= 0.9;
  const resistedPerturbation = trial.hasPerturbation && !response.releasedDuringPerturbation;
  return { success, holdRatio, resistedPerturbation };
}
