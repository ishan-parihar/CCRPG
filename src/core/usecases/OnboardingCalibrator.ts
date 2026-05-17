/**
 * OnboardingCalibrator — converts onboarding probe results into initial altitudes.
 * Uses fast staircase (larger steps, 2 reversals → seat at midpoint).
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_STAGES } from '../domain/Stage.js';

export interface ProbeResult {
  readonly line: Line;
  /** Accuracy in [0, 1]. */
  readonly accuracy: number;
  /** Reaction time in ms (optional). */
  readonly reactionMs?: number;
}

export interface CalibrationOutput {
  readonly altitudes: Record<Line, Stage>;
  readonly driveWeights: Record<Drive, number>;
  readonly stage: Stage;
}

/**
 * Calibrate initial altitudes from onboarding probes.
 * Maps accuracy bands to stages:
 *   0.0–0.2 → Infrared, 0.2–0.35 → Magenta, 0.35–0.5 → Red,
 *   0.5–0.65 → Amber, 0.65–0.75 → Orange, 0.75–0.85 → Green,
 *   0.85–0.95 → Turquoise, 0.95–1.0 → White
 */
export function calibrate(
  probes: readonly ProbeResult[],
  driveSignals?: Partial<Record<Drive, number>>,
): CalibrationOutput {
  const altitudes = {} as Record<Line, Stage>;

  for (const probe of probes) {
    altitudes[probe.line] = accuracyToStage(probe.accuracy);
  }

  // Fill missing lines with Infrared
  const allLines: Line[] = [
    'Cognitive', 'Emotional', 'Moral', 'Intrapersonal',
    'Spiritual', 'Somatic', 'Willpower', 'Interpersonal',
  ];
  for (const line of allLines) {
    if (!(line in altitudes)) {
      altitudes[line] = 'Infrared';
    }
  }

  const driveWeights: Record<Drive, number> = {
    Agency: driveSignals?.Agency ?? 0.25,
    Communion: driveSignals?.Communion ?? 0.25,
    Eros: driveSignals?.Eros ?? 0.25,
    Agape: driveSignals?.Agape ?? 0.25,
  };

  // Synthesise: lowest altitude
  let minIdx = 7;
  for (const line of allLines) {
    const idx = ALL_STAGES.indexOf(altitudes[line]);
    if (idx < minIdx) minIdx = idx;
  }

  return {
    altitudes,
    driveWeights,
    stage: ALL_STAGES[minIdx]!,
  };
}

function accuracyToStage(accuracy: number): Stage {
  if (accuracy >= 0.95) return 'White';
  if (accuracy >= 0.85) return 'Turquoise';
  if (accuracy >= 0.75) return 'Green';
  if (accuracy >= 0.65) return 'Orange';
  if (accuracy >= 0.5) return 'Amber';
  if (accuracy >= 0.35) return 'Red';
  if (accuracy >= 0.2) return 'Magenta';
  return 'Infrared';
}
