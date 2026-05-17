import { describe, it, expect } from 'vitest';
import { Battler, ATB_MAX } from '../src/core/domain/Battler.js';
import { ATBEngine } from '../src/core/usecases/ATBEngine.js';
import { DEFAULT_STATS } from '../src/core/domain/Stats.js';

function makeBattler(id: string, agility: number): Battler {
  return new Battler({
    id,
    name: id,
    side: 'player',
    stats: { ...DEFAULT_STATS, agility },
  });
}

describe('ATBEngine.fillRate', () => {
  it('is linear up to agility 100', () => {
    expect(ATBEngine.fillRate(0, 500)).toBeCloseTo(500);
    expect(ATBEngine.fillRate(100, 500)).toBeCloseTo(1000);
  });

  it('applies diminishing returns above 100', () => {
    const at100 = ATBEngine.fillRate(100, 500);
    const at200 = ATBEngine.fillRate(200, 500);
    const at255 = ATBEngine.fillRate(255, 500);
    // Monotonic increase.
    expect(at200).toBeGreaterThan(at100);
    expect(at255).toBeGreaterThan(at200);
    // Bounded — must asymptote, not blow up.
    expect(at255).toBeLessThan(at100 * 4);
    // Diminishing: 200→255 adds less than 100→200.
    expect(at255 - at200).toBeLessThan(at200 - at100);
  });

  it('matches the blueprint calibration at agility 255', () => {
    // Blueprint target: ~0.5s to fill 1000 ATB, i.e. ~2000/s.
    const at255 = ATBEngine.fillRate(255, 500);
    expect(at255).toBeGreaterThan(1700);
    expect(at255).toBeLessThan(2000);
  });
});

describe('ATBEngine.tick', () => {
  it('queues a battler when ATB hits max', () => {
    const fast = makeBattler('hero', 100);
    const slow = makeBattler('boss', 0);
    const engine = new ATBEngine([fast, slow], 333);

    // Tick 2 seconds: fast gets ~666*2=1332 → caps at 1000 and queues.
    engine.tick(2000);
    expect(engine.peekTurn()).toBe('hero');
    expect(fast.atb).toBe(ATB_MAX);
  });

  it('clears ATB when a turn is consumed', () => {
    const b = makeBattler('hero', 200);
    const engine = new ATBEngine([b], 333);
    engine.tick(5000);
    const id = engine.consumeTurn();
    expect(id).toBe('hero');
    expect(b.atb).toBe(0);
    expect(engine.peekTurn()).toBeNull();
  });

  it('does not advance when paused', () => {
    const b = makeBattler('hero', 100);
    const engine = new ATBEngine([b], 333);
    engine.pause();
    engine.tick(2000);
    expect(b.atb).toBe(0);
    engine.resume();
    engine.tick(2000);
    expect(b.atb).toBe(ATB_MAX);
  });

  it('skips dead battlers', () => {
    const b = makeBattler('ghost', 100);
    b.takeDamage(9999);
    const engine = new ATBEngine([b], 333);
    engine.tick(5000);
    expect(engine.peekTurn()).toBeNull();
  });
});
