/**
 * MetaCognitiveProbe — agentic loop tool for assessing curriculum effectiveness.
 *
 * This is the top-level meta-cognitive tool that AI agents can call to verify
 * that the curriculum system is working as intended. It combines:
 * - ProgressionValidator (is the player advancing?)
 * - RubricCalibrator (are the rubrics well-calibrated?)
 * - Curriculum linter (is the content structurally sound?)
 *
 * The agentic loop can call probeCurriculum() at session end or periodically
 * to get a comprehensive health check of the curriculum system.
 *
 * Pure functions: data in, probe results out. No side effects.
 */
import type { KnowledgeState } from './types.js';
import type { CurriculumRegistry } from './CurriculumRegistry.js';
import { auditProgression, type ProgressionAudit } from './ProgressionValidator.js';
import { calibrateAllRubrics, type RubricCalibrationReport } from './RubricCalibrator.js';
import { lintRegistry } from './CurriculumLinter.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetaCognitiveProbeResult {
  readonly timestamp: number;
  readonly progression: ProgressionAudit;
  readonly rubricCalibration: readonly RubricCalibrationReport[];
  readonly contentLint: {
    readonly totalErrors: number;
    readonly totalWarnings: number;
    readonly passed: boolean;
  };
  readonly overallHealth: number; // 0.0 to 1.0
  readonly recommendations: readonly string[];
  readonly shouldIntervene: boolean;
  readonly interventionReason?: string;
}

// ---------------------------------------------------------------------------
// Core Probe
// ---------------------------------------------------------------------------

/**
 * Run a full meta-cognitive probe on the curriculum system.
 *
 * This is the main entry point for AI agents to assess curriculum health.
 * It combines progression analysis, rubric calibration, and content linting
 * into a single comprehensive report.
 *
 * @param knowledge - The player's current KnowledgeState
 * @param registry - The CurriculumRegistry (for rubric lookup and linting)
 * @param now - Current timestamp
 * @returns MetaCognitiveProbeResult with health scores and recommendations
 */
export function probeCurriculum(
  knowledge: KnowledgeState,
  registry: CurriculumRegistry,
  now: number,
): MetaCognitiveProbeResult {
  // 1. Progression audit
  const progression = auditProgression(knowledge, registry, now);

  // 2. Rubric calibration
  const rubricCalibration = calibrateAllRubrics(
    knowledge,
    (conceptId) => registry.get(conceptId)?.depthRubric,
  );

  // 3. Content lint
  const lintResult = lintRegistry(registry);

  // 4. Compute overall health
  const progressionWeight = 0.4;
  const rubricWeight = 0.3;
  const contentWeight = 0.3;

  const rubricQuality = rubricCalibration.length > 0
    ? rubricCalibration.reduce((sum, r) => sum + r.overallQuality, 0) / rubricCalibration.length
    : 1.0;

  const contentHealth = lintResult.overallPassed ? 1.0 : Math.max(0.3, 1 - lintResult.totalErrors * 0.1);

  const overallHealth =
    progression.overallHealth * progressionWeight +
    rubricQuality * rubricWeight +
    contentHealth * contentWeight;

  // 5. Generate recommendations
  const recommendations: string[] = [];

  if (progression.criticalCount > 0) {
    recommendations.push(
      `${progression.criticalCount} concept(s) with critical progression issues — investigate depth demotion or stuck states`,
    );
  }

  if (progression.warningCount > 3) {
    recommendations.push(
      `${progression.warningCount} concepts with warnings — consider reviewing retention strategies`,
    );
  }

  const rubricIssues = rubricCalibration.flatMap(r => r.issues);
  const rubricErrors = rubricIssues.filter(i => i.severity === 'error');
  if (rubricErrors.length > 0) {
    recommendations.push(
      `${rubricErrors.length} rubric calibration error(s) — fix threshold monotonicity or discrimination issues`,
    );
  }

  if (!lintResult.overallPassed) {
    recommendations.push(
      `Content lint failed with ${lintResult.totalErrors} error(s) — fix structural or pedagogical issues`,
    );
  }

  if (knowledge.conceptStates.size === 0) {
    recommendations.push('No concepts encountered yet — curriculum encounters may not be wired correctly');
  }

  // 6. Determine if intervention is needed
  const shouldIntervene = progression.criticalCount > 0 || rubricErrors.length > 0;
  const interventionReason = shouldIntervene
    ? [
        progression.criticalCount > 0 ? `${progression.criticalCount} critical progression issues` : null,
        rubricErrors.length > 0 ? `${rubricErrors.length} rubric calibration errors` : null,
      ].filter(Boolean).join(' and ')
    : undefined;

  return {
    timestamp: now,
    progression,
    rubricCalibration,
    contentLint: {
      totalErrors: lintResult.totalErrors,
      totalWarnings: lintResult.totalWarnings,
      passed: lintResult.overallPassed,
    },
    overallHealth,
    recommendations,
    shouldIntervene,
    interventionReason,
  };
}

/**
 * Format a probe result as a human-readable summary for the agentic loop.
 */
export function formatProbeSummary(result: MetaCognitiveProbeResult): string {
  const lines: string[] = [];
  lines.push(`=== Curriculum Meta-Cognitive Probe ===`);
  lines.push(`Overall Health: ${(result.overallHealth * 100).toFixed(0)}%`);
  lines.push(`Should Intervene: ${result.shouldIntervene ? 'YES' : 'no'}`);
  if (result.interventionReason) {
    lines.push(`Intervention Reason: ${result.interventionReason}`);
  }
  lines.push('');
  lines.push(`--- Progression ---`);
  lines.push(`Concepts Analyzed: ${result.progression.conceptsAnalyzed}`);
  lines.push(`Healthy: ${result.progression.healthyCount}`);
  lines.push(`Warnings: ${result.progression.warningCount}`);
  lines.push(`Critical: ${result.progression.criticalCount}`);
  lines.push(`Summary: ${result.progression.summary}`);
  lines.push('');
  lines.push(`--- Rubric Calibration ---`);
  if (result.rubricCalibration.length > 0) {
    const avgQuality = result.rubricCalibration.reduce((s, r) => s + r.overallQuality, 0) / result.rubricCalibration.length;
    const totalIssues = result.rubricCalibration.reduce((s, r) => s + r.issues.length, 0);
    lines.push(`Rubrics Calibrated: ${result.rubricCalibration.length}`);
    lines.push(`Average Quality: ${(avgQuality * 100).toFixed(0)}%`);
    lines.push(`Total Issues: ${totalIssues}`);
  } else {
    lines.push('No rubrics calibrated (no concepts encountered)');
  }
  lines.push('');
  lines.push(`--- Content Lint ---`);
  lines.push(`Passed: ${result.contentLint.passed}`);
  lines.push(`Errors: ${result.contentLint.totalErrors}`);
  lines.push(`Warnings: ${result.contentLint.totalWarnings}`);
  lines.push('');
  if (result.recommendations.length > 0) {
    lines.push('--- Recommendations ---');
    for (const rec of result.recommendations) {
      lines.push(`• ${rec}`);
    }
  }
  return lines.join('\n');
}
