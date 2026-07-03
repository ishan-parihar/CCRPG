/**
 * UserMatrixModel — explicit model of the USER's own Matrix and Potentiator.
 *
 * HoloOS alignment (per AUDIT-USER-MATRIX.md):
 * Per HoloOS 02.1 §1-4 (canonical), the Matrix stores Experience (past,
 * unprocessed catalyst) and the Potentiator stores Catalyst (future, latent
 * unprocessed experience). Shadows are digestive inefficiencies:
 *   - Dark-Addiction = excess unprocessed Catalyst in Matrix
 *   - Dark-Allergy = deficient Catalyst in Matrix (avoidance)
 *   - Golden-Addiction = excess unprocessed Experience in Potentiator (bypass)
 *   - Golden-Allergy = deficient Experience in Potentiator (resistance)
 *
 * This engine explicitly models the user's Matrix/Potentiator SEPARATE from
 * the in-game Significator. The in-game Significator tracks what happened
 * IN the game; the UserMatrixModel infers what the user BRINGS to the game
 * — their pre-existing unprocessed developmental material.
 *
 * The profilePhase field tracks the transition from random probing (unmapped)
 * to targeted intervention (crystallized), per the user's two-phase articulation:
 *   "first by randomly throwing the catalysts, and then as the developmental-
 *    profile of the individual is crystallized, it then focuses on the patterns
 *    appropriate and relevant for the evolution of the individual"
 *
 * Status: canonical-hypothesis (CCRPG-specific operationalization of HoloOS
 * 02.1 canonical).
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_LINES } from '../domain/Line.js';
import { ALL_STAGES } from '../domain/Stage.js';
import type { DriveDirectionality, ShadowQuadrant } from '../domain/enums.js';
import type { Drive } from '../domain/Drive.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProfilePhase = 'unmapped' | 'mapping' | 'crystallizing' | 'crystallized';

export interface CellMatrixState {
  readonly line: Line;
  readonly stage: Stage;
  /** 0-1: how much unprocessed life-catalyst is in the user's Matrix at this cell.
   * High = Dark-Addiction signature (excess catalyst, repetitive pattern). */
  readonly unprocessedCatalystLoad: number;
  /** 0-1: how much unprocessed experience is in the user's Potentiator.
   * High = Golden-Addiction signature (excess experience, bypass). */
  readonly unprocessedExperienceLoad: number;
  /** 0-1: avoidance signal. High = Dark-Allergy (deficient catalyst, flinching). */
  readonly avoidanceSignal: number;
  /** 0-1: resistance signal. High = Golden-Allergy (deficient experience, refusal). */
  readonly resistanceSignal: number;
  readonly encounterCount: number;
  readonly lastProbedAt: number;
}

export interface UserMatrixModel {
  readonly cells: Readonly<Record<string, CellMatrixState>>;
  readonly profilePhase: ProfilePhase;
  /** Fraction of 64 cells probed at least once (0-1). */
  readonly probeCoverage: number;
}

// ---------------------------------------------------------------------------
// Inference: response → Matrix/Potentiator state update
// ---------------------------------------------------------------------------

/** Keyword sets for inferring the user's Matrix/Potentiator state from responses. */
const AVOIDANCE_KEYWORDS = [
  'avoid', 'withdraw', 'escape', 'retreat', 'numb', 'shut down', 'flinch',
  'pull back', 'close off', 'disconnect', 'tune out', 'check out', 'dissociate',
];

const FIXATION_KEYWORDS = [
  'must', 'have to', 'need to', 'always', 'never', 'can\'t stop', 'compelled',
  'driven', 'obsessed', 'can\'t help', 'addicted', 'hooked', 'stuck',
];

const BYPASS_KEYWORDS = [
  'transcend', 'already past', 'beyond this', 'higher self', 'spiritual',
  'enlightened', 'awakened', 'i know', 'i\'ve done this work', 'i\'m beyond',
  'love and light', 'everything happens', 'it\'s all good',
];

const RESISTANCE_KEYWORDS = [
  'don\'t need', 'fine as i am', 'refuse', 'not interested', 'waste of time',
  'doesn\'t apply', 'i\'m different', 'this is stupid', 'no point', 'giving up',
  'why bother', 'i can\'t', 'i won\'t',
];

