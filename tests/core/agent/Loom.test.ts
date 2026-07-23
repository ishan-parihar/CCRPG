/**
 * Tests for the Loom rolling context window.
 *
 * Two invariants:
 *   1. Bounded: the window never exceeds the configured cap.
 *   2. Rolling: appending beyond the cap evicts the oldest entries.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Loom } from '../../../src/core/agent/Loom.js';
import { EventBus } from '../../../src/core/events/EventBus.js';
import type { GameEventMap } from '../../../src/core/events/GameEvents.js';

const MAX_GAME_EVENTS = 5;
const MAX_FREE_INPUTS = 3;

describe('Loom.gameEvents (bounded rolling window)', () => {
  let loom: Loom;
  beforeEach(() => {
    loom = new Loom();
  });

  it('keeps at most MAX_GAME_EVENTS entries', () => {
    const bus = new EventBus();
    for (let i = 0; i < MAX_GAME_EVENTS + 3; i++) {
      const payload: GameEventMap['session_started'] = { timestamp: i };
      loom.observeGameEvent('session_started', payload, i);
    }
    void bus;
    const events = loom.gameEvents$();
    expect(events.length).toBe(MAX_GAME_EVENTS);
    // Newest should be at index 0.
    expect(events[0]?.timestamp).toBe(MAX_GAME_EVENTS + 3 - 1);
  });

  it('stores a JSON-stable projection of the payload', () => {
    // Use cci_computed which carries a structured payload. Cast through
    // unknown to keep the test focused on Loom semantics rather than the
    // exhaustive CCI shape.
    loom.observeGameEvent('cci_computed', {
      score: { composite: 0.5 } as unknown as GameEventMap['cci_computed']['score'],
      timestamp: 42,
    });
    const ev = loom.gameEvents$()[0];
    expect(ev?.event).toBe('cci_computed');
    expect(ev?.projection['timestamp']).toBe(42);
  });
});

describe('Loom.freeInputs (bounded rolling window)', () => {
  let loom: Loom;
  beforeEach(() => {
    loom = new Loom();
  });

  it('keeps at most MAX_FREE_INPUTS entries', () => {
    for (let i = 0; i < MAX_FREE_INPUTS + 2; i++) {
      loom.observeFreeInput({
        timestamp: i,
        text: `t-${i}`,
        selectedPolarity: 'reflective',
      });
    }
    const inputs = loom.freeInputs$();
    expect(inputs.length).toBe(MAX_FREE_INPUTS);
    expect(inputs[0]?.text).toBe(`t-${MAX_FREE_INPUTS + 2 - 1}`);
  });
});
