import { describe, it, expect } from 'vitest';
import {
  updateStaircase,
  hasConverged,
  DEFAULT_STAIRCASE_CONFIG,
} from '../src/core/usecases/Staircase.js';
import type { StaircaseState } from '../src/core/domain/PlayerProfile.js';

const initial: StaircaseState = {
  level: 5,
  reversals: 0,
  lastDirection: null,
  history: [],
};

describe('updateStaircase', () => {
  it('does not change level on a single correct response', () => {
    const result = updateStaircase(initial, DEFAULT_STAIRCASE_CONFIG, true);
    expect(result.level).toBe(5);
    expect(result.history).toHaveLength(1);
  });

  it('decreases level after 2 consecutive correct (2-down)', () => {
    const after1 = updateStaircase(initial, DEFAULT_STAIRCASE_CONFIG, true);
    const after2 = updateStaircase(after1, DEFAULT_STAIRCASE_CONFIG, true);
    expect(after2.level).toBe(4);
    expect(after2.lastDirection).toBe('down');
  });

  it('increases level after 1 incorrect (1-up)', () => {
    const result = updateStaircase(initial, DEFAULT_STAIRCASE_CONFIG, false);
    expect(result.level).toBe(6);
    expect(result.lastDirection).toBe('up');
  });

  it('counts a reversal when direction changes', () => {
    // Go down first
    const down: StaircaseState = { level: 4, reversals: 0, lastDirection: 'down', history: [true, true] };
    // Then incorrect → up = reversal
    const result = updateStaircase(down, DEFAULT_STAIRCASE_CONFIG, false);
    expect(result.lastDirection).toBe('up');
    expect(result.reversals).toBe(1);
  });

  it('clamps at minLevel', () => {
    const atMin: StaircaseState = { level: 1, reversals: 0, lastDirection: null, history: [true] };
    const result = updateStaircase(atMin, DEFAULT_STAIRCASE_CONFIG, true);
    expect(result.level).toBe(1);
  });

  it('clamps at maxLevel', () => {
    const atMax: StaircaseState = { level: 10, reversals: 0, lastDirection: null, history: [] };
    const result = updateStaircase(atMax, DEFAULT_STAIRCASE_CONFIG, false);
    expect(result.level).toBe(10);
  });
});

describe('hasConverged', () => {
  it('returns false when reversals below threshold', () => {
    const state: StaircaseState = { level: 5, reversals: 3, lastDirection: 'up', history: [] };
    expect(hasConverged(state, DEFAULT_STAIRCASE_CONFIG)).toBe(false);
  });

  it('returns true when reversals meet threshold', () => {
    const state: StaircaseState = { level: 5, reversals: 6, lastDirection: 'down', history: [] };
    expect(hasConverged(state, DEFAULT_STAIRCASE_CONFIG)).toBe(true);
  });
});
