/**
 * ShadowDetector — detects fixation, regression, and repression patterns.
 * Per foundations/10 §2.1: three failure modes per line.
 */
import type { Line } from '../domain/Line.js';
import type { PlayerProfile, ShadowSignal, TaskSlug } from '../domain/PlayerProfile.js';
import { ALL_LINES } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';

/** Correct line→task mapping (post-refactor). */
const LINE_TASK_MAP: Readonly<Record<Line, TaskSlug>> = {
  Cognitive: 'n_back',
  Emotional: 'affect_recognition',
  Moral: 'dilemma_choice',
  Intrapersonal: 'self_report',
  Spiritual: 'value_coherence',
  Somatic: 'reaction_time',
  Willpower: 'held_input',
  Interpersonal: 'pattern_prediction',
};

/**
 * Detect shadow signals from the player's profile.
 * - Repression: a line ≥2 stages below the synthesised stage.
 * - Fixation: staircase with many trials but no reversals (stuck).
 * - Regression: altitude history shows a drop that persisted.
 */
export function detectShadows(profile: PlayerProfile): readonly ShadowSignal[] {
  const signals: ShadowSignal[] = [];
  const now = Date.now();
  const stageOrd = stageOrdinal(profile.stage);

  for (const line of ALL_LINES) {
    const lineOrd = stageOrdinal(profile.altitudes[line]);

    // Repression: line ≥2 stages below overall stage
    if (stageOrd - lineOrd >= 2) {
      signals.push({
        type: 'repression',
        line,
        detectedAtMs: now,
        description: `${line} line is significantly below overall stage.`,
      });
    }

    // Fixation: staircase with >10 trials but 0 reversals (no adaptive movement)
    const staircase = profile.taskStaircases[LINE_TASK_MAP[line]];
    if (staircase && staircase.history.length > 10 && staircase.reversals === 0) {
      signals.push({
        type: 'fixation',
        line,
        detectedAtMs: now,
        description: `${line} line shows fixation — no adaptive movement.`,
      });
    }

    // Regression: altitude history shows a drop that persisted (≥3 entries at lower stage)
    const lineHistory = profile.altitudeHistory.filter(h => h.line === line);
    if (lineHistory.length >= 4) {
      const recent = lineHistory.slice(-3);
      const peak = Math.max(...lineHistory.map(h => stageOrdinal(h.stage)));
      const recentMax = Math.max(...recent.map(h => stageOrdinal(h.stage)));
      if (peak - recentMax >= 1) {
        signals.push({
          type: 'regression',
          line,
          detectedAtMs: now,
          description: `${line} line has regressed from a higher altitude.`,
        });
      }
    }
  }

  return signals;
}