function countKeywordMatches(text: string, keywords: readonly string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) count++;
  }
  return count;
}

/**
 * Infer the user's Matrix/Potentiator state from their encounter response.
 * Returns delta values to apply to the cell's state.
 */
export interface MatrixInference {
  readonly unprocessedCatalystDelta: number;
  readonly unprocessedExperienceDelta: number;
  readonly avoidanceDelta: number;
  readonly resistanceDelta: number;
}

export function inferFromResponse(
  responseText: string,
  driveDirectionality: Readonly<Record<Drive, DriveDirectionality>>,
  shadowSurfaced: ShadowQuadrant | null,
): MatrixInference {
  const text = responseText || '';
  const responseLength = text.split(/\s+/).filter(Boolean).length;

  // Unprocessed catalyst load ↑ from: fixation keywords, strong reactions (long responses),
  // Dark-Addicted drive signals, DarkAddiction shadow
  const fixationMatches = countKeywordMatches(text, FIXATION_KEYWORDS);
  const strongReaction = responseLength > 80 ? 0.1 : responseLength > 40 ? 0.05 : 0;
  const darkAddictedSignal = Object.values(driveDirectionality).some(d => d === 'DarkAddicted') ? 0.15 : 0;
  const darkAddictionShadow = shadowSurfaced === 'DarkAddiction' ? 0.2 : 0;
  const unprocessedCatalystDelta = Math.min(0.3,
    fixationMatches * 0.08 + strongReaction + darkAddictedSignal + darkAddictionShadow,
  );

  // Avoidance signal ↑ from: avoidance keywords, short responses, Dark-Averted signals, DarkAllergy shadow
  const avoidanceMatches = countKeywordMatches(text, AVOIDANCE_KEYWORDS);
  const shortResponse = responseLength < 10 && responseLength > 0 ? 0.1 : 0;
  const darkAvertedSignal = Object.values(driveDirectionality).some(d => d === 'DarkAverted') ? 0.15 : 0;
  const darkAllergyShadow = shadowSurfaced === 'DarkAllergy' ? 0.2 : 0;
  const avoidanceDelta = Math.min(0.3,
    avoidanceMatches * 0.08 + shortResponse + darkAvertedSignal + darkAllergyShadow,
  );

  // Unprocessed experience load ↑ from: bypass keywords, Golden-Addicted signals, GoldenAddiction shadow
  const bypassMatches = countKeywordMatches(text, BYPASS_KEYWORDS);
  const goldenAddictedSignal = Object.values(driveDirectionality).some(d => d === 'GoldenAddicted') ? 0.15 : 0;
  const goldenAddictionShadow = shadowSurfaced === 'GoldenAddiction' ? 0.2 : 0;
  const unprocessedExperienceDelta = Math.min(0.3,
    bypassMatches * 0.08 + goldenAddictedSignal + goldenAddictionShadow,
  );

  // Resistance signal ↑ from: resistance keywords, Golden-Averted signals, GoldenAllergy shadow
  const resistanceMatches = countKeywordMatches(text, RESISTANCE_KEYWORDS);
  const goldenAvertedSignal = Object.values(driveDirectionality).some(d => d === 'GoldenAverted') ? 0.15 : 0;
  const goldenAllergyShadow = shadowSurfaced === 'GoldenAllergy' ? 0.2 : 0;
  const resistanceDelta = Math.min(0.3,
    resistanceMatches * 0.08 + goldenAvertedSignal + goldenAllergyShadow,
  );

  return {
    unprocessedCatalystDelta,
    unprocessedExperienceDelta,
    avoidanceDelta,
    resistanceDelta,
  };
}

// ---------------------------------------------------------------------------
// Cell state update
// ---------------------------------------------------------------------------

function cellKey(line: Line, stage: Stage): string {
  return `${line}:${stage}`;
}

