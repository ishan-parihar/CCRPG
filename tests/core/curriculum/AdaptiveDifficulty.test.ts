/**
 * Tests for adaptive difficulty in CandidateGeneration.ts (Phase 6B).
 * Tests computeAdaptiveTargetDepth and computeAdaptivePriority helpers.
 */
import { describe, it, expect } from 'vitest';
import type { CurriculumHolon, DepthLevel } from '../../../src/core/curriculum/types.js';

// Minimal holon factory for testing
function makeHolon(overrides: Partial<CurriculumHolon> = {}): CurriculumHolon {
  return {
    id: 'test.holon',
    name: 'Test Holon',
    description: 'A test holon for adaptive difficulty testing',
    level: 'concept',
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
    prerequisites: [],
    devMapping: { primaryLine: 'Cognitive', secondaryLines: [], stageRange: { min: 'Red', max: 'Red' } },
    depthMeta: {
      requiredPrerequisiteDepth: 'memorized',
      targetDepthRange: { min: 'memorized', max: 'transformed' },
      depthProgression: ['memorized', 'comprehended', 'applied', 'analyzed', 'evaluated', 'transformed'],
    },
    forgettingParams: { initialHalfLifeMs: 86400000, halfLifeMultiplier: 2.5, maxHalfLifeMs: 31536000000 },
    content: {
      explanation: 'Test explanation that is long enough to pass validation',
      examples: ['Example 1'],
      nonExamples: ['Non-example 1'],
      analogies: [],
      visuals: [],
      practiceProblems: [],
    },
    misconceptions: [],
    depthRubric: {
      conceptId: 'test.holon',
      levels: {
        memorized: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['factual_recall'], threshold: 0.2 },
        comprehended: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['concept_explanation'], threshold: 0.4 },
        applied: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['application_problem'], threshold: 0.6 },
        analyzed: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['analogy_mapping'], threshold: 0.75 },
        evaluated: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['debate_position'], threshold: 0.9 },
        transformed: { evidence: 'e', canDo: [], cannotDo: [], appropriateTasks: ['creative_synthesis'], threshold: 1.0 },
      },
    },
    supportedModalities: ['LanguageReflective'],
    ...overrides,
  };
}

// We need to test the internal helpers indirectly through generateCurriculumCandidates
// or extract them for direct testing. For now, we test the observable behavior.

import { generateCurriculumCandidates } from '../../../src/core/engines/CandidateGeneration.js';
import type { KnowledgeState } from '../../../src/core/curriculum/types.js';
import { CurriculumRegistry } from '../../../src/core/curriculum/CurriculumRegistry.js';

function makeRegistry(holons: CurriculumHolon[]): CurriculumRegistry {
  const reg = new CurriculumRegistry();
  for (const h of holons) reg.register(h);
  return reg;
}

function makeKnowledge(conceptStates: Record<string, { depthLevel: DepthLevel; retention: number; reviewCount: number }>): KnowledgeState {
  const states = new Map<string, any>();
  for (const [id, cs] of Object.entries(conceptStates)) {
    states.set(id, {
      depthLevel: cs.depthLevel,
      retention: cs.retention,
      lastReviewedAt: Date.now() - 86400000,
      reviewCount: cs.reviewCount,
      depthHistory: [],
      misconceptionFlags: [],
    });
  }
  return {
    conceptStates: states as ReadonlyMap<string, any>,
    subjectProgress: new Map(),
    studyHistory: [],
    learningProfile: {
      preferredModalities: [],
      metacognitionScore: 0.5,
      calibrationAccuracy: 0.5,
      transferCapacity: 0.5,
      studyEfficiency: 0.5,
    },
  };
}

