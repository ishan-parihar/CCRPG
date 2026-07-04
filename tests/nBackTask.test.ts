import { describe, it, expect } from 'vitest';
import {
  generateNBackSequence,
  scoreNBack,
  nBackDamageMultiplier,
  shouldUpgradeNBack,
} from '../src/core/usecases/NBackTask.js';
import { mulberry32 } from '../src/core/usecases/RandomSource.js';

describe('generateNBackSequence', () => {
  it('produces the requested length', () => {
    const seq = generateNBackSequence(
      { n: 2, trials: 12, alphabetSize: 4 },
      mulberry32(42),
    );
    expect(seq).toHaveLength(12);
  });

  it('marks targets correctly per the n-back rule', () => {
    const seq = generateNBackSequence(
      { n: 2, trials: 50, alphabetSize: 4, targetRatio: 0.5 },
      mulberry32(7),
    );
    for (let i = 0; i < seq.length; i++) {
      const t = seq[i]!;
      if (i < 2) {
        expect(t.isTarget).toBe(false);
      } else {
        const expected = seq[i - 2]!.stimulus === t.stimulus;
        expect(t.isTarget).toBe(expected);
      }
    }
  });

  it('produces some targets given a positive ratio', () => {
    const seq = generateNBackSequence(
      { n: 2, trials: 100, alphabetSize: 4, targetRatio: 0.4 },
      mulberry32(11),
    );
    const targets = seq.filter((t) => t.isTarget).length;
    expect(targets).toBeGreaterThan(10);
  });
});

describe('scoreNBack', () => {
  it('rewards perfect responses with accuracy 1', () => {
    const trials = generateNBackSequence(
      { n: 2, trials: 8, alphabetSize: 3 },
      mulberry32(3),
    );
    const responses = trials.map((t) => t.isTarget);
    const result = scoreNBack(trials, responses);
    expect(result.accuracy).toBe(1);
    expect(result.misses).toBe(0);
    expect(result.falseAlarms).toBe(0);
  });

  it('penalises false alarms and misses', () => {
    const trials = generateNBackSequence(
      { n: 1, trials: 10, alphabetSize: 3 },
      mulberry32(99),
    );
    const responses = trials.map(() => true); // press every trial
    const r = scoreNBack(trials, responses);
    expect(r.falseAlarms).toBeGreaterThan(0);
    expect(r.accuracy).toBeLessThan(1);
  });
});

describe('nBackDamageMultiplier', () => {
  it('returns at least the floor for a complete failure', () => {
    const result = {
      hits: 0,
      correctRejections: 0,
      misses: 5,
      falseAlarms: 5,
      total: 10,
      accuracy: 0,
      sensitivity: 0,
    };
    expect(nBackDamageMultiplier(result)).toBeCloseTo(0.2);
  });

  it('caps at 1.6 for perfect performance', () => {
    const result = {
      hits: 5,
      correctRejections: 5,
      misses: 0,
      falseAlarms: 0,
      total: 10,
      accuracy: 1,
      sensitivity: 1,
    };
    expect(nBackDamageMultiplier(result)).toBeCloseTo(1.6);
  });
});

describe('shouldUpgradeNBack', () => {
  it('upgrades on three perfect rounds', () => {
    expect(shouldUpgradeNBack([1, 1, 1])).toBe(true);
  });
  it('does not upgrade on a streak with a miss', () => {
    expect(shouldUpgradeNBack([1, 0.9, 1])).toBe(false);
  });
});
