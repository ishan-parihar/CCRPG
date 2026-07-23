/**
 * CurriculumLinter — validates curriculum holons for structural integrity,
 * pedagogical quality, and developmental alignment.
 * Spec: docs/foundations/32-curriculum-linter.md
 *
 * Pure function: registry in, linter report out. No side effects.
 */
import type {
  CurriculumHolon,
  LinterIssue,
  CurriculumLinterReport,
} from './types.js';
import { depthOrdinal } from './types.js';
import type { CurriculumRegistry } from './CurriculumRegistry.js';

// ---------------------------------------------------------------------------
// Linter checks
// ---------------------------------------------------------------------------

type LinterCheck = (
  holon: CurriculumHolon,
  registry: CurriculumRegistry,
) => LinterIssue[];

// ---------------------------------------------------------------------------
// Structural checks (foundations/32 §1)
// ---------------------------------------------------------------------------

/**
 * S-1: Orphan detection — concept has prerequisites that don't exist in registry.
 */
const checkPrerequisiteOrphans: LinterCheck = (holon, registry) => {
  const issues: LinterIssue[] = [];
  for (const prereqId of holon.prerequisites) {
    if (!registry.has(prereqId)) {
      issues.push({
        checkId: 'S-1',
        category: 'structural',
        severity: 'error',
        message: `Prerequisite "${prereqId}" not found in registry`,
        suggestion: `Add the missing prerequisite holon or remove the reference`,
        location: holon.id,
      });
    }
  }
  // Phase 6: Cross-branch prerequisite orphan detection
  if (holon.crossBranchPrerequisites) {
    for (const cbPrereqId of holon.crossBranchPrerequisites) {
      if (!registry.has(cbPrereqId)) {
        issues.push({
          checkId: 'S-1',
          category: 'structural',
          severity: 'error',
          message: `Cross-branch prerequisite "${cbPrereqId}" not found in registry`,
          suggestion: `Add the missing prerequisite holon or remove the cross-branch reference`,
          location: holon.id,
        });
      }
    }
  }
  return issues;
};

/**
 * S-2: Parent existence — concept references a parent that doesn't exist.
 */
const checkParentExists: LinterCheck = (holon, registry) => {
  if (holon.parentId === null) return [];
  if (!registry.has(holon.parentId)) {
    return [{
      checkId: 'S-2',
      category: 'structural',
      severity: 'error',
      message: `Parent "${holon.parentId}" not found in registry`,
      suggestion: `Add the parent holon or set parentId to null`,
      location: holon.id,
    }];
  }
  return [];
};

/**
 * S-3: Child existence — concept references children that don't exist.
 */
const checkChildrenExist: LinterCheck = (holon, registry) => {
  const issues: LinterIssue[] = [];
  for (const childId of holon.childIds) {
    if (!registry.has(childId)) {
      issues.push({
        checkId: 'S-3',
        category: 'structural',
        severity: 'warning',
        message: `Child "${childId}" not found in registry`,
        suggestion: `Add the child holon or remove the reference`,
        location: holon.id,
      });
    }
  }
  return issues;
};

/**
 * S-4: Isomorphism target existence — isomorphism references a concept not in registry.
 */
const checkIsomorphismTargets: LinterCheck = (holon, registry) => {
  const issues: LinterIssue[] = [];
  for (const iso of holon.isomorphisms) {
    if (!registry.has(iso.targetConceptId)) {
      issues.push({
        checkId: 'S-4',
        category: 'structural',
        severity: 'warning',
        message: `Isomorphism target "${iso.targetConceptId}" not found in registry`,
        suggestion: `Add the target holon or remove the isomorphism`,
        location: holon.id,
      });
    }
  }
  return issues;
};

/**
 * S-5: Level consistency — holon level is appropriate for its position.
 * Phase 2B: Extended to support academic hierarchy levels.
 * Top-level holons (program, branch) → parentId should be null.
 * Leaf-level holons (concept, instance, lesson) → should have a parent.
 */
const TOP_LEVELS = new Set(['program', 'branch']);
const LEAF_LEVELS = new Set(['concept', 'instance', 'lesson']);

