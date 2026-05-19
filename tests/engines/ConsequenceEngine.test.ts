import { describe, it, expect } from 'vitest';
import { processOutcome, applyConsequences, type PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { WorldState } from '../../src/core/engines/CandidateGeneration.js';

const altitudes: Record<Line, Stage> = {
  Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
  Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
};

const mockEncounter: ScheduledEncounter = {
  id: 'Cognitive/Red:h1:1000',
  moduleRef: 'Cognitive/Red',
  modality: 'ImmersiveRPG',
  targetLines: ['Cognitive'],
  stage: 'Red',
  holonSource: 'h1',
  shadowTarget: null,
  polarityMode: 'Exploring',
  difficulty: 0.5,
  sessionPosition: 'peak',
  priority: 0.8,
  driveTarget: null,
};

const mockResponse: PlayerResponse = {
  encounterId: 'Cognitive/Red:h1:1000',
  energeticDirection: 'Radiative',
  driveDirectionality: { Agency: 'HealthyBalanced', Communion: 'HealthyBalanced', Eros: 'HealthyBalanced', Agape: 'HealthyBalanced' },
  stageOrientation: 'ReachingHigher',
  sourceOfNourishment: 'HigherRealm',
  shadowSurfaced: null,
  shadowResolvedId: null,
  narrativeSummary: 'Player chose to help the stranger.',
};

describe('ConsequenceEngine', () => {
  describe('processOutcome', () => {
    it('produces a valid ConsequenceRecord', () => {
      const record = processOutcome(mockEncounter, mockResponse, 1000);
      expect(record.encounterId).toBe(mockEncounter.id);
      expect(record.polarityTrace.energeticDirection).toBe('Radiative');
      expect(record.timestamp).toBe(1000);
    });

    it('records shadow surfacing', () => {
      const resp = { ...mockResponse, shadowSurfaced: 'DarkAddiction' as const };
      const record = processOutcome(mockEncounter, resp, 1000);
      expect(record.shadowSurfaced).toBe('DarkAddiction');
    });
  });

  describe('applyConsequences', () => {
    it('increments totalEncounters', () => {
      const sig = createSignificator('p1', altitudes, 'Red');
      const world: WorldState = { holons: [], recentEncounterIds: [], cooldowns: {} };
      const record = processOutcome(mockEncounter, mockResponse, 1000);
      const result = applyConsequences(sig, world, record);
      expect(result.sig.totalEncounters).toBe(1);
    });

    it('updates theta timestamps', () => {
      const sig = createSignificator('p1', altitudes, 'Red');
      const world: WorldState = { holons: [], recentEncounterIds: [], cooldowns: {} };
      const record = processOutcome(mockEncounter, mockResponse, 5000);
      const result = applyConsequences(sig, world, record);
      expect(result.sig.theta.lastEncounter['Cognitive:Red']).toBe(5000);
    });

    it('adds shadow entry when shadow surfaced', () => {
      const sig = createSignificator('p1', altitudes, 'Red');
      const world: WorldState = { holons: [], recentEncounterIds: [], cooldowns: {} };
      const resp = { ...mockResponse, shadowSurfaced: 'GoldenAllergy' as const };
      const record = processOutcome(mockEncounter, resp, 1000);
      const result = applyConsequences(sig, world, record);
      expect(result.sig.shadows.activeCount).toBe(1);
    });
  });
});
