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
import type { UserMatrixModel } from './UserMatrixModel.js';

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

// ─── ACTION-3: Knot-Pair Generation (foundations/17 §5) ──────────────

export interface KnotPair {
  readonly anchorShadow: ShadowEntry;     // dark shadow at current stage
  readonly blockShadow: ShadowEntry;      // golden shadow at next stage
  readonly line: string;                  // shared line
  readonly drive: string;                 // shared drive axis
  readonly anchorEncounter: ScheduledEncounter; // Encounter A: surfaces dark anchor
  readonly blockEncounter: ScheduledEncounter;  // Encounter B: invites golden capacity
}

/**
 * ACTION-3: Detect knot-pairs — dark-anchor + golden-block shadow pairs
 * that share the same drive axis across current and next stage.
 *
 * Per foundations/17 §5: "A 'knot' is a compound shadow — a dark-shadow at
 * current stage structurally linked to a golden-allergy at next stage. Encounter
 * A surfaces the dark anchor; Encounter B (immediately follows) demands the
 * golden capacity."
 *
 * Knots are the CORE MECHANIC of the Lovers Crucible. Without them, the
 * Crucible is just "5 sessions of shadow mode" with no structural relationship
 * between dark and golden shadows. The evolve/heal vector (golden integration
 * dissolves dark knots) cannot fire without knot detection.
 *
 * @param sig The player's Significator
 * @param currentStage The player's current stage
 * @param nextStage The target stage (currentStage + 1)
 * @returns Array of KnotPairs (may be empty if no knots detected)
 */
export function detectKnotPairs(
  sig: Significator,
  currentStage: string,
  nextStage: string,
): readonly KnotPair[] {
  const knots: KnotPair[] = [];

  // Find dark shadows at current stage (the "anchor")
  const darkAnchors = sig.shadows.entries.filter(
    e => e.resolvedAt === null
      && e.stage === currentStage
      && (e.quadrant === 'DarkAddiction' || e.quadrant === 'DarkAllergy'),
  );

  // Find golden shadows at next stage (the "block")
  const goldenBlocks = sig.shadows.entries.filter(
    e => e.resolvedAt === null
      && e.stage === nextStage
      && (e.quadrant === 'GoldenAddiction' || e.quadrant === 'GoldenAllergy'),
  );

  // Match by shared drive axis (same drive on both sides = knot)
  for (const anchor of darkAnchors) {
    for (const block of goldenBlocks) {
      if (anchor.line === block.line && anchor.drive === block.drive) {
        // Generate the A→B encounter pair
        const anchorEncounter: ScheduledEncounter = {
          id: `knot-anchor:${anchor.line}:${currentStage}:${Date.now()}`,
          moduleRef: `${anchor.line}:${currentStage}`,
          modality: 'LanguageReflective',
          targetLines: [anchor.line as any],
          stage: currentStage as any,
          holonSource: `${anchor.line}:${currentStage}`,
          shadowTarget: anchor.quadrant,
          polarityMode: 'Exploring',
          difficulty: 0.7,
          sessionPosition: 'peak',
          priority: 0.9,
          driveTarget: anchor.drive,
          executionMode: 'shadow',
        };
        const blockEncounter: ScheduledEncounter = {
          id: `knot-block:${block.line}:${nextStage}:${Date.now()}`,
          moduleRef: `${block.line}:${nextStage}`,
          modality: 'ScenarioChoice',
          targetLines: [block.line as any],
          stage: nextStage as any,
          holonSource: `${block.line}:${nextStage}`,
          shadowTarget: block.quadrant,
          polarityMode: 'Exploring',
          difficulty: 0.8,
          sessionPosition: 'peak',
          priority: 0.9,
          driveTarget: block.drive,
          executionMode: 'shadow',
        };

        knots.push({
          anchorShadow: anchor,
          blockShadow: block,
          line: anchor.line,
          drive: anchor.drive,
          anchorEncounter,
          blockEncounter,
        });
      }
    }
  }

  return knots;
}

/**
 * Schedule the next N encounters, ranked by priority.
 *
 * T-0.4 (HS-13 fix): the optional `moduleTaskTypesProvider` callback is
 * forwarded to `generateCandidates` to filter modalities by module support.
 */
export function scheduleNext(
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  now: number,
  count: number = 3,
  weights?: PriorityWeights,
  bleedThrough?: readonly string[],
  moduleTaskTypesProvider?: (moduleRef: string) => Set<string> | undefined,
  userMatrixModel?: UserMatrixModel,
): ScheduledEncounter[] {
  const candidates = generateCandidates(sig, world, now, session, moduleTaskTypesProvider);
  if (candidates.length === 0) return [];

  const scored = candidates.map(c => ({
    candidate: c,
    priority: computePriority(c, sig, world, session, now, weights, bleedThrough, userMatrixModel),
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
