/**
 * CurriculumBridge — integration functions between curriculum modules and
 * the existing CCRPG engine.
 * Spec: docs/foundations/34-curriculum-engine-bridge.md
 *
 * Bridges curriculum outcomes to developmental Significator updates,
 * and developmental needs to curriculum recommendations.
 *
 * Pure functions: data in, results out. No side effects.
 */
import type {
  DualDepthResult,
  ConceptState,
  KnowledgeState,
  ReviewCandidate,
  CurriculumRecommendation,
  DepthLevel,
  ForgettingCurve,
} from './types.js';
import { ALL_DEPTH_LEVELS } from './types.js';
import { computeReviewCandidates, depthOrdinal } from './ForgettingCurve.js';

// ---------------------------------------------------------------------------
// Curriculum → Developmental Signal
// ---------------------------------------------------------------------------

/** Result of bridging a curriculum outcome to developmental state. */
export interface CurriculumBridgeResult {
  readonly knowledgeUpdate: Partial<KnowledgeState>;
  readonly developmentalSignals: {
    readonly primaryLine: string;
    readonly depthLevel: DepthLevel;
    readonly confidence: number;
    readonly driveScores: Readonly<Record<string, number>>;
    readonly shadowDetected: string | null;
    readonly metacognitionCalibration: number;
  };
  readonly shouldTriggerShadowWork: boolean;
}

/**
 * Bridge a dual-depth result to developmental signals.
 * This is the core integration function that connects curriculum
 * completion to the existing developmental engine.
 */
const EMPTY_KS: KnowledgeState = {
  conceptStates: new Map(),
  subjectProgress: new Map(),
  studyHistory: [],
  learningProfile: {
    preferredModalities: [],
    metacognitionScore: 0.5,
    calibrationAccuracy: 0.5,
    transferCapacity: 0.5,
    studyEfficiency: 0.5,
  },
};

export function bridgeCurriculumToDevelopmental(
  result: DualDepthResult,
  existingKnowledge: KnowledgeState = EMPTY_KS,
): CurriculumBridgeResult {
  const now = result.timestamp;
  const depth = result.knowledgeDepth.level;
  const confidence = result.knowledgeDepth.confidence;

  // Update concept state
  const prevConcept = existingKnowledge.conceptStates.get(result.conceptId);
  const newConceptState = updateConceptFromResult(prevConcept, result, now);

  const newConceptStates = new Map(existingKnowledge.conceptStates);
  newConceptStates.set(result.conceptId, newConceptState);

  // Determine if shadow work should be triggered
  const shouldTriggerShadowWork = result.developmentalSignal.shadowIntensity > 0.6;

  return {
    knowledgeUpdate: {
      conceptStates: newConceptStates as ReadonlyMap<string, ConceptState>,
    },
    developmentalSignals: {
      primaryLine: inferPrimaryLine(result),
      depthLevel: depth,
      confidence,
      driveScores: result.developmentalSignal.driveScores,
      shadowDetected: result.developmentalSignal.shadowDetected,
      metacognitionCalibration: 1 - result.metacognition.calibrationError,
    },
    shouldTriggerShadowWork,
  };
}

// ---------------------------------------------------------------------------
// Developmental → Curriculum Recommendation
// ---------------------------------------------------------------------------

/** A developmental need that could be addressed by curriculum content. */
export interface DevelopmentalNeed {
  readonly type: 'theta_decay' | 'shadow_surface' | 'drive_rebalance' | 'depth_gap';
  readonly line: string;
  readonly currentDepth?: DepthLevel;
  readonly urgency: number;
}

/**
 * Convert a developmental need to a curriculum recommendation.
 * Returns null if no curriculum module addresses this need.
 */
