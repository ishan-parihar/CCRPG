/**
 * StageSynthesizer — synthesises per-line altitudes into a single stage.
 * Per foundations/02 §3.2: stage = max S such that all lines ≥ S AND ≥1 line at S+1.
 * Per lines/00 §3.3: advancement gate requires 5 checks.
 */
import type { Line } from '../domain/Line.js';
import type { PlayerProfile } from '../domain/PlayerProfile.js';
import type { Stage } from '../domain/Stage.js';
import type { Quadrant } from '../domain/PlayerProfile.js';
import { ALL_LINES } from '../domain/Line.js';
import { ALL_STAGES, stageOrdinal } from '../domain/Stage.js';

/**
 * Compute the synthesised stage with hysteresis (+1 pull rule).
 * Stage = max S such that all lines ≥ S AND at least one line ≥ S+1.
 */
export function synthesiseStage(altitudes: Record<Line, Stage>): Stage {
  let result: Stage = 'Infrared';

  for (let i = 0; i < ALL_STAGES.length; i++) {
    const candidate = ALL_STAGES[i]!;
    // Check: all lines at or above candidate
    let allAtOrAbove = true;
    let countAbove = 0;

    for (const line of ALL_LINES) {
      const ord = stageOrdinal(altitudes[line]);
      if (ord < i) { allAtOrAbove = false; break; }
      if (ord > i) countAbove++;
    }

    if (!allAtOrAbove) break;

    // Hysteresis: at least one line must be pulling forward (at S+1)
    // Exception: if we're at the highest possible (White), no pull needed
    if (i === ALL_STAGES.length - 1 || countAbove >= 1) {
      result = candidate;
    } else {
      // All lines are exactly at this stage but none above — stay here
      result = candidate;
    }
  }

  return result;
}

/**
 * Full 5-check advancement gate per lines/00 §3.3.
 * Returns { canAdvance, blockers } where blockers lists what's missing.
 */
export function checkAdvancementGate(profile: PlayerProfile, target: Stage): {
  canAdvance: boolean;
  blockers: string[];
} {
  const blockers: string[] = [];
  const targetOrd = stageOrdinal(target);
  const prevStage = targetOrd > 0 ? ALL_STAGES[targetOrd - 1]! : null;

  // 1. All 8 lines ≥ target stage
  for (const line of ALL_LINES) {
    if (stageOrdinal(profile.altitudes[line]) < targetOrd) {
      blockers.push(`${line} line below ${target}`);
    }
  }

  // 2. At least 2 lines ≥ target+1 (the pull)
  if (targetOrd < ALL_STAGES.length - 1) {
    let pullCount = 0;
    for (const line of ALL_LINES) {
      if (stageOrdinal(profile.altitudes[line]) > targetOrd) pullCount++;
    }
    if (pullCount < 2) {
      blockers.push(`Need ≥2 lines above ${target} (have ${pullCount})`);
    }
  }

  // 3. All 4 quadrants demonstrated at the previous stage
  if (prevStage) {
    const covered = profile.quadrantCoverage[prevStage] ?? [];
    const allQuadrants: Quadrant[] = ['UL', 'UR', 'LL', 'LR'];
    for (const q of allQuadrants) {
      if (!covered.includes(q)) {
        blockers.push(`Quadrant ${q} not demonstrated at ${prevStage}`);
      }
    }
  }

  // 4. Boss synthesis exam cleared for previous stage
  if (prevStage && !profile.bossesCleared.includes(prevStage)) {
    blockers.push(`Boss for ${prevStage} not cleared`);
  }

  // 5. No active shadow signals at altitude ≤ target
  for (const shadow of profile.shadows) {
    const shadowLineOrd = stageOrdinal(profile.altitudes[shadow.line]);
    if (shadowLineOrd <= targetOrd) {
      blockers.push(`Unresolved ${shadow.type} shadow on ${shadow.line}`);
    }
  }

  return { canAdvance: blockers.length === 0, blockers };
}

/**
 * Legacy compatibility: check if all lines meet target (simple check).
 */
export function meetsAdvancementCriteria(profile: PlayerProfile, target: Stage): boolean {
  return checkAdvancementGate(profile, target).canAdvance;
}
