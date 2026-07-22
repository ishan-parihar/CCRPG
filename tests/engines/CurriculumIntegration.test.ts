/**
 * Tests for curriculum integration points:
 * - selectStudyTheme / computeCurriculumSlots (AutoModeStrategy.ts)
 * - generateCurriculumCandidates (CandidateGeneration.ts)
 */
import { describe, it, expect } from 'vitest';
import { selectStudyTheme, computeCurriculumSlots } from '../../src/core/engines/AutoModeStrategy.js';
import { generateCurriculumCandidates } from '../../src/core/engines/CandidateGeneration.js';
import type { CCIScore } from '../../src/core/engines/CCIEngine.js';
import type { KnowledgeState } from '../../src/core/curriculum/types.js';
import type { SessionContext } from '../../src/core/engines/PriorityComputation.js';
import { CurriculumRegistry } from '../../src/core/curriculum/CurriculumRegistry.js';
import type { CurriculumHolon } from '../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCCI(khOverrides: Partial<CCIScore['knowledgeHealth']> = {}): CCIScore {
  const knowledgeHealth = {
    conceptCoverage: 0,
    averageDepth: 0,
    retentionHealth: 1.0,
    integrationDensity: 0,
    misconceptionLoad: 0,
    composite: 0,
    ...khOverrides,
  };
  return {
    composite: 0.5,
    weights: { altitude: 0.12, driveHealth: 0.20, polarity: 0.12, shadowTopology: 0.20, transformationReadiness: 0.16, knowledgeHealth: 0.20 },
    dominantDimension: 'altitude' as const,
    dimensions: { altitude: 0.5, driveHealth: 0.5, polarity: 0.5, shadowTopology: 0.5, transformationReadiness: 0.5 },
    sessionSignals: {
      recommendedTheme: 'balanced-development' as const,
      intensityBudget: 0.5,
      shadowPressure: 'low' as const,
      transformationProximity: 'distant' as const,
      driveRebalancingTarget: null,
      polarityGuidance: { mode: 'exploration' as const, recommendedDiversity: 0.9, temptationFrequency: 0.0 },
    },
    knowledgeHealth,
  };
}

function makeKnowledgeState(overrides: Partial<KnowledgeState> = {}): KnowledgeState {
  return {
    conceptStates: new Map([
      ['math.algebra', {
        depthLevel: 'comprehended',
        retention: 0.8,
        lastReviewedAt: Date.now() - 86400000,
        reviewCount: 3,
        depthHistory: [],
        misconceptionFlags: [],
      }],
      ['math.geometry', {
        depthLevel: 'memorized',
        retention: 0.4,
        lastReviewedAt: Date.now() - 172800000,
        reviewCount: 1,
        depthHistory: [],
        misconceptionFlags: [],
      }],
      ['math.calculus', {
        depthLevel: 'analyzed',
        retention: 0.9,
        lastReviewedAt: Date.now() - 43200000,
        reviewCount: 5,
        depthHistory: [],
        misconceptionFlags: ['DarkAddiction'],
      }],
    ]),
    subjectProgress: new Map(),
    studyHistory: [],
    learningProfile: {
      preferredModalities: [],
      metacognitionScore: 0.5,
      calibrationAccuracy: 0.5,
      transferCapacity: 0.5,
      studyEfficiency: 0.5,
    },
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 10,
    recentLines: [],
    ...overrides,
  };
}

function makeHolon(id: string, prerequisites: readonly string[] = []): CurriculumHolon {
  return {
    id,
    name: id.split('.').pop() ?? id,
    description: `Test concept ${id}`,
    level: 'concept' as const,
    parentId: null,
    childIds: [],
    phases: {
      observation: { question: 'q', assessmentType: 'factual_recall', completionEvidence: 'e' },
      principle: { question: 'q', assessmentType: 'concept_explanation', completionEvidence: 'e' },
      application: { question: 'q', assessmentType: 'application_problem', completionEvidence: 'e' },
      integration: { question: 'q', assessmentType: 'analogy_mapping', completionEvidence: 'e' },
      creation: { question: 'q', assessmentType: 'creative_synthesis', completionEvidence: 'e' },
    },
    isomorphisms: [],
    prerequisites,
    devMapping: { primaryLine: 'Cognitive' as const, secondaryLines: [], stageRange: { min: 'Red' as const, max: 'Red' as const } },
    depthMeta: {
      requiredPrerequisiteDepth: 'memorized' as const,
      targetDepthRange: { min: 'memorized' as const, max: 'applied' as const },
      depthProgression: ['memorized', 'comprehended', 'applied'] as const,
    },
    forgettingParams: { initialHalfLifeMs: 86400000, halfLifeMultiplier: 2.5, maxHalfLifeMs: 31536000000 },
    content: { explanation: '', examples: [], nonExamples: [], analogies: [], visuals: [], practiceProblems: [] },
    misconceptions: [],
    depthRubric: {
      conceptId: id,
      levels: {
        memorized: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.3 },
        comprehended: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.5 },
        applied: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.7 },
        analyzed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.8 },
        evaluated: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.9 },
        transformed: { evidence: '', canDo: [], cannotDo: [], appropriateTasks: [], threshold: 0.95 },
      },
    },
    supportedModalities: ['LanguageReflective'] as const,
  };
}

