/**
 * DepthAssessment — dual-depth scoring engine.
 * Spec: docs/foundations/31-depth-assessment-model.md
 *
 * Assesses both knowledge depth (Bloom's taxonomy) and developmental
 * capacity (drives, shadows) from a single curriculum encounter.
 *
 * Pure functions: data in, results out. No side effects.
 */
import type {
  DepthLevel,
  DepthRubric,
  DualDepthResult,
  ConceptState,
  DepthHistoryEntry,
} from './types.js';
import { ALL_DEPTH_LEVELS, depthOrdinal } from './types.js';

// ---------------------------------------------------------------------------
// Depth Classification
// ---------------------------------------------------------------------------

/** Classify a response into a depth level based on rubric thresholds. */
export function classifyDepth(
  scores: Readonly<Record<string, number>>,
  rubric: DepthRubric,
): { level: DepthLevel; confidence: number } {
  const levels = ALL_DEPTH_LEVELS.slice(1); // skip 'absent'

  // Check from deepest to shallowest
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    const entry = rubric.levels[level as keyof typeof rubric.levels];
    if (!entry) continue;

    // Compute a composite score for this level
    let totalScore = 0;
    let scoreCount = 0;

    for (const value of Object.values(scores)) {
      if (typeof value === 'number') {
        totalScore += value;
        scoreCount++;
      }
    }

    const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    if (avgScore >= entry.threshold) {
      // Confidence based on how far above the threshold
      const margin = avgScore - entry.threshold;
      const confidence = Math.min(1, 0.5 + margin * 2);

      // Check that scores are consistent (no major drops in key dimensions)
      const minScore = scoreCount > 0
        ? Math.min(...Object.values(scores).filter((v): v is number => typeof v === 'number'))
        : 0;
      const consistencyPenalty = minScore < entry.threshold * 0.5 ? 0.2 : 0;

      return {
        level,
        confidence: Math.max(0, confidence - consistencyPenalty),
      };
    }
  }

  return { level: 'memorized', confidence: 0.3 };
}

// ---------------------------------------------------------------------------
// Dual-Depth Assessment
// ---------------------------------------------------------------------------

/** Produce a DualDepthResult from assessment data. */
export function assessDualDepth(params: {
  readonly conceptId: string;
  readonly knowledgeScores: Readonly<Record<string, number>>;
  readonly depthRubric: DepthRubric;
  readonly driveScores: Readonly<Record<string, number>>;
  readonly driveSignals: Readonly<Record<string, string>>;
  readonly shadowDetected: string | null;
  readonly shadowIntensity: number;
  readonly predictedDepth: DepthLevel;
  readonly confidenceInPrediction: number;
  readonly timestamp?: number;
}): DualDepthResult {
  const { level, confidence } = classifyDepth(params.knowledgeScores, params.depthRubric);

  const calibrationError = Math.abs(
    depthOrdinal(params.predictedDepth) - depthOrdinal(level),
  ) / (ALL_DEPTH_LEVELS.length - 1);

  return {
    conceptId: params.conceptId,
    timestamp: params.timestamp ?? Date.now(),
    knowledgeDepth: {
      level,
      confidence,
      evidence: buildEvidence(level, params.knowledgeScores),
      dimensions: params.knowledgeScores,
    },
    developmentalSignal: {
      driveScores: params.driveScores as Readonly<Record<string, number>>,
      driveSignals: params.driveSignals as Readonly<Record<string, string>>,
      shadowDetected: params.shadowDetected,
      shadowIntensity: params.shadowIntensity,
    },
    metacognition: {
      predictedDepth: params.predictedDepth,
      actualDepth: level,
      calibrationError,
      confidenceInPrediction: params.confidenceInPrediction,
    },
  };
}

// ---------------------------------------------------------------------------
// Concept State Updates
// ---------------------------------------------------------------------------

/** Update a ConceptState after a depth assessment. */
export function updateConceptState(
  existing: ConceptState | undefined,
  result: DualDepthResult,
  now: number,
): ConceptState {
  const prev = existing ?? {
    depthLevel: 'absent' as DepthLevel,
    retention: 0,
    lastReviewedAt: 0,
    reviewCount: 0,
    depthHistory: [],
    misconceptionFlags: [],
  };

  const newLevel = result.knowledgeDepth.level;
  const prevOrdinal = depthOrdinal(prev.depthLevel);
  const newOrdinal = depthOrdinal(newLevel);

  // Only update depth if it progressed (or if this is first encounter)
  const effectiveLevel = newOrdinal >= prevOrdinal ? newLevel : prev.depthLevel;

  // Add history entry if depth changed
  const history: DepthHistoryEntry[] = [...prev.depthHistory];
  if (effectiveLevel !== prev.depthLevel || prev.depthHistory.length === 0) {
    history.push({
      level: effectiveLevel,
      timestamp: now,
      evidence: result.knowledgeDepth.evidence.join('; '),
    });
  }

  // Track misconceptions
  const misconceptions = [...prev.misconceptionFlags];
  if (result.developmentalSignal.shadowDetected && !misconceptions.includes(result.developmentalSignal.shadowDetected)) {
    misconceptions.push(result.developmentalSignal.shadowDetected);
  }

  return {
    depthLevel: effectiveLevel,
    retention: 1.0, // Reset retention on successful assessment
    lastReviewedAt: now,
    reviewCount: prev.reviewCount + 1,
    depthHistory: history,
    misconceptionFlags: misconceptions,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildEvidence(level: DepthLevel, scores: Readonly<Record<string, number>>): readonly string[] {
  const evidence: string[] = [`Classified at "${level}" depth`];
  const entries = Object.entries(scores).filter(([_, v]) => typeof v === 'number');
  if (entries.length > 0) {
    const avg = entries.reduce((sum, [_, v]) => sum + (v as number), 0) / entries.length;
    evidence.push(`Average score: ${avg.toFixed(2)}`);
  }
  return evidence;
}
