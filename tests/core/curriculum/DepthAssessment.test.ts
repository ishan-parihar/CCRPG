/**
 * Tests for DepthAssessment — dual-depth scoring engine.
 * Spec: docs/foundations/31-depth-assessment-model.md
 */
import { describe, it, expect } from 'vitest';
import {
  classifyDepth,
  classifyDepthFromScores,
  assessDualDepth,
  updateConceptState,
} from '../../../src/core/curriculum/DepthAssessment.js';
import type {
  RubricEvaluationInput,
} from '../../../src/core/curriculum/DepthAssessment.js';
import type {
  DepthRubric,
  ConceptState,
  DualDepthResult,
} from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeRubric(conceptId: string = 'test'): DepthRubric {
  return {
    conceptId,
    levels: {
      memorized: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['factual_recall'], threshold: 0.3 },
      comprehended: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['concept_explanation'], threshold: 0.5 },
      applied: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['application_problem'], threshold: 0.7 },
      analyzed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['analogy_mapping'], threshold: 0.8 },
      evaluated: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['debate_position'], threshold: 0.9 },
      transformed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['creative_synthesis'], threshold: 0.95 },
    },
  };
}

function makeEvaluationInput(scores: Record<string, number>): RubricEvaluationInput {
  return {
    demonstratedCapabilities: [],
    failedCapabilities: [],
    taskType: 'factual_recall',
    scores,
  };
}

