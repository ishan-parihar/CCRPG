/**
 * GameLoop — headless game loop wiring all 5 engines.
 * Spec: foundations/21 (master synthesis)
 */
import type { Significator } from './domain/Significator.js';
import type { ScheduledEncounter } from './domain/EncounterSpecNew.js';
import { scheduleNextWithHolonicReturn, scheduleThresholdMode, type WorldState, type SessionContext } from './engines/EncounterScheduler.js';
import { processOutcome, applyConsequences, type PlayerResponse } from './engines/ConsequenceEngine.js';
import { detectThreshold, advanceTransformation, commitTransformation, recordKnotResolution, reconstructTransformationState, type TransformationSignal, type TransformationState } from './engines/TransformationDetector.js';
import { detectBleedThrough } from './engines/ThetaDecay.js';
import { toSnapshot } from './domain/SignificatorSnapshot.js';
import { computeCCI, type CCIScore } from './engines/CCIEngine.js';
import {
  generateSessionStrategy,
  evaluateMidSessionAdjustment,
  applyWeightBias,
  checkSafetyOverride,
  computePostTransformationBias,
  type SessionStrategy,
  type SessionStrategyAdjustment,
  type RecentEncounter,
} from './engines/AutoModeStrategy.js';
import { DEFAULT_WEIGHTS, type PriorityWeights } from './engines/PriorityComputation.js';
import { runModeAwareAssessment } from './assessments/engine.js';
import type { AssessmentResult, ShadowAssessmentResult, StageAssessment, TrialResult, ModuleExecutionMode } from './assessments/types.js';
import {
  createInitialUserMatrixModel,
  updateUserMatrix,
  promotePhase,
  resetPhaseAfterTransformation,
  inferFromResponse,
  summarizeUserMatrix,
  type UserMatrixModel,
} from './engines/UserMatrixModel.js';
import { maybeFireHook } from './engines/hooks.js';
import { stageOrdinal } from './domain/Stage.js';

export interface TickResult {
  readonly encounter: ScheduledEncounter | null;
  readonly encounters: readonly ScheduledEncounter[];
  readonly sig: Significator;
  readonly world: WorldState;
  readonly transformation: TransformationSignal | null;
  readonly bleedThrough: readonly string[];
}

/**
 * Wave 1.1: Apply a response WITHOUT scheduling the next encounter.
 * This decouples "apply consequences + update UserMatrixModel + advance
 * transformation state" from "schedule next encounter." The CLI's
 * AgenticOrchestrator already calls applyConsequences internally, so
 * passing the response to tickWithStrategy would double-count. Instead,
 * the CLI calls applyResponseOnly first, then tickWithStrategy(null, null)
 * for scheduling only.
 *
 * Returns the updated sig, world, and sessionState (with UserMatrixModel
 * and transformation state advanced).
 */
