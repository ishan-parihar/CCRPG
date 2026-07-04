import { describe, it, expect } from 'vitest';
import { tick } from '../../src/core/GameLoop.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Holon } from '../../src/core/domain/Holon.js';
import type { WorldState } from '../../src/core/engines/CandidateGeneration.js';
import type { SessionContext } from '../../src/core/engines/PriorityComputation.js';
import type { PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';

const altitudes: Record<Line, Stage> = {
  Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
  Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
};

function makeHolon(id: string, line: Line, stage: Stage): Holon {
  return {
    id, name: id, kind: 'NPC', line, stage,
    drives: { dominant: 'Agency', secondary: 'Eros', shadowQuadrant: null },
    polarity: 'Sovereign', narrativeRole: 'test', relationships: [], active: true,
  };
}

const world: WorldState = {
  holons: [
    makeHolon('h1', 'Cognitive', 'Red'),
    makeHolon('h2', 'Emotional', 'Red'),
    makeHolon('h3', 'Moral', 'Red'),
    makeHolon('h4', 'Somatic', 'Red'),
    makeHolon('h5', 'Willpower', 'Red'),
    makeHolon('h6', 'Interpersonal', 'Red'),
    makeHolon('h7', 'Intrapersonal', 'Red'),
    makeHolon('h8', 'Spiritual', 'Red'),
  ],
  recentEncounterIds: [],
  cooldowns: {},
  narrativeBeats: [],
  activeBeatId: null,
  completedBeatIds: [],
  factions: [],
  npcRelationships: [],
  pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
  activeMacroEvents: [],
};

const session: SessionContext = {
  encountersSoFar: 0,
  sessionDurationMs: 0,
  targetSessionLength: 10,
  recentLines: [],
};

function makeResponse(encounterId: string): PlayerResponse {
  return {
    encounterId,
    energeticDirection: 'Radiative',
    driveDirectionality: { Agency: 'HealthyBalanced', Communion: 'HealthyBalanced', Eros: 'HealthyBalanced', Agape: 'HealthyBalanced' },
    stageOrientation: 'ReachingHigher',
    sourceOfNourishment: 'HigherRealm',
    shadowSurfaced: null,
    shadowResolvedId: null,
    narrativeSummary: 'Test response.',
  };
}

describe('GameLoop', () => {
  it('produces an encounter on first tick', () => {
    const result = tick(createSignificator('p1', altitudes, 'Red'), world, session, null, null, Date.now());
    expect(result.encounter).not.toBeNull();
  });

  it('runs 20 ticks without crashing', () => {
    let sig = createSignificator('p1', altitudes, 'Red');
    let w = world;
    let now = Date.now();

    for (let i = 0; i < 20; i++) {
      const result = tick(sig, w, { ...session, encountersSoFar: i }, null, null, now);
      if (result.encounter) {
        const resp = makeResponse(result.encounter.id);
        const withConsequences = tick(result.sig, result.world, { ...session, encountersSoFar: i }, resp, result.encounter, now);
        sig = withConsequences.sig;
        w = withConsequences.world;
      } else {
        sig = result.sig;
        w = result.world;
      }
      now += 60000; // advance 1 minute per tick
    }

    expect(sig.totalEncounters).toBeGreaterThan(0);
  });

  it('detects bleed-through for stale cells', () => {
    const staleSig = {
      ...createSignificator('p1', altitudes, 'Red'),
      theta: { lastEncounter: { 'Cognitive:Red': 0 } },
    };
    const now = 30 * 24 * 60 * 60 * 1000; // 30 days later
    const result = tick(staleSig, world, session, null, null, now);
    expect(result.bleedThrough.length).toBeGreaterThan(0);
    expect(result.bleedThrough).toContain('Cognitive:Red');
  });
});
