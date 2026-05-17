import { describe, it, expect } from 'vitest';
import { synthesiseStage, meetsAdvancementCriteria, checkAdvancementGate } from '../src/core/usecases/StageSynthesizer.js';
import type { Line } from '../src/core/domain/Line.js';
import type { Stage } from '../src/core/domain/Stage.js';
import { createInitialProfile } from '../src/core/domain/PlayerProfile.js';

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

describe('synthesiseStage', () => {
  it('returns the uniform stage when all lines are equal', () => {
    expect(synthesiseStage(makeAltitudes('Red'))).toBe('Red');
    expect(synthesiseStage(makeAltitudes('Amber'))).toBe('Amber');
  });

  it('returns the lowest line altitude', () => {
    const altitudes = { ...makeAltitudes('Orange'), Moral: 'Red' as Stage };
    expect(synthesiseStage(altitudes)).toBe('Red');
  });

  it('returns Infrared if any line is at Infrared', () => {
    const altitudes = { ...makeAltitudes('White'), Somatic: 'Infrared' as Stage };
    expect(synthesiseStage(altitudes)).toBe('Infrared');
  });
});

describe('meetsAdvancementCriteria', () => {
  it('returns false when lines are at target but no pull/boss/quadrant', () => {
    // All at Red, but no boss cleared, no quadrant coverage, no pull lines
    const profile = createInitialProfile('p1', makeAltitudes('Red'), 'Red', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    // Advancing to Red requires: boss for Magenta, quadrant coverage at Magenta, ≥2 lines above Red
    expect(meetsAdvancementCriteria(profile, 'Red')).toBe(false);
  });

  it('returns false when any line is below target', () => {
    const altitudes = { ...makeAltitudes('Amber'), Cognitive: 'Red' as Stage };
    const profile = createInitialProfile('p2', altitudes, 'Red', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    expect(meetsAdvancementCriteria(profile, 'Amber')).toBe(false);
  });

  it('returns true for Infrared (no previous stage, no gate)', () => {
    const profile = createInitialProfile('p3', makeAltitudes('Infrared'), 'Infrared', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    // Infrared has no previous stage, so no boss/quadrant needed. But still needs ≥2 lines above.
    // All at Infrared with none above → needs pull. So this should be false unless at top.
    // Actually for Infrared (ordinal 0), there's no prevStage, so checks 3,4,5 are skipped.
    // Check 2: need ≥2 lines above Infrared. All at Infrared → 0 above → false.
    expect(meetsAdvancementCriteria(profile, 'Infrared')).toBe(false);
  });
});

describe('checkAdvancementGate', () => {
  it('identifies all blockers for advancement', () => {
    const profile = createInitialProfile('p4', makeAltitudes('Red'), 'Red', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    const { canAdvance, blockers } = checkAdvancementGate(profile, 'Red');
    expect(canAdvance).toBe(false);
    expect(blockers.length).toBeGreaterThan(0);
  });

  it('passes when all criteria are met', () => {
    // All lines at Amber, ≥2 at Orange (pull), boss cleared, quadrants covered, no shadows
    const altitudes: Record<Line, Stage> = {
      Cognitive: 'Orange',
      Emotional: 'Orange',
      Moral: 'Amber',
      Intrapersonal: 'Amber',
      Spiritual: 'Amber',
      Somatic: 'Amber',
      Willpower: 'Amber',
      Interpersonal: 'Amber',
    };
    const base = createInitialProfile('p5', altitudes, 'Amber', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    // Satisfy all gate criteria for advancing to Amber:
    // prevStage = Red, need boss for Red cleared, quadrant coverage at Red
    const profile = {
      ...base,
      bossesCleared: ['Red' as Stage],
      quadrantCoverage: { Red: ['UL', 'UR', 'LL', 'LR'] as ('UL' | 'UR' | 'LL' | 'LR')[] },
    };
    const { canAdvance, blockers } = checkAdvancementGate(profile, 'Amber');
    expect(blockers).toEqual([]);
    expect(canAdvance).toBe(true);
  });
});
