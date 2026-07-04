import { describe, it, expect } from 'vitest';
import { generateGoNoGoTrial, scoreGoNoGo } from '../src/core/usecases/GoNoGoTask.js';
import { mulberry32 } from '../src/core/usecases/RandomSource.js';

describe('generateGoNoGoTrial', () => {
  it('produces go trials when ratio is 1', () => {
    const trial = generateGoNoGoTrial(() => 0.5, 1.0);
    expect(trial.type).toBe('go');
  });

  it('produces nogo trials when ratio is 0', () => {
    const trial = generateGoNoGoTrial(() => 0.5, 0.0);
    expect(trial.type).toBe('nogo');
  });

  it('produces a mix with default ratio', () => {
    const rng = mulberry32(42);
    const trials = Array.from({ length: 100 }, () => generateGoNoGoTrial(rng));
    const goCount = trials.filter((t) => t.type === 'go').length;
    expect(goCount).toBeGreaterThan(50);
    expect(goCount).toBeLessThan(90);
  });
});

describe('scoreGoNoGo', () => {
  it('scores a hit on go + responded', () => {
    const result = scoreGoNoGo({ type: 'go' }, { responded: true, reactionMs: 250 });
    expect(result.correct).toBe(true);
    expect(result.outcome).toBe('hit');
  });

  it('scores a miss on go + not responded', () => {
    const result = scoreGoNoGo({ type: 'go' }, { responded: false, reactionMs: 0 });
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('miss');
  });

  it('scores correct-rejection on nogo + not responded', () => {
    const result = scoreGoNoGo({ type: 'nogo' }, { responded: false, reactionMs: 0 });
    expect(result.correct).toBe(true);
    expect(result.outcome).toBe('correct-rejection');
  });

  it('scores false-alarm on nogo + responded', () => {
    const result = scoreGoNoGo({ type: 'nogo' }, { responded: true, reactionMs: 200 });
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('false-alarm');
  });
});
