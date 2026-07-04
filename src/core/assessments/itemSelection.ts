/**
 * Adaptive item selection for assessment modules.
 * Spec: STAGE-ASSESSMENT-ARCHITECTURE §9
 *
 * Selects items from the pool ensuring:
 * - No repetition within a session (anti-repetition)
 * - Difficulty adapts to player performance
 * - Diverse measurement coverage
 */
import type { AssessmentItem, MeasureDimension } from './types.js';

export interface ItemSelectionContext {
  readonly usedItemIds: readonly string[];
  readonly currentDifficulty: number; // 0-1
  readonly targetDimensions?: readonly MeasureDimension[];
}

/**
 * Select the next item from the pool based on context.
 * Returns null if pool is exhausted.
 */
export function selectNextItem(
  pool: readonly AssessmentItem[],
  context: ItemSelectionContext,
): AssessmentItem | null {
  // Filter out already-used items
  const available = pool.filter(item => !context.usedItemIds.includes(item.id));
  if (available.length === 0) return null;

  // Score each available item
  const scored = available.map(item => ({
    item,
    score: scoreItem(item, context),
  }));

  // Sort by score descending and pick the best
  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}

/**
 * Select N items for a session from the pool.
 */
export function selectSessionItems(
  pool: readonly AssessmentItem[],
  count: number,
  startDifficulty: number = 0.5,
): AssessmentItem[] {
  const selected: AssessmentItem[] = [];
  let difficulty = startDifficulty;

  for (let i = 0; i < count; i++) {
    const item = selectNextItem(pool, {
      usedItemIds: selected.map(s => s.id),
      currentDifficulty: difficulty,
    });
    if (!item) break;
    selected.push(item);
    // Gradually increase difficulty through the session
    difficulty = Math.min(1, difficulty + 0.05);
  }

  return selected;
}

function scoreItem(item: AssessmentItem, context: ItemSelectionContext): number {
  // Difficulty match: prefer items close to current difficulty
  const diffMatch = 1 - Math.abs(item.difficulty - context.currentDifficulty);

  // Dimension coverage: prefer items measuring target dimensions
  let dimScore = 0.5;
  if (context.targetDimensions && context.targetDimensions.length > 0) {
    const overlap = item.measures.filter(m => context.targetDimensions!.includes(m)).length;
    dimScore = overlap / context.targetDimensions.length;
  }

  return diffMatch * 0.6 + dimScore * 0.4;
}