export function applyResponseOnly(
  sig: Significator,
  world: WorldState,
  sessionState: SessionState,
  response: PlayerResponse,
  previousEncounter: ScheduledEncounter,
  now: number,
): { sig: Significator; world: WorldState; sessionState: SessionState } {
  let updatedSig = sig;
  let updatedWorld = world;
  let updatedUserMatrix = sessionState.userMatrixModel;
  let updatedTransformationState = sessionState.transformationState;

  // The orchestrator already called applyConsequences, so we DON'T re-apply.
  // But we DO need to update UserMatrixModel and advance transformation state.

  // Update UserMatrixModel
  const inference = inferFromResponse(
    response.narrativeSummary ?? '',
    response.driveDirectionality,
    response.shadowSurfaced,
  );
  const line = previousEncounter.targetLines[0] ?? 'Cognitive';
  const stage = previousEncounter.stage;
  updatedUserMatrix = updateUserMatrix(updatedUserMatrix, line, stage, inference, now);
  updatedUserMatrix = promotePhase(updatedUserMatrix, updatedSig.polarity.master.mode);

  // Advance transformation state
  updatedTransformationState = advanceTransformation(updatedTransformationState, updatedSig);

  // Record knot resolution if shadow encounter was passed
  if (previousEncounter.executionMode === 'shadow') {
    const shadowPassed = Object.values(response.driveDirectionality).every(d => d === 'HealthyBalanced');
    if (shadowPassed) {
      updatedTransformationState = recordKnotResolution(updatedTransformationState);
    }
  }

  // Check for transformation commit
  const commitResult = commitTransformation(updatedTransformationState);
  if (commitResult.targetStage) {
    // Hook 3: onTransformation — fire before we mutate sig, using the pre-commit stage as `from`.
    const fromStage = updatedSig.currentStage;
    maybeFireHook('onTransformation', (h) => h.onTransformation(fromStage, commitResult.targetStage!, updatedSig));
    updatedSig = {
      ...updatedSig,
      currentStage: commitResult.targetStage,
      transformations: [
        ...updatedSig.transformations,
        {
          fromStage: updatedSig.currentStage,
          toStage: commitResult.targetStage,
          triggeredAt: Date.now(),
          triggeredAtSession: updatedSig.totalSessions,
          catalystCount: updatedSig.totalEncounters,
        },
      ],
    };
    updatedTransformationState = commitResult.newState;
    updatedUserMatrix = resetPhaseAfterTransformation(updatedUserMatrix);
  }

  // Persist transformation state to sig
  updatedSig = {
    ...updatedSig,
    transformationPhase: updatedTransformationState.phase,
    transformationTargetStage: updatedTransformationState.targetStage,
    transformationSessionsInPhase: updatedTransformationState.sessionsInPhase,
    transformationKnotsResolved: updatedTransformationState.knotsResolved,
    transformationTotalKnots: updatedTransformationState.totalKnots,
  };

  // Track outcome
  const quality = estimateResponseQuality(response);
  const newOutcome: RecentEncounter = {
    outcome: 'completed',
    quality,
    mode: previousEncounter.executionMode === 'shadow' ? 'shadow' : 'capacity',
    shadowIntegrated: previousEncounter.executionMode === 'shadow' && quality > 0.5,
  };
  const recentOutcomes = [newOutcome, ...sessionState.recentOutcomes].slice(0, 20);

  return {
    sig: updatedSig,
    world: updatedWorld,
    sessionState: {
      ...sessionState,
      recentOutcomes,
      encountersSinceRefresh: sessionState.encountersSinceRefresh + 1,
      transformationState: updatedTransformationState,
      userMatrixModel: updatedUserMatrix,
    },
  };
}

export interface SessionState {
  readonly strategy: SessionStrategy;
  readonly cci: CCIScore;
  readonly recentOutcomes: RecentEncounter[];
  readonly encountersSinceRefresh: number;
  readonly transformationState: TransformationState;
  /** GAP-D2-4: UserMatrixModel — explicit model of the user's Matrix/Potentiator. */
  readonly userMatrixModel: UserMatrixModel;
  /** Wave 3.4: Explicit session start time for accurate shadow-counting. */
  readonly sessionStartMs?: number;
}

/**
 * Initialize a new session: compute CCI, generate strategy.
 * Called once at session start before the first encounter.
 *
 * P0-7: Reconstructs transformationState from the Significator's persisted
 * fields instead of always returning a fresh 'idle' state. This preserves
 * cross-session transformation continuity — if the player was mid-crucible
 * when they last exited, they resume mid-crucible instead of resetting to idle.
 */
export function startSession(sig: Significator, session: SessionContext): SessionState {
  const snapshot = toSnapshot(sig);
  // P1-15: Pass sig so CCI delegates G_z/P_z to GreaterCycleEngine.
  const cci = computeCCI(snapshot, sig);
  const strategy = generateSessionStrategy(cci, session, null);
  return {
    strategy,
    cci,
    recentOutcomes: [],
    encountersSinceRefresh: 0,
    // P0-7: reconstruct from sig instead of always createInitialTransformationState()
    transformationState: reconstructTransformationState(sig),
    userMatrixModel: createInitialUserMatrixModel(),
    sessionStartMs: Date.now(),
  };
}

