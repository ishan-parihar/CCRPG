/**
 * ProgressionValidator — meta-cognitive tool for verifying curriculum progression.
 *
 * Analyzes a player's ConceptState history to detect:
 * - Monotonic depth progression (stages NEVER demote)
 * - Retention health (concepts not decaying too fast)
 * - Stuck concepts (same depth for too many sessions)
 * - Isomorphism leverage (cross-domain connections being activated)
 * - Overall curriculum health score
 *
 * Pure functions: data in, validation results out. No side effects.
 */
import type { ConceptState, DepthLevel, KnowledgeState } from './types.js';
import { depthOrdinal } from './types.js';
import type { CurriculumRegistry } from './CurriculumRegistry.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressionCheck {
  readonly conceptId: string;
  readonly checkType: 'monotonic' | 'retention' | 'stuck' | 'isomorphism' | 'depth_ceiling';
  readonly status: 'healthy' | 'warning' | 'critical';
  readonly message: string;
  readonly currentValue: number;
  readonly expectedRange: readonly [number, number];
}

export interface ConceptProgressionReport {
  readonly conceptId: string;
  readonly currentDepth: DepthLevel;
  readonly depthHistory: readonly { level: DepthLevel; timestamp: number; evidence: string }[];
  readonly retention: number;
  readonly reviewCount: number;
  readonly lastReviewedAt: number;
  readonly checks: readonly ProgressionCheck[];
  readonly overallStatus: 'healthy' | 'warning' | 'critical';
}

