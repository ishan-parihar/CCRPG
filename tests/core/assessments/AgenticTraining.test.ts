import { describe, it, expect } from 'vitest';
import { handleTrainingTool, type TrainingServices, type TrainingHandlerContext, type GameRunnerPort } from '../../../src/core/assessments/trainingTools.js';
import { CalibrationStore } from '../../../src/core/adaptive/CalibrationStore.js';
import { TrialRecordStore } from '../../../src/core/braingame/TrialRecordStore.js';
import { CognitiveIndex } from '../../../src/core/training/CognitiveIndex.js';
import { FatigueMonitor, planWorkout } from '../../../src/core/training/WorkoutPlanner.js';
import type { KeyValueStore } from '../../../src/infra/persistence/KeyValueStore.js';
import type { TrialRecord } from '../../../src/core/braingame/types.js';
import { getParadigm } from '../../../src/core/braingame/registry.js';

class MemKV implements KeyValueStore {
  private m = new Map<string, string>();
  async get(k: string) { return this.m.get(k) ?? null; }
  async set(k: string, v: string) { this.m.set(k, v); }
  async remove(k: string) { this.m.delete(k); }
  async clear() { this.m.clear(); }
}

function makeServices(kv: KeyValueStore): TrainingServices {
  const calibration = new CalibrationStore(kv);
  const trials = new TrialRecordStore(kv);
  const index = new CognitiveIndex();
  return { calibration, trials, index, now: () => Date.now(), persistIndex: async () => { await kv.set('cogidx:v1', JSON.stringify(index.getState())); }, fatigue: new FatigueMonitor() };
}

describe('Agentic training integration', () => {
  it('run_brain_game persists telemetry, index and calibration via handler', async () => {
    const kv = new MemKV();
    const services = makeServices(kv);
    const paradigm = getParadigm('stroop')!;
    const fakeTrials: TrialRecord[] = [{ sessionId: 's1', paradigmId: 'stroop', timestamp: Date.now(), trialIndex: 0, params: {}, paramsHash: 'h', correct: true, accuracy: 1, latencyScore: 0.9, latencyNs: 300_000_000n, adjustedLatencyMs: 300 }];
    const runner: GameRunnerPort = {
      async runGame(paradigmId, _opts) {
        return {
          summary: {
            sessionId: 's1', paradigmId, label: paradigm.label, trialsCompleted: 1, aborted: false,
            accuracyTrend: [1], rtMedianMs: 300, paramsStart: {}, paramsEnd: { windowMs: 1400, colorCount: 4, conflictRatio: 0.8 }, overallAccuracy: 1, performance: 0.9, feltSenseHint: 'luminous clarity',
          } as any,
          trials: fakeTrials,
        };
      },
    };
    const ctx: TrainingHandlerContext = { services, runner, workout: { plan: null, completed: 0 } };
    const res = await handleTrainingTool('run_brain_game', JSON.stringify({ paradigmId: 'stroop' }), ctx);
    expect(res.ok).toBe(true);
    expect((res.payload as any).feltSenseHint).toBeTruthy();
    // Persisted
    const sessions = await services.trials.recentSessions(5);
    expect(sessions.length).toBe(1);
    expect(sessions[0]!.paradigmId).toBe('stroop');
    const snap = services.index.snapshot();
    expect(snap.find((s) => s.line === 'Cognitive')!.score01).toBeGreaterThan(0.5);
    const cal = await services.calibration.get('stroop');
    expect(cal).not.toBeNull();
  });

  it('recommend_workout + run sequence respects budget and completes workout', async () => {
    const kv = new MemKV();
    const services = makeServices(kv);
    const runner: GameRunnerPort = {
      async runGame(paradigmId, _opts) {
        const p = getParadigm(paradigmId)!;
        return {
          summary: { sessionId: `s-${paradigmId}`, paradigmId, label: p.label, trialsCompleted: 4, aborted: false, accuracyTrend: [0.7], rtMedianMs: 400, paramsStart: {}, paramsEnd: {}, overallAccuracy: 0.7, performance: 0.65, feltSenseHint: 'steady' } as any,
          trials: [] as any,
        };
      },
    };
    const plan = planWorkout(services.index, { minutes: 9 });
    expect(plan.items.length).toBeGreaterThanOrEqual(2);
    const ctx: TrainingHandlerContext = { services, runner, workout: { plan, completed: 0 } };
    for (const item of plan.items) {
      const r = await handleTrainingTool('run_brain_game', JSON.stringify({ paradigmId: item.paradigmId }), ctx);
      expect(r.ok).toBe(true);
    }
    const done = await handleTrainingTool('complete_workout', JSON.stringify({ summary: 'felt steady' }), ctx);
    expect(done.ok).toBe(true);
    expect((done.payload as any).gamesCompleted).toBe(plan.items.length);
  });

  it('Veil: payload never contains raw % or ms labels beyond controlled fields', async () => {
    const kv = new MemKV();
    const services = makeServices(kv);
    const paradigm = getParadigm('reaction_time')!;
    const runner: GameRunnerPort = {
      async runGame(paradigmId, _opts) {
        return {
          summary: { sessionId: 's2', paradigmId, label: paradigm.label, trialsCompleted: 4, aborted: false, accuracyTrend: [0.5], rtMedianMs: 520, paramsStart: {}, paramsEnd: {}, overallAccuracy: 0.5, performance: 0.5, feltSenseHint: 'attention finding its rhythm' } as any,
          trials: [] as any,
        };
      },
    };
    const ctx: TrainingHandlerContext = { services, runner, workout: { plan: null, completed: 0 } };
    const res = await handleTrainingTool('run_brain_game', JSON.stringify({ paradigmId: 'reaction_time' }), ctx);
    // Raw numbers are allowed in controlled fields (rtMedianMs, accuracyTrend), but feltSenseHint must be Veil-safe
    expect((res.payload as any).feltSenseHint).not.toMatch(/%/);
    expect((res.payload as any).feltSenseHint).not.toMatch(/ms/i);
  });
});
