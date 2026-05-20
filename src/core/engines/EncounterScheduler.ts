/**
 * EncounterScheduler — selects and ranks encounters using the full priority formula.
 * Spec: foundations/24 (full)
 */
import type { PolarityMode, ShadowQuadrant } from '../domain/enums.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import { generateCandidates, type WorldState } from './CandidateGeneration.js';
import { computePriority, type SessionContext, type PriorityWeights } from './PriorityComputation.js';

export type { WorldState } from './CandidateGeneration.js';
export type { SessionContext } from './PriorityComputation.js';

/**
 * Schedule the next N encounters, ranked by priority.
 */
export function scheduleNext(
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  now: number,
  count: number = 3,
  weights?: PriorityWeights,
): ScheduledEncounter[] {
  const candidates = generateCandidates(sig, world, now);
  if (candidates.length === 0) return [];

  // Score all candidates
  const scored = candidates.map(c => ({
    candidate: c,
    priority: computePriority(c, sig, world, session, now, weights),
  }));

  // Sort descending by priority
  scored.sort((a, b) => b.priority - a.priority);

  // Determine session position
  const progress = session.encountersSoFar / Math.max(1, session.targetSessionLength);
  const position: 'warmup' | 'peak' | 'cooldown' =
    progress < 0.2 ? 'warmup' : progress > 0.8 ? 'cooldown' : 'peak';

  // Determine polarity mode from significator
  const polarityMode: PolarityMode = sig.polarity.master.mode;

  // Determine shadow target from active shadows
  const activeShadow = sig.shadows.entries.find(e => e.resolvedAt === null);
  const shadowTarget: ShadowQuadrant | null = activeShadow?.quadrant ?? null;

  // Take top N, diversifying by line (no more than 2 from same line)
  const result: ScheduledEncounter[] = [];
  const lineCounts: Record<string, number> = {};

  for (const { candidate, priority } of scored) {
    if (result.length >= count) break;
    const lc = lineCounts[candidate.line] ?? 0;
    if (lc >= 2) continue;
    lineCounts[candidate.line] = lc + 1;

    result.push({
      id: `${candidate.moduleRef}:${candidate.holonId}:${now}`,
      moduleRef: candidate.moduleRef,
      modality: candidate.modality,
      targetLines: [candidate.line],
      stage: candidate.stage,
      holonSource: candidate.holonId,
      shadowTarget,
      polarityMode,
      difficulty: computeDifficulty(sig, candidate.line, candidate.stage),
      sessionPosition: position,
      priority,
      driveTarget: activeShadow?.drive ?? null,
    });
  }

  return result;
}

function computeDifficulty(sig: Significator, line: string, stage: string): number {
  // Difficulty relative to player's altitude in that line
  const key = `${line}:${stage}`;
  const cell = sig.polarity.cells[key];
  const traceCount = cell?.traceCount ?? 0;
  // More traces = more familiarity = lower difficulty; cap at 0.3-0.9
  return Math.max(0.3, Math.min(0.9, 0.9 - traceCount * 0.05));
}
