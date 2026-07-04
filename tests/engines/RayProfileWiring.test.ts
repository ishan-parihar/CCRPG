/**
 * Tests for GAP-D2-1: Energy-Ray-Center Profile wiring (rayProfile).
 * Per HoloOS 08.8.22 — the rayProfile is a 7-element vector of activation
 * levels that should be UPDATED by ConsequenceEngine and READ by
 * TransformationDetector.
 */
import { describe, it, expect } from 'vitest';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { applyConsequences, processOutcome, type PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';
import { createInitialWorldState } from '../../src/core/engines/CandidateGeneration.js';
import { STAGE_RAY_MAP, RAY_COMPLEX, raysForComplex } from '../../src/core/domain/Ray.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeEncounter(line: Line, stage: Stage): ScheduledEncounter {
  return {
    id: `test-${line}:${stage}`,
    moduleRef: `${line}:${stage}`,
    modality: 'Deterministic',
    targetLines: [line],
    stage,
    holonSource: `${line}:${stage}`,
    shadowTarget: null,
    polarityMode: 'Exploring',
    difficulty: 0.5,
    sessionPosition: 'peak',
    priority: 0.5,
    driveTarget: null,
    executionMode: 'capacity',
  };
}

function makeResponse(): PlayerResponse {
  return {
    encounterId: 'test',
    energeticDirection: 'Radiative',
    driveDirectionality: {
      Agency: 'HealthyBalanced',
      Communion: 'HealthyBalanced',
      Eros: 'HealthyBalanced',
      Agape: 'HealthyBalanced',
    },
    stageOrientation: 'Homeostatic',
    sourceOfNourishment: 'LowerRealm',
    shadowSurfaced: null,
    shadowResolvedId: null,
    narrativeSummary: 'A normal response.',
  };
}

describe('GAP-D2-1: Energy-Ray-Center Profile (rayProfile)', () => {
  it('rayProfile starts at all-zeros for a fresh Significator', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    for (const ray of Object.keys(sig.rayProfile)) {
      expect(sig.rayProfile[ray as keyof typeof sig.rayProfile]).toBe(0);
    }
  });

  it('applyConsequences activates the encounter\'s ray-center', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const encounter = makeEncounter('Cognitive', 'Red');
    const response = makeResponse();
    const record = processOutcome(encounter, response, Date.now());
    const { sig: newSig } = applyConsequences(sig, world, record, encounter);

    // Red stage maps to Yellow ray (density-coordinate)
    const expectedRay = STAGE_RAY_MAP['Red'];
    expect(newSig.rayProfile[expectedRay]).toBeGreaterThan(0);
  });

  it('applyConsequences decays non-encounter ray-centers slightly', () => {
    // Start with a non-zero rayProfile
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const sigWithProfile = {
      ...sig,
      rayProfile: { ...sig.rayProfile, Red: 0.5, Orange: 0.3 } as typeof sig.rayProfile,
    };
    const world = createInitialWorldState([]);
    const encounter = makeEncounter('Cognitive', 'Red'); // Red stage → Yellow ray
    const response = makeResponse();
    const record = processOutcome(encounter, response, Date.now());
    const { sig: newSig } = applyConsequences(sigWithProfile, world, record, encounter);

    // Yellow (the encounter's ray) should increase
    expect(newSig.rayProfile.Yellow).toBeGreaterThan(sigWithProfile.rayProfile.Yellow);
    // Red and Orange (non-encounter rays) should decrease
    expect(newSig.rayProfile.Red).toBeLessThan(sigWithProfile.rayProfile.Red);
    expect(newSig.rayProfile.Orange).toBeLessThan(sigWithProfile.rayProfile.Orange);
  });

  it('rayProfile activations are clamped to [0, 1]', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const encounter = makeEncounter('Cognitive', 'Red');
    const response = makeResponse();

    // Apply many encounters to push activation high
    let currentSig = sig;
    for (let i = 0; i < 20; i++) {
      const record = processOutcome(encounter, response, Date.now() + i);
      const result = applyConsequences(currentSig, world, record, encounter);
      currentSig = result.sig;
    }

    for (const ray of Object.keys(currentSig.rayProfile)) {
      const val = currentSig.rayProfile[ray as keyof typeof currentSig.rayProfile];
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

describe('GAP-D2-1: RAY_COMPLEX mapping (per 08.8.22)', () => {
  it('maps Red/Orange/Yellow to Body', () => {
    expect(RAY_COMPLEX.Red).toBe('Body');
    expect(RAY_COMPLEX.Orange).toBe('Body');
    expect(RAY_COMPLEX.Yellow).toBe('Body');
  });

  it('maps Green/Blue to Mind', () => {
    expect(RAY_COMPLEX.Green).toBe('Mind');
    expect(RAY_COMPLEX.Blue).toBe('Mind');
  });

  it('maps Indigo/Violet to Spirit', () => {
    expect(RAY_COMPLEX.Indigo).toBe('Spirit');
    expect(RAY_COMPLEX.Violet).toBe('Spirit');
  });

  it('raysForComplex returns correct rays for each Complex', () => {
    expect(raysForComplex('Body')).toEqual(['Red', 'Orange', 'Yellow']);
    expect(raysForComplex('Mind')).toEqual(['Green', 'Blue']);
    expect(raysForComplex('Spirit')).toEqual(['Indigo', 'Violet']);
  });
});
