import { describe, it, expect } from 'vitest';
import { NBackParadigm } from '../../src/core/braingame/paradigms/nback.js';
import { ReactionTimeParadigm, rtLatencyScore } from '../../src/core/braingame/paradigms/reactionTime.js';
import { PatternPredictionParadigm } from '../../src/core/braingame/paradigms/patternPrediction.js';
import { GoNoGoParadigm } from '../../src/core/braingame/paradigms/goNoGo.js';
import { StroopParadigm, STROOP_COLORS } from '../../src/core/braingame/paradigms/stroop.js';
import { createRng, clampParams, paramsToLevel, levelToParams, fnvHash } from '../../src/core/braingame/types.js';

const SEED = 42;

describe('param space utilities', () => {
  it('clamps and snaps values into the declared space', () => {
    const out = clampParams(N_BACK_SPACE_TEST, { n: 99, isiMs: 1237, bogus: 5 });
    expect(out.n).toBe(4);
    // 1237 snaps to nearest 100-step within [900,2400]
    expect(out.isiMs).toBe(1200);
    expect('bogus' in out).toBe(false);
  });

  it('maps level→params→level round-trips approximately', () => {
    const level = 0.62;
    const params = levelToParams(N_BACK_SPACE_TEST, level);
    const back = paramsToLevel(N_BACK_SPACE_TEST, params);
    expect(Math.abs(back - level)).toBeLessThan(0.05);
  });

  it('fnvHash is deterministic and hex', () => {
    expect(fnvHash('n_back|{}')).toBe(fnvHash('n_back|{}'));
    expect(fnvHash('a')).not.toBe(fnvHash('b'));
    expect(fnvHash('x')).toMatch(/^[0-9a-f]{8}$/);
  });
});

const N_BACK_SPACE_TEST = {
  n: { min: 1, max: 4, step: 1 },
  isiMs: { min: 900, max: 2400, step: 100 },
};

describe('NBackParadigm', () => {
  it('produces identical sequences under the same seed', () => {
    const rngA = createRng(SEED);
    const rngB = createRng(SEED);
    const state = NBackParadigm.init({ n: 2 }, rngA);
    const plansA = [];
    let s = state;
    for (let i = 0; i < 10; i++) {
      const plan = NBackParadigm.present(s, i, rngA);
      plansA.push(plan.stimulus.kind === 'symbol' ? plan.stimulus.glyph : '');
      s = NBackParadigm.advance(s, plan, { value: 'n', latencyNs: null, timedOut: false });
    }
    const state2 = NBackParadigm.init({ n: 2 }, rngB);
    let s2 = state2;
    const glyphsB = [];
    for (let i = 0; i < 10; i++) {
      const plan = NBackParadigm.present(s2, i, rngB);
      glyphsB.push(plan.stimulus.kind === 'symbol' ? plan.stimulus.glyph : '');
      s2 = NBackParadigm.advance(s2, plan, { value: 'n', latencyNs: null, timedOut: false });
    }
    expect(glyphsB).toEqual(plansA);
  });

  it('scores match/no-match correctly via answerKey', () => {
    const state = NBackParadigm.init({ n: 1 }, createRng(1));
    // Build history so we control a known match: present trial0, advance,
    // then force a matching symbol at trial 1.
    const plan0 = NBackParadigm.present(state, 0, createRng(7));
    const glyph0 = plan0.stimulus.kind === 'symbol' ? plan0.stimulus.glyph : '';
    const s1 = NBackParadigm.advance(state, plan0, { value: null, latencyNs: null, timedOut: false });

    const matchPlan: typeof plan0 = {
      ...plan0,
      stimulus: { kind: 'symbol', glyph: glyph0 },
      answerKey: { isMatch: true },
    };
    const hit = NBackParadigm.evaluate(s1, matchPlan, { value: 'y', latencyNs: null, timedOut: false });
    const miss = NBackParadigm.evaluate(s1, matchPlan, { value: 'n', latencyNs: null, timedOut: false });
    const timeout = NBackParadigm.evaluate(s1, matchPlan, { value: null, latencyNs: null, timedOut: true });
    expect(hit.correct).toBe(true);
    expect(miss.correct).toBe(false);
    expect(timeout.correct).toBe(false);
  });

  it('never presents a match before trial n', () => {
    const rng = createRng(3);
    let s = NBackParadigm.init({ n: 3 }, rng);
    for (let i = 0; i < 3; i++) {
      const plan = NBackParadigm.present(s, i, rng);
      const key = plan.answerKey as { isMatch: boolean };
      expect(key.isMatch).toBe(false);
      s = NBackParadigm.advance(s, plan, { value: null, latencyNs: null, timedOut: false });
    }
  });
});

