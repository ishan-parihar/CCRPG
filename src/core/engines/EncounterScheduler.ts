/**
 * EncounterScheduler — selects and ranks encounters using the full priority formula.
 * Spec: foundations/24 (full)
 */
import type { PolarityMode, ShadowQuadrant } from '../domain/enums.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import type { ShadowEntry } from '../domain/ShadowLedger.js';
import { generateCandidates, type WorldState } from './CandidateGeneration.js';
import { computePriority, DEFAULT_WEIGHTS, type SessionContext, type PriorityWeights } from './PriorityComputation.js';
import type { TransformationPhase } from './TransformationDetector.js';

/** Threshold: if a line has more than this many unresolved shadows, shadow-work mode activates. */
const SHADOW_WORK_THRESHOLD = 3;

export type { WorldState } from './CandidateGeneration.js';
export type { SessionContext } from './PriorityComputation.js';

/**
 * Check if a line has exceeded the shadow-work threshold (>3 unresolved shadows).
 * When true, encounters for this line should use shadow execution mode.
 */
export function detectShadowWorkThreshold(sig: Significator, line: string): boolean {
  const unresolved = sig.shadows.entries.filter(
    (e: ShadowEntry) => e.line === line && e.resolvedAt === null,
  );
  return unresolved.length > SHADOW_WORK_THRESHOLD;
}

/**
 * Find the most active (highest severity) unresolved shadow quadrant for a line.
 * Returns null if no unresolved shadows exist for that line.
 */
export function findMostActiveShadowQuadrant(sig: Significator, line: string): ShadowQuadrant | null {
  const unresolved = sig.shadows.entries
    .filter((e: ShadowEntry) => e.line === line && e.resolvedAt === null)
    .sort((a: ShadowEntry, b: ShadowEntry) => b.severity - a.severity);
  return unresolved[0]?.quadrant ?? null;
}

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
  bleedThrough?: readonly string[],
): ScheduledEncounter[] {
  const candidates = generateCandidates(sig, world, now, session);
  if (candidates.length === 0) return [];

  const scored = candidates.map(c => ({
    candidate: c,
    priority: computePriority(c, sig, world, session, now, weights, bleedThrough),
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

  // G.9: Holonic Return — detect shadow-work threshold per-line
  // When a line accumulates >3 unresolved shadows, force shadow execution mode
  // and target the most active (highest severity) shadow quadrant for that line.
  const lineShadowModes = new Map<string, boolean>();
  const lineShadowTargets = new Map<string, ShadowQuadrant | null>();

  // Take top N, diversifying by line (no more than 2 from same line)
  const result: ScheduledEncounter[] = [];
  const lineCounts: Record<string, number> = {};
  const moduleRefs = new Set<string>();

  for (const { candidate, priority } of scored) {
    if (result.length >= count) break;
    const lc = lineCounts[candidate.line] ?? 0;
    if (lc >= 2) continue;
    // Deduplicate by moduleRef to prevent same encounter appearing multiple times
    if (moduleRefs.has(candidate.moduleRef)) continue;
    lineCounts[candidate.line] = lc + 1;
    moduleRefs.add(candidate.moduleRef);

    // G.9: Check shadow-work threshold for this candidate's line
    if (!lineShadowModes.has(candidate.line)) {
      lineShadowModes.set(candidate.line, detectShadowWorkThreshold(sig, candidate.line));
      lineShadowTargets.set(candidate.line, findMostActiveShadowQuadrant(sig, candidate.line));
    }
    const isShadowWork = lineShadowModes.get(candidate.line)!;
    const lineShadowTarget = lineShadowTargets.get(candidate.line) ?? shadowTarget;

    // G.20: During transformation crucible, force shadow mode for ego-dissolution
    const isCrucible = session.transformationState?.phase === 'crucible';
    const executionMode = isCrucible ? 'shadow' : (isShadowWork ? 'shadow' : 'capacity');

    result.push({
      id: `${candidate.moduleRef}:${candidate.holonId}:${now}`,
      moduleRef: candidate.moduleRef,
      modality: candidate.modality,
      targetLines: [candidate.line],
      stage: candidate.stage,
      holonSource: candidate.holonId,
      shadowTarget: lineShadowTarget,
      polarityMode,
      difficulty: computeDifficulty(sig, candidate.line, candidate.stage),
      sessionPosition: position,
      priority,
      driveTarget: activeShadow?.drive ?? null,
      executionMode,
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

/**
 * Threshold-mode scheduling: overrides normal scheduling during transformation.
 * Spec: foundations/24 §6.2
 */
export function scheduleThresholdMode(
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  phase: TransformationPhase,
  now: number,
): ScheduledEncounter[] {
  switch (phase) {
    case 'unravelling':
      return scheduleNext(sig, world, session, now, 3, {
        ...DEFAULT_WEIGHTS,
        thetaUrgency: 0.10,
        shadowActivation: 0.35,
        transformationReadiness: 0.30,
        polarityAlignment: 0.10,
        driveCorrection: 0.05,
        narrativeCoherence: 0.05,
        sessionFit: 0.05,
      });
    case 'crucible':
      return scheduleNext(sig, world, session, now, 2, {
        ...DEFAULT_WEIGHTS,
        thetaUrgency: 0.05,
        shadowActivation: 0.40,
        transformationReadiness: 0.35,
        polarityAlignment: 0.05,
        driveCorrection: 0.05,
        narrativeCoherence: 0.05,
        sessionFit: 0.05,
      });
    case 'emergence':
      return scheduleNext(sig, world, session, now, 3, {
        ...DEFAULT_WEIGHTS,
        thetaUrgency: 0.05,
        shadowActivation: 0.10,
        transformationReadiness: 0.05,
        polarityAlignment: 0.20,
        driveCorrection: 0.10,
        narrativeCoherence: 0.30,
        sessionFit: 0.20,
      });
    default:
      return scheduleNext(sig, world, session, now, 3);
  }
}
