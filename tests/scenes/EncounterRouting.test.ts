import { describe, it, expect } from 'vitest';
import { routeModality } from '../../src/game/logic/encounterRouting.js';
import { SceneKeys } from '../../src/game/keys.js';
import type { Modality } from '../../src/core/domain/enums.js';
import { ALL_MODALITIES } from '../../src/core/domain/enums.js';

describe('routeModality', () => {
  it('routes Deterministic to BattleScene', () => {
    expect(routeModality('Deterministic')).toBe(SceneKeys.Battle);
  });

  it('routes Strategic to BattleScene', () => {
    expect(routeModality('Strategic')).toBe(SceneKeys.Battle);
  });

  it('routes Embodied to BattleScene', () => {
    expect(routeModality('Embodied')).toBe(SceneKeys.Battle);
  });

  it('routes ImmersiveRPG to BattleScene', () => {
    expect(routeModality('ImmersiveRPG')).toBe(SceneKeys.Battle);
  });

  it('routes LanguageReflective to ReflectionScene', () => {
    expect(routeModality('LanguageReflective')).toBe(SceneKeys.Reflection);
  });

  it('routes ScenarioChoice to DilemmaScene', () => {
    expect(routeModality('ScenarioChoice')).toBe(SceneKeys.Dilemma);
  });

  it('routes SocialCooperative to DilemmaScene', () => {
    expect(routeModality('SocialCooperative')).toBe(SceneKeys.Dilemma);
  });

  it('returns a valid scene key for every modality', () => {
    const validSceneKeys = new Set<string>(Object.values(SceneKeys));
    for (const modality of ALL_MODALITIES) {
      const result = routeModality(modality);
      expect(validSceneKeys.has(result)).toBe(true);
    }
  });

  it('routes all combat-like modalities to Battle', () => {
    const combatModalities: Modality[] = ['Deterministic', 'Strategic', 'Embodied', 'ImmersiveRPG'];
    for (const m of combatModalities) {
      expect(routeModality(m)).toBe(SceneKeys.Battle);
    }
  });
});
