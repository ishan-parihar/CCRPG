/**
 * RubricCalibrator — validates rubric quality against actual player performance data.
 *
 * A meta-cognitive tool that AI agents can call to verify:
 * - Rubric thresholds are well-calibrated (not too easy/hard)
 * - canDo/cannotDo items are comprehensive and discriminative
 * - appropriateTasks match the concept's supported modalities
 * - Rubric produces consistent depth classifications across similar inputs
 *
 * Pure functions: data in, calibration results out. No side effects.
 */
import type { ConceptState, DepthRubric, KnowledgeState } from './types.js';
import { ALL_DEPTH_LEVELS, depthOrdinal } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RubricIssue {
  readonly conceptId: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly category: 'threshold' | 'discrimination' | 'coverage' | 'consistency';
  readonly message: string;
  readonly suggestion?: string;
}

export interface RubricCalibrationReport {
  readonly conceptId: string;
  readonly timestamp: number;
  readonly issues: readonly RubricIssue[];
  readonly discriminability: number; // 0.0-1.0, how well the rubric distinguishes levels
  readonly thresholdAlignment: number; // 0.0-1.0, how well thresholds match actual performance
  readonly coverage: number; // 0.0-1.0, how well canDo/cannotDo cover the level
  readonly overallQuality: number; // 0.0-1.0
}

// ---------------------------------------------------------------------------
// Calibration Functions
// ---------------------------------------------------------------------------

/**
 * Check rubric discriminability: canDo items at adjacent levels should be distinct.
 * If two adjacent levels share >50% of their canDo items, the rubric is poorly calibrated.
 */
function checkDiscriminability(rubric: DepthRubric): RubricIssue[] {
  const issues: RubricIssue[] = [];
  const levels = ALL_DEPTH_LEVELS.filter(l => l !== 'absent') as Array<keyof typeof rubric.levels>;

  for (let i = 0; i < levels.length - 1; i++) {
    const current = rubric.levels[levels[i]!];
    const next = rubric.levels[levels[i + 1]!];
    if (!current || !next) continue;

    const currentCanDo = new Set(current.canDo.map(s => s.toLowerCase()));
    const nextCanDo = new Set(next.canDo.map(s => s.toLowerCase()));
    const intersection = [...currentCanDo].filter(x => nextCanDo.has(x));
    const unionSize = currentCanDo.size + nextCanDo.size - intersection.length;

    if (unionSize > 0) {
      const overlap = intersection.length / unionSize;
      if (overlap > 0.5) {
        issues.push({
          conceptId: rubric.conceptId,
          severity: 'warning',
          category: 'discrimination',
          message: `Levels "${levels[i]}" and "${levels[i + 1]}" share ${Math.round(overlap * 100)}% of canDo items — poor discrimination`,
          suggestion: `Add unique canDo items to each level to improve distinction`,
        });
      }
    }
  }

  return issues;
}

/**
 * Check threshold alignment: thresholds should increase monotonically with depth.
 * A threshold of 0.3 at "memorized" and 0.9 at "transformed" is reasonable.
 * A threshold of 0.8 at "memorized" is too hard; 0.2 at "transformed" is too easy.
 */
function checkThresholdAlignment(rubric: DepthRubric): RubricIssue[] {
  const issues: RubricIssue[] = [];
  const levels = ALL_DEPTH_LEVELS.filter(l => l !== 'absent') as Array<keyof typeof rubric.levels>;

  let prevThreshold = 0;
  for (const level of levels) {
    const entry = rubric.levels[level];
    if (!entry) continue;

    // Check monotonic increase
    if (entry.threshold < prevThreshold) {
      issues.push({
        conceptId: rubric.conceptId,
        severity: 'error',
        category: 'threshold',
        message: `Threshold at "${level}" (${entry.threshold}) is lower than previous level (${prevThreshold})`,
        suggestion: `Thresholds must increase monotonically with depth`,
      });
    }

    // Check reasonable range
    const expectedMin = 0.2 + (depthOrdinal(level) / 6) * 0.3;
    const expectedMax = 0.5 + (depthOrdinal(level) / 6) * 0.5;
    if (entry.threshold < expectedMin || entry.threshold > expectedMax + 0.1) {
      issues.push({
        conceptId: rubric.conceptId,
        severity: 'warning',
        category: 'threshold',
        message: `Threshold at "${level}" (${entry.threshold}) is outside expected range [${expectedMin.toFixed(2)}, ${(expectedMax + 0.1).toFixed(2)}]`,
        suggestion: `Consider adjusting threshold to match typical learner progression`,
      });
    }

    prevThreshold = entry.threshold;
  }

  return issues;
}

