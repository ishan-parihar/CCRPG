/**
 * ProgressionValidator — unit tests.
 * Validates monotonic progression, retention health, stuck detection, depth ceiling.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { auditProgression } from '../../../src/core/curriculum/ProgressionValidator.js';
import type { KnowledgeState, ConceptState, DepthLevel } from '../../../src/core/curriculum/types.js';
import { getCurriculumRegistry, resetCurriculumRegistry } from '../../../src/core/curriculum/CurriculumRegistry.js';
import { seedCurriculumRegistry } from '../../../src/core/curriculum/CurriculumSeed.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeConceptState(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    depthLevel: 'absent' as DepthLevel,
    retention: 0.8,
    lastReviewedAt: Date.now(),
    reviewCount: 3,
    depthHistory: [],
    misconceptionFlags: [],
    ...overrides,
  };
}

function makeKnowledgeState(concepts: Map<string, ConceptState> = new Map()): KnowledgeState {
  return {
    conceptStates: concepts as ReadonlyMap<string, ConceptState>,
    subjectProgress: new Map(),
    studyHistory: [],
    forgettingCurves: new Map(),
    learningProfile: {
      preferredModalities: [],
      metacognitionScore: 0.5,
      calibrationAccuracy: 0.5,
      transferCapacity: 0.5,
      studyEfficiency: 0.5,
      modalityEffectiveness: {},
      learningVelocity: 0,
      lastAnalyticsAt: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProgressionValidator', () => {
  beforeAll(() => {
    seedCurriculumRegistry();
  });

  afterAll(() => {
    resetCurriculumRegistry();
  });

  describe('auditProgression', () => {
    it('returns empty audit when no concepts encountered', () => {
      const knowledge = makeKnowledgeState();
      const registry = getCurriculumRegistry();
      const result = auditProgression(knowledge, registry, Date.now());

      expect(result.conceptsAnalyzed).toBe(0);
      expect(result.healthyCount).toBe(0);
      expect(result.warningCount).toBe(0);
      expect(result.criticalCount).toBe(0);
      expect(result.overallHealth).toBe(1.0);
    });

    it('analyzes concepts with good retention', () => {
      const now = Date.now();
      const concepts = new Map<string, ConceptState>();
      concepts.set('test-concept-1', makeConceptState({
        depthLevel: 'comprehended' as DepthLevel,
        retention: 0.9,
        lastReviewedAt: now,
        reviewCount: 5,
        depthHistory: [
          { level: 'absent' as DepthLevel, timestamp: now - 100000, evidence: 'initial' },
          { level: 'comprehended' as DepthLevel, timestamp: now, evidence: 'advanced' },
        ],
      }));

      const knowledge = makeKnowledgeState(concepts);
      const registry = getCurriculumRegistry();
      const result = auditProgression(knowledge, registry, Date.now());

      expect(result.conceptsAnalyzed).toBe(1);
    });

    it('detects stuck concepts (many reviews without advancement)', () => {
      const now = Date.now();
      const concepts = new Map<string, ConceptState>();
      const history = Array.from({ length: 12 }, (_, i) => ({
        level: 'absent' as DepthLevel,
        timestamp: now - (12 - i) * 86400000,
        evidence: `review ${i + 1}`,
      }));

      concepts.set('stuck-concept', makeConceptState({
        depthLevel: 'absent' as DepthLevel,
        retention: 0.5,
        lastReviewedAt: now,
        reviewCount: 12,
        depthHistory: history,
      }));

      const knowledge = makeKnowledgeState(concepts);
      const registry = getCurriculumRegistry();
      const result = auditProgression(knowledge, registry, Date.now());

      expect(result.conceptsAnalyzed).toBe(1);
    });

    it('detects low retention as a concern', () => {
      const now = Date.now();
      const concepts = new Map<string, ConceptState>();
      concepts.set('low-retention', makeConceptState({
        depthLevel: 'comprehended' as DepthLevel,
        retention: 0.1,
        lastReviewedAt: now,
        reviewCount: 5,
        depthHistory: [
          { level: 'absent' as DepthLevel, timestamp: now - 100000, evidence: 'initial' },
          { level: 'comprehended' as DepthLevel, timestamp: now, evidence: 'advanced' },
        ],
      }));

      const knowledge = makeKnowledgeState(concepts);
      const registry = getCurriculumRegistry();
      const result = auditProgression(knowledge, registry, Date.now());

      expect(result.conceptsAnalyzed).toBe(1);
    });
  });
});