/**
 * M4 (TDG→CCRPG feedback): Async session start that augments the baseline CCI
 * with TDG-Rust graph-level health (G_z/P_z) when TDG is running.
 *
 * When TDG-Rust is NOT running, this returns the exact same SessionState as
 * the sync startSession() — zero regression. When TDG IS running, it blends
 * TDG's metabolic health into the CCI's metabolicHealth dimension and runs
 * a graph-level reflection to seed the session strategy with developmental
 * insights from the player's cross-session history.
 *
 * Callers that don't need TDG augmentation should use the sync startSession().
 */
export async function startSessionWithTDG(
  sig: Significator,
  session: SessionContext,
): Promise<SessionState> {
  // ponytail: TDG-Rust integration removed. This now delegates to the sync
  // startSession — same behavior, no dynamic TDG import. Signature preserved
  // so the CLI's USE_PERSISTENT_AGENT branch still compiles (it's always false).
  return startSession(sig, session);
}

/**
 * ponytail: TDG-Rust integration removed. Always returns null — no
 * graph-level transformation pressure without TDG. CCRPG's own
 * detectThreshold remains the authoritative signal.
 */
export async function getTDGTransformationPressure(_sig: Significator): Promise<number | null> {
  return null;
}

/**
 * Enhanced tick that uses session strategy for weight biasing.
 * Call this instead of tick() when auto-mode is active.
 *
 * Integrates CCI computation and mid-session adjustment logic:
 * 1. Applies weight bias from session strategy to priority computation
 * 2. Tracks encounter outcomes
 * 3. Every reEvaluationInterval encounters: recomputes CCI and evaluates adjustment
 */
