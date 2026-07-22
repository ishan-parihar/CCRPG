/**
 * LearningAnalytics — data-driven study recommendations.
 * Spec: docs/foundations/36-curriculum-upgrade-plan.md §Phase E
 *
 * Computes study efficiency, learning velocity, modality effectiveness,
 * and optimal review intervals from the player's KnowledgeState and
 * studyHistory. Pure functions: state in, analytics out. No side effects.
 */
import type {
  KnowledgeState,
  StudyEvent,
} from './types.js';
import { depthOrdinal } from './types.js';
import type { Modality } from '../domain/enums.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudyEfficiency {
  /** Concept ID */
  readonly conceptId: string;
  /** Minutes spent studying this concept (estimated from study events) */
  readonly totalMinutes: number;
  /** Retention gain per minute (0-1 scale) */
  readonly efficiency: number;
  /** Number of study sessions on this concept */
  readonly sessionCount: number;
}

export interface LearningVelocity {
  /** Concepts mastered per session (depth levels gained / sessions) */
  readonly conceptsPerSession: number;
  /** Average depth levels gained per study event */
  readonly depthGainPerEvent: number;
  /** Average minutes per study event */
  readonly minutesPerEvent: number;
  /** Overall learning rate (depth gain per minute) */
  readonly overallRate: number;
}

export interface ModalityEffectiveness {
  /** The modality */
  readonly modality: Modality;
  /** Number of study events with this modality */
  readonly eventCount: number;
  /** Average depth gain per event */
  readonly avgDepthGain: number;
  /** Average retention after study event */
  readonly avgRetention: number;
  /** Effectiveness score (0-1) */
  readonly effectiveness: number;
}

export interface OptimalReviewInterval {
  /** Concept ID */
  readonly conceptId: string;
  /** Current retention */
  readonly currentRetention: number;
  /** Recommended days until next review */
  readonly recommendedDays: number;
  /** Confidence in recommendation (0-1) */
  readonly confidence: number;
}

