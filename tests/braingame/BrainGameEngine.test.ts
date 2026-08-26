import { describe, it, expect } from 'vitest';
import { BrainGameEngine, feltSense } from '../../src/core/braingame/BrainGameEngine.js';
import type { GameUiPort, EngineOptions } from '../../src/core/braingame/BrainGameEngine.js';
import { NBackParadigm } from '../../src/core/braingame/paradigms/nback.js';
import { ReactionTimeParadigm } from '../../src/core/braingame/paradigms/reactionTime.js';
import type { CollectedResponse, TrialPlan, TrialRecord } from '../../src/core/braingame/types.js';

/** Scripted UI port: answers from a queue; fake latencies. */
function scriptedUi(
  answers: (string | null)[],
  latencyNs = 250_000_000n,
): { ui: GameUiPort; presented: TrialPlan[] } {
  let i = 0;
  const presented: TrialPlan[] = [];
  const ui: GameUiPort = {
    show: async () => {},
    runTrial: async (plan) => {
      presented.push(plan);
      const value = answers[i % answers.length] ?? null;
      i++;
      const response: CollectedResponse =
        value === null
          ? { value: null, latencyNs: null, timedOut: true }
          : { value, latencyNs, timedOut: false };
      return response;
    },
    onAbort: () => {},
  };
  return { ui, presented };
}

function makeEngine(opts: Partial<EngineOptions> & { ui: GameUiPort }): BrainGameEngine {
  return new BrainGameEngine({
    paradigm: NBackParadigm,
    params: { n: 1 },
    trialCount: 6,
    ...opts,
  });
}

describe('BrainGameEngine', () => {
  it('runs the full trial loop and emits records to the sink', async () => {
    const records: TrialRecord[] = [];
    const { ui } = scriptedUi(['y', 'n', 'y']);
    const engine = makeEngine({ ui, sink: (r) => records.push(r) });
    const summary = await engine.run();

    expect(summary.trialsCompleted).toBe(6);
    expect(summary.paradigmId).toBe('n_back');
    expect(records).toHaveLength(6);
    expect(records[0]!.paradigmId).toBe('n_back');
    expect(records[0]!.sessionId).toBe(summary.sessionId);
    expect(summary.accuracyTrend.length).toBeGreaterThan(0);
    expect(summary.rtMedianMs).not.toBeNull();
  });

  it('passes answerKey through but never exposes it via presentation alone', async () => {
    const { ui, presented } = scriptedUi(['y']);
    await makeEngine({ ui }).run();
    // Every plan carried an opaque key for evaluation.
    for (const p of presented) expect(p.answerKey).toBeDefined();
    // Descriptors carry no key material.
    for (const p of presented) expect(JSON.stringify(p.stimulus)).not.toContain('isMatch');
  });

  it('invokes adjustDifficulty between trials and clamps to param space', async () => {
    const levelsSeen: number[] = [];
    const { ui } = scriptedUi(['y']);
    const engine = makeEngine({
      ui,
      trialCount: 4,
      adjustDifficulty: (params) => {
        levelsSeen.push(params.n ?? -1);
        // Try to push n beyond max — must be clamped.
        return { ...params, n: 99 };
      },
    });
    const summary = await engine.run();
    expect(levelsSeen.length).toBe(3); // after trials 0..2, feeding trials 1..3
    expect(summary.paramsEnd.n).toBeLessThanOrEqual(4);
  });

  it('abort stops the loop early and flags the summary', async () => {
    let abortCb: (() => void) | null = null;
    const ui: GameUiPort = {
      show: async () => {},
      runTrial: async () => ({ value: 'y', latencyNs: 100_000_000n, timedOut: false }),
      onAbort: (cb) => { abortCb = cb; },
    };
    const engine = new BrainGameEngine({
      paradigm: ReactionTimeParadigm,
      trialCount: 50,
      ui,
    });
    const running = engine.run();
    abortCb!();
    const summary = await running;
    expect(summary.aborted).toBe(true);
    expect(summary.trialsCompleted).toBeLessThan(50);
    expect(summary.feltSenseHint).toContain('unfinished');
  });

  it('composite performance blends RT for timed paradigms', async () => {
    const slowUi: GameUiPort = {
      show: async () => {},
      runTrial: async () => ({ value: 'space', latencyNs: 900_000_000n, timedOut: false }),
      onAbort: () => {},
    };
    const fastUi: GameUiPort = {
      show: async () => {},
      runTrial: async () => ({ value: 'space', latencyNs: 150_000_000n, timedOut: false }),
      onAbort: () => {},
    };
    const slow = await new BrainGameEngine({ paradigm: ReactionTimeParadigm, trialCount: 5, ui: slowUi }).run();
    const fast = await new BrainGameEngine({ paradigm: ReactionTimeParadigm, trialCount: 5, ui: fastUi }).run();
    expect(fast.performance).toBeGreaterThan(slow.performance);
    expect(slow.rtMedianMs!).toBeGreaterThan(fast.rtMedianMs!);
  });

  it('feltSense maps performance bands monotonically', () => {
    const phrases = [0.95, 0.75, 0.6, 0.45, 0.2].map((p) => feltSense(p, true));
    expect(new Set(phrases).size).toBe(phrases.length);
    expect(feltSense(0.9, false)).toContain('unfinished');
  });
});
