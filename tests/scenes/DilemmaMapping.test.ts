import { describe, it, expect } from 'vitest';
import { mapChoiceToResponse } from '../../src/game/logic/dilemmaMapping.js';
import { ALL_ENERGETIC_DIRECTIONS, ALL_STAGE_ORIENTATIONS, ALL_SOURCES_OF_NOURISHMENT, ALL_DRIVE_DIRECTIONALITIES } from '../../src/core/domain/enums.js';
import { ALL_DRIVES } from '../../src/core/domain/Drive.js';

describe('DilemmaScene mapChoiceToResponse', () => {
  it('returns a valid PlayerResponse for "attack" choice', () => {
    const response = mapChoiceToResponse('attack', 'enc-001');
    expect(response.encounterId).toBe('enc-001');
    expect(response.energeticDirection).toBe('Radiative');
    expect(response.stageOrientation).toBe('ReachingHigher');
    expect(response.sourceOfNourishment).toBe('LowerRealm');
  });

  it('returns a valid PlayerResponse for "defend" choice', () => {
    const response = mapChoiceToResponse('defend', 'enc-002');
    expect(response.encounterId).toBe('enc-002');
    expect(response.energeticDirection).toBe('Absorptive');
    expect(response.stageOrientation).toBe('Homeostatic');
  });

  it('returns a valid PlayerResponse for "negotiate" choice', () => {
    const response = mapChoiceToResponse('negotiate', 'enc-003');
    expect(response.energeticDirection).toBe('Sovereign');
    expect(response.stageOrientation).toBe('IntegratingLower');
    expect(response.sourceOfNourishment).toBe('HigherRealm');
  });

  it('returns a valid PlayerResponse for "trust" choice', () => {
    const response = mapChoiceToResponse('trust', 'enc-004');
    expect(response.energeticDirection).toBe('Radiative');
    expect(response.sourceOfNourishment).toBe('HigherRealm');
  });

  it('returns a valid PlayerResponse for "betray" choice', () => {
    const response = mapChoiceToResponse('betray', 'enc-005');
    expect(response.energeticDirection).toBe('Diffuse');
    expect(response.stageOrientation).toBe('Regressive');
    expect(response.driveDirectionality.Communion).toBe('DarkAverted');
  });

  it('returns a valid PlayerResponse for unknown choice (default)', () => {
    const response = mapChoiceToResponse('unknown_choice', 'enc-006');
    expect(response.encounterId).toBe('enc-006');
    expect(response.energeticDirection).toBe('Sovereign');
    expect(response.stageOrientation).toBe('Homeostatic');
    expect(response.sourceOfNourishment).toBe('Ambivalent');
  });

  it('always produces valid energeticDirection values', () => {
    const choices = ['attack', 'defend', 'negotiate', 'trust', 'verify', 'betray', 'expand', 'fortify', 'raid'];
    for (const choice of choices) {
      const response = mapChoiceToResponse(choice, 'test');
      expect(ALL_ENERGETIC_DIRECTIONS).toContain(response.energeticDirection);
    }
  });

  it('always produces valid stageOrientation values', () => {
    const choices = ['attack', 'defend', 'negotiate', 'trust', 'verify', 'betray', 'expand', 'fortify', 'raid'];
    for (const choice of choices) {
      const response = mapChoiceToResponse(choice, 'test');
      expect(ALL_STAGE_ORIENTATIONS).toContain(response.stageOrientation);
    }
  });

  it('always produces valid sourceOfNourishment values', () => {
    const choices = ['attack', 'defend', 'negotiate', 'trust', 'verify', 'betray', 'expand', 'fortify', 'raid'];
    for (const choice of choices) {
      const response = mapChoiceToResponse(choice, 'test');
      expect(ALL_SOURCES_OF_NOURISHMENT).toContain(response.sourceOfNourishment);
    }
  });

  it('always produces valid driveDirectionality for all 4 drives', () => {
    const choices = ['attack', 'defend', 'negotiate', 'trust', 'verify', 'betray'];
    for (const choice of choices) {
      const response = mapChoiceToResponse(choice, 'test');
      for (const drive of ALL_DRIVES) {
        expect(ALL_DRIVE_DIRECTIONALITIES).toContain(response.driveDirectionality[drive]);
      }
    }
  });

  it('includes narrativeSummary with choice ID', () => {
    const response = mapChoiceToResponse('attack', 'enc-test');
    expect(response.narrativeSummary).toContain('attack');
  });

  it('sets shadowSurfaced to null by default', () => {
    const response = mapChoiceToResponse('attack', 'enc-test');
    expect(response.shadowSurfaced).toBeNull();
  });

  it('sets shadowResolvedId to null by default', () => {
    const response = mapChoiceToResponse('attack', 'enc-test');
    expect(response.shadowResolvedId).toBeNull();
  });
});
