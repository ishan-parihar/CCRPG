/**
 * PolarityEngine — 4-level polarity aggregation.
 * Spec: foundations/19 §4, §6
 *
 * GAP-WB-1: Now wired to PolarityOntology — texture names are used for
 * narrative conditioning. The ContextPipeline and ConsequenceNarrator
 * can query getTextureName() to get stage-appropriate polarity texture
 * language for LLM prompt conditioning and narrative feedback.
 */
import type { Line } from '../domain/Line.js';
import { ALL_LINES } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { EnergeticDirection, PolarityMode } from '../domain/enums.js';
import type { PolarityTrace } from '../domain/PolarityTrace.js';
import type {
  LineProfile,
  MasterPolarity,
  PolarityCellVector,
  PolarityState,
} from '../domain/PolarityCellVector.js';
import { getTexture, DEFAULT_POLARITY_ONTOLOGY, type PolarityTexture } from '../data/PolarityOntology.js';

const CRYSTALLIZATION_THRESHOLD = 0.8;
const CRYSTALLIZING_THRESHOLD = 0.5;
const COHERENT_LINE_THRESHOLD = 0.6;
const MIN_LINES_FOR_MASTER = 6;

function cellKey(line: Line, stage: Stage): string {
  return `${line}:${stage}`;
}

/**
 * Compute crystallization via spec formula (foundations/19 §B2).
 * crystallization = coherence × sigmoid((traceCount - 5) / 7)
 */
export function computeCrystallization(coherence: number, traceCount: number): number {
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  return coherence * sigmoid((traceCount - 5) / 7);
}

/** Record a new polarity trace into the state, updating the relevant cell. */
export function recordTrace(state: PolarityState, trace: PolarityTrace, line: Line, stage: Stage): PolarityState {
  const key = cellKey(line, stage);
  const existing = state.cells[key] ?? {
    dominantPattern: null,
    exploratoryBreadth: 1,
    coherence: 0,
    crystallization: 0,
    traceCount: 0,
    textureId: key,
  };

  const count = existing.traceCount + 1;
  const dir = trace.energeticDirection;

  // Update dominant pattern via exponential moving average logic
  const matchesDominant = existing.dominantPattern === dir;
  const newCoherence = matchesDominant
    ? existing.coherence + (1 - existing.coherence) * 0.1
    : existing.coherence * 0.9;

  const newDominant = newCoherence < 0.3 ? dir : existing.dominantPattern ?? dir;
  const newBreadth = matchesDominant
    ? existing.exploratoryBreadth * 0.95
    : Math.min(1, existing.exploratoryBreadth + 0.05);

  const newCrystallization = computeCrystallization(newCoherence, count);

  const updatedCell: PolarityCellVector = {
    dominantPattern: newDominant,
    exploratoryBreadth: newBreadth,
    coherence: newCoherence,
    crystallization: newCrystallization,
    traceCount: count,
    textureId: existing.textureId,
  };

  const cells = { ...state.cells, [key]: updatedCell };
  const lineProfiles = computeAllLineProfiles(cells);
  const master = computeMasterPolarity(Object.values(lineProfiles));

  return { cells, lineProfiles, master };
}

/** Compute coherence for a single cell. */
export function computeCellCoherence(cell: PolarityCellVector): number {
  return cell.coherence;
}

/** Compute line profile from all cells belonging to that line. */
export function computeLineProfile(cells: PolarityCellVector[]): LineProfile {
  if (cells.length === 0) return { direction: null, coherence: 0, mode: 'Exploring' };

  const totalCoherence = cells.reduce((sum, c) => sum + c.coherence, 0) / cells.length;
  const totalCrystallization = cells.reduce((sum, c) => sum + c.crystallization, 0) / cells.length;

  // Find dominant direction across cells
  const dirCounts: Record<string, number> = {};
  for (const c of cells) {
    if (c.dominantPattern) {
      dirCounts[c.dominantPattern] = (dirCounts[c.dominantPattern] ?? 0) + 1;
    }
  }
  const dominant = Object.entries(dirCounts).sort((a, b) => b[1] - a[1])[0];
  const direction = dominant ? dominant[0] as EnergeticDirection : null;

  let mode: PolarityMode = 'Exploring';
  if (totalCrystallization >= CRYSTALLIZATION_THRESHOLD) mode = 'Crystallized';
  else if (totalCrystallization >= CRYSTALLIZING_THRESHOLD) mode = 'Crystallizing';

  return { direction, coherence: totalCoherence, mode };
}

