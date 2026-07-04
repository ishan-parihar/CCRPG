import { describe, it, expect } from 'vitest';
import { routeModality } from '../../src/game/logic/encounterRouting.js';
import { SceneKeys } from '../../src/game/keys.js';
import type { Modality } from '../../src/core/domain/enums.js';
import { ALL_MODALITIES } from '../../src/core/domain/enums.js';

describe('routeModality', () => {
  it('routes Deterministic to EncounterScene', () => {
    expect(routeModality('Deterministic')).toBe(SceneKeys.Encounter);
  });

  it('routes Strategic to EncounterScene', () => {
    expect(routeModality('Strategic')).toBe(SceneKeys.Encounter);
  });

  it('routes Embodied to EncounterScene', () => {
    expect(routeModality('Embodied')).toBe(SceneKeys.Encounter);
  });

  it('routes ImmersiveRPG to EncounterScene', () => {
    expect(routeModality('ImmersiveRPG')).toBe(SceneKeys.Encounter);
  });

  it('routes LanguageReflective to ReflectionScene', () => {
    expect(routeModality('LanguageReflective')).toBe(SceneKeys.Reflection);
  });

  it('routes ScenarioChoice to DilemmaScene', () => {
    expect(routeModality('ScenarioChoice')).toBe(SceneKeys.Dilemma);
  });

  it('routes SocialCooperative to EncounterScene', () => {
    expect(routeModality('SocialCooperative')).toBe(SceneKeys.Encounter);
  });

  it('returns a valid scene key for every modality', () => {
    const validSceneKeys = new Set<string>(Object.values(SceneKeys));
    for (const modality of ALL_MODALITIES) {
      const result = routeModality(modality);
      expect(validSceneKeys.has(result)).toBe(true);
    }
  });

  it('routes all assessment modalities to Encounter', () => {
    const assessmentModalities: Modality[] = ['Deterministic', 'Strategic', 'Embodied', 'ImmersiveRPG'];
    for (const m of assessmentModalities) {
      expect(routeModality(m)).toBe(SceneKeys.Encounter);
    }
  });
});