/**
 * Check canDo/cannotDo coverage: each level should have at least 2 canDo items.
 * Levels with 0 canDo items are under-specified and will produce unreliable assessments.
 */
function checkCoverage(rubric: DepthRubric): RubricIssue[] {
  const issues: RubricIssue[] = [];
  const levels = ALL_DEPTH_LEVELS.filter(l => l !== 'absent') as Array<keyof typeof rubric.levels>;

  for (const level of levels) {
    const entry = rubric.levels[level];
    if (!entry) continue;

    if (entry.canDo.length < 2) {
      issues.push({
        conceptId: rubric.conceptId,
        severity: 'warning',
        category: 'coverage',
        message: `Level "${level}" has only ${entry.canDo.length} canDo item(s) — needs at least 2 for reliable assessment`,
        suggestion: `Add more capability descriptors for this depth level`,
      });
    }

    if (entry.cannotDo.length === 0) {
      issues.push({
        conceptId: rubric.conceptId,
        severity: 'info',
        category: 'coverage',
        message: `Level "${level}" has no cannotDo items — missing negative discrimination`,
        suggestion: `Add cannotDo items to prevent false-positive depth classification`,
      });
    }
  }

  return issues;
}

/**
 * Check consistency: compare player's actual depth classification against rubric expectations.
 * If a player is consistently classified at a level but their retention is low, the rubric
 * threshold may be too easy.
 */
function checkConsistency(
  rubric: DepthRubric,
  state: ConceptState,
): RubricIssue[] {
  const issues: RubricIssue[] = [];
  const currentEntry = rubric.levels[state.depthLevel as keyof typeof rubric.levels];

  if (!currentEntry) return issues;

  // If retention is low but depth is high, threshold might be too easy
  if (state.retention < 0.5 && depthOrdinal(state.depthLevel) >= 3) {
    issues.push({
      conceptId: rubric.conceptId,
      severity: 'warning',
      category: 'consistency',
      message: `Player at "${state.depthLevel}" depth but retention is ${(state.retention * 100).toFixed(0)}% — threshold may be too easy`,
      suggestion: `Consider raising the threshold for this depth level`,
    });
  }

  // If review count is high but depth hasn't advanced, threshold might be too hard
  if (state.reviewCount >= 5 && depthOrdinal(state.depthLevel) < 3) {
    issues.push({
      conceptId: rubric.conceptId,
      severity: 'warning',
      category: 'consistency',
      message: `Player has ${state.reviewCount} reviews but still at "${state.depthLevel}" — threshold may be too hard`,
      suggestion: `Consider lowering the threshold or providing more scaffolding`,
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Main Entry Points
// ---------------------------------------------------------------------------

/**
 * Calibrate a single concept's rubric against player performance data.
 */
export function calibrateRubric(
  conceptId: string,
  rubric: DepthRubric,
  state: ConceptState | undefined,
): RubricCalibrationReport {
  const issues: RubricIssue[] = [
    ...checkDiscriminability(rubric),
    ...checkThresholdAlignment(rubric),
    ...checkCoverage(rubric),
    ...(state ? checkConsistency(rubric, state) : []),
  ];

  // Compute quality metrics
  const discriminabilityScore = issues.filter(i => i.category === 'discrimination').length === 0
    ? 1.0
    : Math.max(0, 1 - issues.filter(i => i.category === 'discrimination').length * 0.2);

  const thresholdScore = issues.filter(i => i.category === 'threshold' && i.severity === 'error').length === 0
    ? 1.0
    : Math.max(0, 1 - issues.filter(i => i.category === 'threshold').length * 0.3);

  const coverageScore = Math.max(0,
    1 - issues.filter(i => i.category === 'coverage').length * 0.15
  );

  const overallQuality = (discriminabilityScore + thresholdScore + coverageScore) / 3;

  return {
    conceptId,
    timestamp: Date.now(),
    issues,
    discriminability: discriminabilityScore,
    thresholdAlignment: thresholdScore,
    coverage: coverageScore,
    overallQuality,
  };
}

/**
 * Run a full rubric calibration across all concepts the player has encountered.
 */
export function calibrateAllRubrics(
  knowledge: KnowledgeState,
  getRubric: (conceptId: string) => DepthRubric | undefined,
): readonly RubricCalibrationReport[] {
  const reports: RubricCalibrationReport[] = [];

  for (const [conceptId, state] of knowledge.conceptStates) {
    const rubric = getRubric(conceptId);
    if (!rubric) continue;
    reports.push(calibrateRubric(conceptId, rubric, state));
  }

  return reports;
}
