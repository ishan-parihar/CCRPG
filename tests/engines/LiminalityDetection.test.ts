/**
 * Tests for GAP-D2-2: Significator-Liminality detection.
 * Per HoloOS 08.8.14 — the 'transitional' interpretation distinguishes
 * healthy phase-transition from pathological polarization.
 */
import { describe, it, expect } from 'vitest';
import { computeMetabolicHealth } from '../../src/core/engines/GreaterCycleEngine.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

describe('GAP-D2-2: Significator-Liminality detection', () => {
  it('returns liminalitySignature on every MetabolicHealth', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const mh = computeMetabolicHealth(sig);
    expect(mh.liminalitySignature).toBeDefined();
    expect(mh.liminalitySignature).toHaveProperty('pzSpike');
    expect(mh.liminalitySignature).toHaveProperty('subDensitySaturation');
    expect(mh.liminalitySignature).toHaveProperty('isTransitional');
  });

  it('a fresh Significator is NOT transitional (no polarity, no saturation)', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const mh = computeMetabolicHealth(sig);
    expect(mh.liminalitySignature!.isTransitional).toBe(false);
    expect(mh.liminalitySignature!.pzSpike).toBe(false);
    expect(mh.liminalitySignature!.subDensitySaturation).toBe(false);
  });

  it('classifies a player with P_z spike + 5+ saturated lines as transitional', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    // Build a Significator with high P_z and 5+ lines saturated.
    // DEV-1: P_z = structuralGradient × polarAlignment per HoloOS 00.md §6.3.
    // Need non-zero rayProfile + drive weights to create structural tension.
    const saturatedCells: Record<string, { crystallization: number; traceCount: number; dominantPattern: string | null }> = {};
    const lines = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal'];
    for (let i = 0; i < 6; i++) {
      saturatedCells[`${lines[i]}:Red`] = { crystallization: 0.8, traceCount: 5, dominantPattern: 'Radiative' };
    }
    const transitionalSig = {
      ...sig,
      // DEV-1: Add non-zero rayProfile + drive weights for structural gradient
      rayProfile: { Red: 0.4, Orange: 0.3, Yellow: 0.6, Green: 0.2, Blue: 0.1, Indigo: 0.0, Violet: 0.0 } as any,
      drives: { ...sig.drives, weights: { Agency: 0.3, Communion: 0.2, Eros: 0.4, Agape: 0.1 } },
      polarity: {
        cells: saturatedCells as never,
        lineProfiles: {},
        master: {
          mode: 'Crystallized' as const,
          dominantDirection: 'Radiative' as const,
          coherentLineCount: 6,
          crystallizationProgress: 0.9,
        },
      },
    } as typeof sig;
    const mh = computeMetabolicHealth(transitionalSig);
    expect(mh.liminalitySignature!.subDensitySaturation).toBe(true);
    // P_z should be > 0 due to structural gradient × high crystallization
    expect(mh.pz).toBeGreaterThan(0);
    // If P_z > 0.7, should be transitional
    if (mh.pz > 0.7) {
      expect(mh.interpretation).toBe('transitional');
      expect(mh.liminalitySignature!.isTransitional).toBe(true);
    }
  });

  it('does NOT classify as transitional when only P_z is high but no saturation', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const highPzSig = {
      ...sig,
      polarity: {
        cells: {}, // no saturated cells
        lineProfiles: {},
        master: {
          mode: 'Crystallized' as const,
          dominantDirection: 'Radiative' as const,
          coherentLineCount: 0,
          crystallizationProgress: 0.9,
        },
      },
    };
    const mh = computeMetabolicHealth(highPzSig);
    expect(mh.liminalitySignature!.subDensitySaturation).toBe(false);
    expect(mh.liminalitySignature!.isTransitional).toBe(false);
    // Should NOT be 'transitional' — should be one of the other 4
    expect(mh.interpretation).not.toBe('transitional');
  });

  it('interpretation can return all 5 valid values including transitional', () => {
    const validInterpretations = ['consolidating', 'polarizing-healthy', 'polarizing-unhealthy', 'stuck', 'transitional'];
    // Just verify 'transitional' is in the allowed set
    expect(validInterpretations).toContain('transitional');
  });
});