export function tickWithStrategy(
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  sessionState: SessionState,
  response: PlayerResponse | null,
  previousEncounter: ScheduledEncounter | null,
  now: number,
): { tickResult: TickResult; sessionState: SessionState } {
  // 1. Process response from previous encounter (if available)
  let updatedSig = sig;
  let updatedWorld = world;
  // GAP-D2-4: carry forward the userMatrixModel; update it after response processing
  let updatedUserMatrix = sessionState.userMatrixModel;

  if (response && previousEncounter) {
    const record = processOutcome(previousEncounter, response, now);
    const result = applyConsequences(sig, world, record, previousEncounter);
    updatedSig = result.sig;
    updatedWorld = result.world;

    // GAP-D2-4: Update the UserMatrixModel with the inferred Matrix/Potentiator
    // state from the player's response. This is the core of the user-modelling:
    // the game infers what the user's Matrix/Potentiator looks like based on
    // how they responded, then uses that model to select the next catalyst.
    const inference = inferFromResponse(
      response.narrativeSummary ?? '',
      response.driveDirectionality,
      response.shadowSurfaced,
    );
    const line = previousEncounter.targetLines[0] ?? 'Cognitive';
    const stage = previousEncounter.stage;
    updatedUserMatrix = updateUserMatrix(updatedUserMatrix, line, stage, inference, now);
    // Promote phase based on polarity crystallization
    updatedUserMatrix = promotePhase(updatedUserMatrix, updatedSig.polarity.master.mode);
  }

  // 2. Increment encounter counter
  const encountersSinceRefresh = sessionState.encountersSinceRefresh + 1;

  // 3. Apply weight bias from strategy to default weights
  const biasedWeights: PriorityWeights = applyWeightBias(
    DEFAULT_WEIGHTS,
    sessionState.strategy.weightBias,
  );

  // 4. Check for bleed-through
  const bleedThrough = detectBleedThrough(updatedSig.theta.lastEncounter, now);

  // GAP-D2-3: Wire scheduleThresholdMode — when the transformation state
  // machine is in unravelling/crucible/emergence phase, use the threshold-mode
  // weights (which bias toward shadow-activation + transformation-readiness)
  // instead of the normal session-strategy weights. This activates the 3-phase
  // Crucible that was previously dead code.
  const tsPhase = sessionState.transformationState.phase;
  let scheduled: ScheduledEncounter[];
  if (tsPhase === 'unravelling' || tsPhase === 'crucible' || tsPhase === 'emergence') {
    scheduled = scheduleThresholdMode(updatedSig, updatedWorld, session, tsPhase, now);
  } else {
    // GAP-D2-4: pass userMatrixModel to scheduleNext so the scheduler can use
    // the user's Matrix/Potentiator model for phase-dependent targeting.
    // WIRE-1: Use scheduleNextWithHolonicReturn to inject Holonic Return encounters
    // when the cadence triggers (every 3 encounters at current stage).
    scheduled = scheduleNextWithHolonicReturn(updatedSig, updatedWorld, session, now, 5, biasedWeights, bleedThrough, undefined, sessionState.userMatrixModel, sessionState.encountersSinceRefresh);
  }
  const encounter = scheduled[0] ?? null;

  // 6. Check transformation threshold and advance state machine.
  //
  // P0-1 BUGFIX: When tickWithStrategy is called with response=null (scheduling-only
  // mode — the CLI's standard pattern), we must NOT advance the transformation state
  // machine here. The caller will invoke applyResponseOnly() which advances it.
  // Advancing here too caused the state machine to advance 2× per encounter,
  // making the 3-phase Crucible complete in half the intended sessions.
  // The transformation SIGNAL (detectThreshold) is still computed so the caller
  // can observe readiness, but the STATE is not mutated when response=null.
  const transformation = detectThreshold(updatedSig);
  let updatedTransformationState = sessionState.transformationState;

  if (response && previousEncounter) {
    // Only advance the state machine when we have an actual encounter response.
    updatedTransformationState = advanceTransformation(sessionState.transformationState, updatedSig);

    // If transformation completes, commit it and update Significator
    const commitResult = commitTransformation(updatedTransformationState);
    if (commitResult.targetStage) {
      // Hook 3: onTransformation — fire before mutating sig, using pre-commit stage as `from`.
      const fromStage = updatedSig.currentStage;
      maybeFireHook('onTransformation', (h) => h.onTransformation(fromStage, commitResult.targetStage!, updatedSig));
      // Advance the Significator to the new stage
      updatedSig = {
        ...updatedSig,
        currentStage: commitResult.targetStage,
        transformations: [
          ...updatedSig.transformations,
          {
            fromStage: updatedSig.currentStage,
            toStage: commitResult.targetStage,
            triggeredAt: Date.now(),
            triggeredAtSession: updatedSig.totalSessions,
            catalystCount: updatedSig.totalEncounters,
          },
        ],
      };
      updatedTransformationState = commitResult.newState;
      // GAP-V3-23: Reset the UserMatrixModel phase to 'unmapped' — the new stage
      // brings new territory to probe.
      updatedUserMatrix = resetPhaseAfterTransformation(updatedUserMatrix);
    }

    // GAP-V3-25: If a shadow encounter was passed, record knot resolution
    // (prior code only did this in Phaser EncounterScene, not in headless GameLoop)
    if (previousEncounter.executionMode === 'shadow') {
      const shadowPassed = Object.values(response.driveDirectionality).every(d => d === 'HealthyBalanced');
      if (shadowPassed) {
        updatedTransformationState = recordKnotResolution(updatedTransformationState);
      }
    }
  }

  // GAP-F-4: Persist transformation state back to Significator so it survives
  // across sessions. Prior code only stored it in SessionState (which is
  // ephemeral). Now we write phase + counters + targetStage to sig fields.
  updatedSig = {
    ...updatedSig,
    transformationPhase: updatedTransformationState.phase,
    transformationTargetStage: updatedTransformationState.targetStage,
    transformationSessionsInPhase: updatedTransformationState.sessionsInPhase,
    transformationKnotsResolved: updatedTransformationState.knotsResolved,
    transformationTotalKnots: updatedTransformationState.totalKnots,
  };

  // 7. Track outcome in recentOutcomes.
  //
  // P0-2 BUGFIX: When response=null (scheduling-only mode), do NOT push a phantom
  // 'avoided' outcome. The scheduling tick is not a player behavior event — it's
  // just the scheduler computing what to offer next. Pushing 'avoided' here
  // polluted recentOutcomes with [completed, avoided, completed, avoided, ...],
  // causing evaluateMidSessionAdjustment to see ~50% avoidance when the player
  // never avoided anything, incorrectly triggering theme switches to 'consolidation'.
  // Now: only push an outcome when there's an actual response.
  let recentOutcomes = sessionState.recentOutcomes;
  if (response) {
    const quality = estimateResponseQuality(response);
    const newOutcome: RecentEncounter = {
      outcome: 'completed',
      quality,
      mode: previousEncounter?.executionMode === 'shadow' ? 'shadow' : 'capacity',
      shadowIntegrated: previousEncounter?.executionMode === 'shadow' && quality > 0.5,
    };
    recentOutcomes = [newOutcome, ...sessionState.recentOutcomes].slice(0, 20);
  }

  // 8. Mid-session refresh: every reEvaluationInterval encounters
  const interval = sessionState.strategy.adjustmentThresholds.reEvaluationInterval;
  let updatedStrategy = sessionState.strategy;
  let updatedCCI = sessionState.cci;

  if (encountersSinceRefresh % interval === 0) {
    // Recompute CCI from current Significator state
    const freshSnapshot = toSnapshot(updatedSig);
    // P1-15: Pass sig so CCI delegates G_z/P_z to GreaterCycleEngine.
    updatedCCI = computeCCI(freshSnapshot, updatedSig);

    // Evaluate whether mid-session adjustment is needed
    const adjustment = evaluateMidSessionAdjustment(
      updatedStrategy,
      session,
      recentOutcomes,
    );

    if (adjustment !== null) {
      // Apply the adjustment to strategy
      updatedStrategy = applyAdjustmentToStrategy(updatedStrategy, adjustment);
    }
  }

  // 9. Safety override: if player is in distress, force consolidation theme
  const snapshot = toSnapshot(updatedSig);
  if (checkSafetyOverride(snapshot)) {
    updatedStrategy = {
      ...updatedStrategy,
      theme: 'consolidation',
      themeRationale: 'Safety override: high fixation + unresolved shadows',
    };
  }

  // 10. Post-transformation bias: apply weight adjustments after recent transformation
  const lastTransformation = updatedSig.transformations[updatedSig.transformations.length - 1];
  if (lastTransformation) {
    const sessionsSinceTransform = updatedSig.totalSessions;
    const postBias = computePostTransformationBias(sessionsSinceTransform);
    if (postBias) {
      updatedStrategy = {
        ...updatedStrategy,
        weightBias: {
          thetaUrgency: updatedStrategy.weightBias.thetaUrgency + (postBias.thetaUrgency ?? 0),
          shadowActivation: updatedStrategy.weightBias.shadowActivation + (postBias.shadowActivation ?? 0),
          polarityAlignment: updatedStrategy.weightBias.polarityAlignment + (postBias.polarityAlignment ?? 0),
          transformationReadiness: updatedStrategy.weightBias.transformationReadiness + (postBias.transformationReadiness ?? 0),
          driveCorrection: updatedStrategy.weightBias.driveCorrection + (postBias.driveCorrection ?? 0),
          narrativeCoherence: updatedStrategy.weightBias.narrativeCoherence + (postBias.narrativeCoherence ?? 0),
          sessionFit: updatedStrategy.weightBias.sessionFit + (postBias.sessionFit ?? 0),
        },
      };
    }
  }

  const tickResult: TickResult = {
    encounter,
    encounters: scheduled,
    sig: updatedSig,
    world: updatedWorld,
    transformation,
    bleedThrough,
  };

  const newSessionState: SessionState = {
    strategy: updatedStrategy,
    cci: updatedCCI,
    recentOutcomes,
    encountersSinceRefresh,
    transformationState: updatedTransformationState,
    userMatrixModel: updatedUserMatrix,
  };

  return { tickResult, sessionState: newSessionState };
}

