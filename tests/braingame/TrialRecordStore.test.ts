import { describe, it, expect } from 'vitest';
import { TrialRecordStore } from '../../src/core/braingame/TrialRecordStore.js';
import { MAX_TRIALS_PER_PARADIGM } from '../../src/core/braingame/TrialRecordStore.js';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import type { TrialRecord } from '../../src/core/braingame/types.js';

function fakeTrial(i: number, paradigmId = 'n_back'): TrialRecord {
  return {
    sessionId: `s-${Math.floor(i / 10)}`,
    paradigmId,
    timestamp: 1000 + i,
    trialIndex: i % 10,
    params: { n: 2 },
    paramsHash: 'deadbeef',
    correct: i % 3 !== 0,
    accuracy: i % 3 !== 0 ? 1 : 0,
    latencyScore: 0.5,
    latencyNs: i % 3 !== 0 ? 250_000_000n * BigInt(i) : null,
    adjustedLatencyMs: i % 3 !== 0 ? 250 + i : null,
  };
}

describe('TrialRecordStore', () => {
  it('appends sessions and returns them newest-first', async () => {
    const store = new TrialRecordStore(new InMemoryStore());
    const trials = Array.from({ length: 10 }, (_, i) => fakeTrial(i));
    await store.appendSession(trials, {
      sessionId: 's-0', paradigmId: 'n_back', startedAt: 1,
      trialsCompleted: 10, accuracy: 0.7, rtMedianMs: 300, performance: 0.68,
    });
    await store.appendSession(trials, {
      sessionId: 's-1', paradigmId: 'stroop', startedAt: 2,
      trialsCompleted: 10, accuracy: 0.9, rtMedianMs: null, performance: 0.88,
    });
    const sessions = await store.recentSessions();
    expect(sessions[0]!.sessionId).toBe('s-1');
    expect(sessions).toHaveLength(2);
  });

  it('caps per-paradigm trial history (ring buffer)', async () => {
    const store = new TrialRecordStore(new InMemoryStore());
    for (let batch = 0; batch < 60; batch++) {
      const trials = Array.from({ length: 10 }, (_, i) => fakeTrial(batch * 10 + i));
      await store.appendSession(trials, {
        sessionId: `s-${batch}`, paradigmId: 'n_back', startedAt: batch,
        trialsCompleted: 10, accuracy: 0.6, rtMedianMs: 280, performance: 0.58,
      });
    }
    const kept = await store.trialsByParadigm('n_back');
    expect(kept.length).toBeLessThanOrEqual(MAX_TRIALS_PER_PARADIGM);
    // Newest survive the eviction.
    expect(kept[kept.length - 1]!.timestamp).toBeGreaterThan(kept[0]!.timestamp);
  });

  it('caps session summaries at MAX_SESSIONS', async () => {
    const store = new TrialRecordStore(new InMemoryStore());
    for (let s = 0; s < 130; s++) {
      await store.appendSession([], {
        sessionId: `s-${s}`, paradigmId: 'stroop', startedAt: s,
        trialsCompleted: 1, accuracy: 0.8, rtMedianMs: null, performance: 0.8,
      });
    }
    expect((await store.recentSessions(200)).length).toBeLessThanOrEqual(100);
  });

  it('domainSummaries aggregates per-paradigm stats', async () => {
    const store = new TrialRecordStore(new InMemoryStore());
    await store.appendSession([fakeTrial(0)], {
      sessionId: 'a', paradigmId: 'reaction_time', startedAt: 1,
      trialsCompleted: 10, accuracy: 0.8, rtMedianMs: 260, performance: 0.75,
    });
    await store.appendSession([fakeTrial(1)], {
      sessionId: 'b', paradigmId: 'reaction_time', startedAt: 2,
      trialsCompleted: 10, accuracy: 0.6, rtMedianMs: 340, performance: 0.55,
    });
    const summaries = await store.domainSummaries();
    const rt = summaries.get('reaction_time')!;
    expect(rt.trials).toBe(20);
    expect(rt.accuracy).toBeCloseTo(0.7, 5);
    expect(rt.rtMedianMs).toBeCloseTo(300, 5);
  });
});
