/**
 * SeedInitialKnowledge — populates a fresh player's KnowledgeState with
 * introductory concepts from the curriculum registry.
 *
 * This solves the cold-start problem: without initial knowledge state,
 * generateCurriculumCandidates() returns empty and curriculum encounters
 * never appear for new players.
 *
 * The function selects 2-3 introductory concepts from the player's dominant
 * line's curriculum, initializing them at 'memorized' depth. This gives the
 * curriculum scheduling engine enough data to generate candidates on the
 * first session.
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

  // Sort by priority (introductory concepts first), then take top 3
  matchingConcepts.sort((a, b) => b.priority - a.priority);
  const selected = matchingConcepts.slice(0, 3);

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
    selected.splice(3); // Limit to 3
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
