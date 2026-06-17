/**
 * Pure routing logic for encounters.
 * Maps a modality to the target scene key.
 * Extracted from EncounterScene for testability (no Phaser dependency).
 */
import type { Modality } from '@core/domain/enums.js';
import { SceneKeys } from '../keys.js';

/**
 * Routes a modality to the appropriate scene key.
 */
export function routeModality(modality: Modality): string {
  switch (modality) {
    case 'Deterministic':
    case 'Strategic':
    case 'Embodied':
    case 'ImmersiveRPG':
    case 'SocialCooperative':
      return SceneKeys.Encounter;
    case 'LanguageReflective':
      return SceneKeys.Reflection;
    case 'ScenarioChoice':
      return SceneKeys.Dilemma;
  }
}