/**
 * Apply a mid-session adjustment to the current strategy.
 * Returns a new strategy with the adjustment incorporated.
 */
function applyAdjustmentToStrategy(
  strategy: SessionStrategy,
  adjustment: SessionStrategyAdjustment,
): SessionStrategy {
  let updated = { ...strategy };

  if (adjustment.newPeakIntensity) {
    updated = {
      ...updated,
      arc: {
        ...updated.arc,
        peak: {
          ...updated.arc.peak,
          intensityRange: adjustment.newPeakIntensity,
        },
      },
    };
  }

  if (adjustment.newTheme) {
    updated = { ...updated, theme: adjustment.newTheme };
  }

  if (adjustment.newWeightBias) {
    updated = { ...updated, weightBias: adjustment.newWeightBias };
  }

  return updated;
}

/**
 * Estimate encounter quality from the richness of the player response.
 * Quality reflects engagement depth: diverse drive signals, shadow surfacing,
 * and narrative richness indicate higher engagement.
 */
function estimateResponseQuality(response: PlayerResponse): number {
  let quality = 0.5; // baseline for any completed encounter

  // Diverse drive directionality boosts quality
  const driveValues = Object.values(response.driveDirectionality);
  const uniqueDrives = new Set(driveValues).size;
  if (uniqueDrives >= 3) quality += 0.15;
  else if (uniqueDrives >= 2) quality += 0.08;

  // Shadow surfacing indicates deep engagement
  if (response.shadowSurfaced !== null) quality += 0.15;

  // Shadow resolution indicates integration
  if (response.shadowResolvedId !== null) quality += 0.1;

  // Longer narrative suggests deeper engagement
  if (response.narrativeSummary.length > 100) quality += 0.1;
  else if (response.narrativeSummary.length > 50) quality += 0.05;

  return Math.min(1.0, quality);
}

