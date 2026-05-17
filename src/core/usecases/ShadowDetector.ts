/**
 * ShadowDetector — detects fixation, regression, and repression patterns.
 */
import type { Line } from '../domain/Line.js';
import type { PlayerProfile, ShadowSignal, StaircaseState } from '../domain/PlayerProfile.js';
import { ALL_LINES } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';

/**
 * Detect shadow signals from the player's profile.
 * - Fixation: a line stuck at the same level for too many trials without progress.
 * - Regression: a line's staircase level dropping significantly.
 * - Repression: one line far below the others (≥2 stages gap).
 */
export function detectShadows(profile: PlayerProfile): readonly ShadowSignal[] {
  const signals: ShadowSignal[] = [];
  const now = Date.now();

  // Repression: any line ≥2 stages below the synthesised stage
  const stageOrd = stageOrdinal(profile.stage);
  for (const line of ALL_LINES) {
    const lineOrd = stageOrdinal(profile.altitudes[line]);
    if (stageOrd - lineOrd >= 2) {
      signals.push({
        type: 'repression',
        line,
        detectedAtMs: now,
        description: `${line} line is significantly below overall stage.`,
      });
    }
  }

  // Fixation: staircase with many trials but no reversals (stuck)
  for (const line of ALL_LINES) {
    const staircase = findStaircaseForLine(profile, line);
    if (staircase && staircase.history.length > 10 && staircase.reversals === 0) {
      signals.push({
        type: 'fixation',
        line,
        detectedAtMs: now,
        description: `${line} line shows fixation — no adaptive movement.`,
      });
    }
  }

  return signals;
}

function findStaircaseForLine(profile: PlayerProfile, line: Line): StaircaseState | undefined {
  // Map line to its primary task slug
  const lineTaskMap: Partial<Record<Line, keyof typeof profile.taskStaircases>> = {
    Cognitive: 'n_back',
    Emotional: 'affect_recognition',
    Moral: 'dilemma_choice',
    Intrapersonal: 'go_no_go',
    Spiritual: 'breath_rhythm',
    Somatic: 'reaction_time',
    Willpower: 'simon',
    Interpersonal: 'stroop',
  };
  const slug = lineTaskMap[line];
  return slug ? profile.taskStaircases[slug] : undefined;
}