describe('ReactionTimeParadigm', () => {
  it('marks fast hits correct and scores speed bands', () => {
    const state = ReactionTimeParadigm.init({}, createRng(1));
    const plan = ReactionTimeParadigm.present(state, 0, createRng(2));
    const fast = ReactionTimeParadigm.evaluate(state, plan, { value: 'space', latencyNs: 200_000_000n, timedOut: false });
    const slow = ReactionTimeParadigm.evaluate(state, plan, { value: 'space', latencyNs: 800_000_000n, timedOut: false });
    const miss = ReactionTimeParadigm.evaluate(state, plan, { value: null, latencyNs: null, timedOut: true });
    expect(fast.correct).toBe(true);
    expect(fast.latencyScore).toBeGreaterThan(slow.latencyScore);
    expect(miss.correct).toBe(false);
    expect(miss.latencyScore).toBe(0);
  });

  it('rtLatencyScore bands', () => {
    expect(rtLatencyScore(null)).toBe(0);
    expect(rtLatencyScore(150)).toBe(1);
    expect(rtLatencyScore(2000)).toBe(0.15);
  });

  it('random foreperiod stays within [delayMin, delayMax]', () => {
    const rng = createRng(9);
    let s = ReactionTimeParadigm.init({ delayMinMs: 1000, delayMaxMs: 2000 }, rng);
    for (let i = 0; i < 30; i++) {
      const plan = ReactionTimeParadigm.present(s, i, rng);
      expect(plan.preambleMs).toBeGreaterThanOrEqual(1000);
      expect(plan.preambleMs).toBeLessThan(2000);
    }
  });
});

describe('PatternPredictionParadigm', () => {
  it('answerKey holds the correct next symbol and choices contain exactly one correct', () => {
    const rng = createRng(11);
    const state = PatternPredictionParadigm.init({ alphabetSize: 5 }, rng);
    for (let i = 0; i < 20; i++) {
      const plan = PatternPredictionParadigm.present(state, i, rng);
      if (plan.response.mode !== 'choice') throw new Error('expected choice mode');
      const correctId = plan.answerKey as string;
      const matches = plan.response.choices.filter((c) => c.id === correctId);
      expect(matches).toHaveLength(1);
      expect(plan.response.choices).toHaveLength(4);
    }
  });

  it('evaluates picked choice against answerKey', () => {
    const rng = createRng(12);
    const state = PatternPredictionParadigm.init({}, rng);
    const plan = PatternPredictionParadigm.present(state, 0, rng);
    const key = plan.answerKey as string;
    const good = PatternPredictionParadigm.evaluate(state, plan, { value: key, latencyNs: null, timedOut: false });
    const bad = PatternPredictionParadigm.evaluate(state, plan, { value: '◆◆', latencyNs: null, timedOut: false });
    expect(good.correct).toBe(true);
    expect(bad.correct).toBe(false);
  });
});

describe('GoNoGoParadigm', () => {
  it('go trials require press; nogo trials require withholding', () => {
    const rng = createRng(21);
    const state = GoNoGoParadigm.init({}, rng);
    let goPlan = null, nogoPlan = null;
    let s = state;
    for (let i = 0; i < 50 && (!goPlan || !nogoPlan); i++) {
      const plan = GoNoGoParadigm.present(s, i, rng);
      const key = plan.answerKey as { isGo: boolean };
      if (key.isGo && !goPlan) goPlan = plan;
      if (!key.isGo && !nogoPlan) nogoPlan = plan;
      s = GoNoGoParadigm.advance(s, plan, { value: null, latencyNs: null, timedOut: false });
    }
    expect(goPlan).not.toBeNull();
    expect(nogoPlan).not.toBeNull();

    const hit = GoNoGoParadigm.evaluate(state, goPlan!, { value: 'space', latencyNs: 300_000_000n, timedOut: false });
    const omission = GoNoGoParadigm.evaluate(state, goPlan!, { value: null, latencyNs: null, timedOut: true });
    const rejection = GoNoGoParadigm.evaluate(state, nogoPlan!, { value: null, latencyNs: null, timedOut: true });
    const commission = GoNoGoParadigm.evaluate(state, nogoPlan!, { value: 'space', latencyNs: 300_000_000n, timedOut: false });
    expect(hit.correct).toBe(true);
    expect(omission.correct).toBe(false);
    expect(rejection.correct).toBe(true);
    expect(commission.correct).toBe(false);
  });
});

describe('StroopParadigm', () => {
  it('conflict trials render word ≠ ink; answerKey names the ink', () => {
    const rng = createRng(31);
    const state = StroopParadigm.init({ conflictRatio: 1 }, rng);
    for (let i = 0; i < 20; i++) {
      const plan = StroopParadigm.present(state, i, rng);
      if (plan.stimulus.kind !== 'symbol') throw new Error('expected symbol');
      const key = plan.answerKey as { inkKey: string };
      const inkColor = STROOP_COLORS.find((c) => c.key === key.inkKey)!;
      // Conflict ratio 1 → the displayed WORD must differ from the INK color name.
      expect(plan.stimulus.glyph).not.toBe(inkColor.word);
    }
  });

  it('keys cover the configured color count', () => {
    const state = StroopParadigm.init({ colorCount: 6 }, createRng(32));
    const plan = StroopParadigm.present(state, 0, createRng(33));
    if (plan.response.mode !== 'key') throw new Error('expected key mode');
    expect(plan.response.keys).toHaveLength(6);
  });

  it('scores correct ink naming', () => {
    const state = StroopParadigm.init({}, createRng(34));
    const plan = StroopParadigm.present(state, 0, createRng(35));
    const key = plan.answerKey as { inkKey: string };
    const right = StroopParadigm.evaluate(state, plan, { value: key.inkKey, latencyNs: 500_000_000n, timedOut: false });
    const wrong = StroopParadigm.evaluate(state, plan, { value: 'z', latencyNs: null, timedOut: false });
    expect(right.correct).toBe(true);
    expect(wrong.correct).toBe(false);
  });
});