function makeRegistry(holons: CurriculumHolon[]): CurriculumRegistry {
  const reg = new CurriculumRegistry();
  for (const h of holons) reg.register(h);
  return reg;
}

// ---------------------------------------------------------------------------
// selectStudyTheme tests
// ---------------------------------------------------------------------------

describe('selectStudyTheme', () => {
  it('returns undefined when knowledgeHealth is absent', () => {
    const cci = makeCCI();
    delete (cci as any).knowledgeHealth;
    expect(selectStudyTheme(cci)).toBeUndefined();
  });

  it('returns undefined when conceptCoverage and averageDepth are both 0', () => {
    const cci = makeCCI({ conceptCoverage: 0, averageDepth: 0 });
    expect(selectStudyTheme(cci)).toBeUndefined();
  });

  it('selects misconception_repair when misconceptionLoad > 0.3', () => {
    // Must set non-zero conceptCoverage and averageDepth to bypass the early return
    expect(selectStudyTheme(makeCCI({ conceptCoverage: 0.5, averageDepth: 0.5, misconceptionLoad: 0.4 }))).toBe('misconception_repair');
  });

  it('selects review_decay when retentionHealth < 0.4', () => {
    // Must set non-zero conceptCoverage and averageDepth to bypass the early return
    expect(selectStudyTheme(makeCCI({ conceptCoverage: 0.5, averageDepth: 0.5, retentionHealth: 0.3 }))).toBe('review_decay');
  });

  it('selects depth_push when averageDepth < 0.3', () => {
    expect(selectStudyTheme(makeCCI({ conceptCoverage: 0.5, averageDepth: 0.2, retentionHealth: 0.8 }))).toBe('depth_push');
  });

  it('selects cross_domain when integrationDensity < 0.3', () => {
    expect(selectStudyTheme(makeCCI({
      conceptCoverage: 0.5,
      averageDepth: 0.5,
      retentionHealth: 0.8,
      integrationDensity: 0.2,
    }))).toBe('cross_domain');
  });

  it('selects integration_sprint when coverage > 0.6 and depth > 0.4', () => {
    expect(selectStudyTheme(makeCCI({
      conceptCoverage: 0.7,
      averageDepth: 0.5,
      retentionHealth: 0.8,
      integrationDensity: 0.5,
    }))).toBe('integration_sprint');
  });

  it('selects new_material when coverage <= 0.6 and fundamentals are healthy', () => {
    expect(selectStudyTheme(makeCCI({
      conceptCoverage: 0.5,
      averageDepth: 0.5,
      retentionHealth: 0.8,
      integrationDensity: 0.5,
    }))).toBe('new_material');
  });

  it('falls back to review_decay for high coverage with moderate depth', () => {
    expect(selectStudyTheme(makeCCI({
      conceptCoverage: 0.8,
      averageDepth: 0.35,
      retentionHealth: 0.8,
      integrationDensity: 0.5,
    }))).toBe('review_decay');
  });
});

// ---------------------------------------------------------------------------
// computeCurriculumSlots tests
// ---------------------------------------------------------------------------

