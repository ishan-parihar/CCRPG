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
    narrativeBeats: [],
    activeBeatId: null,
    completedBeatIds: [],
    factions: [],
    npcRelationships: [],
    pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
    activeMacroEvents: [],
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
    const emptyWorld: WorldState = { holons: [], recentEncounterIds: [], cooldowns: {}, narrativeBeats: [], activeBeatId: null, completedBeatIds: [], factions: [], npcRelationships: [], pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 }, activeMacroEvents: [] };
    const result = scheduleNext(sig, emptyWorld, session, Date.now(), 3);
    expect(result).toHaveLength(0);
  });

  it('filters out holons above player perception', () => {
    const highWorld: WorldState = {
      holons: [makeHolon('h-high', 'Cognitive', 'Orange')], // 2 stages above Red
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

  it('allows scheduling forced line and stage even if above player perception/altitude', () => {
    const highWorld: WorldState = {
      holons: [
        makeHolon('h-high', 'Cognitive', 'Orange'), // 2 stages above Red
        makeHolon('h-other', 'Emotional', 'Orange'),
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
    const forcedSession: SessionContext = {
      ...session,
      forceLine: 'Cognitive',
      forceStage: 'Orange',
    };
    const result = scheduleNext(sig, highWorld, forcedSession, Date.now(), 3);
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.targetLines).toContain('Cognitive');
      expect(item.stage).toBe('Orange');
      expect(item.holonSource).toBe('h-high');
    }
  });

  it('overrides eligible modalities when forceModality is provided', () => {
    const customWorld: WorldState = {
      holons: [
        {
          ...makeHolon('h-mod', 'Cognitive', 'Red'),
          modality: 'Deterministic',
        }
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
    const forcedSession: SessionContext = {
      ...session,
      forceModality: 'LanguageReflective',
    };
    const result = scheduleNext(sig, customWorld, forcedSession, Date.now(), 3);
    expect(result.length).toBe(1);
    expect(result[0].modality).toBe('LanguageReflective');
  });

  it('bypasses cooldowns and recency checks when any forcing is active', () => {
    const now = Date.now();
    const cooldownWorld: WorldState = {
      holons: [
        makeHolon('h-cooldown', 'Cognitive', 'Red'),
      ],
      recentEncounterIds: [],
      cooldowns: {
        'Cognitive:Red': now + 100000,
      },
      recentEncounters: [
        { line: 'Cognitive', stage: 'Red', modality: 'Deterministic' },
      ],
      narrativeBeats: [],
      activeBeatId: null,
      completedBeatIds: [],
      factions: [],
      npcRelationships: [],
      pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      activeMacroEvents: [],
    };

    const normalResult = scheduleNext(sig, cooldownWorld, session, now, 3);
    expect(normalResult).toHaveLength(0);

    const forcedSession: SessionContext = {
      ...session,
      forceLine: 'Cognitive',
    };
    const forcedResult = scheduleNext(sig, cooldownWorld, forcedSession, now, 3);
    expect(forcedResult.length).toBeGreaterThan(0);
  });

  it('recency check matches the most recent (last) elements rather than oldest (first) elements', () => {
    const now = Date.now();
    const testWorld: WorldState = {
      holons: [
        makeHolon('h1', 'Cognitive', 'Red'),
      ],
      recentEncounterIds: [],
      cooldowns: {},
      recentEncounters: [
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' }, // index 0 (oldest)
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' }, // index 1
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' }, // index 2
        { line: 'Cognitive', stage: 'Red', modality: 'Deterministic' }, // index 3 (most recent)
      ],
      narrativeBeats: [],
      activeBeatId: null,
      completedBeatIds: [],
      factions: [],
      npcRelationships: [],
      pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      activeMacroEvents: [],
    };

    const result = scheduleNext(sig, testWorld, session, now, 3);
    const hasCognitive = result.some(r => r.targetLines.includes('Cognitive'));
    expect(hasCognitive).toBe(false);
  });

  it('recency check of last 2 module elements matches the end of the array', () => {
    const now = Date.now();
    const testWorld: WorldState = {
      holons: [
        makeHolon('h1', 'Cognitive', 'Red'),
      ],
      recentEncounterIds: [],
      cooldowns: {},
      recentEncounters: [
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' },
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' },
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' },
        { line: 'Cognitive', stage: 'Red', modality: 'Strategic' },
      ],
      narrativeBeats: [],
      activeBeatId: null,
      completedBeatIds: [],
      factions: [],
      npcRelationships: [],
      pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      activeMacroEvents: [],
    };

    const result = scheduleNext(sig, testWorld, session, now, 3);
    const hasCognitive = result.some(r => r.targetLines.includes('Cognitive'));
    expect(hasCognitive).toBe(false);
  });

  it('modality rotation constraint filters out a modality if it was used consecutively in the last two encounters', () => {
    const now = Date.now();
    const testWorld: WorldState = {
      holons: [
        {
          ...makeHolon('h1', 'Cognitive', 'Red'),
          modality: 'Deterministic',
        }
      ],
      recentEncounterIds: [],
      cooldowns: {},
      recentEncounters: [
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' },
        { line: 'Moral', stage: 'Red', modality: 'Deterministic' },
      ],
      narrativeBeats: [],
      activeBeatId: null,
      completedBeatIds: [],
      factions: [],
      npcRelationships: [],
      pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      activeMacroEvents: [],
    };

    const result = scheduleNext(sig, testWorld, session, now, 3);
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.modality).not.toBe('Deterministic');
    }
  });

  it('modality rotation constraint is bypassed when any forcing is active', () => {
    const now = Date.now();
    const testWorld: WorldState = {
      holons: [
        {
          ...makeHolon('h1', 'Cognitive', 'Red'),
          modality: 'Deterministic',
        }
      ],
      recentEncounterIds: [],
      cooldowns: {},
      recentEncounters: [
        { line: 'Emotional', stage: 'Red', modality: 'Deterministic' },
        { line: 'Moral', stage: 'Red', modality: 'Deterministic' },
      ],
      narrativeBeats: [],
      activeBeatId: null,
      completedBeatIds: [],
      factions: [],
      npcRelationships: [],
      pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      activeMacroEvents: [],
    };

    const forcedSession: SessionContext = {
      ...session,
      forceModality: 'Deterministic',
    };

    const result = scheduleNext(sig, testWorld, forcedSession, now, 3);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].modality).toBe('Deterministic');
  });

  it('applies a deterministic tie-breaker so candidates at session start do not return the exact same priority', () => {
    const customWorld: WorldState = {
      holons: [
        { ...makeHolon('h-cog', 'Cognitive', 'Red'), modality: 'ImmersiveRPG' },
        { ...makeHolon('h-emo', 'Emotional', 'Red'), modality: 'ImmersiveRPG' },
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

    const result = scheduleNext(sig, customWorld, session, Date.now(), 2);
    expect(result).toHaveLength(2);
    const p1 = result[0].priority;
    const p2 = result[1].priority;
    expect(p1).not.toBe(p2);
    expect(Math.abs(p1 - p2)).toBeLessThan(0.01);
  });
});
