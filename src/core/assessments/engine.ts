/**
 * Assessment Engine - pure functions for scoring and aggregation.
 * Spec: docs/STAGE-ASSESSMENT-ARCHITECTURE Part V.
 *
 * All functions are pure: state in, result out. No side effects.
 */
import type {
  StageAssessment,
  TrialResult,
  AssessmentResult,
  ScoringRubric,
  MeasureDimension,
} from './types.js';

const ALL_DIMENSIONS: readonly MeasureDimension[] = [
  'accuracy',
  'response_time',
  'consistency',
  'depth',
  'self_correction',
  'complexity_handled',
  'transfer',
  'metacognition',
  'coherence',
  'integration',
];

/**
 * Compute weighted average for each dimension across trials.
 * Dimensions not present in a trial are excluded from that trial's contribution.
 * Weights from the rubric determine each dimension's importance in the final score.
 */
export function scoreTrials(
  trials: readonly TrialResult[],
  rubric: ScoringRubric,
): Record<MeasureDimension, number> {
  const result = {} as Record<MeasureDimension, number>;

  for (const dim of ALL_DIMENSIONS) {
    const values: number[] = [];
    for (const trial of trials) {
      const v = trial.dimensions[dim];
      if (v !== undefined) {
        values.push(v);
      }
    }
    if (values.length === 0) {
      result[dim] = 0;
    } else {
      const sum = values.reduce((a, b) => a + b, 0);
      result[dim] = sum / values.length;
    }
  }

  return result;
}

/**
 * Compute confidence in the pass/fail determination.
 * Formula: distance * consistency * trialFactor
 *   - distance: normalized distance of weighted score from threshold
 *   - consistency: 1 - variance of dimension scores across trials
 *   - trialFactor: min(1, trials.length / 6) - more trials = more confidence
 */
export function computeConfidence(
  trials: readonly TrialResult[],
  passThreshold: number,
): number {
  if (trials.length === 0) return 0;

  // Compute weighted score across all trials (average of all dimensions present)
  const trialScores: number[] = [];
  for (const trial of trials) {
    const values = Object.values(trial.dimensions).filter(
      (v): v is number => v !== undefined,
    );
    if (values.length > 0) {
      trialScores.push(values.reduce((a, b) => a + b, 0) / values.length);
    }
  }

  if (trialScores.length === 0) return 0;

  const mean = trialScores.reduce((a, b) => a + b, 0) / trialScores.length;

  // distance: how far from the threshold (normalized 0-1)
  const distance = Math.min(1, Math.abs(mean - passThreshold));

  // consistency: 1 - variance (clamped to 0-1)
  const variance =
    trialScores.length > 1
      ? trialScores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / trialScores.length
      : 0;
  const consistency = Math.max(0, 1 - variance);

  // trialFactor: more trials increases confidence, saturates at 6
  const trialFactor = Math.min(1, trials.length / 6);

  return distance * consistency * trialFactor;
}

/**
 * Run an assessment by aggregating trial results against a module's rubric.
 * Returns a full AssessmentResult with pass/fail determination.
 */
export function runAssessment(
  module: StageAssessment,
  trials: readonly TrialResult[],
): AssessmentResult {
  const rubric = module.scoringRubric;
  const dimensions = scoreTrials(trials, rubric);

  // Compute weighted score using rubric dimension weights
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of ALL_DIMENSIONS) {
    const weight = rubric.dimensionWeights[dim] ?? 0;
    if (weight > 0) {
      weightedSum += dimensions[dim] * weight;
      totalWeight += weight;
    }
  }

  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const passed = weightedScore >= rubric.passThreshold;
  const confidence = computeConfidence(trials, rubric.passThreshold);

  return {
    line: module.line,
    stage: module.stage,
    passed,
    confidence,
    dimensions,
    rawTrials: trials,
  };
}