describe('computeCurriculumSlots', () => {
  it('returns 0 when knowledgeHealth is absent', () => {
    const cci = makeCCI();
    delete (cci as any).knowledgeHealth;
    expect(computeCurriculumSlots(makeSession(), cci)).toBe(0);
  });

  it('returns 0 when conceptCoverage is 0', () => {
    const cci = makeCCI({ conceptCoverage: 0 });
    expect(computeCurriculumSlots(makeSession(), cci)).toBe(0);
  });

  it('returns at least 1 slot when conceptCoverage > 0', () => {
    const cci = makeCCI({ conceptCoverage: 0.5, composite: 0.5 });
    const slots = computeCurriculumSlots(makeSession(), cci);
    expect(slots).toBeGreaterThanOrEqual(1);
    expect(slots).toBeLessThanOrEqual(3);
  });

  it('scales slots with knowledge health composite', () => {
    const lowCCI = makeCCI({ conceptCoverage: 0.5, composite: 0.2 });
    const highCCI = makeCCI({ conceptCoverage: 0.5, composite: 0.9 });
    const lowSlots = computeCurriculumSlots(makeSession(), lowCCI);
    const highSlots = computeCurriculumSlots(makeSession(), highCCI);
    expect(highSlots).toBeGreaterThanOrEqual(lowSlots);
  });

  it('caps at 3 slots maximum', () => {
    const cci = makeCCI({ conceptCoverage: 0.9, composite: 1.0 });
    const slots = computeCurriculumSlots(makeSession({ targetSessionLength: 100 }), cci);
    expect(slots).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// generateCurriculumCandidates tests
// ---------------------------------------------------------------------------

describe('generateCurriculumCandidates', () => {
  it('returns empty when knowledge is undefined', () => {
    expect(generateCurriculumCandidates(undefined, 'review_decay', 5)).toHaveLength(0);
  });

  it('returns empty when studyTheme is undefined', () => {
    expect(generateCurriculumCandidates(makeKnowledgeState(), undefined, 5)).toHaveLength(0);
  });

  it('returns empty when maxSlots is 0', () => {
    expect(generateCurriculumCandidates(makeKnowledgeState(), 'review_decay', 0)).toHaveLength(0);
  });

  it('generates review_decay candidates for low-retention concepts', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'review_decay', 5);
    // math.geometry has retention 0.4 < 0.7 threshold
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].action).toBe('review');
  });

  it('generates depth_push candidates for concepts with retention > 0.5', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'depth_push', 5);
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].action).toBe('deepen');
  });

  it('generates misconception_repair candidates for flagged concepts', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'misconception_repair', 5);
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].rationale).toContain('misconception');
  });

  it('generates cross_domain candidates for high-depth concepts', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'cross_domain', 5);
    // math.calculus is at 'analyzed' depth
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].action).toBe('connect');
  });

  it('generates integration_sprint candidates for top-depth concepts', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'integration_sprint', 5);
    // math.calculus is at 'analyzed' — not high enough for integration_sprint
    // (needs 'evaluated' or 'transformed')
    expect(candidates).toHaveLength(0);
  });

  it('returns empty for new_material when no registry provided', () => {
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'new_material', 5);
    expect(candidates).toHaveLength(0);
  });

  it('discovers unmastered concepts from registry for new_material', () => {
    const registry = makeRegistry([
      makeHolon('math.algebra'),
      makeHolon('math.geometry', ['math.algebra']),
      makeHolon('math.calculus', ['math.algebra', 'math.geometry']),
      makeHolon('math.topology', ['math.calculus']),
    ]);
    const candidates = generateCurriculumCandidates(makeKnowledgeState(), 'new_material', 5, registry);
    // math.algebra is already in knowledge (comprehended) — should get deepen candidate
    // math.geometry is in knowledge (memorized) — should get deepen candidate
    // math.calculus is in knowledge (analyzed) — should get deepen candidate
    // math.topology is NOT in knowledge — should get new_material candidate (prereqs not met)
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    // Candidates should be sorted by priority descending
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i - 1].priority).toBeGreaterThanOrEqual(candidates[i].priority);
    }
  });

  it('prioritizes concepts with met prerequisites in new_material', () => {
    const registry = makeRegistry([
      makeHolon('math.algebra'),
      makeHolon('math.geometry', ['math.algebra']),
    ]);
    const knowledge = makeKnowledgeState({
      conceptStates: new Map([
        ['math.algebra', { depthLevel: 'memorized', retention: 0.9, lastReviewedAt: Date.now(), reviewCount: 1, depthHistory: [], misconceptionFlags: [] }],
      ]),
    });
    const candidates = generateCurriculumCandidates(knowledge, 'new_material', 5, registry);
    // math.algebra is mastered (memorized) — deepen candidate
    // math.geometry has prereq met — new_material candidate with higher priority
    expect(candidates.length).toBe(2);
    // math.geometry (prereqs met) should have priority 0.7, math.algebra (already mastered) lower
    const geoCandidate = candidates.find(c => c.conceptId === 'math.geometry');
    expect(geoCandidate).toBeDefined();
    expect(geoCandidate!.action).toBe('new_material');
    expect(geoCandidate!.priority).toBe(0.7);
  });

  it('respects maxSlots limit', () => {
    const knowledge = makeKnowledgeState({
      conceptStates: new Map([
        ['a', { depthLevel: 'memorized', retention: 0.1, lastReviewedAt: 0, reviewCount: 0, depthHistory: [], misconceptionFlags: [] }],
        ['b', { depthLevel: 'memorized', retention: 0.2, lastReviewedAt: 0, reviewCount: 0, depthHistory: [], misconceptionFlags: [] }],
        ['c', { depthLevel: 'memorized', retention: 0.3, lastReviewedAt: 0, reviewCount: 0, depthHistory: [], misconceptionFlags: [] }],
      ]),
    });
    const candidates = generateCurriculumCandidates(knowledge, 'review_decay', 2);
    expect(candidates).toHaveLength(2);
  });

  it('sorts candidates by priority descending', () => {
    const knowledge = makeKnowledgeState({
      conceptStates: new Map([
        ['low', { depthLevel: 'memorized', retention: 0.2, lastReviewedAt: 0, reviewCount: 0, depthHistory: [], misconceptionFlags: [] }],
        ['mid', { depthLevel: 'memorized', retention: 0.5, lastReviewedAt: 0, reviewCount: 0, depthHistory: [], misconceptionFlags: [] }],
      ]),
    });
    const candidates = generateCurriculumCandidates(knowledge, 'review_decay', 5);
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates[0].priority).toBeGreaterThanOrEqual(candidates[1].priority);
  });
});