export interface LearningAnalyticsReport {
  /** Per-concept study efficiency */
  readonly studyEfficiency: readonly StudyEfficiency[];
  /** Overall learning velocity */
  readonly velocity: LearningVelocity;
  /** Per-modality effectiveness */
  readonly modalityEffectiveness: readonly ModalityEffectiveness[];
  /** Optimal review intervals for concepts needing review */
  readonly reviewIntervals: readonly OptimalReviewInterval[];
  /** Overall analytics confidence */
  readonly confidence: number;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Compute a full learning analytics report from the player's knowledge state.
 * Pure function: state in, analytics out.
 */
export function computeLearningAnalytics(
  knowledge: KnowledgeState,
): LearningAnalyticsReport {
  const now = Date.now();

  const studyEfficiency = computeStudyEfficiency(knowledge, now);
  const velocity = computeLearningVelocity(knowledge);
  const modalityEffectiveness = computeModalityEffectiveness(knowledge);
  const reviewIntervals = computeOptimalReviewIntervals(knowledge, now);

  // Confidence based on amount of data
  const totalEvents = knowledge.studyHistory.length;
  const confidence = Math.min(1, totalEvents / 20); // Full confidence at 20+ events

  return {
    studyEfficiency,
    velocity,
    modalityEffectiveness,
    reviewIntervals,
    confidence,
  };
}

// ---------------------------------------------------------------------------
// Study efficiency
// ---------------------------------------------------------------------------

function computeStudyEfficiency(
  knowledge: KnowledgeState,
  _now: number,
): readonly StudyEfficiency[] {
  const efficiency: StudyEfficiency[] = [];

  for (const [conceptId] of knowledge.conceptStates) {
    const events = knowledge.studyHistory.filter(e => e.conceptId === conceptId);
    if (events.length === 0) continue;

    const totalMinutes = events.reduce((sum, e) => sum + estimateMinutes(e), 0);
    const firstRetention = events[0]!.retentionBefore;
    const lastRetention = events[events.length - 1]!.retentionAfter;
    const retentionGain = Math.max(0, lastRetention - firstRetention);
    const efficiencyScore = totalMinutes > 0
      ? Math.min(1, retentionGain / (totalMinutes / 10))
      : 0;

    efficiency.push({
      conceptId,
      totalMinutes,
      efficiency: efficiencyScore,
      sessionCount: events.length,
    });
  }

  return efficiency.sort((a, b) => b.efficiency - a.efficiency);
}

// ---------------------------------------------------------------------------
// Learning velocity
// ---------------------------------------------------------------------------

function computeLearningVelocity(
  knowledge: KnowledgeState,
): LearningVelocity {
  const events = knowledge.studyHistory;
  if (events.length === 0) {
    return {
      conceptsPerSession: 0,
      depthGainPerEvent: 0,
      minutesPerEvent: 0,
      overallRate: 0,
    };
  }

  // Total depth levels gained across all events
  let totalDepthGain = 0;
  for (const event of events) {
    const beforeOrd = depthOrdinal(event.depthAchieved);
    // Use the depthAchieved as the final depth; estimate initial from retentionBefore
    const estimatedInitialOrd = Math.max(0, beforeOrd - 1);
    totalDepthGain += Math.max(0, beforeOrd - estimatedInitialOrd);
  }

  const avgDepthGain = totalDepthGain / events.length;
  const avgMinutes = events.reduce((sum, e) => sum + estimateMinutes(e), 0) / events.length;
  const overallRate = avgMinutes > 0 ? avgDepthGain / avgMinutes : 0;

  // Estimate sessions from unique timestamps (rough grouping by hour)
  const uniqueHours = new Set(
    events.map(e => Math.floor(e.timestamp / (60 * 60 * 1000))),
  );
  const sessionCount = Math.max(1, uniqueHours.size);
  const conceptsPerSession = knowledge.conceptStates.size / sessionCount;

  return {
    conceptsPerSession,
    depthGainPerEvent: avgDepthGain,
    minutesPerEvent: avgMinutes,
    overallRate,
  };
}

// ---------------------------------------------------------------------------
// Modality effectiveness
// ---------------------------------------------------------------------------

function computeModalityEffectiveness(
  knowledge: KnowledgeState,
): readonly ModalityEffectiveness[] {
  const events = knowledge.studyHistory;
  if (events.length === 0) return [];

  // Group events by modality
  const byModality = new Map<string, StudyEvent[]>();
  for (const event of events) {
    const key = event.modality;
    const list = byModality.get(key) ?? [];
    list.push(event);
    byModality.set(key, list);
  }

  const results: ModalityEffectiveness[] = [];
  for (const [modality, modEvents] of byModality) {
    const avgDepthGain = modEvents.reduce((sum, e) => {
      const gain = depthOrdinal(e.depthAchieved);
      return sum + Math.max(0, gain - Math.max(0, gain - 1));
    }, 0) / modEvents.length;

    const avgRetention = modEvents.reduce((sum, e) => sum + e.retentionAfter, 0) / modEvents.length;

    // Effectiveness: weighted combination of depth gain and retention
    const effectiveness = Math.min(1, (avgDepthGain / 6) * 0.5 + avgRetention * 0.5);

    results.push({
      modality: modality as Modality,
      eventCount: modEvents.length,
      avgDepthGain,
      avgRetention,
      effectiveness,
    });
  }

  return results.sort((a, b) => b.effectiveness - a.effectiveness);
}

// ---------------------------------------------------------------------------
// Optimal review intervals
// ---------------------------------------------------------------------------

function computeOptimalReviewIntervals(
  knowledge: KnowledgeState,
  _now: number,
): readonly OptimalReviewInterval[] {
  const intervals: OptimalReviewInterval[] = [];

  for (const [conceptId, cs] of knowledge.conceptStates) {
    if (cs.retention >= 0.7) continue; // No review needed

    const events = knowledge.studyHistory.filter(e => e.conceptId === conceptId);

    // Estimate optimal interval based on retention and review history
    const baseInterval = 1; // 1 day
    const retentionFactor = Math.max(0.5, cs.retention);
    const reviewBoost = Math.min(3, events.length * 0.5); // More reviews = longer intervals

    const recommendedDays = baseInterval * retentionFactor * (1 + reviewBoost);

    // Confidence based on number of review events
    const confidence = Math.min(1, events.length / 5);

    intervals.push({
      conceptId,
      currentRetention: cs.retention,
      recommendedDays,
      confidence,
    });
  }

  return intervals.sort((a, b) => a.recommendedDays - b.recommendedDays);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateMinutes(event: StudyEvent): number {
  // Rough estimate based on modality
  const modalityMinutes: Record<string, number> = {
    Deterministic: 5,
    LanguageReflective: 10,
    ScenarioChoice: 12,
    Strategic: 15,
    Embodied: 8,
    SocialCooperative: 15,
    ImmersiveRPG: 20,
  };
  return modalityMinutes[event.modality] ?? 10;
}