export function bridgeDevelopmentalToCurriculum(
  need: DevelopmentalNeed,
  knowledgeState: KnowledgeState,
  concepts: ReadonlyMap<string, { id: string; primaryLine: string; depthRange: { min: DepthLevel; max: DepthLevel } }>,
  curves: ReadonlyMap<string, ForgettingCurve>,
  now: number,
): CurriculumRecommendation | null {
  switch (need.type) {
    case 'theta_decay':
    case 'depth_gap': {
      // Find concepts on this line that need review
      const candidates = computeReviewCandidates(
        knowledgeState.conceptStates as ReadonlyMap<string, ConceptState>,
        curves,
        now,
      );
      const lineCandidates = candidates.filter(c => {
        const concept = concepts.get(c.conceptId);
        return concept?.primaryLine === need.line;
      });
      if (lineCandidates.length === 0) return null;
      const best = lineCandidates[0]!;
      return {
        conceptId: best.conceptId,
        action: 'review',
        estimatedMinutes: 10,
        rationale: `Review needed: retention at ${(best.currentRetention * 100).toFixed(0)}%`,
        priority: best.priority,
        targetDepth: best.targetDepth,
      };
    }

    case 'drive_rebalance': {
      // Find concepts that exercise the under-expressed line
      const unencountered = [...concepts.values()].filter(c =>
        c.primaryLine === need.line &&
        !knowledgeState.conceptStates.has(c.id),
      );
      if (unencountered.length === 0) return null;
      const target = unencountered[0]!;
      return {
        conceptId: target.id,
        action: 'new_material',
        estimatedMinutes: 15,
        rationale: `New material to address ${need.line} drive imbalance`,
        priority: need.urgency * 0.8,
        targetDepth: 'memorized',
      };
    }

    case 'shadow_surface': {
      // Find concepts with misconception flags on this line
      const flagged = [...knowledgeState.conceptStates.entries()].filter(([id, state]) => {
        const concept = concepts.get(id);
        return concept?.primaryLine === need.line && state.misconceptionFlags.length > 0;
      });
      if (flagged.length === 0) return null;
      const [conceptId, state] = flagged[0]!;
      return {
        conceptId,
        action: 'deepen',
        estimatedMinutes: 12,
        rationale: `Address misconceptions: ${state.misconceptionFlags.join(', ')}`,
        priority: need.urgency,
        targetDepth: nextDepth(state.depthLevel),
      };
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Scheduler Integration
// ---------------------------------------------------------------------------

/** Compute the combined review schedule for curriculum encounters. */
export function computeCurriculumReviewSchedule(
  knowledgeState: KnowledgeState,
  curves: ReadonlyMap<string, ForgettingCurve>,
  now: number,
  maxCandidates: number = 5,
): readonly ReviewCandidate[] {
  return computeReviewCandidates(
    knowledgeState.conceptStates as ReadonlyMap<string, ConceptState>,
    curves,
    now,
  ).slice(0, maxCandidates);
}

/** Compute depth-progression opportunities. */
export function computeDepthProgressions(
  knowledgeState: KnowledgeState,
  concepts: ReadonlyMap<string, { id: string; depthRange: { min: DepthLevel; max: DepthLevel } }>,
): readonly CurriculumRecommendation[] {
  const recommendations: CurriculumRecommendation[] = [];

  for (const [conceptId, concept] of knowledgeState.conceptStates) {
    const spec = concepts.get(conceptId);
    if (!spec) continue;

    const currentOrdinal = depthOrdinal(concept.depthLevel);
    const maxOrdinal = depthOrdinal(spec.depthRange.max);

    if (currentOrdinal < maxOrdinal && concept.retention > 0.7) {
      const targetDepth = ALL_DEPTH_LEVELS[Math.min(currentOrdinal + 1, ALL_DEPTH_LEVELS.length - 1)]!;
      recommendations.push({
        conceptId,
        action: 'deepen',
        estimatedMinutes: 15,
        rationale: `Depth progression: ${concept.depthLevel} → ${targetDepth}`,
        priority: 0.6 + (currentOrdinal / 6) * 0.3,
        targetDepth,
      });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

// ---------------------------------------------------------------------------
// Knowledge Health (for CCI integration)
// ---------------------------------------------------------------------------

/** Compute knowledge health metrics for the CCI engine. */
export function computeKnowledgeHealth(
  knowledgeState: KnowledgeState,
  totalConceptsInCurriculum: number,
): {
  readonly conceptCoverage: number;
  readonly averageDepth: number;
  readonly retentionHealth: number;
  readonly integrationDensity: number;
  readonly misconceptionLoad: number;
} {
  const concepts = knowledgeState.conceptStates;
  if (concepts.size === 0 || totalConceptsInCurriculum === 0) {
    return {
      conceptCoverage: 0,
      averageDepth: 0,
      retentionHealth: 0,
      integrationDensity: 0,
      misconceptionLoad: 0,
    };
  }

  let totalDepth = 0;
  let totalRetention = 0;
  let totalMisconceptions = 0;

  for (const state of concepts.values()) {
    totalDepth += depthOrdinal(state.depthLevel);
    totalRetention += state.retention;
    totalMisconceptions += state.misconceptionFlags.length;
  }

  const count = concepts.size;

  return {
    conceptCoverage: Math.min(1, count / totalConceptsInCurriculum),
    averageDepth: totalDepth / count / (ALL_DEPTH_LEVELS.length - 1),
    retentionHealth: totalRetention / count,
    integrationDensity: Math.min(1, knowledgeState.learningProfile.transferCapacity),
    misconceptionLoad: Math.min(1, totalMisconceptions / Math.max(1, count)),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function updateConceptFromResult(
  prev: ConceptState | undefined,
  result: DualDepthResult,
  now: number,
): ConceptState {
  const depth = result.knowledgeDepth.level;
  const prevDepth = prev?.depthLevel ?? 'absent';
  const effectiveDepth = depthOrdinal(depth) >= depthOrdinal(prevDepth) ? depth : prevDepth;

  return {
    depthLevel: effectiveDepth,
    retention: 1.0,
    lastReviewedAt: now,
    reviewCount: (prev?.reviewCount ?? 0) + 1,
    depthHistory: [
      ...(prev?.depthHistory ?? []),
      { level: effectiveDepth, timestamp: now, evidence: result.knowledgeDepth.evidence.join('; ') },
    ],
    misconceptionFlags: [
      ...(prev?.misconceptionFlags ?? []),
      ...(result.developmentalSignal.shadowDetected ? [result.developmentalSignal.shadowDetected] : []),
    ],
  };
}

function inferPrimaryLine(result: DualDepthResult): string {
  // Infer from drive scores — the strongest drive suggests the primary line
  const drives = result.developmentalSignal.driveScores;
  let maxDrive = 'Agency';
  let maxValue = 0;
  for (const [drive, value] of Object.entries(drives)) {
    if (typeof value === 'number' && value > maxValue) {
      maxValue = value;
      maxDrive = drive;
    }
  }
  // Map drive back to a default line (simplified)
  const driveToLine: Record<string, string> = {
    Agency: 'Cognitive',
    Communion: 'Interpersonal',
    Eros: 'Emotional',
    Agape: 'Spiritual',
  };
  return driveToLine[maxDrive] ?? 'Cognitive';
}

function nextDepth(current: DepthLevel): DepthLevel {
  const idx = ALL_DEPTH_LEVELS.indexOf(current);
  if (idx < 0 || idx >= ALL_DEPTH_LEVELS.length - 1) return current;
  return ALL_DEPTH_LEVELS[idx + 1];
}
