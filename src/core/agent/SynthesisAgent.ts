/**
 * SynthesisAgent — computes module transitions.
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 2 (sub-agent roster).
 *
 * Background: cci_computed is published by the CCIEngine when a
 * Cognitive-Capacity-Index score is produced. SynthesisAgent observes
 * the score plus the Loom and decides whether the player should
 * advance modules or stay in the current one.
 *
 * Phase 3 surface: this version of SynthesisAgent is *read-only* and
 * emits a structured recommendation. The decision to advance is made
 * by the DirectorAgent and ultimately by the existing engine
 * strategy generator — SynthesisAgent does not mutate state itself.
 */

import type { Loom } from './Loom.js';

export interface SynthesisRecommendation {
  readonly action: 'advance' | 'hold';
  /** Free-text rationale, Veil register. */
  readonly rationale: string;
}

export class SynthesisAgent {
  /** Stub — Phase 6 will add real CCI-signal-driven logic. */
  recommend(loom: Loom, _cciHint: number | null): SynthesisRecommendation {
    void loom;
    return {
      action: 'hold',
      rationale: 'No enough CCI signal yet; stay in current module.',
    };
  }
}
