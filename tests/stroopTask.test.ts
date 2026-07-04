import { describe, it, expect } from 'vitest';
import {
  generateStroopTrial,
  scoreStroop,
} from '../src/core/usecases/StroopTask.js';
import { mulberry32 } from '../src/core/usecases/RandomSource.js';

describe('generateStroopTrial', () => {
  it('produces an incongruent trial when ratio is 1', () => {
    const t = generateStroopTrial(mulberry32(1), 1);
    expect(t.incongruent).toBe(true);
    expect(t.word).not.toBe(t.ink);
  });

  it('produces a congruent trial when ratio is 0', () => {
    const t = generateStroopTrial(mulberry32(1), 0);
    expect(t.incongruent).toBe(false);
    expect(t.word).toBe(t.ink);
  });
});

describe('scoreStroop', () => {
  const trial = { word: 'red' as const, ink: 'blue' as const, incongruent: true };

  it('grants a perfect parry on fast correct response', () => {
    const out = scoreStroop(trial, { chosen: 'blue', reactionMs: 400 });
    expect(out.quality).toBe('perfect-parry');
    expect(out.damageMultiplier).toBe(0);
  });

  it('grants a block on slow correct response', () => {
    const out = scoreStroop(trial, { chosen: 'blue', reactionMs: 1500 });
    expect(out.quality).toBe('block');
    expect(out.damageMultiplier).toBeCloseTo(0.4);
  });

  it('punishes wrong answers as critical hits', () => {
    const out = scoreStroop(trial, { chosen: 'red', reactionMs: 500 });
    expect(out.quality).toBe('fail');
    expect(out.damageMultiplier).toBeGreaterThan(1);
  });

  it('treats null (timeout) as failure', () => {
    const out = scoreStroop(trial, { chosen: null, reactionMs: 9999 });
    expect(out.quality).toBe('fail');
  });
});
