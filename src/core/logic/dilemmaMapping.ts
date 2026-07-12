/**
 * Pure choice-to-PlayerResponse mapping logic for DilemmaScene.
 * Extracted for testability (no Phaser dependency).
 */
import type { PlayerResponse } from '@core/engines/ConsequenceEngine.js';
import type { EnergeticDirection, DriveDirectionality, StageOrientation, SourceOfNourishment } from '@core/domain/enums.js';
import type { Drive } from '@core/domain/Drive.js';

/**
 * Maps a choice ID to a PlayerResponse.
 */
export function mapChoiceToResponse(
  choiceId: string,
  encounterId: string,
): PlayerResponse {
  const driveMap: Record<string, { energetic: EnergeticDirection; orientation: StageOrientation; nourishment: SourceOfNourishment }> = {
    attack: { energetic: 'Radiative', orientation: 'ReachingHigher', nourishment: 'LowerRealm' },
    trust: { energetic: 'Radiative', orientation: 'IntegratingLower', nourishment: 'HigherRealm' },
    expand: { energetic: 'Radiative', orientation: 'ReachingHigher', nourishment: 'LowerRealm' },
    defend: { energetic: 'Absorptive', orientation: 'Homeostatic', nourishment: 'LowerRealm' },
    verify: { energetic: 'Sovereign', orientation: 'Homeostatic', nourishment: 'Ambivalent' },
    fortify: { energetic: 'Absorptive', orientation: 'Homeostatic', nourishment: 'LowerRealm' },
    negotiate: { energetic: 'Sovereign', orientation: 'IntegratingLower', nourishment: 'HigherRealm' },
    betray: { energetic: 'Diffuse', orientation: 'Regressive', nourishment: 'LowerRealm' },
    raid: { energetic: 'Radiative', orientation: 'Regressive', nourishment: 'LowerRealm' },
  };

  const mapping = driveMap[choiceId] ?? {
    energetic: 'Sovereign' as EnergeticDirection,
    orientation: 'Homeostatic' as StageOrientation,
    nourishment: 'Ambivalent' as SourceOfNourishment,
  };

  const defaultDriveDir: Record<Drive, DriveDirectionality> = {
    Agency: 'HealthyBalanced',
    Communion: 'HealthyBalanced',
    Eros: 'HealthyBalanced',
    Agape: 'HealthyBalanced',
  };

  // Adjust drive directionality based on choice character
  const driveDirectionality = { ...defaultDriveDir };
  if (choiceId === 'attack' || choiceId === 'expand' || choiceId === 'raid') {
    driveDirectionality.Agency = 'DarkAddicted';
  }
  if (choiceId === 'betray') {
    driveDirectionality.Communion = 'DarkAverted';
  }
  if (choiceId === 'trust' || choiceId === 'negotiate') {
    driveDirectionality.Communion = 'HealthyBalanced';
    driveDirectionality.Agape = 'HealthyBalanced';
  }

  return {
    encounterId,
    energeticDirection: mapping.energetic,
    driveDirectionality,
    stageOrientation: mapping.orientation,
    sourceOfNourishment: mapping.nourishment,
    shadowSurfaced: null,
    shadowResolvedId: null,
    narrativeSummary: `Player chose: ${choiceId}`,
  };
}