function computeAllLineProfiles(cells: Readonly<Record<string, PolarityCellVector>>): Record<string, LineProfile> {
  const profiles: Record<string, LineProfile> = {};
  for (const line of ALL_LINES) {
    const lineCells = Object.entries(cells)
      .filter(([k]) => k.startsWith(`${line}:`))
      .map(([_, v]) => v);
    profiles[line] = computeLineProfile(lineCells);
  }
  return profiles;
}

/** Compute master polarity from all line profiles. */
export function computeMasterPolarity(profiles: LineProfile[], altitudes?: Readonly<Record<string, Stage>>): MasterPolarity {
  const coherentLines = profiles.filter(p => p.coherence >= COHERENT_LINE_THRESHOLD);
  const coherentCount = coherentLines.length;

  // Find dominant direction across coherent lines
  const dirCounts: Record<string, number> = {};
  for (const p of coherentLines) {
    if (p.direction) {
      dirCounts[p.direction] = (dirCounts[p.direction] ?? 0) + 1;
    }
  }
  const dominant = Object.entries(dirCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantDirection = dominant ? dominant[0] as EnergeticDirection : null;

  const avgCrystallization = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + (p.mode === 'Crystallized' ? 1 : p.mode === 'Crystallizing' ? 0.5 : 0), 0) / profiles.length
    : 0;

  let mode: PolarityMode = 'Exploring';
  // P1-20: Add altitude_floor ≥ Orange check per foundations/19 §5.
  // Previously a Red-stage player with 6 coherent lines could be promoted to
  // 'Crystallizing' — the spec explicitly forbids this. Now we require the
  // player's current stage ≥ Orange for crystallization. When altitudes is not
  // provided (backward compat), the check is skipped.
  const ORANGE_ORDINAL = stageOrdinal('Orange');
  const playerStageOrdinal = altitudes
    ? Math.min(...Object.values(altitudes).map(s => stageOrdinal(s)))
    : ORANGE_ORDINAL; // default to passing if no altitudes provided
  const meetsAltitudeFloor = playerStageOrdinal >= ORANGE_ORDINAL;

  if (coherentCount >= MIN_LINES_FOR_MASTER && avgCrystallization >= CRYSTALLIZATION_THRESHOLD && meetsAltitudeFloor) {
    mode = 'Crystallized';
  } else if (coherentCount >= MIN_LINES_FOR_MASTER && avgCrystallization >= CRYSTALLIZING_THRESHOLD && meetsAltitudeFloor) {
    mode = 'Crystallizing';
  }

  return { mode, dominantDirection, coherentLineCount: coherentCount, crystallizationProgress: avgCrystallization };
}

/**
 * P1-20: Check if the player is harvestable (ready for the endgame Choice).
 *
 * Per foundations/19 §5, the harvest requires:
 * - STO: mode='Crystallized', direction='STO', ≥6 coherent lines, altitude_floor ≥ Orange,
 *   mean(direction_strength) ≥ 0.51, all prior stages healthy, violet_ray_integration ≥ 0.8
 * - STS: mode='Crystallized', direction='STS', ≥7 coherent lines, altitude_floor ≥ Orange,
 *   mean(direction_strength) ≥ 0.95 (stricter — STS requires near-total absorption efficiency)
 *
 * The 51% / 95% asymmetry follows from source-flow coupling: STO source=above
 * (inexhaustible) → slight opening suffices; STS source=below (finite) → near-total
 * efficiency required.
 *
 * @param master The master polarity state
 * @param directionStrengths Per-line direction strength (0-1). If omitted, harvestable=false.
 * @param altitudeFloor The lowest stage across coherent lines (ordinal 0-7)
 * @param violetRayIntegration The violet-ray integration score (0-1). If < 0.8, not harvestable.
 * @returns { harvestable: boolean, direction: 'STO'|'STS'|null, reason: string }
 */
