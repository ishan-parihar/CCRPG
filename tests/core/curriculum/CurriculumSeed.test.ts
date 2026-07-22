/**
 * Tests for CurriculumSeed — registry seeding, lint integration,
 * and conceptCoverage calculation in CCIEngine.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  seedCurriculumRegistry,
  getCurriculumRegistry,
  resetCurriculumRegistry,
  isRegistrySeeded,
} from '../../../src/core/curriculum/index.js';
import {
  lintRegistry,
  lintHolon,
} from '../../../src/core/curriculum/CurriculumLinter.js';
import type { CurriculumHolon } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Helper: create a minimal valid CurriculumHolon for testing
// ---------------------------------------------------------------------------

function makeMinimalHolon(overrides: Partial<CurriculumHolon> = {}): CurriculumHolon {
  const base: CurriculumHolon = {
    id: overrides.id ?? 'test.holon',
    name: overrides.name ?? 'Test Holon',
    description: overrides.description ?? 'A test concept for lint validation purposes.',
    level: overrides.level ?? 'concept',
    parentId: overrides.parentId ?? null,
    childIds: overrides.childIds ?? [],
    phases: {
      observation: { question: 'What do you observe?', assessmentType: 'factual_recall', completionEvidence: 'Identifies patterns' },
      principle: { question: 'What is the principle?', assessmentType: 'concept_explanation', completionEvidence: 'Explains the concept' },
      application: { question: 'How do you apply it?', assessmentType: 'application_problem', completionEvidence: 'Solves problems' },
      integration: { question: 'How does it connect?', assessmentType: 'analogy_mapping', completionEvidence: 'Maps relationships' },
      creation: { question: 'What can you create?', assessmentType: 'project_based', completionEvidence: 'Builds something new' },
    },
    isomorphisms: overrides.isomorphisms ?? [],
    prerequisites: overrides.prerequisites ?? [],
    devMapping: overrides.devMapping ?? {
      primaryLine: 'Cognitive',
      secondaryLines: [],
      stageRange: { min: 'Amber', max: 'Orange' },
    },
    depthMeta: overrides.depthMeta ?? {
      requiredPrerequisiteDepth: 'absent',
      targetDepthRange: { min: 'memorized', max: 'applied' },
      depthProgression: ['memorized', 'comprehended', 'applied'],
    },
    forgettingParams: overrides.forgettingParams ?? {
      initialHalfLifeMs: 86400000,
      halfLifeMultiplier: 2.0,
      maxHalfLifeMs: 31536000000,
    },
    content: overrides.content ?? {
      explanation: 'Test content for linting purposes with enough detail to pass validation checks.',
      examples: ['Example 1', 'Example 2'],
      nonExamples: ['Non-example 1'],
      analogies: [],
      visuals: [],
      practiceProblems: [{ id: 'test.p1', problemText: 'Practice problem', targetDepth: 'memorized' }],
    },
    misconceptions: overrides.misconceptions ?? [],
    depthRubric: overrides.depthRubric ?? {
      conceptId: overrides.id ?? 'test.holon',
      levels: {
        memorized: { evidence: 'Recalls definitions', canDo: [], cannotDo: [], appropriateTasks: ['factual_recall'], threshold: 0.3 },
        comprehended: { evidence: 'Explains concepts', canDo: [], cannotDo: [], appropriateTasks: ['concept_explanation'], threshold: 0.5 },
        applied: { evidence: 'Applies to problems', canDo: [], cannotDo: [], appropriateTasks: ['application_problem'], threshold: 0.65 },
        analyzed: { evidence: 'Analyzes structure', canDo: [], cannotDo: [], appropriateTasks: ['case_study_analysis'], threshold: 0.8 },
        evaluated: { evidence: 'Evaluates quality', canDo: [], cannotDo: [], appropriateTasks: ['peer_review'], threshold: 0.9 },
        transformed: { evidence: 'Transforms thinking', canDo: [], cannotDo: [], appropriateTasks: ['peer_teaching'], threshold: 0.95 },
      },
    },
    supportedModalities: overrides.supportedModalities ?? ['LanguageReflective'],
  };
  return base;
}

// ---------------------------------------------------------------------------
// CurriculumSeed tests
// ---------------------------------------------------------------------------

describe('CurriculumSeed', () => {
  beforeEach(() => {
    resetCurriculumRegistry();
  });

  it('seeds the registry with all curriculum holons', () => {
    const count = seedCurriculumRegistry();
    // 2 branch holons + 3 CS concepts + 3 math concepts = 8 holons
    expect(count).toBe(8);
    expect(getCurriculumRegistry().count()).toBe(8);
  });

  it('marks registry as seeded after first call', () => {
    expect(isRegistrySeeded()).toBe(false);
    seedCurriculumRegistry();
    expect(isRegistrySeeded()).toBe(true);
  });

  it('is idempotent — second call returns same count without re-seeding', () => {
    seedCurriculumRegistry();
    const count2 = seedCurriculumRegistry();
    expect(count2).toBe(8);
    // Registry should still have 8, not 16
    expect(getCurriculumRegistry().count()).toBe(8);
  });

  it('registers CS foundations concepts with correct structure', () => {
    seedCurriculumRegistry();
    const registry = getCurriculumRegistry();

    const logic = registry.get('cs.foundations.logic');
    expect(logic).toBeDefined();
    expect(logic!.name).toBe('Formal Logic');
    expect(logic!.level).toBe('concept');
    expect(logic!.parentId).toBe('cs.foundations');
    expect(logic!.prerequisites).toEqual([]);
    expect(logic!.devMapping.primaryLine).toBe('Cognitive');
  });

  it('registers math foundations concepts with correct structure', () => {
    seedCurriculumRegistry();
    const registry = getCurriculumRegistry();

    const numberTheory = registry.get('math.foundations.number_theory');
    expect(numberTheory).toBeDefined();
    expect(numberTheory!.name).toBe('Number Theory');
    expect(numberTheory!.level).toBe('concept');
    expect(numberTheory!.parentId).toBe('math.foundations');
    expect(numberTheory!.prerequisites).toEqual([]);
    expect(numberTheory!.devMapping.primaryLine).toBe('Cognitive');

    const algebra = registry.get('math.foundations.algebra');
    expect(algebra).toBeDefined();
    expect(algebra!.prerequisites).toContain('math.foundations.number_theory');

    const geometry = registry.get('math.foundations.geometry');
    expect(geometry).toBeDefined();
    expect(geometry!.prerequisites).toContain('math.foundations.algebra');
  });

  it('resets seed flag when registry is reset', () => {
    seedCurriculumRegistry();
    expect(isRegistrySeeded()).toBe(true);
    resetCurriculumRegistry();
    expect(isRegistrySeeded()).toBe(false);
  });

  it('can re-seed after reset', () => {
    seedCurriculumRegistry();
    resetCurriculumRegistry();
    const count = seedCurriculumRegistry();
    expect(count).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// CurriculumRegistry query tests
// ---------------------------------------------------------------------------

describe('CurriculumRegistry queries after seed', () => {
  beforeEach(() => {
    resetCurriculumRegistry();
    seedCurriculumRegistry();
  });

  it('getBySubject returns holons for a subject', () => {
    const csHolons = getCurriculumRegistry().getBySubject('cs.foundations');
    // Branch + 3 concepts = 4 holons under cs.foundations subject
    expect(csHolons.length).toBe(4);
  });

  it('getByLevel returns concept holons', () => {
    const concepts = getCurriculumRegistry().getByLevel('concept');
    expect(concepts.length).toBe(6); // 3 CS + 3 math concepts
  });

  it('getByLevel returns branch holons', () => {
    const branches = getCurriculumRegistry().getByLevel('branch');
    expect(branches.length).toBe(2); // cs.foundations + math.foundations
  });

  it('getPrerequisites returns prereq holons', () => {
    const registry = getCurriculumRegistry();
    const setsPrereqs = registry.getPrerequisites('cs.foundations.sets');
    expect(setsPrereqs.length).toBe(1);
    expect(setsPrereqs[0]!.id).toBe('cs.foundations.logic');
  });

  it('getDependents returns dependent holons', () => {
    const registry = getCurriculumRegistry();
    const logicDependents = registry.getDependents('cs.foundations.logic');
    // sets and recursion both depend on logic
    expect(logicDependents.length).toBeGreaterThanOrEqual(1);
    const ids = logicDependents.map((h: CurriculumHolon) => h.id);
    expect(ids).toContain('cs.foundations.sets');
  });

  it('conceptIds returns all registered IDs', () => {
    const ids = getCurriculumRegistry().conceptIds();
    expect(ids.length).toBe(8); // 2 branches + 6 concepts
    expect(ids).toContain('cs.foundations');
    expect(ids).toContain('cs.foundations.logic');
    expect(ids).toContain('math.foundations');
    expect(ids).toContain('math.foundations.number_theory');
  });
});

// ---------------------------------------------------------------------------
// Lint integration tests
// ---------------------------------------------------------------------------

describe('CurriculumLinter on seeded data', () => {
  beforeEach(() => {
    resetCurriculumRegistry();
    seedCurriculumRegistry();
  });

  it('lintRegistry finds no errors on well-formed seed data', () => {
    const result = lintRegistry(getCurriculumRegistry());
    expect(result.overallPassed).toBe(true);
    expect(result.totalErrors).toBe(0);
  });

  it('lintRegistry reports errors for broken prerequisites', () => {
    const registry = getCurriculumRegistry();
    // Inject a holon with a missing prerequisite
    const broken = makeMinimalHolon({
      id: 'cs.test.broken',
      prerequisites: ['cs.nonexistent.concept'],
    });
    registry.register(broken);

    const result = lintRegistry(registry);
    expect(result.overallPassed).toBe(false);
    expect(result.totalErrors).toBeGreaterThan(0);

    // Check that the S-1 orphan error is reported
    const allErrors = [
      ...result.graphIssues.filter((i) => i.severity === 'error'),
      ...result.holonReports.flatMap((r) => r.errors),
    ];
    const orphanError = allErrors.find(
      (e) => e.checkId === 'S-1' && e.location === 'cs.test.broken',
    );
    expect(orphanError).toBeDefined();
  });

  it('lintHolon passes on a well-formed holon', () => {
    const registry = getCurriculumRegistry();
    const logic = registry.get('cs.foundations.logic')!;
    const report = lintHolon(logic, registry);
    expect(report.passed).toBe(true);
    expect(report.errors.length).toBe(0);
    expect(report.pedagogicalQuality).toBeGreaterThan(0.5);
    expect(report.developmentalIntegration).toBeGreaterThan(0.5);
  });
});
