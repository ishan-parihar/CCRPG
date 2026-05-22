import { describe, it, expect } from 'vitest';
import {
  CONQUEROR_PHASES,
  getConquerorPhase,
  isConquerorDefeated,
} from '../../src/core/data/encounters/red/conqueror.js';

describe('Conqueror Boss Phases', () => {
  it('has exactly 4 phases', () => {
    expect(CONQUEROR_PHASES).toHaveLength(4);
  });

  it('covers all 4 quadrants (UL, UR, LL, LR)', () => {
    const quadrants = CONQUEROR_PHASES.map(p => p.quadrant);
    expect(quadrants).toContain('UL');
    expect(quadrants).toContain('UR');
    expect(quadrants).toContain('LL');
    expect(quadrants).toContain('LR');
  });

  it('each phase has a unique quadrant', () => {
    const quadrants = CONQUEROR_PHASES.map(p => p.quadrant);
    expect(new Set(quadrants).size).toBe(4);
  });

  it('each phase has a positive difficulty', () => {
    for (const phase of CONQUEROR_PHASES) {
      expect(phase.difficulty).toBeGreaterThan(0);
    }
  });

  it('each phase has at least one taskBind', () => {
    for (const phase of CONQUEROR_PHASES) {
      expect(phase.taskBinds.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each phase has a non-empty name and description', () => {
    for (const phase of CONQUEROR_PHASES) {
      expect(phase.name.length).toBeGreaterThan(0);
      expect(phase.description.length).toBeGreaterThan(0);
    }
  });

  it('all taskBinds have valid taskSlug values', () => {
    const validSlugs = new Set([
      'n_back', 'stroop', 'simon', 'go_no_go',
      'affect_recognition', 'dilemma_choice', 'reaction_time',
      'held_input', 'breath_rhythm', 'self_report',
      'value_coherence', 'pattern_prediction',
    ]);
    for (const phase of CONQUEROR_PHASES) {
      for (const bind of phase.taskBinds) {
        expect(validSlugs.has(bind.taskSlug)).toBe(true);
      }
    }
  });

  describe('getConquerorPhase', () => {
    it('returns correct phase by index', () => {
      expect(getConquerorPhase(0)).toBe(CONQUEROR_PHASES[0]);
      expect(getConquerorPhase(1)).toBe(CONQUEROR_PHASES[1]);
      expect(getConquerorPhase(2)).toBe(CONQUEROR_PHASES[2]);
      expect(getConquerorPhase(3)).toBe(CONQUEROR_PHASES[3]);
    });

    it('returns undefined for out-of-range index', () => {
      expect(getConquerorPhase(4)).toBeUndefined();
      expect(getConquerorPhase(-1)).toBeUndefined();
    });
  });

  describe('isConquerorDefeated', () => {
    it('returns false when fewer than 4 phases completed', () => {
      expect(isConquerorDefeated(0)).toBe(false);
      expect(isConquerorDefeated(1)).toBe(false);
      expect(isConquerorDefeated(2)).toBe(false);
      expect(isConquerorDefeated(3)).toBe(false);
    });

    it('returns true when 4 or more phases completed', () => {
      expect(isConquerorDefeated(4)).toBe(true);
      expect(isConquerorDefeated(5)).toBe(true);
    });
  });
});
