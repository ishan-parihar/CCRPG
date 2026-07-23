/**
 * RecognitionAgent — recognises polarity patterns across MCQ picks.
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 12 (4+1 polarity taxonomy),
 * Decision 7 (4 options per probe, each with a polarity).
 *
 * Inputs: a list of polarity selections the player has made so far.
 * Output: a `RecognitionProfile` describing which quadrant of the
 *         dialectical space is currently under-explored.
 *
 * The RecognitionAgent's primary job is to *inform* the next probe —
 * which polarity should be on the menu. The CalibrationAgent already
 * takes the Loom into account when composing a probe; RecognitionAgent
 * provides the explicit ask: "the next probe must include an option
 * tagged with polarity X because that quadrant is under-represented."
 */

import type { ProbePolarity } from './AgenticProbe.js';

export interface RecognitionProfile {
  readonly counts: Readonly<Record<ProbePolarity, number>>;
  /** The least-chosen polarities, ordered from least to most chosen. */
  readonly underrepresented: readonly ProbePolarity[];
  /** 0..1 spread: how balanced the player's polarity distribution is.
   *  1.0 = perfectly balanced; 0.0 = completely one-sided. */
  readonly balance: number;
}

const POLARITIES: readonly ProbePolarity[] = [
  'action',
  'reflective',
  'communion',
  'integrative',
];

export class RecognitionAgent {
  /**
   * Compute a RecognitionProfile from the player's polarity log.
   * Pure function — exported-style constructor.
   */
  profile(selected: readonly ProbePolarity[]): RecognitionProfile {
    const counts: Record<ProbePolarity, number> = {
      action: 0,
      reflective: 0,
      communion: 0,
      integrative: 0,
    };
    for (const p of selected) counts[p] = (counts[p] ?? 0) + 1;

    const sorted = [...POLARITIES].sort((a, b) => counts[a] - counts[b]);
    const total = selected.length;
    if (total === 0) {
      return { counts, underrepresented: sorted, balance: 0 };
    }
    let max = 0;
    let min = Infinity;
    for (const p of POLARITIES) {
      if (counts[p] > max) max = counts[p];
      if (counts[p] < min) min = counts[p];
    }
    // Perfectly balanced (all four equal) → 1.0; one-sided → 0.0.
    const balance = max === 0 ? 0 : Math.min(1, (min / max));
    return { counts, underrepresented: sorted, balance };
  }
}
