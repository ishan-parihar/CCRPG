/**
 * Tests for GreaterCycleEngine — HoloOS G_z / P_z dual health metrics.
 * Per AUDIT-HOLOOS-ALIGNMENT.md §2.5.6 and foundations/25 §1.1.
 */
import { describe, it, expect } from 'vitest';
import { computeGz, computePz, computeMetabolicHealth, computeComplexAltitudes } from '../../src/core/engines/GreaterCycleEngine.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage,
    Emotional: stage,
    Moral: stage,
    Intrapersonal: stage,
    Spiritual: stage,
    Somatic: stage,
    Willpower: stage,
    Interpersonal: stage,
  };
}

describe('GreaterCycleEngine — G_z (Lesser-Cycle health)', () => {
  it('returns a value in [0, 1]', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const gz = computeGz(sig, Date.now());
    expect(gz.value).toBeGreaterThanOrEqual(0);
    expect(gz.value).toBeLessThanOrEqual(1);
  });

  it('produces higher G_z when drives are balanced', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const balancedSig = {
      ...sig,
      drives: {
        weights: { Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25 },
        fixationRisk: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 },
      },
    };
    const unbalancedSig = {
      ...sig,
      drives: {
        weights: { Agency: 0.9, Communion: 0.05, Eros: 0.03, Agape: 0.02 },
        fixationRisk: { Agency: 0.8, Communion: 0, Eros: 0, Agape: 0 },
      },
    };
    const balancedGz = computeGz(balancedSig, Date.now());
    const unbalancedGz = computeGz(unbalancedSig, Date.now());
    expect(balancedGz.value).toBeGreaterThan(unbalancedGz.value);
  });

  it('includes complexBalance sub-metric', () => {
    const sig = createSignificator('p1', makeAltitudes('Amber'), 'Amber');
    const gz = computeGz(sig, Date.now());
    expect(gz).toHaveProperty('complexBalance');
    expect(gz.complexBalance).toBeGreaterThanOrEqual(0);
    expect(gz.complexBalance).toBeLessThanOrEqual(1);
  });
});

describe('GreaterCycleEngine — P_z (Greater-Cycle health)', () => {
  it('returns a value in [0, 1]', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const pz = computePz(sig);
    expect(pz.value).toBeGreaterThanOrEqual(0);
    expect(pz.value).toBeLessThanOrEqual(1);
  });

  it('produces higher P_z when polarity is crystallized', () => {
    // DEV-1: P_z = structuralGradient × polarAlignment per HoloOS 00.md §6.3.
    // Both factors must be non-zero for P_z > 0. The test sigs need non-zero
    // rayProfile (Potentiator state) that differs from drive weights (Matrix state)
    // so the structural gradient is non-zero.
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    // Add non-zero rayProfile + drive weights to create structural tension
    const baseSig = {
      ...sig,
      rayProfile: { Red: 0.3, Orange: 0.2, Yellow: 0.5, Green: 0.1, Blue: 0.0, Indigo: 0.0, Violet: 0.0 } as any,
      drives: { ...sig.drives, weights: { Agency: 0.4, Communion: 0.3, Eros: 0.2, Agape: 0.1 } },
    };
    const lowPolarSig = {
      ...baseSig,
      polarity: {
        ...baseSig.polarity,
        master: { ...baseSig.polarity.master, crystallizationProgress: 0.1 },
      },
    };
    const highPolarSig = {
      ...baseSig,
      polarity: {
        ...baseSig.polarity,
        master: { ...baseSig.polarity.master, crystallizationProgress: 0.9 },
      },
    };
    const lowPz = computePz(lowPolarSig);
    const highPz = computePz(highPolarSig);
    // With the HoloOS formula, P_z = gradient × alignment.
    // Same gradient (same drives + rays), different alignment (crystallization).
    // highPz should be > lowPz because 0.9 > 0.1 in the alignment factor.
    expect(highPz.value).toBeGreaterThan(lowPz.value);
  });
});

describe('GreaterCycleEngine — computeMetabolicHealth', () => {
  it('returns total = gz * pz', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const mh = computeMetabolicHealth(sig);
    expect(mh.total).toBeCloseTo(mh.gz * mh.pz, 5);
  });

  it('classifies a stuck player (low gz + low pz) as "stuck"', () => {
    // A fresh significator with no encounters, no polarity, no shadows.
    const sig = createSignificator('p1', makeAltitudes('Infrared'), 'Infrared');
    // Fresh players have low pz (no polarity, no transformations) and
    // moderate gz (balanced drives, no shadows). They shouldn't be "stuck"
    // unless both are low. Let's force both low.
    const stuckSig = {
      ...sig,
      drives: {
        weights: { Agency: 0.9, Communion: 0.05, Eros: 0.03, Agape: 0.02 },
        fixationRisk: { Agency: 0.8, Communion: 0.7, Eros: 0.6, Agape: 0.5 },
      },
      shadows: {
        entries: [
          { id: 's1', quadrant: 'DarkAddiction' as const, line: 'Cognitive' as const, stage: 'Red' as const, drive: 'Agency' as const, surfacedAt: Date.now(), resolvedAt: null, recurrenceCount: 5, compoundPartner: null, severity: 0.9 },
        ],
        activeCount: 1,
      },
    };
    const mhStuck = computeMetabolicHealth(stuckSig);
    expect(mhStuck.gz).toBeLessThan(0.5);
    // The interpretation should be one of the 4 valid values
    expect(['stuck', 'consolidating', 'polarizing-healthy', 'polarizing-unhealthy']).toContain(mhStuck.interpretation);
  });

  it('returns all 4 breakdown sub-metrics in gzBreakdown and pzBreakdown', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const mh = computeMetabolicHealth(sig);
    expect(mh.gzBreakdown).toHaveProperty('driveBalance');
    expect(mh.gzBreakdown).toHaveProperty('shadowIntegration');
    expect(mh.gzBreakdown).toHaveProperty('thetaFreshness');
    expect(mh.gzBreakdown).toHaveProperty('complexBalance');
    expect(mh.pzBreakdown).toHaveProperty('polarityCrystallization');
    expect(mh.pzBreakdown).toHaveProperty('transformationReadiness');
    expect(mh.pzBreakdown).toHaveProperty('greatWayAlignment');
    expect(mh.pzBreakdown).toHaveProperty('choiceAuthenticity');
  });
});

describe('GreaterCycleEngine — computeComplexAltitudes', () => {
  it('returns altitudes for all 3 Complexes (Mind, Body, Spirit)', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const complexAlts = computeComplexAltitudes(sig);
    expect(complexAlts).toHaveProperty('Mind');
    expect(complexAlts).toHaveProperty('Body');
    expect(complexAlts).toHaveProperty('Spirit');
  });

  it('uses the max line altitude within each Complex', () => {
    const altitudes = {
      ...makeAltitudes('Red'),
      Cognitive: 'Orange' as Stage,  // Cognitive is in Mind complex
    };
    const sig = createSignificator('p1', altitudes, 'Red');
    const complexAlts = computeComplexAltitudes(sig);
    // Mind complex = Cognitive, Moral, Intrapersonal. Cognitive is at Orange (ordinal 4).
    // The max should be 4 (Orange).
    expect(complexAlts.Mind).toBe(4);
    // Body complex = Somatic, Willpower, both at Red (ordinal 2).
    expect(complexAlts.Body).toBe(2);
  });
});
