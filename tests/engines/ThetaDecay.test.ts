import { describe, it, expect } from 'vitest';
import { computeCellStaleness, computeStaleness, detectBleedThrough, DEFAULT_THETA_PARAMS } from '../../src/core/engines/ThetaDecay.js';

const HALF_LIFE = DEFAULT_THETA_PARAMS.halfLife; // 7 days in ms
const DAY = 24 * 60 * 60 * 1000;

describe('ThetaDecay', () => {
  describe('computeCellStaleness', () => {
    it('returns 0 for just-visited cell', () => {
      expect(computeCellStaleness(1000, 1000, HALF_LIFE)).toBe(0);
    });

    it('returns ~0.5 after one half-life', () => {
      const staleness = computeCellStaleness(0, HALF_LIFE, HALF_LIFE);
      expect(staleness).toBeCloseTo(0.5, 5);
    });

    it('returns ~0.75 after two half-lives', () => {
      const staleness = computeCellStaleness(0, HALF_LIFE * 2, HALF_LIFE);
      expect(staleness).toBeCloseTo(0.75, 5);
    });

    it('approaches 1 for very old timestamps', () => {
      const staleness = computeCellStaleness(0, HALF_LIFE * 20, HALF_LIFE);
      expect(staleness).toBeGreaterThan(0.99);
    });

    it('returns 0 for future timestamps', () => {
      expect(computeCellStaleness(2000, 1000, HALF_LIFE)).toBe(0);
    });
  });

  describe('computeStaleness', () => {
    it('computes staleness for all cells', () => {
      const timestamps = { 'Cognitive:Red': 0, 'Emotional:Red': HALF_LIFE };
      const now = HALF_LIFE;
      const result = computeStaleness(timestamps, now);
      expect(result['Cognitive:Red']).toBeCloseTo(0.5, 5);
      expect(result['Emotional:Red']).toBe(0);
    });
  });

  describe('detectBleedThrough', () => {
    it('returns cells above threshold', () => {
      const now = 14 * DAY; // 2 half-lives
      const timestamps = { 'Cognitive:Red': 0, 'Emotional:Red': now - DAY };
      const result = detectBleedThrough(timestamps, now);
      expect(result).toContain('Cognitive:Red');
      expect(result).not.toContain('Emotional:Red');
    });

    it('returns empty when all cells are fresh', () => {
      const now = 1000;
      const timestamps = { 'Cognitive:Red': 999 };
      expect(detectBleedThrough(timestamps, now)).toHaveLength(0);
    });
  });
});
