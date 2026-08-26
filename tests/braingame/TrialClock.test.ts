import { describe, it, expect } from 'vitest';
import { TrialClock } from '../../src/core/braingame/TrialClock.js';
import {
  adapt,
  initAdaptiveState,
  levelForParadigm,
  createTrialAdjuster,
} from '../../src/core/adaptive/AdaptiveDifficultyService.js';
import { NBackParadigm } from '../../src/core/braingame/paradigms/nback.js';
import { CalibrationStore } from '../../src/core/adaptive/CalibrationStore.js';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import { FileKeyValueStore } from '../../src/infra/persistence/FileKeyValueStore.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('TrialClock', () => {
  it('computes ms between ns samples', () => {
    const start = 1_000_000_000n;
    const end = 1_250_000_000n;
    expect(TrialClock.msBetween(start, end)).toBeCloseTo(250, 5);
  });

  it('adjusts latency by calibration offset with a human floor', () => {
    const clock = new TrialClock(() => 0n);
    clock.calibrationOffsetMs = 40;
    expect(clock.adjustedMs(200_000_000n)).toBeCloseTo(160, 5);
    expect(clock.adjustedMs(10_000_000n)).toBeGreaterThanOrEqual(5);
    expect(clock.adjustedMs(null)).toBeNull();
  });

  it('falls back gracefully without process.hrtime', () => {
    const clock = new TrialClock(() => BigInt(Date.now()) * 1_000_000n);
    expect(typeof clock.ns()).toBe('bigint');
  });
});

describe('adapt() — weighted up-down staircase', () => {
  it('steps up only after k consecutive correct', () => {
    let s = initAdaptiveState(0.5);
    s = adapt(s, true);
    expect(s.level).toBe(0.5); // streak 1 — no change
    s = adapt(s, true);
    expect(s.level).toBeCloseTo(0.55, 6); // streak 2 — step up
  });

  it('steps down after repeated failure and force-eases at 3', () => {
    let s = initAdaptiveState(0.5);
    s = adapt(s, false);
    expect(s.level).toBe(0.5); // failStreak 1 — no change
    s = adapt(s, false);
    expect(s.level).toBeCloseTo(0.41, 6); // normal ease
    s = adapt(s, false);
    expect(s.level).toBeCloseTo(0.25, 6); // forced ease (bigger step)
    expect(s.failStreak).toBe(0); // guardrail resets the counter
  });

  it('counts reversals on direction change', () => {
    let s = initAdaptiveState(0.5);
    s = adapt(s, true);
    s = adapt(s, true); // up
    expect(s.lastDirection).toBe('up');
    s = adapt(s, false);
    s = adapt(s, false); // down → reversal
    expect(s.reversals).toBe(1);
  });

  it('composite strategy blocks escalation on correct-but-slow trials', () => {
    let weighted = initAdaptiveState(0.5);
    let composite = initAdaptiveState(0.5);
    // Correct but sluggish (latencyScore 0.3 < escalate threshold).
    for (let i = 0; i < 4; i++) {
      weighted = adapt(weighted, true, undefined, 0.3, 'weighted_up_down');
      composite = adapt(composite, true, undefined, 0.3, 'composite_accuracy_rt');
    }
    expect(weighted.level).toBeGreaterThan(0.5);
    expect(composite.level).toBeCloseTo(0.5, 6);
  });

  it('composite escalates on fast-correct trials like weighted', () => {
    let s = initAdaptiveState(0.5);
    s = adapt(s, true, undefined, 0.9, 'composite_accuracy_rt');
    s = adapt(s, true, undefined, 0.9, 'composite_accuracy_rt');
    expect(s.level).toBeCloseTo(0.55, 6);
  });
});

describe('levelForParadigm / createTrialAdjuster', () => {
  it('maps adaptive state onto the paradigm parameter space', () => {
    const params = levelForParadigm(NBackParadigm, initAdaptiveState(0));
    expect(params.n).toBe(NBackParadigm.paramSpace.n!.min);
    const hi = levelForParadigm(NBackParadigm, initAdaptiveState(1));
    expect(hi.n).toBe(NBackParadigm.paramSpace.n!.max);
  });

  it('adjuster feeds next-trial params from evolving state', () => {
    const { adjust, state } = createTrialAdjuster(NBackParadigm, initAdaptiveState(0.5));
    let params = NBackParadigm.paramSpace && levelForParadigm(NBackParadigm, initAdaptiveState(0.5));
    params = adjust(params, true);
    params = adjust(params, true);
    expect(state().level).toBeGreaterThan(0.5);
    expect(params.n).toBeDefined();
  });
});

describe('CalibrationStore', () => {
  it('round-trips records through the KV port', async () => {
    const store = new CalibrationStore(new InMemoryStore());
    expect(await store.get('n_back')).toBeNull();
    await store.put({
      paradigmId: 'n_back',
      baselineLevel: 0.42,
      lastLevel: 0.47,
      calibratedAt: 100,
      lastPlayedAt: 200,
      sessionsPlayed: 3,
    });
    const rec = await store.get('n_back');
    expect(rec?.baselineLevel).toBe(0.42);
    expect((await store.all()).length).toBe(1);
  });

  it('treats corrupt records as absent (recalibrate rather than crash)', async () => {
    const kv = new InMemoryStore();
    await kv.set('calib:v1:n_back', '{not json');
    const store = new CalibrationStore(kv);
    expect(await store.get('n_back')).toBeNull();
  });
});

describe('FileKeyValueStore', () => {
  it('persists values atomically in a temp dir', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mysterium-kv-'));
    try {
      const kv = new FileKeyValueStore(dir);
      await kv.set('calib:v1:test', '{"ok":true}');
      expect(await kv.get('calib:v1:test')).toBe('{"ok":true}');
      expect(fs.readdirSync(dir).some((f) => f.includes('.tmp'))).toBe(false);

      await kv.remove('calib:v1:test');
      expect(await kv.get('calib:v1:test')).toBeNull();

      await expect(kv.set('../evil', 'x')).rejects.toThrow(/Unsafe KV key/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
