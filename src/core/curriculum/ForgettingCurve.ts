/**
 * ForgettingCurve — per-concept retention modeling and review scheduling.
 * Spec: docs/foundations/29-meta-learning-science.md §2.2, docs/foundations/34-curriculum-engine-bridge.md §3.5
 *
 * Models the Ebbinghaus forgetting curve for each concept. Computes when
 * a concept needs review and produces review candidates for the scheduler.
 *
 * Pure functions: state in, results out. No side effects.
 */
import type {
  ForgettingCurve,
  ForgettingParams,
  ConceptState,
  DepthLevel,
  ReviewCandidate,
} from './types.js';
import { DEFAULT_FORGETTING_PARAMS, depthOrdinal, ALL_DEPTH_LEVELS, REVIEW_THRESHOLD, CRITICAL_THRESHOLD } from './types.js';
import type { CurriculumRegistry } from './CurriculumRegistry.js';

// ---------------------------------------------------------------------------
// Retention Computation
// ---------------------------------------------------------------------------

/** Compute current retention from a forgetting curve. */
export function computeRetention(curve: ForgettingCurve, now: number): number {
  const elapsed = now - curve.lastRetrievedAt;
  if (elapsed <= 0) return curve.retention;
  // True half-life decay: retention drops to 50% after halfLifeMs
  return Math.max(0, Math.min(1, curve.retention * Math.pow(2, -elapsed / curve.halfLifeMs)));
}

/** Compute retention from a ConceptState (uses stored half-life). */
export function computeConceptRetention(
  concept: ConceptState,
  curve: ForgettingCurve | null,
  now: number,
): number {
  if (!curve) return concept.retention;
  return computeRetention(curve, now);
}

// ---------------------------------------------------------------------------
// Curve Updates
// ---------------------------------------------------------------------------

/** Update a forgetting curve after a successful retrieval. */
export function updateAfterSuccess(
  curve: ForgettingCurve,
  now: number,
  params: ForgettingParams = DEFAULT_FORGETTING_PARAMS,
): ForgettingCurve {
  const newHalfLife = Math.min(
    curve.halfLifeMs * params.halfLifeMultiplier,
    params.maxHalfLifeMs,
  );
  return {
    ...curve,
    lastRetrievedAt: now,
    retrievalCount: curve.retrievalCount + 1,
    retention: 1.0,
    halfLifeMs: newHalfLife,
  };
}

/** Update a forgetting curve after a failed retrieval. */
export function updateAfterFailure(
  curve: ForgettingCurve,
  now: number,
  params: ForgettingParams = DEFAULT_FORGETTING_PARAMS,
): ForgettingCurve {
  return {
    ...curve,
    lastRetrievedAt: now,
    retention: Math.max(0.1, curve.retention * 0.5),
    halfLifeMs: params.initialHalfLifeMs,
  };
}

/** Create a new forgetting curve for a freshly-learned concept. */
export function createCurve(
  conceptId: string,
  now: number,
  params: ForgettingParams = DEFAULT_FORGETTING_PARAMS,
): ForgettingCurve {
  return {
    conceptId,
    firstLearnedAt: now,
    lastRetrievedAt: now,
    retrievalCount: 0,
    retention: 1.0,
    halfLifeMs: params.initialHalfLifeMs,
  };
}

/**
 * Create a personalized forgetting curve for a concept using its
 * CurriculumHolon forgettingParams. Falls back to DEFAULT_FORGETTING_PARAMS
 * if the holon is not found in the registry.
 */
export function createPersonalizedCurve(
  conceptId: string,
  now: number,
  registry: CurriculumRegistry,
): ForgettingCurve {
  const holon = registry.get(conceptId);
  const params = holon?.forgettingParams ?? DEFAULT_FORGETTING_PARAMS;
  return createCurve(conceptId, now, params);
}

// ---------------------------------------------------------------------------
// Review Scheduling
// ---------------------------------------------------------------------------

/** Compute review candidates from a set of concept states and curves. */
export function computeReviewCandidates(
  concepts: ReadonlyMap<string, ConceptState>,
  curves: ReadonlyMap<string, ForgettingCurve>,
  now: number,
): readonly ReviewCandidate[] {
  const candidates: ReviewCandidate[] = [];

  for (const [conceptId, concept] of concepts) {
    const curve = curves.get(conceptId) ?? null;
    const retention = computeConceptRetention(concept, curve, now);

    if (retention < REVIEW_THRESHOLD) {
      const overdueMs = now - (curve?.lastRetrievedAt ?? concept.lastReviewedAt);
      const overdueDays = overdueMs / (24 * 60 * 60 * 1000);

      // Priority: lower retention = higher priority
      const retentionPriority = 1 - retention;
      // Critical threshold gets a boost
      const criticalBoost = retention < CRITICAL_THRESHOLD ? 0.3 : 0;
      // Overdue boost: more days overdue = higher priority
      const overdueBoost = Math.min(0.2, overdueDays * 0.02);

      candidates.push({
        conceptId,
        currentRetention: retention,
        currentDepth: concept.depthLevel,
        targetDepth: nextDepthLevel(concept.depthLevel),
        priority: Math.min(1, retentionPriority + criticalBoost + overdueBoost),
        overdueDays,
      });
    }
  }

  // Sort by priority descending
  return candidates.sort((a, b) => b.priority - a.priority);
}

// ---------------------------------------------------------------------------
// Depth Progression
// ---------------------------------------------------------------------------

/** Get the next depth level for review escalation. */
export function nextDepthLevel(current: DepthLevel): DepthLevel {
  const idx = depthOrdinal(current);
  if (idx < 0 || idx >= ALL_DEPTH_LEVELS.length - 1) return current;
  return ALL_DEPTH_LEVELS[idx + 1];
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/** Compute aggregate retention statistics for a knowledge state. */
export function computeRetentionStats(
  concepts: ReadonlyMap<string, ConceptState>,
  curves: ReadonlyMap<string, ForgettingCurve>,
  now: number,
): {
  readonly meanRetention: number;
  readonly minRetention: number;
  readonly belowThreshold: number;
  readonly totalConcepts: number;
} {
  if (concepts.size === 0) {
    return { meanRetention: 1, minRetention: 1, belowThreshold: 0, totalConcepts: 0 };
  }

  let totalRetention = 0;
  let minRetention = 1;
  let belowThreshold = 0;

  for (const [conceptId, concept] of concepts) {
    const curve = curves.get(conceptId) ?? null;
    const retention = computeConceptRetention(concept, curve, now);
    totalRetention += retention;
    minRetention = Math.min(minRetention, retention);
    if (retention < REVIEW_THRESHOLD) belowThreshold++;
  }

  return {
    meanRetention: totalRetention / concepts.size,
    minRetention,
    belowThreshold,
    totalConcepts: concepts.size,
  };
}