describe('Adaptive Difficulty — depth_push theme', () => {
  it('returns empty when no registry provided', () => {
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.8, reviewCount: 3 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5);
    expect(result).toHaveLength(0);
  });

  it('generates candidates for concepts with retention > 0.5 and prerequisites met', () => {
    const holon = makeHolon({ id: 'test.a', prerequisites: [] });
    const registry = makeRegistry([holon]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.8, reviewCount: 3 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]?.conceptId).toBe('test.a');
    expect(result[0]?.action).toBe('deepen');
  });

  it('excludes concepts with retention <= 0.5', () => {
    const holon = makeHolon({ id: 'test.a', prerequisites: [] });
    const registry = makeRegistry([holon]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.3, reviewCount: 1 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result).toHaveLength(0);
  });

  it('excludes concepts whose prerequisites are not at required depth', () => {
    const prereq = makeHolon({ id: 'test.prereq', prerequisites: [] });
    const holon = makeHolon({ id: 'test.a', prerequisites: ['test.prereq'] });
    const registry = makeRegistry([prereq, holon]);
    const knowledge = makeKnowledge({
      'test.prereq': { depthLevel: 'absent', retention: 0.8, reviewCount: 3 },
      'test.a': { depthLevel: 'memorized', retention: 0.8, reviewCount: 3 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    // test.a should be excluded because test.prereq is at 'absent' depth
    expect(result.find(c => c.conceptId === 'test.a')).toBeUndefined();
  });

  it('adaptive target depth pushes to next level when retention > 0.8 and reviewCount >= 3', () => {
    const holon = makeHolon({ id: 'test.a', prerequisites: [] });
    const registry = makeRegistry([holon]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.9, reviewCount: 5 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result.length).toBe(1);
    // Should target 'comprehended' (next level after memorized)
    expect(result[0]?.targetDepth).toBe('comprehended');
  });

  it('adaptive target depth stays at current when retention is medium', () => {
    const holon = makeHolon({ id: 'test.a', prerequisites: [] });
    const registry = makeRegistry([holon]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.6, reviewCount: 2 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result.length).toBe(1);
    // Should stay at 'memorized' (not enough retention for push)
    expect(result[0]?.targetDepth).toBe('memorized');
  });

  it('adaptive priority is higher for low-retention concepts', () => {
    const holonA = makeHolon({ id: 'test.a', prerequisites: [] });
    const holonB = makeHolon({ id: 'test.b', prerequisites: [] });
    const registry = makeRegistry([holonA, holonB]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.55, reviewCount: 2 },
      'test.b': { depthLevel: 'memorized', retention: 0.9, reviewCount: 3 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result.length).toBe(2);
    const lowRet = result.find(c => c.conceptId === 'test.a');
    const highRet = result.find(c => c.conceptId === 'test.b');
    expect(lowRet).toBeDefined();
    expect(highRet).toBeDefined();
    // Low retention should have higher priority
    expect(lowRet!.priority).toBeGreaterThanOrEqual(highRet!.priority);
  });

  it('does not push beyond holon target max depth', () => {
    const holon = makeHolon({
      id: 'test.a',
      prerequisites: [],
      depthMeta: {
        requiredPrerequisiteDepth: 'memorized',
        targetDepthRange: { min: 'memorized', max: 'applied' },
        depthProgression: ['memorized', 'comprehended', 'applied'],
      },
    });
    const registry = makeRegistry([holon]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'applied', retention: 0.95, reviewCount: 10 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    // Already at target max, so no candidate generated (or stays at applied)
    if (result.length > 0) {
      expect(result[0]?.targetDepth).toBe('applied');
    }
  });
});

describe('Adaptive Difficulty — struggle boost', () => {
  it('struggle boost only applies when retention < 0.6 AND reviewCount > 5', () => {
    const holonA = makeHolon({ id: 'test.a', prerequisites: [] });
    const holonB = makeHolon({ id: 'test.b', prerequisites: [] });
    const registry = makeRegistry([holonA, holonB]);
    const knowledge = makeKnowledge({
      'test.a': { depthLevel: 'memorized', retention: 0.55, reviewCount: 7 },
      'test.b': { depthLevel: 'memorized', retention: 0.9, reviewCount: 7 },
    });
    const result = generateCurriculumCandidates(knowledge, 'depth_push', 5, registry);
    expect(result.length).toBe(2);
    const struggling = result.find(c => c.conceptId === 'test.a');
    const strong = result.find(c => c.conceptId === 'test.b');
    expect(struggling).toBeDefined();
    expect(strong).toBeDefined();
    // Struggling concept (low retention + many reviews) should have higher priority
    expect(struggling!.priority).toBeGreaterThan(strong!.priority);
  });
});