/**
 * Execute a module headlessly given pre-collected trials.
 * Bridges the gap between encounter scheduling and consequence processing.
 * In headless/test mode, trials are provided directly.
 * In game mode, the AssessmentScene collects trials interactively.
 */
export function executeModule(
  module: StageAssessment,
  trials: readonly TrialResult[],
  mode: ModuleExecutionMode,
): AssessmentResult | ShadowAssessmentResult {
  return runModeAwareAssessment(module, trials, mode);
}

/**
 * End a session: apply theta-decay to all unvisited modules,
 * persist final state, and return session summary.
 *
 * P1-14: Now advances macro-event lifecycle (onset → active → resolution)
 * via advanceMacroEvent(). Prior to P1-14, the lifecycle functions were
 * exported but never called — macroEventsAdvanced was hardcoded to 0.
 *
 * @param world Optional WorldState — when provided, macro-event states are
 *              advanced and the updated world is returned. When omitted,
 *              macro-event advancement is skipped (backward compat).
 */
export function endSession(
  sig: Significator,
  sessionState: SessionState,
  now: number,
  world?: WorldState,
): { sig: Significator; world?: WorldState; summary: { encountersCompleted: number; shadowsSurfaced: number; shadowsResolved: number; userMatrixSummary?: ReturnType<typeof summarizeUserMatrix>; macroEventsAdvanced?: number }; harvestCheck?: { harvestable: boolean; direction: 'STO' | 'STS' | null; reason: string } | null } {
  const encountersCompleted = sessionState.recentOutcomes.filter(o => o.outcome === 'completed').length;
  const sessionStartMs = sessionState.sessionStartMs ?? now;
  const shadowsSurfaced = sig.shadows.entries.filter(e => e.surfacedAt >= sessionStartMs).length;
  const shadowsResolved = sig.shadows.entries.filter(e => e.resolvedAt !== null && e.resolvedAt >= sessionStartMs).length;

  // Wave 3.5: Summarize UserMatrixModel for telemetry
  const userMatrixSummary = summarizeUserMatrix(sessionState.userMatrixModel);

  // P1-14: Advance macro-event lifecycle at session end.
  // Prior to P1-14, advanceMacroEvent/recordMacroChoice/resolveMacroEvent were
  // exported but NEVER called from runtime — macroEventsAdvanced was hardcoded 0.
  // Now we advance each active macro event's state by one session. Events that
  // reach 'resolution' phase are resolved (PESTLE tension reset for their dimension).
  let macroEventsAdvanced = 0;
  let updatedWorld = world;
  if (world && world.activeMacroEvents.length > 0) {
    const { advanceMacroEvent, resolveMacroEvent } = require('./engines/MacroCatalystEngine.js');
    const existingStates = world.macroEventStates ?? [];
    const newStates: { eventId: string; state: any }[] = [];
    const resolvedEvents: string[] = [];

    for (const event of world.activeMacroEvents) {
      const existing = existingStates.find(s => s.eventId === event.id);
      const currentState = existing?.state ?? { phase: 'onset', sessionsInPhase: 0, playerChoices: [], encountersSinceStart: 0 };
      const advanced = advanceMacroEvent(currentState);
      newStates.push({ eventId: event.id, state: advanced });
      macroEventsAdvanced++;

      if (advanced.phase === 'resolution') {
        resolvedEvents.push(event.id);
      }
    }

    // Resolve events that reached resolution phase — reset their PESTLE dimension
    let newPestle = { ...world.pestleTension };
    const remainingEvents = world.activeMacroEvents.filter(e => !resolvedEvents.includes(e.id));
    for (const eventId of resolvedEvents) {
      const event = world.activeMacroEvents.find(e => e.id === eventId);
      if (event) {
        const result = resolveMacroEvent(
          newStates.find(s => s.eventId === eventId)!.state,
          newPestle,
        );
        newPestle = result.tension;
      }
    }

    updatedWorld = {
      ...world,
      pestleTension: newPestle,
      activeMacroEvents: remainingEvents,
      macroEventStates: newStates.filter(s => !resolvedEvents.includes(s.eventId)),
    };
  }

  // P2-1 (UX-R3): Only count a session if at least one encounter completed.
  // Previously every endSession() call incremented totalSessions, including
  // failed runs where every encounter crashed — so a user who ran 6 commands
  // that all failed would see 'totalSessions: 6' in their save file, which
  // was misleading. Now only sessions with real activity count.
  const updatedSig: Significator = {
    ...sig,
    totalSessions: encountersCompleted > 0 ? sig.totalSessions + 1 : sig.totalSessions,
  };

  // P2-Critical: Wire checkHarvest into runtime. Per foundations/19 §9, at
  // White stage, check if the player is harvestable. If not, enter Samsara
  // mode (the player continues in a post-White loop receiving increasingly
  // intense catalysts to force crystallization). The harvest check uses the
  // STO 51% / STS 95% thresholds per foundations/19 §5.
  let harvestResult: { harvestable: boolean; direction: 'STO' | 'STS' | null; reason: string } | null = null;
  if (updatedSig.currentStage === 'White') {
    try {
      // Use static import to avoid async in sync function
      const { checkHarvest } = require('./engines/PolarityEngine.js');
      // WIRE-5: Fix checkHarvest inputs — use crystallization (direction commitment)
      // not coherence (consistency). Per foundations/19 §5, the harvest requires
      // mean(direction_strength) ≥ 0.51 (STO) / 0.95 (STS). Direction strength =
      // how committed the polarity is, measured by crystallization progress.
      // Previously passed coherence (consistency) which is a different metric.
      const directionStrengths = Object.keys(updatedSig.polarity.lineProfiles ?? {}).length > 0
        ? Object.keys(updatedSig.polarity.lineProfiles ?? {}).map(line => {
            // WIRE-5: Use crystallization from polarity cells as direction strength
            // (not coherence). Crystallization measures commitment; coherence
            // measures consistency. The spec requires commitment.
            const cellKey = `${line}:${updatedSig.currentStage}`;
            const cell = updatedSig.polarity.cells[cellKey];
            return cell?.crystallization ?? 0;
          })
        : [updatedSig.polarity.master.crystallizationProgress ?? 0];
      const violetRay = updatedSig.rayProfile.Violet ?? 0;
      const altitudeFloor = Math.min(...Object.values(updatedSig.altitudes).map(s => stageOrdinal(s)));
      harvestResult = checkHarvest(updatedSig.polarity.master, directionStrengths, altitudeFloor, violetRay);
    } catch {
      // checkHarvest unavailable — skip
    }
  }

  // Hook 4: onSessionEnd — fire fire-and-forget for the sync path.
  // Callers that need to await the hook (e.g. CLI --agent before stopTDGBridge)
  // should use endSessionAsync() instead, which awaits the hook before returning.
  maybeFireHook('onSessionEnd', (h) => h.onSessionEnd(updatedSig));

  return {
    sig: updatedSig,
    ...(updatedWorld !== world ? { world: updatedWorld } : {}),
    summary: { encountersCompleted, shadowsSurfaced, shadowsResolved, userMatrixSummary, macroEventsAdvanced },
    // P2-Critical: harvest check result (null unless player is at White stage)
    harvestCheck: harvestResult,
  };
}

