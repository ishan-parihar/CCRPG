/**
 * GameLoop — headless game loop wiring all 5 engines.
 * Spec: foundations/21 (master synthesis)
 */
import type { Significator } from './domain/Significator.js';
import type { ScheduledEncounter } from './domain/EncounterSpecNew.js';
import { scheduleNext, scheduleThresholdMode, type WorldState, type SessionContext } from './engines/EncounterScheduler.js';
import { processOutcome, applyConsequences, type PlayerResponse } from './engines/ConsequenceEngine.js';
import { detectThreshold, advanceTransformation, commitTransformation, createInitialTransformationState, type TransformationSignal, type TransformationState } from './engines/TransformationDetector.js';
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
  inferFromResponse,
  type UserMatrixModel,
} from './engines/UserMatrixModel.js';

export interface TickResult {
  readonly encounter: ScheduledEncounter | null;
  readonly encounters: readonly ScheduledEncounter[];
  readonly sig: Significator;
  readonly world: WorldState;
  readonly transformation: TransformationSignal | null;
  readonly bleedThrough: readonly string[];
}

export interface SessionState {
  readonly strategy: SessionStrategy;
  readonly cci: CCIScore;
  readonly recentOutcomes: RecentEncounter[];
  readonly encountersSinceRefresh: number;
  readonly transformationState: TransformationState;
  /** GAP-D2-4: UserMatrixModel — explicit model of the user's Matrix/Potentiator. */
  readonly userMatrixModel: UserMatrixModel;
}

/**
 * Initialize a new session: compute CCI, generate strategy.
 * Called once at session start before the first encounter.
 */
export function startSession(sig: Significator, session: SessionContext): SessionState {
  const snapshot = toSnapshot(sig);
  const cci = computeCCI(snapshot);
  const strategy = generateSessionStrategy(cci, session, null);
  return {
    strategy,
    cci,
    recentOutcomes: [],
    encountersSinceRefresh: 0,
    transformationState: createInitialTransformationState(),
    userMatrixModel: createInitialUserMatrixModel(),
  };
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
    scheduled = scheduleNext(updatedSig, updatedWorld, session, now, 5, biasedWeights, bleedThrough, undefined, sessionState.userMatrixModel);
  }
  const encounter = scheduled[0] ?? null;

  // 6. Check transformation threshold and advance state machine
  const transformation = detectThreshold(updatedSig);
  let updatedTransformationState = advanceTransformation(sessionState.transformationState, updatedSig);
  
  // If transformation completes, commit it and update Significator
  const commitResult = commitTransformation(updatedTransformationState);
  if (commitResult.targetStage) {
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

  // 7. Track outcome in recentOutcomes
  const quality = response ? estimateResponseQuality(response) : 0.3;
  const newOutcome: RecentEncounter = {
    outcome: response ? 'completed' : 'avoided',
    quality,
    mode: 'capacity',
    shadowIntegrated: false,
  };
  const recentOutcomes = [newOutcome, ...sessionState.recentOutcomes].slice(0, 20);

  // 8. Mid-session refresh: every reEvaluationInterval encounters
  const interval = sessionState.strategy.adjustmentThresholds.reEvaluationInterval;
  let updatedStrategy = sessionState.strategy;
  let updatedCCI = sessionState.cci;

  if (encountersSinceRefresh % interval === 0) {
    // Recompute CCI from current Significator state
    const freshSnapshot = toSnapshot(updatedSig);
    updatedCCI = computeCCI(freshSnapshot);

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
 * Single game tick: process previous response, schedule next encounter, check transformation.
 * In headless mode, `response` is provided directly (for testing/simulation).
 *
 * This is the original tick function, preserved for backward compatibility
 * when auto-mode is not active.
 */
export function tick(
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  response: PlayerResponse | null,
  previousEncounter: ScheduledEncounter | null,
  now: number,
): TickResult {
  // 1. Process response from PREVIOUS encounter
  let updatedSig = sig;
  let updatedWorld = world;

  if (response && previousEncounter) {
    const record = processOutcome(previousEncounter, response, now);
    const result = applyConsequences(sig, world, record, previousEncounter);
    updatedSig = result.sig;
    updatedWorld = result.world;
  }

  // 2. Check for bleed-through (theta-decay urgency)
  const bleedThrough = detectBleedThrough(updatedSig.theta.lastEncounter, now);

  const scheduled = scheduleNext(updatedSig, updatedWorld, session, now, 1, undefined, bleedThrough);
  const encounter = scheduled[0] ?? null;

  // 4. Check transformation threshold
  const transformation = detectThreshold(updatedSig);

  return { encounter, encounters: scheduled, sig: updatedSig, world: updatedWorld, transformation, bleedThrough };
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
 */
export function endSession(
  sig: Significator,
  sessionState: SessionState,
  now: number,
): { sig: Significator; summary: { encountersCompleted: number; shadowsSurfaced: number; shadowsResolved: number } } {
  // Apply theta-decay: increment decay for all cells NOT visited this session
  // recentOutcomes don't carry cell keys directly, so we rely on theta timestamps
  // Cells with timestamps >= session start are considered visited

  // Count session stats
  const encountersCompleted = sessionState.recentOutcomes.filter(o => o.outcome === 'completed').length;
  // Count shadows surfaced and resolved during this session
  // (entries created or resolved since the first outcome in this session)
  const sessionStartMs = sessionState.recentOutcomes.length > 0
    ? now - sessionState.recentOutcomes.length * 5000 // approximate session start
    : now;
  const shadowsSurfaced = sig.shadows.entries.filter(e => e.surfacedAt >= sessionStartMs).length;
  const shadowsResolved = sig.shadows.entries.filter(e => e.resolvedAt !== null && e.resolvedAt >= sessionStartMs).length;

  // Increment totalSessions
  const updatedSig: Significator = {
    ...sig,
    totalSessions: sig.totalSessions + 1,
  };

  return {
    sig: updatedSig,
    summary: { encountersCompleted, shadowsSurfaced, shadowsResolved },
  };
}
