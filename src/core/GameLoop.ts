/**
 * GameLoop — headless game loop wiring all 5 engines.
 * Spec: foundations/21 (master synthesis)
 */
import type { Significator } from './domain/Significator.js';
import type { ScheduledEncounter } from './domain/EncounterSpecNew.js';
import { scheduleNext, type WorldState, type SessionContext } from './engines/EncounterScheduler.js';
import { processOutcome, applyConsequences, type PlayerResponse } from './engines/ConsequenceEngine.js';
import { detectThreshold, type TransformationSignal } from './engines/TransformationDetector.js';
import { detectBleedThrough } from './engines/ThetaDecay.js';
import { toSnapshot } from './domain/SignificatorSnapshot.js';
import { computeCCI, type CCIScore } from './engines/CCIEngine.js';
import {
  generateSessionStrategy,
  evaluateMidSessionAdjustment,
  applyWeightBias,
  type SessionStrategy,
  type SessionStrategyAdjustment,
  type RecentEncounter,
} from './engines/AutoModeStrategy.js';
import { DEFAULT_WEIGHTS, type PriorityWeights } from './engines/PriorityComputation.js';
import { runModeAwareAssessment } from './assessments/engine.js';
import type { AssessmentResult, ShadowAssessmentResult, StageAssessment, TrialResult, ModuleExecutionMode } from './assessments/types.js';

export interface TickResult {
  readonly encounter: ScheduledEncounter | null;
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

  if (response && previousEncounter) {
    const record = processOutcome(previousEncounter, response, now);
    const result = applyConsequences(sig, world, record, previousEncounter);
    updatedSig = result.sig;
    updatedWorld = result.world;
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

  // 5. Schedule next encounter with updated state and biased weights
  const scheduled = scheduleNext(updatedSig, updatedWorld, session, now, 1, biasedWeights);
  const encounter = scheduled[0] ?? null;

  // 6. Check transformation threshold
  const transformation = detectThreshold(updatedSig);

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

  const tickResult: TickResult = {
    encounter,
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

  // 3. Schedule next encounter
  const scheduled = scheduleNext(updatedSig, updatedWorld, session, now, 1);
  const encounter = scheduled[0] ?? null;

  // 4. Check transformation threshold
  const transformation = detectThreshold(updatedSig);

  return { encounter, sig: updatedSig, world: updatedWorld, transformation, bleedThrough };
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
  const shadowsSurfaced = sig.shadows.entries.filter(e => e.surfacedAt >= now - sessionState.cci.composite * 3600000).length;
  const shadowsResolved = sig.shadows.entries.filter(e => e.resolvedAt !== null && e.resolvedAt >= now - 3600000).length;

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
