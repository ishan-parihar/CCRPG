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

export interface TickResult {
  readonly encounter: ScheduledEncounter | null;
  readonly sig: Significator;
  readonly world: WorldState;
  readonly transformation: TransformationSignal | null;
  readonly bleedThrough: readonly string[];
}

/**
 * Single game tick: schedule encounter, await response, apply consequences, check transformation.
 * In headless mode, `response` is provided directly (for testing/simulation).
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
