/**
 * Tests for KnowledgeGraph — prerequisite DAG operations.
 * Spec: docs/foundations/30-holonic-curriculum-architecture.md §4.2
 */
import { describe, it, expect } from 'vitest';
import {
  buildGraph,
  detectCycles,
  topologicalSort,
  allPrerequisites,
  dependents,
  detectGaps,
  learningPath,
  findReadyConcepts,
} from '../../../src/core/curriculum/KnowledgeGraph.js';
import type { CurriculumHolon, DepthLevel } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Test fixtures — minimal CurriculumHolons for graph construction
// ---------------------------------------------------------------------------

function makeHolon(
  id: string,
  prerequisites: readonly string[] = [],
  name?: string,
): CurriculumHolon {
  return {
    id,
    name: name ?? id.split('.').pop() ?? id,
    description: `Test concept ${id}`,
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
    prerequisites,
    devMapping: { primaryLine: 'Cognitive', secondaryLines: [], stageRange: { min: 'Red', max: 'Red' } },
    depthMeta: {
      requiredPrerequisiteDepth: 'memorized',
      targetDepthRange: { min: 'memorized', max: 'applied' },
      depthProgression: ['memorized', 'comprehended', 'applied'],
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
    supportedModalities: ['LanguageReflective'],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('KnowledgeGraph', () => {
  describe('buildGraph', () => {
    it('builds nodes and adjacency from holons', () => {
      const holons = [
        makeHolon('math.algebra', []),
        makeHolon('math.geometry', ['math.algebra']),
      ];
      const graph = buildGraph(holons);

      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.get('math.algebra')?.name).toBe('algebra');
      expect(graph.adjacency.get('math.geometry')).toContain('math.algebra');
    });

    it('handles empty input', () => {
      const graph = buildGraph([]);
      expect(graph.nodes.size).toBe(0);
    });

    it('builds reverse adjacency', () => {
      const holons = [
        makeHolon('a', []),
        makeHolon('b', ['a']),
        makeHolon('c', ['a']),
      ];
      const graph = buildGraph(holons);
      expect(graph.reverseAdjacency.get('a')).toEqual(expect.arrayContaining(['b', 'c']));
    });
  });

  describe('detectCycles', () => {
    it('returns empty for acyclic graph', () => {
      const holons = [
        makeHolon('a', []),
        makeHolon('b', ['a']),
        makeHolon('c', ['b']),
      ];
      const graph = buildGraph(holons);
      expect(detectCycles(graph.adjacency)).toHaveLength(0);
    });

    it('detects simple cycle A→B→A', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['A', ['B']],
        ['B', ['A']],
      ]);
      const cycles = detectCycles(adjacency);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('detects longer cycles', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['A', ['B']],
        ['B', ['C']],
        ['C', ['A']],
      ]);
      const cycles = detectCycles(adjacency);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('handles disconnected components', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['A', []],
        ['B', []],
      ]);
      expect(detectCycles(adjacency)).toHaveLength(0);
    });
  });

  describe('topologicalSort', () => {
    it('returns prerequisites before dependents', () => {
      const holons = [
        makeHolon('c', ['b']),
        makeHolon('b', ['a']),
        makeHolon('a', []),
      ];
      const graph = buildGraph(holons);
      const sorted = topologicalSort(graph.adjacency);
      expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'));
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('c'));
    });

    it('handles independent concepts', () => {
      const holons = [
        makeHolon('x', []),
        makeHolon('y', []),
      ];
      const graph = buildGraph(holons);
      const sorted = topologicalSort(graph.adjacency);
      expect(sorted).toHaveLength(2);
      expect(sorted).toContain('x');
      expect(sorted).toContain('y');
    });

    it('handles empty graph', () => {
      const sorted = topologicalSort(new Map());
      expect(sorted).toHaveLength(0);
    });
  });

  describe('allPrerequisites', () => {
    it('returns transitive prerequisites', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['A', ['B']],
        ['B', ['C']],
        ['C', []],
      ]);
      const result = allPrerequisites('A', adjacency);
      expect(result).toContain('B');
      expect(result).toContain('C');
    });

    it('returns empty for root concept', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['A', []],
      ]);
      expect(allPrerequisites('A', adjacency)).toHaveLength(0);
    });
  });

  describe('dependents', () => {
    it('returns direct dependents', () => {
      const reverse = new Map<string, readonly string[]>([
        ['A', ['B', 'C']],
      ]);
      const result = dependents('A', reverse);
      expect(result).toContain('B');
      expect(result).toContain('C');
    });

    it('returns empty for concept with no dependents', () => {
      const reverse = new Map<string, readonly string[]>();
      expect(dependents('X', reverse)).toHaveLength(0);
    });
  });

  describe('detectGaps', () => {
    it('finds missing prerequisites', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['C', ['B']],
        ['B', ['A']],
        ['A', []],
      ]);
      const encountered = new Set(['A']);
      const gaps = detectGaps('C', adjacency, encountered);
      expect(gaps).toContain('B');
    });

    it('returns empty when all prerequisites met', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['B', ['A']],
        ['A', []],
      ]);
      const encountered = new Set(['A']);
      expect(detectGaps('B', adjacency, encountered)).toHaveLength(0);
    });
  });

  describe('learningPath', () => {
    it('finds path between connected concepts via reverseAdjacency', () => {
      // reverseAdjacency: A→B→C (A depends on nothing, B depends on A, C depends on B)
      const reverse = new Map<string, readonly string[]>([
        ['A', ['B']],
        ['B', ['C']],
        ['C', []],
      ]);
      const path = learningPath('A', 'C', reverse);
      expect(path).toEqual(['A', 'B', 'C']);
    });

    it('returns empty for disconnected concepts', () => {
      const reverse = new Map<string, readonly string[]>([
        ['A', []],
        ['B', []],
      ]);
      expect(learningPath('A', 'B', reverse)).toHaveLength(0);
    });

    it('returns single element for same concept', () => {
      const reverse = new Map<string, readonly string[]>([
        ['A', []],
      ]);
      expect(learningPath('A', 'A', reverse)).toEqual(['A']);
    });
  });

  describe('findReadyConcepts', () => {
    it('finds concepts whose prerequisites are met at required depth', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['C', ['B']],
        ['B', ['A']],
        ['A', []],
      ]);
      const depths = new Map<string, DepthLevel>([
        ['A', 'comprehended'],
        ['B', 'comprehended'],
      ]);
      const ready = findReadyConcepts(adjacency, depths, 'memorized');
      expect(ready).toContain('C');
    });

    it('excludes concepts with unmet prerequisites', () => {
      // C depends on B, B depends on A. A is at 'memorized' (meets required 'memorized').
      // So B IS ready (its prereq A is met), but C is NOT ready (B is not in depths).
      const graph = new Map<string, readonly string[]>([
        ['C', ['B']],
        ['B', ['A']],
        ['A', []],
      ]);
      const depths = new Map<string, DepthLevel>([
        ['A', 'memorized'],
      ]);
      const ready = findReadyConcepts(graph, depths, 'memorized');
      expect(ready).toContain('B'); // A meets required depth, so B is ready
      expect(ready).not.toContain('C'); // B is not in depths, so C is not ready
    });

    it('excludes already-encountered concepts', () => {
      const adjacency = new Map<string, readonly string[]>([
        ['B', ['A']],
        ['A', []],
      ]);
      const depths = new Map<string, DepthLevel>([
        ['A', 'comprehended'],
        ['B', 'memorized'],
      ]);
      const ready = findReadyConcepts(adjacency, depths, 'memorized');
      expect(ready).not.toContain('B'); // Already in depths
    });
  });
});
