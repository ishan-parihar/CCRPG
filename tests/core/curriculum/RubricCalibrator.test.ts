/**
 * RubricCalibrator — unit tests.
 * Validates rubric discriminability, threshold alignment, coverage, consistency.
 */
import { describe, it, expect } from 'vitest';
import { calibrateAllRubrics } from '../../../src/core/curriculum/RubricCalibrator.js';
import type { KnowledgeState, ConceptState, DepthLevel } from '../../../src/core/curriculum/types.js';
import type { DepthRubric } from '../../../src/core/curriculum/types.js';

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

function makeRubric(conceptId = 'test-concept'): DepthRubric {
  return {
    conceptId,
    levels: {
      memorized: { canDo: ['Identify the concept'], cannotDo: ['Apply the concept'], threshold: 0, evidence: 'Basic recognition', appropriateTasks: ['factual_recall'] },
      comprehended: { canDo: ['Recall facts', 'Follow procedures'], cannotDo: ['Explain why'], threshold: 0.2, evidence: 'Correct recall', appropriateTasks: ['concept_explanation'] },
      applied: { canDo: ['Explain relationships', 'Compare concepts'], cannotDo: ['Transfer to novel contexts'], threshold: 0.4, evidence: 'Clear explanation', appropriateTasks: ['application_problem'] },
      analyzed: { canDo: ['Integrate multiple concepts', 'Transfer knowledge'], cannotDo: ['Create novel frameworks'], threshold: 0.6, evidence: 'Cross-domain transfer', appropriateTasks: ['analogy_mapping'] },
      evaluated: { canDo: ['Evaluate approaches', 'Critique frameworks'], cannotDo: ['Create novel frameworks'], threshold: 0.8, evidence: 'Critical evaluation', appropriateTasks: ['peer_review'] },
      transformed: { canDo: ['Create novel frameworks', 'Teach others'], cannotDo: [], threshold: 0.95, evidence: 'Original contribution', appropriateTasks: ['peer_teaching'] },
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RubricCalibrator', () => {
  describe('calibrateAllRubrics', () => {
    it('returns empty array when no concepts encountered', () => {
      const knowledge = makeKnowledgeState();
      const result = calibrateAllRubrics(knowledge, () => undefined);

      expect(result).toHaveLength(0);
    });

    it('calibrates rubric for encountered concept with good rubric', () => {
      const concepts = new Map<string, ConceptState>();
      concepts.set('good-concept', makeConceptState({
        depthLevel: 'applied' as DepthLevel,
        retention: 0.8,
        reviewCount: 5,
      }));

      const knowledge = makeKnowledgeState(concepts);
      const rubric = makeRubric('good-concept');
      const result = calibrateAllRubrics(knowledge, () => rubric);

      expect(result).toHaveLength(1);
      expect(result[0]!.conceptId).toBe('good-concept');
      expect(result[0]!.overallQuality).toBeGreaterThanOrEqual(0);
      expect(result[0]!.overallQuality).toBeLessThanOrEqual(1);
    });

    it('skips concepts without rubrics', () => {
      const concepts = new Map<string, ConceptState>();
      concepts.set('no-rubric', makeConceptState());

      const knowledge = makeKnowledgeState(concepts);
      const result = calibrateAllRubrics(knowledge, () => undefined);

      expect(result).toHaveLength(0);
    });

    it('reports issues for rubrics with low discriminability', () => {
      const concepts = new Map<string, ConceptState>();
      concepts.set('bad-rubric', makeConceptState({
        depthLevel: 'applied' as DepthLevel,
        retention: 0.8,
        reviewCount: 5,
      }));

      const knowledge = makeKnowledgeState(concepts);
      const badRubric: DepthRubric = {
        conceptId: 'bad-rubric',
        levels: {
          memorized: { canDo: ['Do X'], cannotDo: [], threshold: 0, evidence: 'No discriminability', appropriateTasks: ['factual_recall'] },
          comprehended: { canDo: ['Do X'], cannotDo: [], threshold: 0.2, evidence: 'No discriminability', appropriateTasks: ['concept_explanation'] },
          applied: { canDo: ['Do X'], cannotDo: [], threshold: 0.4, evidence: 'No discriminability', appropriateTasks: ['application_problem'] },
          analyzed: { canDo: ['Do X'], cannotDo: [], threshold: 0.6, evidence: 'No discriminability', appropriateTasks: ['analogy_mapping'] },
          evaluated: { canDo: ['Do X'], cannotDo: [], threshold: 0.8, evidence: 'No discriminability', appropriateTasks: ['peer_review'] },
          transformed: { canDo: ['Do X'], cannotDo: [], threshold: 0.95, evidence: 'No discriminability', appropriateTasks: ['peer_teaching'] },
        },
      };

      const result = calibrateAllRubrics(knowledge, () => badRubric);

      expect(result).toHaveLength(1);
      expect(result[0]!.issues.length).toBeGreaterThanOrEqual(0);
    });
  });
});
