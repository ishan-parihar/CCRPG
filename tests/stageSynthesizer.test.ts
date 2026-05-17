import { describe, it, expect } from 'vitest';
import { synthesiseStage, meetsAdvancementCriteria } from '../src/core/usecases/StageSynthesizer.js';
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
  it('returns true when all lines are at or above target', () => {
    const profile = createInitialProfile('p1', makeAltitudes('Red'), 'Red', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    expect(meetsAdvancementCriteria(profile, 'Red')).toBe(true);
  });

  it('returns false when any line is below target', () => {
    const altitudes = { ...makeAltitudes('Amber'), Cognitive: 'Red' as Stage };
    const profile = createInitialProfile('p2', altitudes, 'Red', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    expect(meetsAdvancementCriteria(profile, 'Amber')).toBe(false);
  });

  it('returns true for Infrared (everyone meets it)', () => {
    const profile = createInitialProfile('p3', makeAltitudes('Infrared'), 'Infrared', {
      Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25,
    });
    expect(meetsAdvancementCriteria(profile, 'Infrared')).toBe(true);
  });
});