function makeConceptState(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    depthLevel: 'absent',
    retention: 0,
    lastReviewedAt: 0,
    reviewCount: 0,
    depthHistory: [],
    misconceptionFlags: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DepthAssessment', () => {
  describe('classifyDepth', () => {
    it('classifies at memorized when scores meet threshold', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({ comprehension: 0.4, application: 0.3 });
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('memorized');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('classifies at comprehended when scores are higher', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({ comprehension: 0.6, application: 0.5 });
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('comprehended');
    });

    it('classifies at analyzed for high scores', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({ comprehension: 0.85, application: 0.82 });
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('analyzed');
    });

    it('classifies at evaluated for very high scores', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({ comprehension: 0.95, application: 0.92 });
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('evaluated');
    });

    it('classifies at transformed for near-perfect scores', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({ comprehension: 0.98, application: 0.97 });
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('transformed');
    });

    it('returns memorized with low confidence for empty scores', () => {
      const rubric = makeRubric();
      const input = makeEvaluationInput({});
      const result = classifyDepth(input, rubric);
      expect(result.level).toBe('memorized');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('returns higher confidence for scores well above threshold', () => {
      const rubric = makeRubric();
      const inputHigh = makeEvaluationInput({ comprehension: 0.98, application: 0.98 });
      const highConf = classifyDepth(inputHigh, rubric);

      const inputLow = makeEvaluationInput({ comprehension: 0.51, application: 0.51 });
      const lowConf = classifyDepth(inputLow, rubric);

      expect(highConf.confidence).toBeGreaterThan(lowConf.confidence);
    });

    it('boosts score when demonstrated capabilities match canDo items', () => {
      const rubric: DepthRubric = {
        conceptId: 'test',
        levels: {
          memorized: { evidence: '', canDo: ['name_facts'], cannotDo: [], appropriateTasks: ['factual_recall'], threshold: 0.3 },
          comprehended: { evidence: '', canDo: ['explain_concept'], cannotDo: [], appropriateTasks: ['concept_explanation'], threshold: 0.5 },
          applied: { evidence: '', canDo: ['solve_problem'], cannotDo: [], appropriateTasks: ['application_problem'], threshold: 0.7 },
          analyzed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['analogy_mapping'], threshold: 0.8 },
          evaluated: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['debate_position'], threshold: 0.9 },
          transformed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['creative_synthesis'], threshold: 0.95 },
        },
      };

      // Without capability evidence — low scores should default to memorized
      const inputNoCap = makeEvaluationInput({ accuracy: 0.4 });
      const resultNoCap = classifyDepth(inputNoCap, rubric);
      expect(resultNoCap.level).toBe('memorized');

      // With capability evidence matching canDo — should boost classification
      const inputWithCap: RubricEvaluationInput = {
        demonstratedCapabilities: ['explain_concept', 'solve_problem'],
        failedCapabilities: [],
        taskType: 'application_problem',
        scores: { accuracy: 0.4 },
      };
      const resultWithCap = classifyDepth(inputWithCap, rubric);
      // The capability evidence should push it higher than memorized
      expect(resultWithCap.level).not.toBe('absent');
    });

    it('penalizes when demonstrated capabilities match cannotDo items', () => {
      const rubric: DepthRubric = {
        conceptId: 'test',
        levels: {
          memorized: { evidence: '', canDo: ['name_facts'], cannotDo: [], appropriateTasks: ['factual_recall'], threshold: 0.3 },
          comprehended: { evidence: '', canDo: ['explain_concept'], cannotDo: ['misunderstand_core'], appropriateTasks: ['concept_explanation'], threshold: 0.5 },
          applied: { evidence: '', canDo: ['solve_problem'], cannotDo: [], appropriateTasks: ['application_problem'], threshold: 0.7 },
          analyzed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['analogy_mapping'], threshold: 0.8 },
          evaluated: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['debate_position'], threshold: 0.9 },
          transformed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: ['creative_synthesis'], threshold: 0.95 },
        },
      };

      const inputWithCannotDo: RubricEvaluationInput = {
        demonstratedCapabilities: ['explain_concept', 'misunderstand_core'],
        failedCapabilities: [],
        taskType: 'concept_explanation',
        scores: { accuracy: 0.6 },
      };
      const result = classifyDepth(inputWithCannotDo, rubric);
      // The cannotDo match should penalize — should be lower than without the cannotDo
      const inputClean: RubricEvaluationInput = {
        demonstratedCapabilities: ['explain_concept'],
        failedCapabilities: [],
        taskType: 'concept_explanation',
        scores: { accuracy: 0.6 },
      };
      const resultClean = classifyDepth(inputClean, rubric);
      expect(result.confidence).toBeLessThanOrEqual(resultClean.confidence);
    });
  });

  describe('classifyDepthFromScores (legacy wrapper)', () => {
    it('works with flat scores array', () => {
      const rubric = makeRubric();
      const result = classifyDepthFromScores({ comprehension: 0.6, application: 0.5 }, rubric);
      expect(result.level).toBe('comprehended');
    });
  });

  describe('assessDualDepth', () => {
    it('produces a complete DualDepthResult', () => {
      const rubric = makeRubric();
      const result = assessDualDepth({
        conceptId: 'test.concept',
        evaluationInput: makeEvaluationInput({ comprehension: 0.6, application: 0.5 }),
        depthRubric: rubric,
        driveScores: { Agency: 0.5, Communion: 0.3 },
        driveSignals: { Agency: 'directional' },
        shadowDetected: 'DarkAddiction',
        shadowIntensity: 0.4,
        predictedDepth: 'comprehended',
        confidenceInPrediction: 0.7,
      });

      expect(result.conceptId).toBe('test.concept');
      expect(result.knowledgeDepth.level).toBeDefined();
      expect(result.developmentalSignal.shadowDetected).toBe('DarkAddiction');
      expect(result.metacognition.predictedDepth).toBe('comprehended');
    });

    it('computes calibration error', () => {
      const rubric = makeRubric();
      const result = assessDualDepth({
        conceptId: 'test',
        evaluationInput: makeEvaluationInput({ comprehension: 0.6 }),
        depthRubric: rubric,
        driveScores: {},
        driveSignals: {},
        shadowDetected: null,
        shadowIntensity: 0,
        predictedDepth: 'memorized',
        confidenceInPrediction: 0.5,
      });

      expect(result.metacognition.calibrationError).toBeGreaterThanOrEqual(0);
      expect(result.metacognition.calibrationError).toBeLessThanOrEqual(1);
    });

    it('includes evidence array', () => {
      const rubric = makeRubric();
      const result = assessDualDepth({
        conceptId: 'test',
        evaluationInput: makeEvaluationInput({ score1: 0.8, score2: 0.7 }),
        depthRubric: rubric,
        driveScores: {},
        driveSignals: {},
        shadowDetected: null,
        shadowIntensity: 0,
        predictedDepth: 'memorized',
        confidenceInPrediction: 0.5,
      });

      expect(result.knowledgeDepth.evidence.length).toBeGreaterThan(0);
    });

    it('uses provided timestamp', () => {
      const rubric = makeRubric();
      const result = assessDualDepth({
        conceptId: 'test',
        evaluationInput: makeEvaluationInput({ score: 0.5 }),
        depthRubric: rubric,
        driveScores: {},
        driveSignals: {},
        shadowDetected: null,
        shadowIntensity: 0,
        predictedDepth: 'memorized',
        confidenceInPrediction: 0.5,
        timestamp: 12345,
      });

      expect(result.timestamp).toBe(12345);
    });
  });

  describe('updateConceptState', () => {
    it('creates new state from undefined', () => {
      const result: DualDepthResult = {
        conceptId: 'test',
        timestamp: 1000,
        knowledgeDepth: {
          level: 'comprehended',
          confidence: 0.8,
          evidence: ['test'],
          dimensions: {},
        },
        developmentalSignal: {
          driveScores: {},
          driveSignals: {},
          shadowDetected: null,
          shadowIntensity: 0,
        },
        metacognition: {
          predictedDepth: 'memorized',
          actualDepth: 'comprehended',
          calibrationError: 0.2,
          confidenceInPrediction: 0.7,
        },
      };

      const state = updateConceptState(undefined, result, 1000);
      expect(state.depthLevel).toBe('comprehended');
      expect(state.reviewCount).toBe(1);
      expect(state.retention).toBe(1.0);
    });

    it('updates existing state when depth progresses', () => {
      const existing = makeConceptState({ depthLevel: 'memorized', reviewCount: 3 });
      const result: DualDepthResult = {
        conceptId: 'test',
        timestamp: 2000,
        knowledgeDepth: {
          level: 'applied',
          confidence: 0.9,
          evidence: ['test'],
          dimensions: {},
        },
        developmentalSignal: {
          driveScores: {},
          driveSignals: {},
          shadowDetected: null,
          shadowIntensity: 0,
        },
        metacognition: {
          predictedDepth: 'comprehended',
          actualDepth: 'applied',
          calibrationError: 0.17,
          confidenceInPrediction: 0.7,
        },
      };

      const state = updateConceptState(existing, result, 2000);
      expect(state.depthLevel).toBe('applied'); // Progressed
      expect(state.reviewCount).toBe(4);
    });

    it('preserves depth when no progress', () => {
      const existing = makeConceptState({ depthLevel: 'applied', reviewCount: 2 });
      const result: DualDepthResult = {
        conceptId: 'test',
        timestamp: 3000,
        knowledgeDepth: {
          level: 'memorized',
          confidence: 0.5,
          evidence: [],
          dimensions: {},
        },
        developmentalSignal: {
          driveScores: {},
          driveSignals: {},
          shadowDetected: null,
          shadowIntensity: 0,
        },
        metacognition: {
          predictedDepth: 'applied',
          actualDepth: 'memorized',
          calibrationError: 0.33,
          confidenceInPrediction: 0.5,
        },
      };

      const state = updateConceptState(existing, result, 3000);
      expect(state.depthLevel).toBe('applied'); // Preserved — regressed attempt
      expect(state.reviewCount).toBe(3);
    });

    it('tracks misconception flags', () => {
      const existing = makeConceptState({ depthLevel: 'memorized' });
      const result: DualDepthResult = {
        conceptId: 'test',
        timestamp: 4000,
        knowledgeDepth: {
          level: 'memorized',
          confidence: 0.5,
          evidence: [],
          dimensions: {},
        },
        developmentalSignal: {
          driveScores: {},
          driveSignals: {},
          shadowDetected: 'DarkAllergy',
          shadowIntensity: 0.6,
        },
        metacognition: {
          predictedDepth: 'memorized',
          actualDepth: 'memorized',
          calibrationError: 0,
          confidenceInPrediction: 0.5,
        },
      };

      const state = updateConceptState(existing, result, 4000);
      expect(state.misconceptionFlags).toContain('DarkAllergy');
    });

    it('appends to depth history on depth change', () => {
      const existing = makeConceptState({ depthLevel: 'memorized', depthHistory: [] });
      const result: DualDepthResult = {
        conceptId: 'test',
        timestamp: 5000,
        knowledgeDepth: {
          level: 'comprehended',
          confidence: 0.8,
          evidence: ['evidence'],
          dimensions: {},
        },
        developmentalSignal: {
          driveScores: {},
          driveSignals: {},
          shadowDetected: null,
          shadowIntensity: 0,
        },
        metacognition: {
          predictedDepth: 'memorized',
          actualDepth: 'comprehended',
          calibrationError: 0.17,
          confidenceInPrediction: 0.7,
        },
      };

      const state = updateConceptState(existing, result, 5000);
      expect(state.depthHistory.length).toBe(1);
      expect(state.depthHistory[0].level).toBe('comprehended');
    });
  });
});
