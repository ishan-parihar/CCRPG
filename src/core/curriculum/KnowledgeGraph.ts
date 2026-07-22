/**
 * KnowledgeGraph — prerequisite DAG for curriculum concepts.
 * Spec: docs/foundations/30-holonic-curriculum-architecture.md §4.2
 *
 * A directed acyclic graph where nodes are curriculum holons and edges
 * are prerequisite relationships. Supports topological sort, gap detection,
 * cycle detection, and learning path computation.
 *
 * Pure functions: graph in, results out. No side effects.
 */
import type { CurriculumHolon, DepthLevel } from './types.js';
import { depthOrdinal } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphNode {
  readonly id: string;
  readonly name: string;
  readonly level: string;
}

export interface GraphEdge {
  readonly from: string; // prerequisite
  readonly to: string;   // dependent
}

// ---------------------------------------------------------------------------
// Graph Construction
// ---------------------------------------------------------------------------

/** Build a KnowledgeGraph from an array of curriculum holons. */
export function buildGraph(holons: readonly CurriculumHolon[]): {
  readonly nodes: ReadonlyMap<string, GraphNode>;
  readonly adjacency: ReadonlyMap<string, readonly string[]>;
  readonly reverseAdjacency: ReadonlyMap<string, readonly string[]>;
} {
  const nodes = new Map<string, GraphNode>();
  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  for (const h of holons) {
    nodes.set(h.id, { id: h.id, name: h.name, level: h.level });
    if (!adjacency.has(h.id)) adjacency.set(h.id, []);
    if (!reverseAdjacency.has(h.id)) reverseAdjacency.set(h.id, []);

    for (const pre of h.prerequisites) {
      adjacency.get(h.id)!.push(pre);
      if (!reverseAdjacency.has(pre)) reverseAdjacency.set(pre, []);
      reverseAdjacency.get(pre)!.push(h.id);
    }
  }

  return {
    nodes: nodes as ReadonlyMap<string, GraphNode>,
    adjacency: adjacency as ReadonlyMap<string, readonly string[]>,
    reverseAdjacency: reverseAdjacency as ReadonlyMap<string, readonly string[]>,
  };
}

// ---------------------------------------------------------------------------
// Cycle Detection
// ---------------------------------------------------------------------------

/** Detect cycles in the prerequisite graph. Returns array of cycle paths. */
export function detectCycles(
  adjacency: ReadonlyMap<string, readonly string[]>,
): readonly (readonly string[])[] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (inStack.has(node)) {
      // Found a cycle — extract it
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const deps = adjacency.get(node) ?? [];
    for (const dep of deps) {
      dfs(dep);
    }

    path.pop();
    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    dfs(node);
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// Topological Sort
// ---------------------------------------------------------------------------

/** Topological sort — returns nodes in valid learning order (prerequisites first). */
export function topologicalSort(
  adjacency: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  const inDegree = new Map<string, number>();
  const result: string[] = [];

  // Count in-degrees
  for (const [node, deps] of adjacency) {
    if (!inDegree.has(node)) inDegree.set(node, 0);
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
    }
  }

  // Seed queue with nodes that have no prerequisites
  const queue: string[] = [];
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node);
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    // Find all nodes that depend on this node
    for (const [n, deps] of inDegree) {
      if (deps > 0 && adjacency.get(n)?.includes(node)) {
        inDegree.set(n, deps - 1);
        if (deps - 1 === 0) queue.push(n);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Prerequisite Queries
// ---------------------------------------------------------------------------

/** Get all transitive prerequisites of a concept. */
export function allPrerequisites(
  conceptId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  const result = new Set<string>();
  const queue = [...(adjacency.get(conceptId) ?? [])];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (result.has(node)) continue;
    result.add(node);
    queue.push(...(adjacency.get(node) ?? []));
  }

  return [...result];
}

/** Get all concepts that require this concept as a prerequisite. */
export function dependents(
  conceptId: string,
  reverseAdjacency: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  return reverseAdjacency.get(conceptId) ?? [];
}

// ---------------------------------------------------------------------------
// Gap Detection
// ---------------------------------------------------------------------------

/** Find prerequisites that the learner hasn't encountered. */
export function detectGaps(
  conceptId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  encountered: ReadonlySet<string>,
): readonly string[] {
  const prereqs = allPrerequisites(conceptId, adjacency);
  return prereqs.filter(p => !encountered.has(p));
}

// ---------------------------------------------------------------------------
// Learning Path
// ---------------------------------------------------------------------------

/** Find the shortest learning path between two concepts. */
export function learningPath(
  from: string,
  to: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  // Forward BFS from `from` to `to`
  const visited2 = new Map<string, string>();
  const queue2 = [from];
  visited2.set(from, '');

  while (queue2.length > 0) {
    const current = queue2.shift()!;
    if (current === to) {
      const path: string[] = [];
      let node: string | undefined = current;
      while (node !== undefined && node !== '') {
        path.unshift(node);
        node = visited2.get(node);
      }
      return path;
    }

    const deps = adjacency.get(current) ?? [];
    for (const dep of deps) {
      if (!visited2.has(dep)) {
        visited2.set(dep, current);
        queue2.push(dep);
      }
    }
  }

  return []; // No path found
}

// ---------------------------------------------------------------------------
// Depth-Aware Queries
// ---------------------------------------------------------------------------

/** Find concepts whose prerequisites are met at a given depth level. */
export function findReadyConcepts(
  adjacency: ReadonlyMap<string, readonly string[]>,
  conceptDepths: ReadonlyMap<string, DepthLevel>,
  requiredDepth: DepthLevel,
): readonly string[] {
  const ready: string[] = [];

  for (const [concept] of adjacency) {
    if (conceptDepths.has(concept)) continue; // Already encountered

    const prereqs = allPrerequisites(concept, adjacency);
    const allMet = prereqs.every(p => {
      const depth = conceptDepths.get(p);
      return depth !== undefined && depthOrdinal(depth) >= depthOrdinal(requiredDepth);
    });

    if (allMet && prereqs.length > 0) {
      ready.push(concept);
    }
  }

  return ready;
}


