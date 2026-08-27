import { describe, it, expect } from 'vitest';
import { initAdaptiveState, adapt, strategyForParadigm, createTrialAdjuster } from '../../src/core/adaptive/AdaptiveDifficultyService.js';
import { getParadigm } from '../../src/core/braingame/registry.js';
import { BrainGameEngine, type GameUiPort } from '../../src/core/braingame/BrainGameEngine.js';
import type { CollectedResponse, TrialPlan } from '../../src/core/braingame/types.js';
import { TrialClock } from '../../src/core/braingame/TrialClock.js';

function syntheticCorrect(level: number, ability: number, rng: () => number): boolean {
  const noise = (rng() - 0.5) * 0.3;
  return ability + noise > level;
}

describe('Synthetic convergence', () => {
  it('strong vs weak vs noisy players converge to distinct bands via adapt()', () => {
    const strong = initAdaptiveState(0.35);
    const weak = initAdaptiveState(0.35);
    const noisy = initAdaptiveState(0.35);
    let s = strong, w = weak, n = noisy;
    const rng = (() => { let seed = 1; return () => (seed = (seed * 1664525 + 1013904223) % 0xffffffff) / 0xffffffff; })();
    for (let i = 0; i < 100; i++) {
      s = adapt(s, syntheticCorrect(s.level, 0.8, rng));
      w = adapt(w, syntheticCorrect(w.level, 0.3, rng));
      n = adapt(n, Math.random() < 0.5);
    }
    expect(s.level).toBeGreaterThan(w.level + 0.2);
    expect(s.level).toBeGreaterThan(0.5);
    expect(w.level).toBeLessThan(0.4);
  });

  it('composite_accuracy_rt does not escalate on slow correct', () => {
    const s = initAdaptiveState(0.5);
    // correct but latencyScore 0.4 < rtEscalateScore 0.65 → neutral (no level increase)
    const afterSlow = adapt(s, true, undefined, 0.4, 'composite_accuracy_rt');
    expect(afterSlow.level).toBe(s.level);
    const afterFast = adapt(s, true, undefined, 0.9, 'composite_accuracy_rt');
    // needs 2 consecutive correct to step up; first correct still no step
    expect(afterFast.level).toBe(s.level);
    const afterFast2 = adapt(afterFast, true, undefined, 0.9, 'composite_accuracy_rt');
    expect(afterFast2.level).toBeGreaterThan(s.level);
  });

  it('staircase inside BrainGameEngine adapts params within a game', async () => {
    const paradigm = getParadigm('stroop')!;
    function correctValueForPlan(plan: TrialPlan): string {
      const ak: any = plan.answerKey ?? {};
      if (typeof ak.inkKey === 'string') return ak.inkKey;
      if (typeof ak.correctKey === 'string') return ak.correctKey;
      if (typeof ak.shouldMatch === 'boolean') return ak.shouldMatch ? 'y' : 'n';
      if (typeof ak.targetKey === 'string') return ak.targetKey;
      if (plan.response.mode === 'key') return plan.response.keys[0]!;
      return '1';
    }
    class AlwaysCorrect implements GameUiPort {
      onAbort(_cb: () => void) {}
      async show(_l: readonly string[]) {}
      async runTrial(plan: TrialPlan): Promise<CollectedResponse> {
        return { value: correctValueForPlan(plan), latencyNs: BigInt(250_000_000), timedOut: false };
      }
    }
    class AlwaysWrong implements GameUiPort {
      onAbort(_cb: () => void) {}
      async show(_l: readonly string[]) {}
      async runTrial(plan: TrialPlan): Promise<CollectedResponse> {
        const correct = correctValueForPlan(plan);
        let wrong: string;
        if (plan.response.mode === 'key') {
          wrong = plan.response.keys.find((k) => k !== correct) ?? (correct === 'y' ? 'n' : 'y');
        } else {
          wrong = correct === '1' ? '2' : '1';
        }
        return { value: wrong, latencyNs: BigInt(900_000_000), timedOut: false };
      }
    }
    const strongAdj = createTrialAdjuster(paradigm, initAdaptiveState(0.5), strategyForParadigm(paradigm.id));
    const weakAdj = createTrialAdjuster(paradigm, initAdaptiveState(0.5), strategyForParadigm(paradigm.id));
    const strongEngine = new BrainGameEngine({ paradigm, params: {}, trialCount: 12, ui: new AlwaysCorrect(), clock: new TrialClock(), adjustDifficulty: strongAdj.adjust });
    const weakEngine = new BrainGameEngine({ paradigm, params: {}, trialCount: 12, ui: new AlwaysWrong(), clock: new TrialClock(), adjustDifficulty: weakAdj.adjust });
    await Promise.all([strongEngine.run(), weakEngine.run()]);
    expect(strongAdj.state().level).toBeGreaterThan(weakAdj.state().level);
    expect(strongAdj.state().level).toBeGreaterThan(0.5);
    expect(weakAdj.state().level).toBeLessThan(0.5);
  });
});
