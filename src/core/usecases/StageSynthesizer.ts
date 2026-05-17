/**
 * StageSynthesizer — synthesises per-line altitudes into a single stage.
 * Stage advancement is a pure function of PlayerProfile (invariant from Part II §7).
 */
import type { Line } from '../domain/Line.js';
import type { PlayerProfile } from '../domain/PlayerProfile.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_LINES } from '../domain/Line.js';
import { ALL_STAGES, stageOrdinal } from '../domain/Stage.js';

/**
 * Compute the synthesised stage: the lowest altitude across all lines.
 * A player's stage is only as high as their weakest line.
 */
export function synthesiseStage(altitudes: Record<Line, Stage>): Stage {
  let minOrdinal = 7;
  for (const line of ALL_LINES) {
    const ord = stageOrdinal(altitudes[line]);
    if (ord < minOrdinal) minOrdinal = ord;
  }
  return ALL_STAGES[minOrdinal]!;
}

/**
 * Check if a player meets the advancement criteria for a target stage.
 * All lines must be at or above the target stage.
 */
export function meetsAdvancementCriteria(profile: PlayerProfile, target: Stage): boolean {
  const targetOrd = stageOrdinal(target);
  for (const line of ALL_LINES) {
    if (stageOrdinal(profile.altitudes[line]) < targetOrd) return false;
  }
  return true;
}
