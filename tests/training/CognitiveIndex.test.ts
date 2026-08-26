import { describe, it, expect } from 'vitest';
import {
  CognitiveIndex,
  decayScore,
  emptyIndex,
} from '../../src/core/training/CognitiveIndex.js';
import { planWorkout, FatigueMonitor } from '../../src/core/training/WorkoutPlanner.js';
import { allParadigms } from '../../src/core/braingame/registry.js';
import type { Line } from '../../src/core/domain/Line.js';

const NOW = 1_700_000_000_000;

describe('decayScore', () => {
  it('decays toward baseline exponentially', () => {
    const d1 = decayScore(0.9, 0.5, 1);
    const d7 = decayScore(0.9, 0.5, 7);
    const d30 = decayScore(0.9, 0.5, 30);
    expect(d1).toBeLessThan(0.9);
    expect(d7).toBeLessThan(d1);
    expect(d30).toBeGreaterThan(0.49); // asymptote is baseline
    expect(decayScore(0.9, 0.5, 0)).toBe(0.9);
  });
});

describe('CognitiveIndex', () => {
  it('starts neutral across all eight lines', () => {
    const idx = new CognitiveIndex();
    for (const s of idx.snapshot(NOW)) {
      expect(s.score01).toBeCloseTo(0.5, 5);
      expect(s.trend).toBe('stable');
    }
  });

  it('recordGame raises played lines and shifts baseline slowly', () => {
    const idx = new CognitiveIndex();
    idx.recordGame(['Cognitive'], 0.95, NOW);
    const cog = idx.snapshot(NOW).find((s) => s.line === 'Cognitive')!;
    expect(cog.score01).toBeGreaterThan(0.5);
    expect(cog.trend).toBe('rising');

    // Unplayed lines stay neutral.
    const som = idx.snapshot(NOW).find((s) => s.line === 'Somatic')!;
    expect(som.score01).toBeCloseTo(0.5, 5);
  });

  it('applyDecay pulls stale scores back toward baseline', () => {
    const idx = new CognitiveIndex();
    idx.recordGame(['Emotional'], 0.9, NOW - 14 * 86_400_000);
    idx.applyDecay(NOW);
    const emo = idx.snapshot(NOW).find((s) => s.line === 'Emotional')!;
    expect(emo.score01).toBeLessThan(idx.getState().skills['Emotional']!.score + 1e-9);
    // Two weeks ≈ two half-lives → most of the gain gone.
    expect(emo.score01).toBeLessThan(0.62);
  });

  it('load() shims missing lines instead of crashing on old saves', () => {
    const partial = emptyIndex(NOW);
    const broken = { skills: { Cognitive: partial.skills['Cognitive']! } } as never;
    const idx = new CognitiveIndex();
    idx.load(broken);
    expect(idx.snapshot(NOW)).toHaveLength(8);
  });

  it('feltSenseFor stays qualitative (Veil) — never numbers or percentiles', () => {
    const idx = new CognitiveIndex();
    idx.recordGame(['Moral'], 0.92, NOW);
    const phrase = idx.feltSenseFor('Moral');
    expect(phrase).not.toMatch(/\d/);
    expect(phrase.toLowerCase()).toContain('moral');
  });
});

describe('planWorkout', () => {
  function indexWith(overrides: Partial<Record<Line, number>>): CognitiveIndex {
    const idx = new CognitiveIndex();
    for (const [line, perf] of Object.entries(overrides)) {
      if (perf !== undefined) idx.recordGame([line as Line], perf, NOW - 86_400_000);
      else idx.recordGame([line as Line], 0.5, NOW);
    }
    return idx;
  }

  it('produces 2–6 items within budget and no duplicate paradigms', () => {
    const plan = planWorkout(indexWith({}), { minutes: 12 });
    expect(plan.items.length).toBeGreaterThanOrEqual(2);
    expect(plan.items.length).toBeLessThanOrEqual(4);
    const ids = plan.items.map((i) => i.paradigmId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(plan.totalMinutes).toBeLessThanOrEqual(24);
  });

  it('biases toward decayed lines over fresh ones', () => {
    const decayedIdx = indexWith({ Cognitive: 0.2 }); // low score → high urgency
    const planA = planWorkout(decayedIdx, { minutes: 9 });
    const firstDomain = planA.items[0]!.paradigmId;
    // n_back/go_no_go/stroop/pattern all train Cognitive; reaction_time also Somatic.
    expect(['n_back', 'go_no_go', 'stroop', 'pattern_prediction']).toContain(firstDomain);

    const freshIdx = indexWith({ Cognitive: 0.95, Somatic: 0.2 });
    const planB = planWorkout(freshIdx, { minutes: 9 });
    // With cognitive strong and somatic weak, reaction_time should rank first.
    expect(planB.items[0]!.paradigmId).toBe('reaction_time');
  });

  it('honors excludeLines when the narrative just trained that line', () => {
    const idx = indexWith({ Cognitive: 0.2 });
    const plan = planWorkout(idx, { minutes: 15, excludeLines: ['Cognitive'] });
    // The first item must NOT be a pure-Cognitive game (fully inside the
    // excluded line); partial-overlap games remain viable candidates.
    const first = plan.items[0];
    expect(first).toBeDefined();
    const paradigmDomains = allParadigms().find((p) => p.id === first!.paradigmId)!.domains;
    expect(paradigmDomains.every((d) => d === 'Cognitive')).toBe(false);
  });

  it('respects focusLine bias', () => {
    const idx = indexWith({});
    const plan = planWorkout(idx, { minutes: 6, focusLine: 'Willpower' });
    // go_no_go trains Willpower — with everything neutral, the bias wins.
    expect(plan.items[0]!.paradigmId).toBe('go_no_go');
  });
});

describe('FatigueMonitor', () => {
  it('returns ok early', () => {
    const fm = new FatigueMonitor();
    expect(fm.record(0.9, 300)).toBe('ok');
    expect(fm.record(0.85, 310)).toBe('ok');
  });

  it('flags break on accuracy collapse', () => {
    const fm = new FatigueMonitor();
    fm.record(0.8, 300);
    fm.record(0.4, 320);
    fm.record(0.3, 340);
    const verdict = fm.record(0.25, 360);
    expect(['break', 'lighter']).toContain(verdict);
  });

  it('flags degradation on RT drift >30%', () => {
    const fm = new FatigueMonitor();
    fm.record(0.8, 300);
    const verdict = fm.record(0.8, 450);
    expect(verdict).not.toBe('ok');
  });
});
