/**
 * SeedInitialKnowledge — populates a fresh player's KnowledgeState with
 * introductory concepts from the curriculum registry.
 *
 * This solves the cold-start problem: without initial knowledge state,
 * generateCurriculumCandidates() returns empty and curriculum encounters
 * never appear for new players.
 *
 * P2-R8 (Curriculum Audit): The function selects up to 5 introductory
 * concepts forming a prerequisite chain from the player's dominant line's
 * curriculum, initializing them at 'memorized' depth. This gives the
 * curriculum scheduling engine enough data to generate candidates on the
 * first session AND ensures the player has a coherent learning path.
 *
 * Pure function: inputs in, KnowledgeState out. No side effects.
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { KnowledgeState, ConceptState, DepthLevel } from './types.js';
import { getCurriculumRegistry } from './CurriculumRegistry.js';
import { seedCurriculumRegistry } from './CurriculumSeed.js';

/**
 * Seed a fresh player's knowledge state with introductory concepts.
 *
 * @param dominantLine - The player's dominant developmental line (e.g., 'Cognitive')
 * @param dominantStage - The player's dominant stage (e.g., 'Red', 'Orange')
 * @returns A KnowledgeState with 2-3 introductory concepts seeded at 'memorized' depth,
 *          or an empty KnowledgeState if no matching concepts are found.
 */
export function seedInitialKnowledge(
  dominantLine: Line,
  dominantStage: Stage,
): KnowledgeState {
  // Ensure the curriculum registry is seeded
  seedCurriculumRegistry();
  const registry = getCurriculumRegistry();

  // Find concepts that match the player's dominant line and stage range
  const stageOrd = stageOrdinal(dominantStage);
  const matchingConcepts: { id: string; priority: number }[] = [];

  for (const holon of registry.getAll()) {
    // Only consider concept-level holons (leaf nodes)
    if (holon.level !== 'concept') continue;

    // Check if the holon's primary line matches the player's dominant line
    if (holon.devMapping.primaryLine !== dominantLine) continue;

    // Check if the holon's stage range includes or is near the player's stage
    const minStageOrd = stageOrdinal(holon.devMapping.stageRange.min);
    const maxStageOrd = stageOrdinal(holon.devMapping.stageRange.max);

    // Prefer concepts at or just below the player's stage (foundational material)
    if (stageOrd >= minStageOrd && stageOrd <= maxStageOrd + 1) {
      // Priority: concepts with no prerequisites are preferred (true introductory material)
      const hasPrereqs = holon.prerequisites.length > 0;
      const priority = hasPrereqs ? 0.5 : 0.8;
      matchingConcepts.push({ id: holon.id, priority });
    }
  }

  // P2-R8: Build a prerequisite chain of up to 5 concepts.
  // buildPrerequisiteChain() internally sorts by priority after DFS traversal.
  const selected = buildPrerequisiteChain(matchingConcepts, registry, 5);

  // If no concepts found for the dominant line, try any line at the player's stage
  if (selected.length === 0) {
    for (const holon of registry.getAll()) {
      if (holon.level !== 'concept') continue;
      const minStageOrd = stageOrdinal(holon.devMapping.stageRange.min);
      const maxStageOrd = stageOrdinal(holon.devMapping.stageRange.max);
      if (stageOrd >= minStageOrd && stageOrd <= maxStageOrd + 1) {
        const hasPrereqs = holon.prerequisites.length > 0;
        const priority = hasPrereqs ? 0.3 : 0.6;
        selected.push({ id: holon.id, priority });
      }
    }
    selected.sort((a, b) => b.priority - a.priority);
    const fallbackSelected = buildPrerequisiteChain(selected, registry, 5);
    selected.splice(0, selected.length, ...fallbackSelected);
  }

  // Build the concept states map
  const now = Date.now();
  const conceptStates = new Map<string, ConceptState>();

  for (const { id } of selected) {
    const conceptState: ConceptState = {
      depthLevel: 'memorized' as DepthLevel,
      retention: 0.9, // High initial retention (just learned)
      lastReviewedAt: now,
      reviewCount: 1,
      depthHistory: [{
        level: 'memorized' as DepthLevel,
        timestamp: now,
        evidence: 'Seeded as introductory concept for new player',
      }],
      misconceptionFlags: [],
      completedPhases: ['observation'], // First phase completed by seeding
    };
    conceptStates.set(id, conceptState);
  }

  // Return a KnowledgeState with the seeded concepts
  return {
    conceptStates,
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

/**
 * P2-R8: Build a prerequisite chain of up to `maxCount` concepts.
 *
 * Given a priority-sorted list of candidate concepts, this function builds
 * a chain where each selected concept's prerequisites are also included
 * (up to the limit). This ensures the player starts with a coherent
 * learning path rather than random disconnected concepts.
 *
 * Algorithm:
 * 1. Start with the highest-priority concept.
 * 2. Walk its prerequisites, adding each if not already selected.
 * 3. Stop when we reach maxCount.
 * 4. If we haven't reached maxCount, add the next highest-priority concept
 *    that isn't already selected, and repeat step 2.
 */
function buildPrerequisiteChain(
  candidates: readonly { id: string; priority: number }[],
  registry: ReturnType<typeof getCurriculumRegistry>,
  maxCount: number,
): { id: string; priority: number }[] {
  const selected: { id: string; priority: number }[] = [];
  const selectedIds = new Set<string>();

  // Build a quick lookup for prerequisites
  const prereqMap = new Map<string, readonly string[]>();
  for (const holon of registry.getAll()) {
    if (holon.level === 'concept') {
      prereqMap.set(holon.id, holon.prerequisites);
    }
  }

  // Start with highest-priority candidates, building chains
  for (const candidate of candidates) {
    if (selectedIds.size >= maxCount) break;
    if (selectedIds.has(candidate.id)) continue;

    // Walk prerequisites depth-first, adding each unseen prereq
    const chain: string[] = [];
    const visited = new Set<string>();
    const stack = [candidate.id];

    while (stack.length > 0 && chain.length < maxCount) {
      const currentId = stack.pop()!;
      if (visited.has(currentId) || selectedIds.has(currentId)) continue;
      visited.add(currentId);

      const prereqs = prereqMap.get(currentId) ?? [];
      // Push current, then push prereqs (so prereqs are processed first)
      chain.unshift(currentId); // unshift so prereqs come before dependents
      for (const prereqId of prereqs) {
        if (!visited.has(prereqId) && !selectedIds.has(prereqId)) {
          stack.push(prereqId);
        }
      }
    }

    // Add chain elements up to the limit
    for (const id of chain) {
      if (selectedIds.size >= maxCount) break;
      if (selectedIds.has(id)) continue;
      selectedIds.add(id);
      const existing = candidates.find(c => c.id === id);
      selected.push({ id, priority: existing?.priority ?? 0.4 });
    }
  }

  // P2-R8 follow-up: Re-sort by priority so downstream code (scheduler,
  // encounter selection) sees concepts in priority order, not DFS order.
  selected.sort((a, b) => b.priority - a.priority);

  return selected;
}
