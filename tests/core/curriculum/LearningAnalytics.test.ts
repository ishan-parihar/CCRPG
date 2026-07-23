/**
 * Tests for LearningAnalytics module.
 * Covers: computeLearningAnalytics, study efficiency, learning velocity,
 * modality effectiveness, and optimal review intervals.
 */
import { describe, it, expect } from 'vitest';
import { computeLearningAnalytics } from '../../../src/core/curriculum/LearningAnalytics.js';
import type { KnowledgeState, ConceptState } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConcept(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    depthLevel: 'memorized',
    retention: 0.8,
    lastReviewedAt: Date.now(),
    reviewCount: 3,
    depthHistory: [],
    misconceptionFlags: [],
    ...overrides,
  };
}

function makeKnowledge(overrides: Partial<KnowledgeState> = {}): KnowledgeState {
  return {
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
    ...overrides,
  };
}

function makeEvent(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    conceptId: 'test.concept',
    depthAchieved: 'memorized' as const,
    modality: 'LanguageReflective' as const,
    timestamp: now,
    retentionBefore: 0.5,
    retentionAfter: 0.8,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeLearningAnalytics', () => {
  it('returns zeroed-out report when no study history exists', () => {
    const knowledge = makeKnowledge();
    const report = computeLearningAnalytics(knowledge);

    expect(report.velocity.conceptsPerSession).toBe(0);
    expect(report.velocity.depthGainPerEvent).toBe(0);
    expect(report.velocity.minutesPerEvent).toBe(0);
    expect(report.velocity.overallRate).toBe(0);
    expect(report.studyEfficiency).toEqual([]);
    expect(report.modalityEffectiveness).toEqual([]);
    expect(report.reviewIntervals).toEqual([]);
    expect(report.confidence).toBe(0);
  });

  it('computes confidence from study history length', () => {
    const events = Array.from({ length: 10 }, () => makeEvent());
    const knowledge = makeKnowledge({ studyHistory: events });
    const report = computeLearningAnalytics(knowledge);

    // 10 events / 20 = 0.5 confidence
    expect(report.confidence).toBeCloseTo(0.5, 2);
  });

  it('caps confidence at 1.0 for 20+ events', () => {
    const events = Array.from({ length: 25 }, () => makeEvent());
    const knowledge = makeKnowledge({ studyHistory: events });
    const report = computeLearningAnalytics(knowledge);

    expect(report.confidence).toBe(1);
  });

  it('computes study efficiency per concept', () => {
    const events = [
      makeEvent({ conceptId: 'a', retentionBefore: 0.3, retentionAfter: 0.9 }),
      makeEvent({ conceptId: 'b', retentionBefore: 0.5, retentionAfter: 0.6 }),
    ];
    const conceptStates = new Map([
      ['a', makeConcept()],
      ['b', makeConcept()],
    ]);
    const knowledge = makeKnowledge({ conceptStates, studyHistory: events });
    const report = computeLearningAnalytics(knowledge);

    expect(report.studyEfficiency).toHaveLength(2);
    // Concept 'a' has higher efficiency (larger retention gain)
    expect(report.studyEfficiency[0]!.conceptId).toBe('a');
  });

  it('computes modality effectiveness across different modalities', () => {
    const events = [
      makeEvent({ modality: 'LanguageReflective' as const, depthAchieved: 'comprehended' as const }),
      makeEvent({ modality: 'LanguageReflective' as const, depthAchieved: 'comprehended' as const }),
      makeEvent({ modality: 'ScenarioChoice' as const, depthAchieved: 'applied' as const }),
    ];
    const knowledge = makeKnowledge({ studyHistory: events });
    const report = computeLearningAnalytics(knowledge);

    expect(report.modalityEffectiveness.length).toBeGreaterThanOrEqual(2);
    // All modalities should have effectiveness scores
    for (const me of report.modalityEffectiveness) {
      expect(me.effectiveness).toBeGreaterThanOrEqual(0);
      expect(me.effectiveness).toBeLessThanOrEqual(1);
    }
  });

  it('computes review intervals for concepts below threshold', () => {
    const conceptStates = new Map([
      ['low-retention', makeConcept({ retention: 0.4, depthLevel: 'memorized' })],
      ['high-retention', makeConcept({ retention: 0.9, depthLevel: 'applied' })],
    ]);
    const knowledge = makeKnowledge({ conceptStates });
    const report = computeLearningAnalytics(knowledge);

    // Only low-retention concept should appear in review intervals
    expect(report.reviewIntervals).toHaveLength(1);
    expect(report.reviewIntervals[0]!.conceptId).toBe('low-retention');
    expect(report.reviewIntervals[0]!.currentRetention).toBe(0.4);
    expect(report.reviewIntervals[0]!.recommendedDays).toBeGreaterThan(0);
  });

  it('sorts study efficiency by efficiency descending', () => {
    const events = [
      makeEvent({ conceptId: 'inefficient', retentionBefore: 0.7, retentionAfter: 0.71 }),
      makeEvent({ conceptId: 'efficient', retentionBefore: 0.2, retentionAfter: 0.9 }),
    ];
    const conceptStates = new Map([
      ['inefficient', makeConcept()],
      ['efficient', makeConcept()],
    ]);
    const knowledge = makeKnowledge({ conceptStates, studyHistory: events });
    const report = computeLearningAnalytics(knowledge);

    expect(report.studyEfficiency[0]!.conceptId).toBe('efficient');
  });

  it('sorts review intervals by recommended days ascending (most urgent first)', () => {
    const conceptStates = new Map([
      ['urgent', makeConcept({ retention: 0.1 })],
      ['moderate', makeConcept({ retention: 0.5 })],
      ['low', makeConcept({ retention: 0.3 })],
    ]);
    const knowledge = makeKnowledge({ conceptStates });
    const report = computeLearningAnalytics(knowledge);

    expect(report.reviewIntervals.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < report.reviewIntervals.length; i++) {
      expect(report.reviewIntervals[i]!.recommendedDays)
        .toBeGreaterThanOrEqual(report.reviewIntervals[i - 1]!.recommendedDays);
    }
  });
});