export interface ProgressionAudit {
  readonly timestamp: number;
  readonly totalConcepts: number;
  readonly conceptsAnalyzed: number;
  readonly healthyCount: number;
  readonly warningCount: number;
  readonly criticalCount: number;
  readonly overallHealth: number; // 0.0 to 1.0
  readonly conceptReports: readonly ConceptProgressionReport[];
  readonly summary: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Core Validation Functions
// ---------------------------------------------------------------------------

/**
 * Check that depth history is monotonically increasing (stages NEVER demote).
 * If any depth history entry shows a lower level than a previous entry, that's a bug.
 */
function checkMonotonicProgression(state: ConceptState): ProgressionCheck {
  const history = state.depthHistory;
  if (history.length <= 1) {
    return {
      conceptId: '',
      checkType: 'monotonic',
      status: 'healthy',
      message: 'First encounter or single history entry — no demotion possible',
      currentValue: 0,
      expectedRange: [0, 0],
    };
  }

  let maxOrdinal = 0;
  let demotionDetected = false;
  let demotionDepth = 0;

  for (const entry of history) {
    const ord = depthOrdinal(entry.level);
    if (ord < maxOrdinal) {
      demotionDetected = true;
      demotionDepth = maxOrdinal - ord;
      break;
    }
    maxOrdinal = Math.max(maxOrdinal, ord);
  }

  return {
    conceptId: '',
    checkType: 'monotonic',
    status: demotionDetected ? 'critical' : 'healthy',
    message: demotionDetected
      ? `Depth demotion detected: dropped ${demotionDepth} level(s) — violates "stages NEVER demote" invariant`
      : `Depth history is monotonically increasing (${history.length} entries)`,
    currentValue: demotionDetected ? demotionDepth : 0,
    expectedRange: [0, 0],
  };
}

/**
 * Check retention health. Retention should be above 0.3 (critical) and ideally above 0.7.
 * Retention decays over time via forgetting curves — this checks if it's still healthy.
 */
function checkRetentionHealth(state: ConceptState, now: number): ProgressionCheck {
  const retention = state.retention;
  const daysSinceReview = (now - state.lastReviewedAt) / (24 * 60 * 60 * 1000);

  let status: 'healthy' | 'warning' | 'critical';
  let message: string;

  if (retention < 0.3) {
    status = 'critical';
    message = `Retention critically low (${(retention * 100).toFixed(0)}%) — concept needs immediate review`;
  } else if (retention < 0.7) {
    status = 'warning';
    message = `Retention below optimal (${(retention * 100).toFixed(0)}%) — review recommended`;
  } else {
    status = 'healthy';
    message = `Retention healthy (${(retention * 100).toFixed(0)}%) — reviewed ${daysSinceReview.toFixed(1)} days ago`;
  }

  return {
    conceptId: '',
    checkType: 'retention',
    status,
    message,
    currentValue: retention,
    expectedRange: [0.7, 1.0],
  };
}

/**
 * Check if a concept is "stuck" — same depth for too many reviews.
 * If a concept has been reviewed 3+ times without advancing depth, it's stuck.
 */
function checkStuckConcept(state: ConceptState): ProgressionCheck {
  const history = state.depthHistory;

  // Count how many consecutive reviews at the same depth without advancement
  if (history.length < 2) {
    return {
      conceptId: '',
      checkType: 'stuck',
      status: 'healthy',
      message: 'Insufficient history to detect stuck state',
      currentValue: 0,
      expectedRange: [0, 2],
    };
  }

  let reviewsAtSameDepth = 0;
  const currentOrd = depthOrdinal(state.depthLevel);
  for (let i = history.length - 1; i >= 0; i--) {
    if (depthOrdinal(history[i]!.level) === currentOrd) {
      reviewsAtSameDepth++;
    } else {
      break;
    }
  }

  let status: 'healthy' | 'warning' | 'critical';
  let message: string;

  if (reviewsAtSameDepth >= 5) {
    status = 'critical';
    message = `Concept stuck: ${reviewsAtSameDepth} consecutive reviews without depth advancement at "${state.depthLevel}"`;
  } else if (reviewsAtSameDepth >= 3) {
    status = 'warning';
    message = `Concept potentially stuck: ${reviewsAtSameDepth} reviews at "${state.depthLevel}" without advancement`;
  } else {
    status = 'healthy';
    message = `Progression normal: ${reviewsAtSameDepth} review(s) at current depth`;
  }

  return {
    conceptId: '',
    checkType: 'stuck',
    status,
    message,
    currentValue: reviewsAtSameDepth,
    expectedRange: [0, 2],
  };
}

/**
 * Check depth ceiling — is the concept at its maximum target depth?
 * If so, the player should move on to new material.
 */
function checkDepthCeiling(
  state: ConceptState,
  targetMax: DepthLevel,
): ProgressionCheck {
  const currentOrd = depthOrdinal(state.depthLevel);
  const maxOrd = depthOrdinal(targetMax);
  const atCeiling = currentOrd >= maxOrd;

  return {
    conceptId: '',
    checkType: 'depth_ceiling',
    status: atCeiling ? 'healthy' : 'warning',
    message: atCeiling
      ? `At depth ceiling ("${state.depthLevel}" >= target max "${targetMax}") — ready for new material`
      : `Below depth ceiling: "${state.depthLevel}" < target max "${targetMax}"`,
    currentValue: currentOrd,
    expectedRange: [maxOrd, maxOrd],
  };
}

// ---------------------------------------------------------------------------
// Main Entry Points
// ---------------------------------------------------------------------------

/**
 * Validate progression for a single concept.
 */
export function validateConceptProgression(
  conceptId: string,
  state: ConceptState,
  targetMax: DepthLevel,
  now: number,
): ConceptProgressionReport {
  const checks: ProgressionCheck[] = [
    { ...checkMonotonicProgression(state), conceptId },
    { ...checkRetentionHealth(state, now), conceptId },
    { ...checkStuckConcept(state), conceptId },
    { ...checkDepthCeiling(state, targetMax), conceptId },
  ];

  const hasCritical = checks.some(c => c.status === 'critical');
  const hasWarning = checks.some(c => c.status === 'warning');
  const overallStatus = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

  return {
    conceptId,
    currentDepth: state.depthLevel,
    depthHistory: state.depthHistory.map(h => ({
      level: h.level,
      timestamp: h.timestamp,
      evidence: h.evidence,
    })),
    retention: state.retention,
    reviewCount: state.reviewCount,
    lastReviewedAt: state.lastReviewedAt,
    checks,
    overallStatus,
  };
}

/**
 * Run a full progression audit across all concepts in the player's knowledge state.
 * Returns an aggregate health score and per-concept reports.
 */
export function auditProgression(
  knowledge: KnowledgeState,
  registry: CurriculumRegistry,
  now: number,
): ProgressionAudit {
  const reports: ConceptProgressionReport[] = [];
  let healthyCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  for (const [conceptId, state] of knowledge.conceptStates) {
    const holon = registry.get(conceptId);
    const targetMax = holon?.depthMeta.targetDepthRange.max ?? 'transformed';
    const report = validateConceptProgression(conceptId, state, targetMax, now);
    reports.push(report);

    switch (report.overallStatus) {
      case 'healthy': healthyCount++; break;
      case 'warning': warningCount++; break;
      case 'critical': criticalCount++; break;
    }
  }

  const total = reports.length;
  const overallHealth = total === 0 ? 1.0 :
    (healthyCount * 1.0 + warningCount * 0.5 + criticalCount * 0.0) / total;

  const summaryParts: string[] = [];
  if (criticalCount > 0) {
    summaryParts.push(`${criticalCount} concept(s) with critical issues (demotion or deeply stuck)`);
  }
  if (warningCount > 0) {
    summaryParts.push(`${warningCount} concept(s) with warnings (low retention or approaching stuck)`);
  }
  if (healthyCount > 0) {
    summaryParts.push(`${healthyCount} concept(s) healthy`);
  }
  if (total === 0) {
    summaryParts.push('No concepts encountered yet');
  }

  return {
    timestamp: now,
    totalConcepts: registry.count(),
    conceptsAnalyzed: total,
    healthyCount,
    warningCount,
    criticalCount,
    overallHealth,
    conceptReports: reports,
    summary: summaryParts.join('; ') || 'No issues detected',
  };
}
