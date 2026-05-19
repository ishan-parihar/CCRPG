import { describe, it, expect } from 'vitest';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { calibrate } from '../../src/core/usecases/OnboardingCalibrator.js';
import type { ProbeResult } from '../../src/core/usecases/OnboardingCalibrator.js';
import { ALL_LINES } from '../../src/core/domain/Line.js';

describe('Onboarding -> Significator Creation', () => {
  const mockProbeResults: ProbeResult[] = [
    { line: 'Somatic', accuracy: 0.8, medianReactionMs: 400, threshold: 3.2, trials: [{ correct: true, reactionMs: 400 }] },
    { line: 'Cognitive', accuracy: 0.7, medianReactionMs: 500, threshold: 2.8, trials: [{ correct: true, reactionMs: 500 }] },
    { line: 'Emotional', accuracy: 0.6, medianReactionMs: 600, threshold: 2.1, trials: [{ correct: true, reactionMs: 600 }] },
    { line: 'Intrapersonal', accuracy: 0.5, medianReactionMs: 700, threshold: 1.8, trials: [{ correct: true, reactionMs: 700 }] },
    { line: 'Moral', accuracy: 0.65, medianReactionMs: 550, threshold: 2.5, trials: [{ correct: true, reactionMs: 550 }] },
    { line: 'Spiritual', accuracy: 0.55, medianReactionMs: 650, threshold: 1.5, trials: [{ correct: false, reactionMs: 650 }] },
    { line: 'Willpower', accuracy: 0.75, medianReactionMs: 450, threshold: 3.0, trials: [{ correct: true, reactionMs: 450 }] },
    { line: 'Interpersonal', accuracy: 0.6, medianReactionMs: 600, threshold: 2.3, trials: [{ correct: true, reactionMs: 600 }] },
  ];

  it('calibrate produces altitudes for all 8 lines', () => {
    const result = calibrate(mockProbeResults);
    for (const line of ALL_LINES) {
      expect(result.altitudes[line]).toBeDefined();
    }
  });

  it('calibrate produces a valid stage', () => {
    const result = calibrate(mockProbeResults);
    expect(result.stage).toBeDefined();
    expect(typeof result.stage).toBe('string');
  });

  it('createSignificator produces a valid Significator', () => {
    const result = calibrate(mockProbeResults);
    const sig = createSignificator('test-player', result.altitudes, result.stage);

    expect(sig.id).toBe('test-player');
    expect(sig.currentStage).toBe(result.stage);
    expect(sig.lifecycle).toBe('Exploring');
    expect(sig.totalEncounters).toBe(0);
    expect(sig.totalSessions).toBe(0);
  });

  it('Significator altitudes match calibration output', () => {
    const result = calibrate(mockProbeResults);
    const sig = createSignificator('test-player', result.altitudes, result.stage);

    for (const line of ALL_LINES) {
      expect(sig.altitudes[line]).toBe(result.altitudes[line]);
    }
  });

  it('Significator has all ray profiles initialized to 0', () => {
    const result = calibrate(mockProbeResults);
    const sig = createSignificator('test-player', result.altitudes, result.stage);

    for (const val of Object.values(sig.rayProfile)) {
      expect(val).toBe(0);
    }
  });

  it('Significator has drive weights initialized to 0', () => {
    const result = calibrate(mockProbeResults);
    const sig = createSignificator('test-player', result.altitudes, result.stage);

    for (const val of Object.values(sig.drives.weights)) {
      expect(val).toBe(0);
    }
  });

  it('Significator has empty transformations array', () => {
    const result = calibrate(mockProbeResults);
    const sig = createSignificator('test-player', result.altitudes, result.stage);

    expect(sig.transformations).toHaveLength(0);
  });

  it('Significator has a createdAt timestamp', () => {
    const result = calibrate(mockProbeResults);
    const before = Date.now();
    const sig = createSignificator('test-player', result.altitudes, result.stage);
    const after = Date.now();

    expect(sig.createdAt).toBeGreaterThanOrEqual(before);
    expect(sig.createdAt).toBeLessThanOrEqual(after);
  });
});
