/**
 * ProfileUpdater — the runtime loop that updates PlayerProfile after encounters.
 * encounter result → staircase → altitude → ceiling → stage → rays → shadows → drives
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import type { PlayerProfile, TaskSlug } from '../domain/PlayerProfile.js';
import { LINE_QUADRANT } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';
import { updateStaircase, DEFAULT_STAIRCASE_CONFIG } from './Staircase.js';
import { thresholdToStage } from './ThresholdMaps.js';
import { capToCeiling } from './LineCeilings.js';
import { computeRayProfile } from './RayProfileComputer.js';
import { synthesiseStage } from './StageSynthesizer.js';
import { detectShadows } from './ShadowDetector.js';

/** Result of a single encounter's cognitive task. */
export interface EncounterResult {
  readonly line: Line;
  readonly taskSlug: TaskSlug;
  readonly trials: readonly { correct: boolean }[];
  /** Optional: which drive the player's choices leaned toward. */
  readonly driveChoice?: Drive;
}

/**
 * Update the player profile after an encounter.
 * Returns a new immutable profile (no mutation).
 */
export function updateProfile(profile: PlayerProfile, result: EncounterResult): PlayerProfile {
  const slug = result.taskSlug;

  // 1. Update staircase for the exercised task
  let staircase = profile.taskStaircases[slug] ?? {
    level: 1, reversals: 0, lastDirection: null, history: [],
  };
  for (const trial of result.trials) {
    staircase = updateStaircase(staircase, DEFAULT_STAIRCASE_CONFIG, trial.correct);
  }
  const newStaircases = { ...profile.taskStaircases, [slug]: staircase };

  // 2. Map staircase level → proposed altitude for the line
  const proposedStage = thresholdToStage(result.line, staircase.level);

  // 3. Enforce line ceiling
  const currentAltitudes = { ...profile.altitudes };
  const capped = capToCeiling(result.line, proposedStage, currentAltitudes);

  // Only advance (never regress from staircase alone — regression is detected separately)
  const currentOrd = stageOrdinal(currentAltitudes[result.line]);
  const cappedOrd = stageOrdinal(capped);
  if (cappedOrd > currentOrd) {
    currentAltitudes[result.line] = capped;
  }

  // 4. Record altitude history
  const altitudeHistory = [
    ...profile.altitudeHistory,
    { line: result.line, stage: currentAltitudes[result.line], atMs: Date.now() },
  ];

  // 5. Update quadrant coverage
  const quadrant = LINE_QUADRANT[result.line];
  const quadrantCoverage = { ...profile.quadrantCoverage };
  const currentStage = profile.stage;
  const existing = quadrantCoverage[currentStage] ?? [];
  if (!existing.includes(quadrant)) {
    quadrantCoverage[currentStage] = [...existing, quadrant];
  }

  // 6. Recompute synthesised stage
  const newStage = synthesiseStage(currentAltitudes);

  // 7. Recompute ray profile
  const newRayProfile = computeRayProfile(currentAltitudes);

  // 8. Update drive fixation risk
  const newDrives = updateDriveRisk(profile.drives, result.driveChoice);

  // 9. Build intermediate profile for shadow detection
  const updatedProfile: PlayerProfile = {
    ...profile,
    altitudes: currentAltitudes,
    stage: newStage,
    rayProfile: newRayProfile,
    taskStaircases: newStaircases,
    quadrantCoverage,
    altitudeHistory,
    drives: newDrives,
    shadows: [], // will be recomputed below
  };

  // 10. Detect shadows on the updated profile
  const shadows = detectShadows(updatedProfile);

  return { ...updatedProfile, shadows };
}

/**
 * Update drive fixation risk based on choice patterns.
 * If the same drive is chosen repeatedly, its fixation risk increases.
 */
function updateDriveRisk(
  drives: PlayerProfile['drives'],
  choice?: Drive,
): PlayerProfile['drives'] {
  if (!choice) return drives;

  const decay = 0.95;
  const boost = 0.1;

  const newRisk = { ...drives.fixationRisk };
  for (const d of Object.keys(newRisk) as Drive[]) {
    newRisk[d] = newRisk[d] * decay; // decay all
  }
  newRisk[choice] = Math.min(1, newRisk[choice] + boost); // boost chosen

  return { weights: drives.weights, fixationRisk: newRisk };
}
