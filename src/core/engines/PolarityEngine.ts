/**
 * PolarityEngine — 4-level polarity aggregation.
 * Spec: foundations/19 §4, §6
 */
import type { Line } from '../domain/Line.js';
import { ALL_LINES } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { EnergeticDirection, PolarityMode } from '../domain/enums.js';
import type { PolarityTrace } from '../domain/PolarityTrace.js';
import type {
  LineProfile,
  MasterPolarity,
  PolarityCellVector,
  PolarityState,
} from '../domain/PolarityCellVector.js';

const CRYSTALLIZATION_THRESHOLD = 0.8;
const CRYSTALLIZING_THRESHOLD = 0.5;
const COHERENT_LINE_THRESHOLD = 0.6;
const MIN_LINES_FOR_MASTER = 6;

function cellKey(line: Line, stage: Stage): string {
  return `${line}:${stage}`;
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

  const newCrystallization = newCoherence > CRYSTALLIZING_THRESHOLD
    ? Math.min(1, existing.crystallization + 0.02)
    : Math.max(0, existing.crystallization - 0.01);

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
export function computeMasterPolarity(profiles: LineProfile[]): MasterPolarity {
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
  if (coherentCount >= MIN_LINES_FOR_MASTER && avgCrystallization >= CRYSTALLIZATION_THRESHOLD) {
    mode = 'Crystallized';
  } else if (coherentCount >= MIN_LINES_FOR_MASTER && avgCrystallization >= CRYSTALLIZING_THRESHOLD) {
    mode = 'Crystallizing';
  }

  return { mode, dominantDirection, coherentLineCount: coherentCount, crystallizationProgress: avgCrystallization };
}

/** Detect current polarity mode from master state. */
export function detectCrystallizationMode(master: MasterPolarity): PolarityMode {
  return master.mode;
}
