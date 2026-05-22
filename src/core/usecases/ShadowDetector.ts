/**
 * ShadowDetector — detects fixation, regression, and repression patterns.
 * Per foundations/10 §2.1: three failure modes per line.
 */
import type { Significator } from '../domain/Significator.js';
import type { ShadowSignal } from '../domain/SharedTypes.js';
import { ALL_LINES } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';

/**
 * Detect shadow signals from the Significator's state.
 * - Repression: a line ≥2 stages below the current stage.
 * - Fixation: active unresolved shadow entries with high recurrence.
 * - Regression: active shadow entries indicating regression.
 */
export function detectShadows(sig: Significator): readonly ShadowSignal[] {
  const signals: ShadowSignal[] = [];
  const now = Date.now();
  const stageOrd = stageOrdinal(sig.currentStage);

  for (const line of ALL_LINES) {
    const lineOrd = stageOrdinal(sig.altitudes[line]);

    // Repression: line ≥2 stages below overall stage
    if (stageOrd - lineOrd >= 2) {
      signals.push({
        type: 'repression',
        line,
        detectedAtMs: now,
        description: `${line} line is significantly below overall stage.`,
      });
    }
  }

  // Surface active shadow ledger entries as signals
  for (const entry of sig.shadows.entries) {
    if (entry.resolvedAt === null) {
      signals.push({
        type: 'fixation',
        line: entry.line,
        detectedAtMs: entry.surfacedAt,
        description: `${entry.line} line has unresolved ${entry.quadrant} shadow (severity ${entry.severity}).`,
      });
    }
  }

  return signals;
}