export function checkHarvest(
  master: MasterPolarity,
  directionStrengths: readonly number[] | null,
  altitudeFloor: number,
  violetRayIntegration: number,
): { harvestable: boolean; direction: 'STO' | 'STS' | null; reason: string } {
  if (master.mode !== 'Crystallized') {
    return { harvestable: false, direction: null, reason: `Master mode is ${master.mode}, not Crystallized` };
  }
  if (!master.dominantDirection) {
    return { harvestable: false, direction: null, reason: 'No dominant direction crystallized' };
  }

  const ORANGE_ORDINAL = stageOrdinal('Orange');
  if (altitudeFloor < ORANGE_ORDINAL) {
    return { harvestable: false, direction: null, reason: `Altitude floor ${altitudeFloor} < Orange (${ORANGE_ORDINAL})` };
  }

  if (violetRayIntegration < 0.8) {
    return { harvestable: false, direction: null, reason: `Violet-ray integration ${violetRayIntegration.toFixed(2)} < 0.80` };
  }

  if (!directionStrengths || directionStrengths.length === 0) {
    return { harvestable: false, direction: null, reason: 'No direction strengths available' };
  }

  const meanStrength = directionStrengths.reduce((a, b) => a + b, 0) / directionStrengths.length;
  const direction = master.dominantDirection === 'Radiative' ? 'STO' : 'STS';

  if (direction === 'STO') {
    // STO: ≥6 coherent lines, mean strength ≥ 0.51
    if (master.coherentLineCount < 6) {
      return { harvestable: false, direction: null, reason: `STO requires ≥6 coherent lines, found ${master.coherentLineCount}` };
    }
    if (meanStrength < 0.51) {
      return { harvestable: false, direction: null, reason: `STO requires mean strength ≥ 0.51, found ${meanStrength.toFixed(3)}` };
    }
    return { harvestable: true, direction: 'STO', reason: `STO harvest: ${master.coherentLineCount} coherent lines, mean strength ${meanStrength.toFixed(3)}` };
  } else {
    // STS: ≥7 coherent lines, mean strength ≥ 0.95 (stricter)
    if (master.coherentLineCount < 7) {
      return { harvestable: false, direction: null, reason: `STS requires ≥7 coherent lines, found ${master.coherentLineCount}` };
    }
    if (meanStrength < 0.95) {
      return { harvestable: false, direction: null, reason: `STS requires mean strength ≥ 0.95, found ${meanStrength.toFixed(3)}` };
    }
    return { harvestable: true, direction: 'STS', reason: `STS harvest: ${master.coherentLineCount} coherent lines, mean strength ${meanStrength.toFixed(3)}` };
  }
}

/** Detect current polarity mode from master state. */
export function detectCrystallizationMode(master: MasterPolarity): PolarityMode {
  return master.mode;
}

// ─── GAP-WB-1: PolarityOntology integration ──────────────────────────

/**
 * Get the polarity texture name for a (line, stage, direction) combination.
 * Used by ContextPipeline for LLM prompt conditioning and by
 * ConsequenceNarrator for narrative feedback.
 *
 * Example: getPolarityTextureName('Cognitive', 'Red', 'sto')
 * → 'strategic-service'
 */
export function getPolarityTextureName(
  line: Line,
  stage: Stage,
  direction: 'sto' | 'sts' | 'exploratory',
): string | null {
  const texture = getTexture(DEFAULT_POLARITY_ONTOLOGY, line, stage);
  if (!texture) return null;
  return texture[direction] ?? null;
}

/**
 * Get the full PolarityTexture for a (line, stage) combination.
 * Returns all three direction textures (sto, sts, exploratory).
 */
export function getPolarityTexture(line: Line, stage: Stage): PolarityTexture | undefined {
  return getTexture(DEFAULT_POLARITY_ONTOLOGY, line, stage);
}

/**
 * Get the player's current polarity texture based on their master direction.
 * If crystallized STO → returns the sto texture; if STS → returns sts;
 * if Exploring → returns exploratory.
 */
export function getPlayerPolarityTexture(
  state: PolarityState,
  line: Line,
  stage: Stage,
): string | null {
  const masterMode = state.master.mode;
  const dominantDir = state.master.dominantDirection;
  if (masterMode === 'Exploring') {
    return getPolarityTextureName(line, stage, 'exploratory');
  }
  if (dominantDir === 'Radiative') {
    return getPolarityTextureName(line, stage, 'sto');
  }
  if (dominantDir === 'Absorptive') {
    return getPolarityTextureName(line, stage, 'sts');
  }
  return getPolarityTextureName(line, stage, 'exploratory');
}