const checkLevelConsistency: LinterCheck = (holon) => {
  const issues: LinterIssue[] = [];
  if (TOP_LEVELS.has(holon.level) && holon.parentId !== null) {
    issues.push({
      checkId: 'S-5',
      category: 'structural',
      severity: 'warning',
      message: `${holon.level}-level holon "${holon.id}" has a parent — top-level holons are typically root nodes`,
      suggestion: `Consider setting parentId to null for ${holon.level} holons`,
      location: holon.id,
    });
  }
  if (LEAF_LEVELS.has(holon.level) && holon.parentId === null) {
    issues.push({
      checkId: 'S-5',
      category: 'structural',
      severity: 'warning',
      message: `${holon.level}-level holon "${holon.id}" has no parent`,
      suggestion: `Add a parent reference to maintain the holarchy`,
      location: holon.id,
    });
  }
  return issues;
};

// ---------------------------------------------------------------------------
// Pedagogical checks (foundations/32 §2)
// ---------------------------------------------------------------------------

/**
 * P-1: Phase completeness — all five phases must have content.
 */
const checkPhaseCompleteness: LinterCheck = (holon) => {
  const issues: LinterIssue[] = [];
  const phases = ['observation', 'principle', 'application', 'integration', 'creation'] as const;
  for (const phase of phases) {
    const p = holon.phases[phase];
    if (!p.question || p.question.trim().length === 0) {
      issues.push({
        checkId: 'P-1',
        category: 'pedagogical',
        severity: 'error',
        message: `Phase "${phase}" has no guiding question`,
        suggestion: `Add a question that drives exploration of this phase`,
        location: `${holon.id}.phases.${phase}`,
      });
    }
    if (!p.completionEvidence || p.completionEvidence.trim().length === 0) {
      issues.push({
        checkId: 'P-1',
        category: 'pedagogical',
        severity: 'warning',
        message: `Phase "${phase}" has no completion evidence`,
        suggestion: `Define what evidence indicates this phase is complete`,
        location: `${holon.id}.phases.${phase}`,
      });
    }
  }
  return issues;
};

/**
 * P-2: Content richness — concept must have explanation, examples, and non-examples.
 */
const checkContentRichness: LinterCheck = (holon) => {
  const issues: LinterIssue[] = [];
  const c = holon.content;
  if (!c.explanation || c.explanation.trim().length < 50) {
    issues.push({
      checkId: 'P-2',
      category: 'pedagogical',
      severity: 'error',
      message: `Content explanation is missing or too brief (<50 chars)`,
      suggestion: `Provide a substantive explanation of the concept`,
      location: `${holon.id}.content.explanation`,
    });
  }
  if (c.examples.length === 0) {
    issues.push({
      checkId: 'P-2',
      category: 'pedagogical',
      severity: 'error',
      message: `No examples provided`,
      suggestion: `Add at least 2 examples to ground the concept`,
      location: `${holon.id}.content.examples`,
    });
  }
  if (c.nonExamples.length === 0) {
    issues.push({
      checkId: 'P-2',
      category: 'pedagogical',
      severity: 'warning',
      message: `No non-examples provided`,
      suggestion: `Add non-examples to clarify boundaries of the concept`,
      location: `${holon.id}.content.nonExamples`,
    });
  }
  return issues;
};

/**
 * P-3: Practice problems — each concept should have at least one practice problem.
 */
const checkPracticeProblems: LinterCheck = (holon) => {
  if (holon.content.practiceProblems.length === 0) {
    return [{
      checkId: 'P-3',
      category: 'pedagogical',
      severity: 'warning',
      message: `No practice problems provided`,
      suggestion: `Add practice problems to enable active learning`,
      location: `${holon.id}.content.practiceProblems`,
    }];
  }
  return [];
};

/**
 * P-4: Misconception coverage — concepts at higher depth targets should have misconceptions.
 */