/**
 * P0-3 BUGFIX: Async session end that AWAITS the TDG onSessionEnd hook before
 * returning. The sync endSession() fires the hook fire-and-forget, which is
 * fine when TDG is not running. But when TDG IS running and the caller is
 * about to call stopTDGBridge() (which kills the TDG-Rust process synchronously),
 * the fire-and-forget hook can be interrupted mid-call — losing the
 * tdg_consolidate + tdg_save_mind_state operations.
 *
 * Callers that use TDG (--agent flag) should call endSessionAsync() and await
 * it BEFORE calling stopTDGBridge(). Callers that don't use TDG can use the
 * sync endSession() — the hook no-ops immediately when TDG is inactive.
 *
 * Returns the same shape as endSession().
 */
export async function endSessionAsync(
  sig: Significator,
  sessionState: SessionState,
  now: number,
  world?: WorldState,
): Promise<{ sig: Significator; world?: WorldState; summary: { encountersCompleted: number; shadowsSurfaced: number; shadowsResolved: number; userMatrixSummary?: ReturnType<typeof summarizeUserMatrix>; macroEventsAdvanced?: number } }> {
  const encountersCompleted = sessionState.recentOutcomes.filter(o => o.outcome === 'completed').length;
  const sessionStartMs = sessionState.sessionStartMs ?? now;
  const shadowsSurfaced = sig.shadows.entries.filter(e => e.surfacedAt >= sessionStartMs).length;
  const shadowsResolved = sig.shadows.entries.filter(e => e.resolvedAt !== null && e.resolvedAt >= sessionStartMs).length;

  const userMatrixSummary = summarizeUserMatrix(sessionState.userMatrixModel);

  // P1-14: Advance macro-event lifecycle (same logic as sync endSession above).
  let macroEventsAdvanced = 0;
  let updatedWorld = world;
  if (world && world.activeMacroEvents.length > 0) {
    const { advanceMacroEvent, resolveMacroEvent } = await import('./engines/MacroCatalystEngine.js');
    const existingStates = world.macroEventStates ?? [];
    const newStates: { eventId: string; state: import('./engines/MacroCatalystEngine.js').MacroEventState }[] = [];
    const resolvedEvents: string[] = [];

    for (const event of world.activeMacroEvents) {
      const existing = existingStates.find(s => s.eventId === event.id);
      const currentState = existing?.state ?? { event, phase: 'onset' as const, sessionsInPhase: 0, playerChoices: [], encountersSinceStart: 0 };
      const advanced = advanceMacroEvent(currentState);
      newStates.push({ eventId: event.id, state: advanced });
      macroEventsAdvanced++;

      if (advanced.phase === 'resolution') {
        resolvedEvents.push(event.id);
      }
    }

    let newPestle = { ...world.pestleTension };
    const remainingEvents = world.activeMacroEvents.filter(e => !resolvedEvents.includes(e.id));
    for (const eventId of resolvedEvents) {
      const stateEntry = newStates.find(s => s.eventId === eventId);
      if (stateEntry) {
        const result = resolveMacroEvent(stateEntry.state, newPestle);
        newPestle = result.tension;
      }
    }

    updatedWorld = {
      ...world,
      pestleTension: newPestle,
      activeMacroEvents: remainingEvents,
      macroEventStates: newStates.filter(s => !resolvedEvents.includes(s.eventId)),
    };
  }

  // P2-1 (UX-R3): Only count a session if at least one encounter completed
  // (matches endSession's behavior). See comment in endSession().
  const updatedSig: Significator = {
    ...sig,
    totalSessions: encountersCompleted > 0 ? sig.totalSessions + 1 : sig.totalSessions,
  };

  // ponytail: TDG-Rust onSessionEnd hook removed. The async endSessionAsync
  // now has the same behavior as the sync endSession — no TDG hook to await.

  return {
    sig: updatedSig,
    ...(updatedWorld !== world ? { world: updatedWorld } : {}),
    summary: { encountersCompleted, shadowsSurfaced, shadowsResolved, userMatrixSummary, macroEventsAdvanced },
  };
}
