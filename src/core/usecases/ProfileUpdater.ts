/**
 * ProfileUpdater — the runtime loop that updates Significator after encounters.
 * encounter result → altitude → stage → rays → shadows → drives
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import { LINE_QUADRANT } from '../domain/Line.js';
import type { Significator, DriveState, EncounterRecord } from '../domain/Significator.js';
import type { TaskSlug } from '../domain/SharedTypes.js';
import type { ShadowQuadrant } from '../domain/enums.js';
import { stageOrdinal } from '../domain/Stage.js';
import { thresholdToStage } from './ThresholdMaps.js';
import { capToCeiling } from './LineCeilings.js';
import { computeRayProfile } from './RayProfileComputer.js';
import { synthesiseStage } from './StageSynthesizer.js';
import { detectShadows, computeBehavioralPatterns } from './ShadowDetector.js';
import type { ShadowLedger } from '../domain/ShadowLedger.js';

/** Result of a single encounter's cognitive task. */
export interface EncounterResult {
  readonly line: Line;
  readonly taskSlug: TaskSlug;
  readonly trials: readonly { correct: boolean }[];
  /** Optional: which drive the player's choices leaned toward. */
  readonly driveChoice?: Drive;
}

const QUADRANT_TO_DRIVE: Record<string, Drive> = {
  UR: 'Agency',
  UL: 'Eros',
  LL: 'Communion',
  LR: 'Agape',
};

export function driveForLine(line: Line): Drive {
  return QUADRANT_TO_DRIVE[LINE_QUADRANT[line]] ?? 'Agency';
}

const SIGNAL_TO_QUADRANT: Record<string, ShadowQuadrant> = {
  fixation: 'DarkAddiction',
  regression: 'DarkAllergy',
  repression: 'GoldenAddiction',
  goldenAllergy: 'GoldenAllergy',
};

/**
 * Update the Significator after an encounter.
 * Returns a new immutable Significator (no mutation).
 */
export function updateProfile(sig: Significator, result: EncounterResult): Significator {
  // 1. Map trial accuracy → proposed altitude for the line
  const correctCount = result.trials.filter(t => t.correct).length;
  const threshold = result.trials.length > 0 ? Math.round((correctCount / result.trials.length) * 10) : 1;
  const proposedStage = thresholdToStage(result.line, threshold);

  // 2. Enforce line ceiling
  const currentAltitudes = { ...sig.altitudes };
  const capped = capToCeiling(result.line, proposedStage, currentAltitudes);

  // Only advance (never regress from encounter alone)
  const currentOrd = stageOrdinal(currentAltitudes[result.line]);
  const cappedOrd = stageOrdinal(capped);
  if (cappedOrd > currentOrd) {
    currentAltitudes[result.line] = capped;
  }

  // 3. Recompute synthesised stage
  const newStage = synthesiseStage(currentAltitudes);

  // 4. Recompute ray profile
  const newRayProfile = computeRayProfile(currentAltitudes);

  // 5. Update drive fixation risk
  const newDrives = updateDriveRisk(sig.drives, result.driveChoice);

  // 6. Build updated Significator for shadow detection
  const newEncounter: EncounterRecord = {
    line: result.line,
    passed: result.trials.filter(t => t.correct).length / result.trials.length >= 0.7,
    driveChoice: result.driveChoice,
    timestamp: Date.now(),
  };
  const recentEncounters = [...sig.recentEncounters, newEncounter].slice(-20);

  const updated: Significator = {
    ...sig,
    altitudes: currentAltitudes,
    currentStage: newStage,
    rayProfile: newRayProfile,
    drives: newDrives,
    totalEncounters: sig.totalEncounters + 1,
    recentEncounters,
  };

  // 7. Compute behavioral patterns and detect shadows
  const patterns = computeBehavioralPatterns(recentEncounters);
  const signals = detectShadows(updated, patterns);
  const now = Date.now();
  const existingEntries = [...sig.shadows.entries];
  for (const signal of signals) {
    const alreadyTracked = existingEntries.some(
      e => e.line === signal.line && e.resolvedAt === null,
    );
    if (!alreadyTracked) {
      // ponytail: severity gradient based on stage gap + line altitude
      const lineOrd = stageOrdinal(currentAltitudes[signal.line]);
      const stageOrd = stageOrdinal(newStage);
      const gapSeverity = Math.min(1, (stageOrd - lineOrd) * 0.25);
      const altitudeSeverity = 1 - (lineOrd / 7);
      const severity = Math.min(1, gapSeverity * 0.6 + altitudeSeverity * 0.4);

      existingEntries.push({
        id: `shadow-${now}-${signal.line}`,
        quadrant: SIGNAL_TO_QUADRANT[signal.type] ?? 'DarkAddiction',
        line: signal.line,
        stage: currentAltitudes[signal.line],
        drive: driveForLine(signal.line),
        surfacedAt: now,
        resolvedAt: null,
        recurrenceCount: 0,
        compoundPartner: null,
        severity,
      });
    }
  }
  const newShadows: ShadowLedger = {
    entries: existingEntries,
    activeCount: existingEntries.filter(e => e.resolvedAt === null).length,
  };

  return { ...updated, shadows: newShadows };
}

/**
 * Update drive fixation risk based on choice patterns.
 */
function updateDriveRisk(drives: DriveState, choice?: Drive): DriveState {
  if (!choice) return drives;

  const decay = 0.95;
  const boost = 0.1;

  const newRisk = { ...drives.fixationRisk };
  for (const d of Object.keys(newRisk) as Drive[]) {
    newRisk[d] = newRisk[d] * decay;
  }
  newRisk[choice] = Math.min(1, newRisk[choice] + boost);

  return { weights: drives.weights, fixationRisk: newRisk };
}