const checkMisconceptionCoverage: LinterCheck = (holon) => {
  const maxTargetOrdinal = depthOrdinal(holon.depthMeta.targetDepthRange.max);
  if (maxTargetOrdinal >= 4 && holon.misconceptions.length === 0) {
    return [{
      checkId: 'P-4',
      category: 'pedagogical',
      severity: 'info',
      message: `Concept targets ${holon.depthMeta.targetDepthRange.max} depth but has no misconceptions`,
      suggestion: `Add misconception entries for deeper mastery levels`,
      location: holon.id,
    }];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Developmental checks (foundations/32 §3)
// ---------------------------------------------------------------------------

/**
 * D-1: Depth progression validity — depth progression must be monotonically increasing.
 */
const checkDepthProgression: LinterCheck = (holon) => {
  const issues: LinterIssue[] = [];
  const prog = holon.depthMeta.depthProgression;
  for (let i = 1; i < prog.length; i++) {
    if (depthOrdinal(prog[i]!) <= depthOrdinal(prog[i - 1]!)) {
      issues.push({
        checkId: 'D-1',
        category: 'developmental',
        severity: 'error',
        message: `Depth progression is not monotonically increasing at index ${i}: "${prog[i - 1]}" → "${prog[i]}"`,
        suggestion: `Ensure each depth level is strictly deeper than the previous`,
        location: `${holon.id}.depthMeta.depthProgression`,
      });
    }
  }
  return issues;
};

/**
 * D-2: Target range validity — target min must be <= target max.
 */
const checkTargetRange: LinterCheck = (holon) => {
  const minOrd = depthOrdinal(holon.depthMeta.targetDepthRange.min);
  const maxOrd = depthOrdinal(holon.depthMeta.targetDepthRange.max);
  if (minOrd > maxOrd) {
    return [{
      checkId: 'D-2',
      category: 'developmental',
      severity: 'error',
      message: `Target depth range min ("${holon.depthMeta.targetDepthRange.min}") > max ("${holon.depthMeta.targetDepthRange.max}")`,
      suggestion: `Ensure target min is at or below target max`,
      location: `${holon.id}.depthMeta.targetDepthRange`,
    }];
  }
  return [];
};

/**
 * D-3: Prerequisite depth requirement — required prerequisite depth should be reachable.
 */
const checkPrerequisiteDepth: LinterCheck = (holon) => {
  const requiredOrd = depthOrdinal(holon.depthMeta.requiredPrerequisiteDepth);
  const minOrd = depthOrdinal(holon.depthMeta.targetDepthRange.min);
  if (requiredOrd >= minOrd) {
    return [{
      checkId: 'D-3',
      category: 'developmental',
      severity: 'warning',
      message: `Required prerequisite depth ("${holon.depthMeta.requiredPrerequisiteDepth}") is at or above target min ("${holon.depthMeta.targetDepthRange.min}")`,
      suggestion: `The prerequisite depth should be below the minimum target depth`,
      location: `${holon.id}.depthMeta`,
    }];
  }
  return [];
};

/**
 * D-4: Modality alignment — at least one modality should be supported.
 */
const checkModalityAlignment: LinterCheck = (holon) => {
  if (holon.supportedModalities.length === 0) {
    return [{
      checkId: 'D-4',
      category: 'developmental',
      severity: 'error',
      message: `No modalities supported`,
      suggestion: `Add at least one supported modality for content delivery`,
      location: `${holon.id}.supportedModalities`,
    }];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Epistemic checks (foundations/32 §4)
// ---------------------------------------------------------------------------

/**
 * E-1: Description quality — description should be substantive.
 */
const checkDescriptionQuality: LinterCheck = (holon) => {
  if (!holon.description || holon.description.trim().length < 30) {
    return [{
      checkId: 'E-1',
      category: 'epistemic',
      severity: 'warning',
      message: `Description is missing or too brief (<30 chars)`,
      suggestion: `Provide a substantive description of the concept`,
      location: `${holon.id}.description`,
    }];
  }
  return [];
};

/**
 * E-2: Rubric completeness — depth rubric should cover all target levels.
 */
const checkRubricCompleteness: LinterCheck = (holon) => {
  const issues: LinterIssue[] = [];
  const rubric = holon.depthRubric;
  const levels = ['memorized', 'comprehended', 'applied', 'analyzed', 'evaluated', 'transformed'] as const;
  for (const level of levels) {
    const entry = rubric.levels[level];
    if (!entry || !entry.evidence || entry.evidence.trim().length === 0) {
      issues.push({
        checkId: 'E-2',
        category: 'epistemic',
        severity: 'warning',
        message: `Depth rubric level "${level}" has no evidence description`,
        suggestion: `Add evidence criteria for this depth level`,
        location: `${holon.id}.depthRubric.levels.${level}`,
      });
    }
  }
  return issues;
};

// ---------------------------------------------------------------------------
// Cycle detection (graph-level)
// ---------------------------------------------------------------------------

/**
 * Detect prerequisite cycles across the entire registry.
 * Returns issues for each holon involved in a cycle.
 */
function detectPrerequisiteCycles(registry: CurriculumRegistry): LinterIssue[] {
  const issues: LinterIssue[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string, path: string[]): void {
    if (inStack.has(id)) {
      // Found a cycle — report it
      const cycleStart = path.indexOf(id);
      const cycle = path.slice(cycleStart).concat(id);
      for (const nodeId of cycle) {
        issues.push({
          checkId: 'S-CYCLE',
          category: 'structural',
          severity: 'error',
          message: `Prerequisite cycle detected: ${cycle.join(' → ')}`,
          suggestion: `Break the cycle by removing one prerequisite reference`,
          location: nodeId,
        });
      }
      return;
    }
    if (visited.has(id)) return;

    visited.add(id);
    inStack.add(id);
    path.push(id);

    const holon = registry.get(id);
    if (holon) {
      for (const prereqId of holon.prerequisites) {
        dfs(prereqId, path);
      }
    }

    path.pop();
    inStack.delete(id);
  }

  for (const holon of registry.getAll()) {
    dfs(holon.id, []);
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/** All structural checks */
const STRUCTURAL_CHECKS: LinterCheck[] = [
  checkPrerequisiteOrphans,
  checkParentExists,
  checkChildrenExist,
  checkIsomorphismTargets,
  checkLevelConsistency,
];

/** All pedagogical checks */
const PEDAGOGICAL_CHECKS: LinterCheck[] = [
  checkPhaseCompleteness,
  checkContentRichness,
  checkPracticeProblems,
  checkMisconceptionCoverage,
];

/** All developmental checks */
const DEVELOPMENTAL_CHECKS: LinterCheck[] = [
  checkDepthProgression,
  checkTargetRange,
  checkPrerequisiteDepth,
  checkModalityAlignment,
];

/** All epistemic checks */
const EPISTEMIC_CHECKS: LinterCheck[] = [
  checkDescriptionQuality,
  checkRubricCompleteness,
];

/**
 * Lint a single curriculum holon against all checks.
 *
 * @param holon - The holon to lint
 * @param registry - The full curriculum registry (for cross-reference checks)
 * @returns CurriculumLinterReport with all issues found
 */
export function lintHolon(
  holon: CurriculumHolon,
  registry: CurriculumRegistry,
): CurriculumLinterReport {
  const allChecks = [
    ...STRUCTURAL_CHECKS,
    ...PEDAGOGICAL_CHECKS,
    ...DEVELOPMENTAL_CHECKS,
    ...EPISTEMIC_CHECKS,
  ];

  const allIssues: LinterIssue[] = [];
  let checksPassed = 0;

  for (const check of allChecks) {
    const issues = check(holon, registry);
    if (issues.length === 0) {
      checksPassed++;
    }
    allIssues.push(...issues);
  }

  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const infos = allIssues.filter(i => i.severity === 'info');

  // Compute pedagogical quality score (0-1)
  const pedagogicalChecks = allChecks.length - STRUCTURAL_CHECKS.length - DEVELOPMENTAL_CHECKS.length - EPISTEMIC_CHECKS.length;
  const pedagogicalIssues = allIssues.filter(i =>
    i.category === 'pedagogical' || i.category === 'epistemic',
  );
  const pedagogicalQuality = pedagogicalChecks > 0
    ? Math.max(0, 1 - (pedagogicalIssues.length * 0.15))
    : 1;

  // Compute developmental integration score (0-1)
  const devIssues = allIssues.filter(i => i.category === 'developmental');
  const devChecks = DEVELOPMENTAL_CHECKS.length;
  const developmentalIntegration = devChecks > 0
    ? Math.max(0, 1 - (devIssues.length * 0.2))
    : 1;

  return {
    moduleId: holon.id,
    timestamp: Date.now(),
    passed: errors.length === 0,
    errors,
    warnings,
    infos,
    summary: {
      totalChecks: allChecks.length,
      passed: checksPassed,
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
    },
    pedagogicalQuality,
    developmentalIntegration,
  };
}

/**
 * Lint an entire curriculum registry.
 * Returns a report for each holon plus a graph-level report.
 */
export function lintRegistry(
  registry: CurriculumRegistry,
): {
  readonly holonReports: readonly CurriculumLinterReport[];
  readonly graphIssues: readonly LinterIssue[];
  readonly overallPassed: boolean;
  readonly totalErrors: number;
  readonly totalWarnings: number;
} {
  const holonReports: CurriculumLinterReport[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const holon of registry.getAll()) {
    const report = lintHolon(holon, registry);
    holonReports.push(report);
    totalErrors += report.errors.length;
    totalWarnings += report.warnings.length;
  }

  // Graph-level checks
  const graphIssues = detectPrerequisiteCycles(registry);
  totalErrors += graphIssues.filter(i => i.severity === 'error').length;

  return {
    holonReports,
    graphIssues,
    overallPassed: totalErrors === 0,
    totalErrors,
    totalWarnings,
  };
}
