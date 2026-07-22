/**
 * Tests for ForgettingCurve — retention modeling and review scheduling.
 * Spec: docs/foundations/29-meta-learning-science.md §2.2
 */
import { describe, it, expect } from 'vitest';
import {
  computeRetention,
  computeConceptRetention,
  updateAfterSuccess,
  updateAfterFailure,
  createCurve,
  computeReviewCandidates,
  nextDepthLevel,
  computeRetentionStats,
} from '../../../src/core/curriculum/ForgettingCurve.js';
import type {
  ForgettingCurve,
  ConceptState,
} from '../../../src/core/curriculum/types.js';
import { DEFAULT_FORGETTING_PARAMS } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCurve(overrides: Partial<ForgettingCurve> = {}): ForgettingCurve {
  return {
    conceptId: 'test.concept',
    firstLearnedAt: 0,
    lastRetrievedAt: 0,
    retrievalCount: 0,
    retention: 1.0,
    halfLifeMs: DEFAULT_FORGETTING_PARAMS.initialHalfLifeMs, // 1 day
    ...overrides,
  };
}

function makeConcept(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    depthLevel: 'memorized',
    retention: 0.8,
    lastReviewedAt: 0,
    reviewCount: 1,
    depthHistory: [],
    misconceptionFlags: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ForgettingCurve', () => {
  describe('computeRetention', () => {
    it('returns current retention when elapsed is 0', () => {
      const curve = makeCurve({ lastRetrievedAt: 1000 });
      expect(computeRetention(curve, 1000)).toBe(1.0);
    });

    it('decays retention to 50% after one half-life', () => {
      const curve = makeCurve({ halfLifeMs: 1000, lastRetrievedAt: 1000 });
      const now = 1000 + 1000; // One half-life later
      const retention = computeRetention(curve, now);
      expect(retention).toBeCloseTo(0.5, 2);
    });

    it('decays to near zero after many half-lives', () => {
      const curve = makeCurve({ halfLifeMs: 1000 });
      const now = 1000 + 10000; // 10 half-lives
      const retention = computeRetention(curve, now);
      expect(retention).toBeLessThan(0.01);
    });

    it('returns retention for future timestamps (elapsed <= 0)', () => {
      const curve = makeCurve({ retention: 0.6, lastRetrievedAt: 1000 });
      expect(computeRetention(curve, 500)).toBe(0.6);
    });
  });

  describe('computeConceptRetention', () => {
    it('returns concept.retention when no curve', () => {
      const concept = makeConcept({ retention: 0.75 });
      expect(computeConceptRetention(concept, null, 1000)).toBe(0.75);
    });

    it('delegates to computeRetention when curve exists', () => {
      const concept = makeConcept({ retention: 0.75 });
      const curve = makeCurve({ halfLifeMs: 1000, lastRetrievedAt: 1000 });
      const retention = computeConceptRetention(concept, curve, 2000);
      // True half-life decay: 50% after one half-life
      expect(retention).toBeCloseTo(0.5, 2);
    });
  });

  describe('createCurve', () => {
    it('creates a curve with full retention', () => {
      const curve = createCurve('test.concept', 1000);
      expect(curve.conceptId).toBe('test.concept');
      expect(curve.retention).toBe(1.0);
      expect(curve.retrievalCount).toBe(0);
      expect(curve.halfLifeMs).toBe(DEFAULT_FORGETTING_PARAMS.initialHalfLifeMs);
    });

    it('accepts custom params', () => {
      const curve = createCurve('test', 1000, {
        initialHalfLifeMs: 5000,
        halfLifeMultiplier: 3.0,
        maxHalfLifeMs: 50000,
      });
      expect(curve.halfLifeMs).toBe(5000);
    });
  });

  describe('updateAfterSuccess', () => {
    it('resets retention to 1.0', () => {
      const curve = makeCurve({ retention: 0.3 });
      const updated = updateAfterSuccess(curve, 2000);
      expect(updated.retention).toBe(1.0);
    });

    it('increases half-life by multiplier', () => {
      const curve = makeCurve({ halfLifeMs: 1000 });
      const updated = updateAfterSuccess(curve, 2000);
      expect(updated.halfLifeMs).toBeCloseTo(2500);
    });

    it('caps half-life at maxHalfLifeMs', () => {
      // Set halfLifeMs close to max so multiplier pushes it over the cap
      const curve = makeCurve({ halfLifeMs: DEFAULT_FORGETTING_PARAMS.maxHalfLifeMs / 2 });
      const updated = updateAfterSuccess(curve, 2000);
      expect(updated.halfLifeMs).toBe(DEFAULT_FORGETTING_PARAMS.maxHalfLifeMs);
    });

    it('increments retrieval count', () => {
      const curve = makeCurve({ retrievalCount: 3 });
      const updated = updateAfterSuccess(curve, 2000);
      expect(updated.retrievalCount).toBe(4);
    });

    it('updates lastRetrievedAt', () => {
      const curve = makeCurve();
      const updated = updateAfterSuccess(curve, 5000);
      expect(updated.lastRetrievedAt).toBe(5000);
    });
  });

  describe('updateAfterFailure', () => {
    it('reduces retention', () => {
      const curve = makeCurve({ retention: 0.8 });
      const updated = updateAfterFailure(curve, 2000);
      expect(updated.retention).toBeCloseTo(0.4, 2);
    });

    it('clamps retention at 0.1 minimum', () => {
      const curve = makeCurve({ retention: 0.15 });
      const updated = updateAfterFailure(curve, 2000);
      expect(updated.retention).toBe(0.1);
    });

    it('resets half-life to initial', () => {
      const curve = makeCurve({ halfLifeMs: 5000 });
      const updated = updateAfterFailure(curve, 2000);
      expect(updated.halfLifeMs).toBe(DEFAULT_FORGETTING_PARAMS.initialHalfLifeMs);
    });
  });

  describe('nextDepthLevel', () => {
    it('advances from memorized to comprehended', () => {
      expect(nextDepthLevel('memorized')).toBe('comprehended');
    });

    it('advances from analyzed to evaluated', () => {
      expect(nextDepthLevel('analyzed')).toBe('evaluated');
    });

    it('stays at transformed (max)', () => {
      expect(nextDepthLevel('transformed')).toBe('transformed');
    });
  });

  describe('computeReviewCandidates', () => {
    it('identifies concepts below review threshold', () => {
      const concepts = new Map<string, ConceptState>([
        ['a', makeConcept({ retention: 0.5 })],
        ['b', makeConcept({ retention: 0.9 })],
      ]);
      const candidates = computeReviewCandidates(concepts, new Map(), Date.now());
      expect(candidates).toHaveLength(1);
      expect(candidates[0].conceptId).toBe('a');
    });

    it('sorts by priority descending', () => {
      const concepts = new Map<string, ConceptState>([
        ['low', makeConcept({ retention: 0.2 })],
        ['mid', makeConcept({ retention: 0.5 })],
      ]);
      const candidates = computeReviewCandidates(concepts, new Map(), Date.now());
      expect(candidates[0].conceptId).toBe('low'); // Lower retention = higher priority
    });

    it('returns empty for all-healthy concepts', () => {
      const concepts = new Map<string, ConceptState>([
        ['a', makeConcept({ retention: 0.9 })],
      ]);
      expect(computeReviewCandidates(concepts, new Map(), Date.now())).toHaveLength(0);
    });

    it('returns empty for empty input', () => {
      expect(computeReviewCandidates(new Map(), new Map(), Date.now())).toHaveLength(0);
    });
  });

  describe('computeRetentionStats', () => {
    it('computes mean retention', () => {
      const concepts = new Map<string, ConceptState>([
        ['a', makeConcept({ retention: 0.8 })],
        ['b', makeConcept({ retention: 0.6 })],
      ]);
      const stats = computeRetentionStats(concepts, new Map(), Date.now());
      expect(stats.meanRetention).toBeCloseTo(0.7, 2);
      expect(stats.totalConcepts).toBe(2);
    });

    it('identifies concepts below threshold', () => {
      const concepts = new Map<string, ConceptState>([
        ['a', makeConcept({ retention: 0.5 })],
        ['b', makeConcept({ retention: 0.9 })],
      ]);
      const stats = computeRetentionStats(concepts, new Map(), Date.now());
      expect(stats.belowThreshold).toBe(1);
    });

    it('returns defaults for empty input', () => {
      const stats = computeRetentionStats(new Map(), new Map(), Date.now());
      expect(stats.meanRetention).toBe(1);
      expect(stats.totalConcepts).toBe(0);
    });
  });
});
