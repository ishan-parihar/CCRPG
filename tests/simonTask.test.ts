import { describe, it, expect } from 'vitest';
import { generateSimonTrial, scoreSimon } from '../src/core/usecases/SimonTask.js';
import { mulberry32 } from '../src/core/usecases/RandomSource.js';

describe('generateSimonTrial', () => {
  it('produces congruent trials when incongruentRatio is 0', () => {
    const trial = generateSimonTrial(mulberry32(1), 0);
    expect(trial.congruent).toBe(true);
    expect(trial.direction).toBe(trial.position);
  });

  it('produces incongruent trials when incongruentRatio is 1', () => {
    const trial = generateSimonTrial(mulberry32(1), 1);
    expect(trial.congruent).toBe(false);
    expect(trial.direction).not.toBe(trial.position);
  });

  it('produces a mix with default ratio', () => {
    const rng = mulberry32(7);
    const trials = Array.from({ length: 100 }, () => generateSimonTrial(rng));
    const congruent = trials.filter((t) => t.congruent).length;
    expect(congruent).toBeGreaterThan(20);
    expect(congruent).toBeLessThan(80);
  });
});

describe('scoreSimon', () => {
  it('scores correct when chosen matches direction', () => {
    const trial = { direction: 'left' as const, position: 'right' as const, congruent: false };
    const result = scoreSimon(trial, { chosen: 'left', reactionMs: 300 });
    expect(result.correct).toBe(true);
    expect(result.congruent).toBe(false);
  });

  it('scores incorrect when chosen does not match direction', () => {
    const trial = { direction: 'right' as const, position: 'left' as const, congruent: false };
    const result = scoreSimon(trial, { chosen: 'left', reactionMs: 400 });
    expect(result.correct).toBe(false);
  });

  it('scores incorrect on null response', () => {
    const trial = { direction: 'left' as const, position: 'left' as const, congruent: true };
    const result = scoreSimon(trial, { chosen: null, reactionMs: 0 });
    expect(result.correct).toBe(false);
  });
});
