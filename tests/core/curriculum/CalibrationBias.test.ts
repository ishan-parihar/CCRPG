/**
 * Tests for computeCalibrationBias and calibrateThreshold — Phase 4B difficulty calibration.
 */
import { describe, it, expect } from 'vitest';
import {
  computeCalibrationBias,
} from '../../../src/core/curriculum/DepthAssessment.js';
import type { StudyEvent } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStudyEvent(overrides: Partial<StudyEvent> = {}): StudyEvent {
  return {
    conceptId: 'test.concept',
    depthAchieved: 'memorized',
    modality: 'LanguageReflective',
    timestamp: Date.now(),
    retentionBefore: 0.5,
    retentionAfter: 0.8,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DepthAssessment — Phase 4B Calibration', () => {
  describe('computeCalibrationBias', () => {
    it('returns 0 for empty study history', () => {
      const bias = computeCalibrationBias([], 'test.concept', Date.now());
      expect(bias).toBe(0);
    });

    it('returns 0 for single event (insufficient data)', () => {
      const events = [makeStudyEvent()];
      const bias = computeCalibrationBias(events, 'test.concept', Date.now());
      expect(bias).toBe(0);
    });

    it('returns positive bias when player consistently improves', () => {
      const now = Date.now();
      const events = [
        makeStudyEvent({ retentionBefore: 0.3, retentionAfter: 0.8, timestamp: now - 86400000 }),
        makeStudyEvent({ retentionBefore: 0.4, retentionAfter: 0.9, timestamp: now }),
      ];
      const bias = computeCalibrationBias(events, 'test.concept', now);
      expect(bias).toBeGreaterThan(0);
    });

    it('returns negative bias when player consistently regresses', () => {
      const now = Date.now();
      const events = [
        makeStudyEvent({ retentionBefore: 0.8, retentionAfter: 0.5, timestamp: now - 86400000 }),
        makeStudyEvent({ retentionBefore: 0.7, retentionAfter: 0.4, timestamp: now }),
      ];
      const bias = computeCalibrationBias(events, 'test.concept', now);
      expect(bias).toBeLessThan(0);
    });

    it('weights recent events more heavily', () => {
      const now = Date.now();
      // Old event: positive gain; recent event: negative gain
      const events = [
        makeStudyEvent({ retentionBefore: 0.3, retentionAfter: 0.9, timestamp: now - 14 * 86400000 }),
        makeStudyEvent({ retentionBefore: 0.8, retentionAfter: 0.3, timestamp: now }),
      ];
      const bias = computeCalibrationBias(events, 'test.concept', now);
      // Recent negative gain should dominate
      expect(bias).toBeLessThan(0);
    });

    it('clamps bias to [-0.3, 0.3]', () => {
      const now = Date.now();
      const extremeGainEvents = Array.from({ length: 10 }, (_, i) =>
        makeStudyEvent({ retentionBefore: 0.0, retentionAfter: 1.0, timestamp: now - i * 86400000 }),
      );
      const bias = computeCalibrationBias(extremeGainEvents, 'test.concept', now);
      expect(bias).toBeLessThanOrEqual(0.3);
      expect(bias).toBeGreaterThanOrEqual(-0.3);
    });

    it('only considers events for the specified concept', () => {
      const now = Date.now();
      const events = [
        makeStudyEvent({ conceptId: 'other.concept', retentionBefore: 0.3, retentionAfter: 0.9, timestamp: now - 86400000 }),
        makeStudyEvent({ conceptId: 'other.concept', retentionBefore: 0.3, retentionAfter: 0.9, timestamp: now }),
      ];
      const bias = computeCalibrationBias(events, 'test.concept', now);
      // No events for test.concept — should return 0
      expect(bias).toBe(0);
    });
  });
});