function getOrCreateCell(
  cells: Record<string, CellMatrixState>,
  line: Line,
  stage: Stage,
): CellMatrixState {
  const key = cellKey(line, stage);
  return cells[key] ?? {
    line,
    stage,
    unprocessedCatalystLoad: 0,
    unprocessedExperienceLoad: 0,
    avoidanceSignal: 0,
    resistanceSignal: 0,
    encounterCount: 0,
    lastProbedAt: 0,
  };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function decay01(current: number, decayRate: number = 0.005): number {
  // Gradually decay old signals — the user processes material over time.
  // 0.005 per encounter = ~200 encounters to fully decay (slow enough to
  // preserve patterns across a full session of 20 encounters).
  return Math.max(0, current - decayRate);
}

/**
 * Update the UserMatrixModel after an encounter.
 * Applies the inference to the relevant cell and decays all other cells slightly.
 */
export function updateUserMatrix(
  model: UserMatrixModel,
  line: Line,
  stage: Stage,
  inference: MatrixInference,
  now: number,
): UserMatrixModel {
  const newCells: Record<string, CellMatrixState> = {};

  for (const l of ALL_LINES) {
    for (const s of ALL_STAGES) {
      const cell = getOrCreateCell(model.cells as Record<string, CellMatrixState>, l, s);
      const isTarget = l === line && s === stage;

      if (isTarget) {
        newCells[cellKey(l, s)] = {
          line: l,
          stage: s,
          unprocessedCatalystLoad: clamp01(cell.unprocessedCatalystLoad + inference.unprocessedCatalystDelta),
          unprocessedExperienceLoad: clamp01(cell.unprocessedExperienceLoad + inference.unprocessedExperienceDelta),
          avoidanceSignal: clamp01(cell.avoidanceSignal + inference.avoidanceDelta),
          resistanceSignal: clamp01(cell.resistanceSignal + inference.resistanceDelta),
          encounterCount: cell.encounterCount + 1,
          lastProbedAt: now,
        };
      } else {
        // Decay all non-target cells slightly
        newCells[cellKey(l, s)] = {
          ...cell,
          unprocessedCatalystLoad: decay01(cell.unprocessedCatalystLoad),
          unprocessedExperienceLoad: decay01(cell.unprocessedExperienceLoad),
          avoidanceSignal: decay01(cell.avoidanceSignal),
          resistanceSignal: decay01(cell.resistanceSignal),
        };
      }
    }
  }

  const probeCoverage = Object.values(newCells).filter(c => c.encounterCount > 0).length / (ALL_LINES.length * ALL_STAGES.length);
  const profilePhase = computeProfilePhase(model, newCells, probeCoverage);

  return {
    cells: newCells,
    profilePhase,
    probeCoverage,
  };
}

// ---------------------------------------------------------------------------
// Phase computation
// ---------------------------------------------------------------------------

/**
 * Compute the profilePhase based on the current model state.
 * Transitions:
 *   unmapped → mapping: when probeCoverage >= 0.25
 *   mapping → crystallizing: when polarity.master.mode = 'Crystallizing' OR 5+ shadows
 *   crystallizing → crystallized: when polarity.master.mode = 'Crystallized'
 *   any → unmapped (regression): when transformation fires (caller resets)
 */
function computeProfilePhase(
  _prevModel: UserMatrixModel,
  newCells: Record<string, CellMatrixState>,
  probeCoverage: number,
): ProfilePhase {
  // Count active shadows (cells with high unprocessed loads)
  const activePatterns = Object.values(newCells).filter(
    c => c.unprocessedCatalystLoad > 0.4 || c.unprocessedExperienceLoad > 0.4,
  ).length;

  // Check polarity crystallization (requires Significator access — passed via prevModel)
  // For now, use the prevModel's phase as a base and transition forward only.
  const prevPhase = _prevModel.profilePhase;

  // Don't regress unless explicitly reset
  if (prevPhase === 'crystallized') return 'crystallized';
  if (prevPhase === 'crystallizing') {
    // Stay in crystallizing unless explicitly promoted
    return 'crystallizing';
  }

  // Transition forward
  if (probeCoverage >= 0.25 && activePatterns >= 3) {
    return 'crystallizing';
  }
  if (probeCoverage >= 0.15) {
    return 'mapping';
  }
  return 'unmapped';
}

/**
 * Promote the phase based on Significator polarity state.
 * Called by the scheduler when polarity mode changes.
 */
export function promotePhase(
  model: UserMatrixModel,
  polarityMode: 'Exploring' | 'Crystallizing' | 'Crystallized',
): UserMatrixModel {
  let newPhase: ProfilePhase = model.profilePhase;

  if (polarityMode === 'Crystallized') {
    newPhase = 'crystallized';
  } else if (polarityMode === 'Crystallizing' && model.profilePhase !== 'crystallized') {
    newPhase = 'crystallizing';
  }

  if (newPhase === model.profilePhase) return model;
  return { ...model, profilePhase: newPhase };
}

/**
 * Reset the phase to 'unmapped' when a transformation fires.
 * The new stage brings new territory to probe.
 */
export function resetPhaseAfterTransformation(model: UserMatrixModel): UserMatrixModel {
  return { ...model, profilePhase: 'unmapped' };
}

// ---------------------------------------------------------------------------
// Scheduler integration: priority boost based on profilePhase
// ---------------------------------------------------------------------------

/**
 * Compute a priority boost for a candidate cell based on the profilePhase.
 *
 * - unmapped: boost UNPROBED cells (encourage diverse probing)
 * - mapping: boost cells with high unprocessedCatalystLoad + low encounterCount
 * - crystallizing: boost cells with highest unprocessedCatalystLoad
 * - crystallized: boost cells with specific shadow quadrant matches
 */
export function computeUserMatrixPriority(
  model: UserMatrixModel,
  line: Line,
  stage: Stage,
): number {
  const key = cellKey(line, stage);
  const cell = model.cells[key];

  switch (model.profilePhase) {
    case 'unmapped': {
      // Boost unprobed cells to maximize coverage
      if (!cell || cell.encounterCount === 0) return 0.3;
      return 0;
    }

    case 'mapping': {
      // Boost cells with high unprocessed load that haven't been probed much
      if (!cell) return 0.2;
      const loadScore = Math.max(cell.unprocessedCatalystLoad, cell.unprocessedExperienceLoad);
      const probePenalty = Math.min(cell.encounterCount * 0.05, 0.2);
      return clamp01(loadScore * 0.5 - probePenalty);
    }

    case 'crystallizing': {
      // Focus on highest-load cells
      if (!cell) return 0;
      return clamp01(cell.unprocessedCatalystLoad * 0.7 + cell.unprocessedExperienceLoad * 0.3);
    }

    case 'crystallized': {
      // Targeted: boost cells with active shadow patterns
      if (!cell) return 0;
      const activeShadow = cell.unprocessedCatalystLoad > 0.5 ? 0.5 : 0;
      const activeBypass = cell.unprocessedExperienceLoad > 0.5 ? 0.3 : 0;
      const activeAvoidance = cell.avoidanceSignal > 0.5 ? 0.2 : 0;
      return clamp01(activeShadow + activeBypass + activeAvoidance);
    }

    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createInitialUserMatrixModel(): UserMatrixModel {
  const cells: Record<string, CellMatrixState> = {};
  for (const line of ALL_LINES) {
    for (const stage of ALL_STAGES) {
      cells[cellKey(line, stage)] = {
        line,
        stage,
        unprocessedCatalystLoad: 0,
        unprocessedExperienceLoad: 0,
        avoidanceSignal: 0,
        resistanceSignal: 0,
        encounterCount: 0,
        lastProbedAt: 0,
      };
    }
  }
  return {
    cells,
    profilePhase: 'unmapped',
    probeCoverage: 0,
  };
}

// ---------------------------------------------------------------------------
// Summary for debugging / telemetry (never player-facing)
// ---------------------------------------------------------------------------

export function summarizeUserMatrix(model: UserMatrixModel): {
  readonly phase: ProfilePhase;
  readonly coverage: number;
  readonly topUnprocessedCells: readonly { line: Line; stage: Stage; load: number }[];
  readonly totalAvoidance: number;
  readonly totalResistance: number;
} {
  const cells = Object.values(model.cells);
  const topUnprocessed = cells
    .map(c => ({
      line: c.line,
      stage: c.stage,
      load: Math.max(c.unprocessedCatalystLoad, c.unprocessedExperienceLoad),
    }))
    .filter(c => c.load > 0.1)
    .sort((a, b) => b.load - a.load)
    .slice(0, 5);

  const totalAvoidance = cells.reduce((sum, c) => sum + c.avoidanceSignal, 0);
  const totalResistance = cells.reduce((sum, c) => sum + c.resistanceSignal, 0);

  return {
    phase: model.profilePhase,
    coverage: model.probeCoverage,
    topUnprocessedCells: topUnprocessed,
    totalAvoidance,
    totalResistance,
  };
}
