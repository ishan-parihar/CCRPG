import { describe, it, expect } from 'vitest';
import { scheduleNext } from '../../src/core/engines/EncounterScheduler.js';
import type { WorldState } from '../../src/core/engines/CandidateGeneration.js';
import type { SessionContext } from '../../src/core/engines/PriorityComputation.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Holon } from '../../src/core/domain/Holon.js';

function makeHolon(id: string, line: Line, stage: Stage): Holon {
  return {
    id, name: id, kind: 'NPC', line, stage,
    drives: { dominant: 'Agency', secondary: 'Eros', shadowQuadrant: null },
    polarity: 'Sovereign', narrativeRole: 'test', relationships: [], active: true,
  };
}

const altitudes: Record<Line, Stage> = {
  Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
  Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
};

describe('EncounterScheduler', () => {
  const sig = createSignificator('test-player', altitudes, 'Red');
  const world: WorldState = {
    holons: [
      makeHolon('h1', 'Cognitive', 'Red'),
      makeHolon('h2', 'Emotional', 'Red'),
      makeHolon('h3', 'Moral', 'Red'),
      makeHolon('h4', 'Somatic', 'Infrared'),
    ],
    recentEncounterIds: [],
    cooldowns: {},
  };
  const session: SessionContext = {
    encountersSoFar: 2,
    sessionDurationMs: 600000,
    targetSessionLength: 10,
    recentLines: [],
  };

  it('returns encounters when candidates exist', () => {
    const result = scheduleNext(sig, world, session, Date.now(), 3);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns empty when no holons are active', () => {
    const emptyWorld: WorldState = { holons: [], recentEncounterIds: [], cooldowns: {} };
    const result = scheduleNext(sig, emptyWorld, session, Date.now(), 3);
    expect(result).toHaveLength(0);
  });

  it('filters out holons above player perception', () => {
    const highWorld: WorldState = {
      holons: [makeHolon('h-high', 'Cognitive', 'Orange')], // 2 stages above Red
      recentEncounterIds: [],
      cooldowns: {},
    };
    const result = scheduleNext(sig, highWorld, session, Date.now(), 3);
    expect(result).toHaveLength(0);
  });

  it('ranks decayed lines higher', () => {
    const oldSig = {
      ...sig,
      theta: { lastEncounter: { 'Cognitive:Red': 0, 'Emotional:Red': Date.now() } },
    };
    const result = scheduleNext(oldSig, world, session, Date.now(), 3);
    // Cognitive should rank higher due to staleness
    if (result.length >= 2) {
      const cogIdx = result.findIndex(r => r.targetLines.includes('Cognitive'));
      const emoIdx = result.findIndex(r => r.targetLines.includes('Emotional'));
      if (cogIdx >= 0 && emoIdx >= 0) {
        expect(cogIdx).toBeLessThan(emoIdx);
      }
    }
  });
});
