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
  CurriculumTaskType,
} from './types.js';
import { ALL_DEPTH_LEVELS, depthOrdinal } from './types.js';

// ---------------------------------------------------------------------------
// Rubric Evaluation Input
// ---------------------------------------------------------------------------

/**
 * Evidence of what the student demonstrated during assessment.
 * Used for multi-dimensional rubric scoring — replaces the flat scores average
 * with canDo/cannotDo/taskType evidence checking.
 */
export interface RubricEvaluationInput {
  /** Skills/capabilities the student demonstrated (matched against canDo). */
  readonly demonstratedCapabilities: readonly string[];
  /** Skills/capabilities the student failed to demonstrate (matched against cannotDo). */
  readonly failedCapabilities: readonly string[];
  /** The task type used for this assessment (checked against appropriateTasks). */
  readonly taskType: CurriculumTaskType;
  /** Numeric scores from the assessment (used as fallback / supplement). */
  readonly scores: Readonly<Record<string, number>>;
  /**
   * Optional LLM-evaluated rubric response.
   * When present, used as primary evidence alongside canDo/cannotDo matching.
   */
  readonly llmEvaluation?: {
    readonly score: number;
    readonly rationale: string;
    readonly matchedCanDo: readonly string[];
    readonly matchedCannotDo: readonly string[];
  };
}

// ---------------------------------------------------------------------------
// Depth Classification
// ---------------------------------------------------------------------------

/**
 * Compute the rubric match score for a given depth level.
 * Returns a score from 0.0 to 1.0 based on:
 * - canDo items matched (positive signal)
 * - cannotDo items demonstrated (negative signal)
 * - appropriateTasks alignment (modality fit)
 * - numeric scores (supplementary)
 */
function computeRubricMatchScore(
  input: RubricEvaluationInput,
  levelEntry: { readonly canDo: readonly string[]; readonly cannotDo: readonly string[]; readonly appropriateTasks: readonly CurriculumTaskType[]; readonly threshold: number },
): { score: number; confidence: number } {
  let positiveSignals = 0;
  let negativeSignals = 0;
  let totalCanDo = levelEntry.canDo.length;
  let totalCannotDo = levelEntry.cannotDo.length;

  // 1. Check canDo items against demonstrated capabilities
  // Uses startsWith matching to avoid false positives (e.g., 'read' matching 'bread').
  for (const canDoItem of levelEntry.canDo) {
    const matched = input.demonstratedCapabilities.some(
      cap => cap.toLowerCase().startsWith(canDoItem.toLowerCase()) ||
             canDoItem.toLowerCase().startsWith(cap.toLowerCase()),
    );
    if (matched) positiveSignals++;
  }

  // 2. Check cannotDo items — if student demonstrated a cannotDo, that's a negative signal
  // Uses startsWith matching to avoid false positives (e.g., 'read' matching 'bread').
  for (const cannotDoItem of levelEntry.cannotDo) {
    const demonstrated = input.demonstratedCapabilities.some(
      cap => cap.toLowerCase().startsWith(cannotDoItem.toLowerCase()) ||
             cannotDoItem.toLowerCase().startsWith(cap.toLowerCase()),
    );
    if (demonstrated) negativeSignals++;
  }

  // 3. Task type alignment — bonus if the task type matches appropriateTasks
  const taskTypeMatch = levelEntry.appropriateTasks.includes(input.taskType);
  const taskBonus = taskTypeMatch ? 0.1 : -0.05;

  // 4. LLM evaluation integration (primary when available)
  let llmBonus = 0;
  if (input.llmEvaluation) {
    // LLM score contributes 40% of the final score
    llmBonus = input.llmEvaluation.score * 0.4;
    // Additional canDo/cannotDo from LLM evaluation
    for (const matched of input.llmEvaluation.matchedCanDo) {
      if (!input.demonstratedCapabilities.includes(matched)) {
        positiveSignals += 0.5; // Partial credit for LLM-identified capabilities
      }
    }
    for (const matched of input.llmEvaluation.matchedCannotDo) {
      if (!input.failedCapabilities.includes(matched)) {
        negativeSignals += 0.5;
      }
    }
  }

  // 5. Numeric scores (supplementary — 30% weight when no LLM, 20% with LLM)
  const numericWeight = input.llmEvaluation ? 0.2 : 0.3;
  let numericAvg = 0;
  const numericValues = Object.values(input.scores).filter((v): v is number => typeof v === 'number');
  if (numericValues.length > 0) {
    numericAvg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  }

  // Compute composite score
  const canDoScore = totalCanDo > 0 ? positiveSignals / totalCanDo : 0;
  const cannotDoPenalty = totalCannotDo > 0 ? (negativeSignals / totalCannotDo) * 0.3 : 0;
  const evidenceBonus = input.demonstratedCapabilities.length > 0 ? 0.05 : 0;

  const score = Math.max(0, Math.min(1,
    canDoScore * 0.5 +
    llmBonus +
    numericAvg * numericWeight +
    taskBonus +
    evidenceBonus -
    cannotDoPenalty
  ));

  // Confidence based on evidence richness and consistency
  const evidenceCount = input.demonstratedCapabilities.length + input.failedCapabilities.length;
  const evidenceConfidence = Math.min(1, evidenceCount / 4);
  const llmConfidence = input.llmEvaluation ? 0.3 : 0;
  const confidence = Math.min(1, evidenceConfidence * 0.4 + llmConfidence + (numericValues.length > 0 ? 0.2 : 0));

  return { score, confidence };
}

