/**
 * ScoringBridge — bridges TaskRenderer TrialResults to the assessment engine.
 * Aggregates TrialResult[] from CLI task renderers into AssessmentResult
 * using the existing scoring functions from engine.ts.
 */
import type { StageAssessment, TrialResult, AssessmentResult, MeasureDimension } from '../types.js';
import { scoreTrials, computeConfidence } from '../engine.js';

/**
 * Aggregate TrialResult[] from CLI task renderers into a full AssessmentResult.
 * Uses the module's rubric for weighted scoring and pass/fail determination.
 */
export function aggregateTrials(
  module: StageAssessment,
  trials: readonly TrialResult[],
): AssessmentResult {
  const rubric = module.scoringRubric;
  const dimensions = scoreTrials(trials, rubric);

  // Compute weighted score using rubric dimension weights
  let weightedSum = 0;
  let totalWeight = 0;
  const ALL_DIMENSIONS: readonly MeasureDimension[] = [
    'accuracy', 'response_time', 'consistency', 'depth', 'self_correction',
    'complexity_handled', 'transfer', 'metacognition', 'coherence', 'integration',
  ];

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

/**
 * Compute per-drive health scores from trial results.
 * Maps trials back to drive probes by matching task IDs.
 */
export function computeDriveHealthFromTrials(
  module: StageAssessment,
  trials: readonly TrialResult[],
): {
  driveScores: { agency: number; communion: number; eros: number; agape: number };
  driveSignals: { agency: string; communion: string; eros: string; agape: string };
} {
  const driveKeys = ['agency', 'communion', 'eros', 'agape'] as const;
  const probeTaskIds: Record<string, string> = {
    agency: module.driveProbes.agency.task.id,
    communion: module.driveProbes.communion.task.id,
    eros: module.driveProbes.eros.task.id,
    agape: module.driveProbes.agape.task.id,
  };

  const driveScores: Record<string, number> = {};
  const driveSignals: Record<string, string> = {};

  for (const drive of driveKeys) {
    const probeTaskId = probeTaskIds[drive];
    const probeTrials = trials.filter(t => t.taskId === probeTaskId);

    if (probeTrials.length === 0) {
      // No probe-specific trials — use average of all trials as baseline
      const allScores = trials.map(t => {
        const vals = Object.values(t.dimensions).filter((v): v is number => v !== undefined);
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
      });
      const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0.5;
      driveScores[drive] = Math.min(1, Math.max(0, avg));
      driveSignals[drive] = 'HealthyBalanced';
    } else {
      const scores = probeTrials.map(t => {
        const vals = Object.values(t.dimensions).filter((v): v is number => v !== undefined);
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
      });
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Determine signal from score level
      if (avg >= 0.7) driveSignals[drive] = 'HealthyBalanced';
      else if (avg >= 0.5) driveSignals[drive] = 'HealthyBalanced';
      else driveSignals[drive] = 'DarkAddicted';

      driveScores[drive] = Math.min(1, Math.max(0, avg));
    }
  }

  return {
    driveScores: {
      agency: driveScores.agency ?? 0.5,
      communion: driveScores.communion ?? 0.5,
      eros: driveScores.eros ?? 0.5,
      agape: driveScores.agape ?? 0.5,
    },
    driveSignals: {
      agency: driveSignals.agency ?? 'HealthyBalanced',
      communion: driveSignals.communion ?? 'HealthyBalanced',
      eros: driveSignals.eros ?? 'HealthyBalanced',
      agape: driveSignals.agape ?? 'HealthyBalanced',
    },
  };
}
