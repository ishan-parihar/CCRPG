/**
 * ReflectionAgent — analyses free-text inputs (the +1).
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 2 (sub-agent roster), 6
 * (Loom as context).
 *
 * Inputs: the player's free-text + the Loom snapshot.
 * Output: a `ReflectionDelta` describing how the free-input moved the
 *         DirectorAgent's diagnostic state (toward which polarity the
 *         player leans; surfaces of themselves they keep returning to).
 *
 * We intentionally avoid forcing the LLM to *score* the free-text. The
 * delta is qualitative and Veil-register-friendly. The amount of
 * calibration signal absorbed is captured in the probe's
 * `metadata.signalWeight`, *not* here; ReflectionAgent only updates
 * the Loom's narrative memory.
 */

import type { Loom } from './Loom.js';

export interface ReflectionDelta {
  /** Free-text interpretation in 1-2 sentences, Veil register. */
  readonly summary: string;
  /** Polarity the free-input leans toward (best-guess). */
  readonly lean: 'action' | 'reflective' | 'communion' | 'integrative' | null;
}

export class ReflectionAgent {
  /** Stub: real implementation lands in Phase 6 wiring. For now,
   *  records into the Loom and returns a minimal delta. */
  observe(loom: Loom, freeInput: string, polarity: string): ReflectionDelta {
    void loom; // reserved for full Loom-driven analysis in Phase 6
    void polarity;
    return {
      summary: freeInput.length === 0 ? '(no free input)' : freeInput.slice(0, 200),
      lean: null,
    };
  }
}