/**
 * Classify a response into a depth level using multi-dimensional rubric scoring.
 *
 * Upgraded from flat average scoring to evidence-based classification:
 * - Checks canDo items against demonstrated capabilities
 * - Penalizes cannotDo items that were demonstrated
 * - Validates appropriateTasks alignment
 * - Integrates LLM rubric evaluation when available
 * - Falls back to numeric scores when evidence is sparse
 */
export function classifyDepth(
  input: RubricEvaluationInput,
  rubric: DepthRubric,
): { level: DepthLevel; confidence: number } {
  const levels = ALL_DEPTH_LEVELS.slice(1); // skip 'absent'

  // Check from deepest to shallowest
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    const entry = rubric.levels[level as keyof typeof rubric.levels];
    if (!entry) continue;

    const { score, confidence } = computeRubricMatchScore(input, entry);

    if (score >= entry.threshold) {
      // Confidence adjusted by margin above threshold
      const margin = score - entry.threshold;
      const adjustedConfidence = Math.min(1, confidence + margin * 0.5);

      return {
        level,
        confidence: Math.max(0.1, adjustedConfidence),
      };
    }
  }

  // Default: memorized with low confidence when no level matches
  return { level: 'memorized', confidence: 0.3 };
}

/**
 * Legacy classifyDepth wrapper for backward compatibility.
 * Accepts flat scores and rubric, constructs a minimal RubricEvaluationInput.
 */
export function classifyDepthFromScores(
  scores: Readonly<Record<string, number>>,
  rubric: DepthRubric,
  taskType: CurriculumTaskType = 'factual_recall',
): { level: DepthLevel; confidence: number } {
  return classifyDepth(
    {
      demonstratedCapabilities: [],
      failedCapabilities: [],
      taskType,
      scores,
    },
    rubric,
  );
}

// ---------------------------------------------------------------------------
// Dual-Depth Assessment
// ---------------------------------------------------------------------------

/** Produce a DualDepthResult from assessment data. */
export function assessDualDepth(params: {
  readonly conceptId: string;
  readonly evaluationInput: RubricEvaluationInput;
  readonly depthRubric: DepthRubric;
  readonly driveScores: Readonly<Record<string, number>>;
  readonly driveSignals: Readonly<Record<string, string>>;
  readonly shadowDetected: string | null;
  readonly shadowIntensity: number;
  readonly predictedDepth: DepthLevel;
  readonly confidenceInPrediction: number;
  readonly timestamp?: number;
}): DualDepthResult {
  const { level, confidence } = classifyDepth(params.evaluationInput, params.depthRubric);

  const calibrationError = Math.abs(
    depthOrdinal(params.predictedDepth) - depthOrdinal(level),
  ) / (ALL_DEPTH_LEVELS.length - 1);

  return {
    conceptId: params.conceptId,
    timestamp: params.timestamp ?? Date.now(),
    knowledgeDepth: {
      level,
      confidence,
      evidence: buildEvidence(level, params.evaluationInput.scores),
      dimensions: params.evaluationInput.scores as Readonly<Record<string, number>>,
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
