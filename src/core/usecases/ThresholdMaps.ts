/**
 * ThresholdMaps — per-line threshold→stage mappings for onboarding calibration.
 * Each line has its own scale; thresholdToStage finds the highest stage
 * whose threshold the player meets or exceeds.
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';

type ThresholdMap = readonly (readonly [number, Stage])[];

const COGNITIVE: ThresholdMap = [
  [1, 'Infrared'], [1.3, 'Magenta'], [1.8, 'Red'], [2.2, 'Amber'],
  [2.8, 'Orange'], [3.5, 'Green'], [4, 'Turquoise'], [5, 'White'],
];

const EMOTIONAL: ThresholdMap = [
  [1, 'Infrared'], [1.5, 'Magenta'], [2, 'Red'], [2.5, 'Amber'],
  [3, 'Orange'], [3.5, 'Green'], [4, 'Turquoise'], [4.5, 'White'],
];

/** Somatic: lower RT = higher stage. Map stores RT cutoffs in ascending order. */
const SOMATIC: ThresholdMap = [
  [900, 'Infrared'], [800, 'Magenta'], [700, 'Red'], [600, 'Amber'],
  [500, 'Orange'], [400, 'Green'], [300, 'Turquoise'], [200, 'White'],
];

const WILLPOWER: ThresholdMap = [
  [1, 'Infrared'], [2, 'Magenta'], [3, 'Red'], [4, 'Amber'],
  [5, 'Orange'], [7, 'Green'], [9, 'Turquoise'], [12, 'White'],
];

export const THRESHOLD_MAPS: Record<Line, ThresholdMap> = {
  Cognitive: COGNITIVE,
  Emotional: EMOTIONAL,
  Moral: EMOTIONAL,
  Intrapersonal: EMOTIONAL,
  Spiritual: EMOTIONAL,
  Somatic: SOMATIC,
  Willpower: WILLPOWER,
  Interpersonal: EMOTIONAL,
};

/**
 * Map a threshold value to a stage for a given line.
 * For Somatic, lower RT = higher stage (cutoffs descend).
 * For all others, higher threshold = higher stage (cutoffs ascend).
 */
export function thresholdToStage(line: Line, threshold: number): Stage {
  const map = THRESHOLD_MAPS[line];

  if (line === 'Somatic') {
    // Inverted: lower threshold (faster RT) = higher stage.
    // Map is sorted descending: [900→Infrared, 800→Magenta, ... 200→White]
    let result: Stage = 'Infrared';
    for (const [cutoff, stage] of map) {
      if (threshold <= cutoff) {
        result = stage;
      }
    }
    return result;
  }

  // Standard: higher threshold = higher stage
  let result: Stage = 'Infrared';
  for (const [cutoff, stage] of map) {
    if (threshold >= cutoff) {
      result = stage;
    }
  }
  return result;
}
