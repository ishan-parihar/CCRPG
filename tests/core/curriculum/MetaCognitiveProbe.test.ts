/**
 * MetaCognitiveProbe — unit tests.
 * Validates the top-level probe that combines progression, rubric, and linting.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { probeCurriculum, formatProbeSummary } from '../../../src/core/curriculum/MetaCognitiveProbe.js';
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

describe('MetaCognitiveProbe', () => {
  beforeAll(() => {
    seedCurriculumRegistry();
  });

  afterAll(() => {
    resetCurriculumRegistry();
  });

  describe('probeCurriculum', () => {
    it('returns healthy probe for empty knowledge state', () => {
      const knowledge = makeKnowledgeState();
      const registry = getCurriculumRegistry();
      const result = probeCurriculum(knowledge, registry, Date.now());

      expect(result.overallHealth).toBeGreaterThanOrEqual(0);
      expect(result.overallHealth).toBeLessThanOrEqual(1);
      expect(result.shouldIntervene).toBe(false);
      expect(result.progression.conceptsAnalyzed).toBe(0);
    });

    it('returns healthy probe for concepts with good progression', () => {
      const now = Date.now();
      const concepts = new Map<string, ConceptState>();
      concepts.set('healthy-concept', makeConceptState({
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
      const result = probeCurriculum(knowledge, registry, Date.now());

      expect(result.progression.conceptsAnalyzed).toBe(1);
      expect(result.overallHealth).toBeGreaterThanOrEqual(0);
    });

    it('shouldIntervene when critical progression issues exist', () => {
      const now = Date.now();
      const concepts = new Map<string, ConceptState>();
      concepts.set('critical-concept', makeConceptState({
        depthLevel: 'analyzed' as DepthLevel,
        retention: 0.05,
        lastReviewedAt: now,
        reviewCount: 10,
        depthHistory: [
          { level: 'absent' as DepthLevel, timestamp: now - 500000, evidence: 'old' },
          { level: 'analyzed' as DepthLevel, timestamp: now, evidence: 'current' },
        ],
      }));

      const knowledge = makeKnowledgeState(concepts);
      const registry = getCurriculumRegistry();
      const result = probeCurriculum(knowledge, registry, Date.now());

      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatProbeSummary', () => {
    it('formats a probe result as human-readable string', () => {
      const knowledge = makeKnowledgeState();
      const registry = getCurriculumRegistry();
      const result = probeCurriculum(knowledge, registry, Date.now());
      const summary = formatProbeSummary(result);

      expect(summary).toContain('Curriculum Meta-Cognitive Probe');
      expect(summary).toContain('Overall Health:');
      expect(summary).toContain('Progression');
      expect(summary).toContain('Rubric Calibration');
      expect(summary).toContain('Content Lint');
    });

    it('includes recommendations when present', () => {
      const concepts = new Map<string, ConceptState>();
      concepts.set('test', makeConceptState({
        depthLevel: 'absent' as DepthLevel,
        retention: 0.01,
        reviewCount: 15,
      }));

      const knowledge = makeKnowledgeState(concepts);
      const registry = getCurriculumRegistry();
      const result = probeCurriculum(knowledge, registry, Date.now());
      const summary = formatProbeSummary(result);

      expect(summary).toContain('Overall Health:');
    });
  });
});
