/**
 * Scoring mode router - applies mode-specific scoring logic per trial.
 * Spec: docs/STAGE-ASSESSMENT-ARCHITECTURE Part V.
 *
 * Four execution modes, each producing different scoring signals:
 *   capacity    - standard pass/fail against rubric
 *   shadow      - drive-health probe scoring (dark/golden per drive)
 *   calibration - information gain / convergence signal
 *   practice    - improvement tracking (delta from baseline)
 */
import type {
  ModuleExecutionMode,
  TrialResult,
  ScoringRubric,
  MeasureDimension,
} from './types.js';

export interface ScoredTrial extends TrialResult {
  readonly mode: ModuleExecutionMode;
  readonly weightedScore: number;
  readonly modeSpecific: Record<string, number>;
}

/**
 * Score a single trial according to the active execution mode.
 */
export function scoreTrial(
  mode: ModuleExecutionMode,
  trial: TrialResult,
  rubric: ScoringRubric,
): ScoredTrial {
  switch (mode) {
    case 'capacity':
      return scoreCapacity(trial, rubric);
    case 'shadow':
      return scoreShadow(trial, rubric);
    case 'calibration':
      return scoreCalibration(trial, rubric);
    case 'practice':
      return scorePractice(trial, rubric);
  }
}

function computeWeightedScore(
  dimensions: Partial<Record<MeasureDimension, number>>,
  rubric: ScoringRubric,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [dim, weight] of Object.entries(rubric.dimensionWeights)) {
    if (weight === undefined || weight === 0) continue;
    const value = dimensions[dim as MeasureDimension];
    if (value !== undefined) {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Capacity mode: score against dimension weights and passThreshold.
 */
function scoreCapacity(trial: TrialResult, rubric: ScoringRubric): ScoredTrial {
  const weightedScore = computeWeightedScore(trial.dimensions, rubric);
  const passed = weightedScore >= rubric.passThreshold ? 1 : 0;
  const margin = weightedScore - rubric.passThreshold;

  return {
    ...trial,
    mode: 'capacity',
    weightedScore,
    modeSpecific: {
      passed,
      margin,
      threshold: rubric.passThreshold,
    },
  };
}

/**
 * Shadow mode: score against drive-health signals.
 * Dark shadow = score well below threshold (avoidance/suppression).
 * Golden shadow = score well above threshold but inconsistently (projection).
 */
function scoreShadow(trial: TrialResult, rubric: ScoringRubric): ScoredTrial {
  const weightedScore = computeWeightedScore(trial.dimensions, rubric);
  const deviation = weightedScore - rubric.passThreshold;

  // Dark shadow signal: low performance suggests avoidance
  const darkSignal = Math.max(0, -deviation);
  // Golden shadow signal: high variance with high performance suggests projection
  const goldenSignal = Math.max(0, deviation * 0.5);

  return {
    ...trial,
    mode: 'shadow',
    weightedScore,
    modeSpecific: {
      darkSignal,
      goldenSignal,
      deviation,
    },
  };
}

/**
 * Calibration mode: score for convergence signal (information gain).
 * Higher surprise (distance from expected) = more informative trial.
 */
function scoreCalibration(trial: TrialResult, rubric: ScoringRubric): ScoredTrial {
  const weightedScore = computeWeightedScore(trial.dimensions, rubric);
  // Information gain: how much this trial's score deviates from the threshold
  // Trials near the boundary are most informative for calibration
  const distFromThreshold = Math.abs(weightedScore - rubric.passThreshold);
  const informationGain = 1 - distFromThreshold; // near-boundary = high info
  const convergenceSignal = Math.max(0, Math.min(1, informationGain));

  return {
    ...trial,
    mode: 'calibration',
    weightedScore,
    modeSpecific: {
      convergenceSignal,
      distFromThreshold,
      informationGain: convergenceSignal,
    },
  };
}

/**
 * Practice mode: score for improvement tracking.
 * Delta from baseline indicates growth direction and magnitude.
 */
function scorePractice(trial: TrialResult, rubric: ScoringRubric): ScoredTrial {
  const weightedScore = computeWeightedScore(trial.dimensions, rubric);
  // In practice mode, we track improvement relative to baseline (threshold as proxy)
  const deltaFromBaseline = weightedScore - rubric.passThreshold;
  const improvementSignal = Math.max(0, deltaFromBaseline);
  const effortScore = Math.min(1, weightedScore);

  return {
    ...trial,
    mode: 'practice',
    weightedScore,
    modeSpecific: {
      deltaFromBaseline,
      improvementSignal,
      effortScore,
    },
  };
}
