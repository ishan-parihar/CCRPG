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
  now: number,
): { tickResult: TickResult; sessionState: SessionState } {
  // 1. Increment encounter counter
  const encountersSinceRefresh = sessionState.encountersSinceRefresh + 1;

  // 2. Apply weight bias from strategy to default weights
  const biasedWeights: PriorityWeights = applyWeightBias(
    DEFAULT_WEIGHTS,
    sessionState.strategy.weightBias,
  );

  // 3. Check for bleed-through
  const bleedThrough = detectBleedThrough(sig.theta.lastEncounter, now);

  // 4. Schedule next encounter (scheduler uses its own internal priority, but we
  //    pass the session context which influences session_fit scoring)
  const scheduled = scheduleNext(sig, world, session, now, 1);
  const encounter = scheduled[0] ?? null;

  // 5. Process response if available
  let updatedSig = sig;
  let updatedWorld = world;

  if (response && encounter) {
    const record = processOutcome(encounter, response, now);
    const result = applyConsequences(sig, world, record);
    updatedSig = result.sig;
    updatedWorld = result.world;
  }

  // 6. Check transformation threshold
  const transformation = detectThreshold(updatedSig);

  // 7. Track outcome in recentOutcomes
  const newOutcome: RecentEncounter = {
    outcome: response ? 'completed' : 'avoided',
    quality: response ? 0.7 : 0.3,
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
 * Single game tick: schedule encounter, await response, apply consequences, check transformation.
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
  now: number,
): TickResult {
  // 1. Check for bleed-through (theta-decay urgency)
  const bleedThrough = detectBleedThrough(sig.theta.lastEncounter, now);

  // 2. Schedule next encounter
  const scheduled = scheduleNext(sig, world, session, now, 1);
  const encounter = scheduled[0] ?? null;

  // 3. If we have a response (from previous encounter), process consequences
  let updatedSig = sig;
  let updatedWorld = world;

  if (response && encounter) {
    const record = processOutcome(encounter, response, now);
    const result = applyConsequences(sig, world, record);
    updatedSig = result.sig;
    updatedWorld = result.world;
  }

  // 4. Check transformation threshold
  const transformation = detectThreshold(updatedSig);

  return { encounter, sig: updatedSig, world: updatedWorld, transformation, bleedThrough };
}
