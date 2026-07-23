/**
 * Tests for CurriculumBridge — engine integration functions.
 * Spec: docs/foundations/34-curriculum-engine-bridge.md
 */
import { describe, it, expect } from 'vitest';
import {
  computeKnowledgeHealth,
} from '../../../src/core/curriculum/CurriculumBridge.js';
import type {
  KnowledgeState,
  ConceptState,
  SubjectProgress,
  LearningProfile,
} from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeConceptState(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    depthLevel: 'memorized',
    retention: 0.8,
    lastReviewedAt: Date.now(),
    reviewCount: 1,
    depthHistory: [],
    misconceptionFlags: [],
    ...overrides,
  };
}

function makeSubjectProgress(overrides: Partial<SubjectProgress> = {}): SubjectProgress {
  return {
    modulesCompleted: 5,
    averageDepth: 0.5,
    masteryLevel: 'competent',
    crossDomainConnections: [],
    ...overrides,
  };
}

function makeLearningProfile(overrides: Partial<LearningProfile> = {}): LearningProfile {
  return {
    preferredModalities: ['LanguageReflective'],
    metacognitionScore: 0.6,
    calibrationAccuracy: 0.7,
    transferCapacity: 0.5,
    studyEfficiency: 0.6,
    ...overrides,
  };
}

function makeKnowledgeState(overrides: Partial<KnowledgeState> = {}): KnowledgeState {
  return {
    conceptStates: new Map([
      ['a', makeConceptState({ retention: 0.9, depthLevel: 'comprehended' })],
      ['b', makeConceptState({ retention: 0.6, depthLevel: 'memorized' })],
      ['c', makeConceptState({ retention: 0.4, depthLevel: 'applied', misconceptionFlags: ['misconception1'] })],
    ]),
    subjectProgress: new Map([
      ['math', makeSubjectProgress()],
      ['physics', makeSubjectProgress({ modulesCompleted: 3, averageDepth: 0.3 })],
    ]),
    studyHistory: [],
    learningProfile: makeLearningProfile(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CurriculumBridge', () => {
  describe('computeKnowledgeHealth', () => {
    it('returns zero scores for empty knowledge state', () => {
      const empty: KnowledgeState = {
        conceptStates: new Map(),
        subjectProgress: new Map(),
        studyHistory: [],
        learningProfile: makeLearningProfile(),
      };
      const health = computeKnowledgeHealth(empty, 10);
      expect(health.conceptCoverage).toBe(0);
      expect(health.averageDepth).toBe(0);
      expect(health.retentionHealth).toBe(0);
      expect(health.integrationDensity).toBe(0);
      expect(health.misconceptionLoad).toBe(0);
    });

    it('computes concept coverage from conceptStates size', () => {
      const state = makeKnowledgeState();
      const health = computeKnowledgeHealth(state, 10);
      // 3 concepts / 10 total = 0.3 coverage
      expect(health.conceptCoverage).toBeCloseTo(0.3, 2);
    });

    it('computes average depth from concept depth levels', () => {
      const state = makeKnowledgeState();
      const health = computeKnowledgeHealth(state, 10);
      // Average of memorized(1), comprehended(2), applied(3) → average ordinal 2, normalized by 6
      expect(health.averageDepth).toBeGreaterThan(0);
    });

    it('computes retention health from concept retention', () => {
      const state = makeKnowledgeState();
      const health = computeKnowledgeHealth(state, 10);
      // Average retention of 0.9, 0.6, 0.4 → 0.633
      expect(health.retentionHealth).toBeCloseTo(0.633, 1);
    });

    it('computes misconception load from misconception flags', () => {
      const state = makeKnowledgeState();
      const health = computeKnowledgeHealth(state, 10);
      // 1 misconception / 3 concepts = 0.333
      expect(health.misconceptionLoad).toBeGreaterThan(0);
    });

    it('returns zero for zero totalConceptsInCurriculum', () => {
      const state = makeKnowledgeState();
      const health = computeKnowledgeHealth(state, 0);
      expect(health.conceptCoverage).toBe(0);
    });

    it('handles state with many concepts', () => {
      const conceptStates = new Map<string, ConceptState>();
      for (let i = 0; i < 50; i++) {
        conceptStates.set(`concept.${i}`, makeConceptState({
          retention: 0.5 + Math.random() * 0.5,
          depthLevel: i % 3 === 0 ? 'memorized' : i % 3 === 1 ? 'comprehended' : 'applied',
        }));
      }
      const state = makeKnowledgeState({ conceptStates });
      const health = computeKnowledgeHealth(state, 100);
      expect(health.conceptCoverage).toBeCloseTo(0.5, 1);
      expect(health.averageDepth).toBeGreaterThanOrEqual(0);
      expect(health.averageDepth).toBeLessThanOrEqual(1);
    });
  });
});
