import type { Significator } from '../domain/Significator.js';
import type { ShadowSignal } from '../domain/SharedTypes.js';
import { ALL_LINES, type Line } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';

interface BehavioralPattern {
  readonly line: Line;
  readonly avoidanceRate: number;
  readonly failureStreak: number;
  readonly defensiveChoiceRate: number;
}

export function detectShadows(
  sig: Significator,
  patterns?: readonly BehavioralPattern[],
): readonly ShadowSignal[] {
  const signals: ShadowSignal[] = [];
  const now = Date.now();
  const stageOrd = stageOrdinal(sig.currentStage);

  // Structural shadows: lines significantly below overall stage
  for (const line of ALL_LINES) {
    const lineOrd = stageOrdinal(sig.altitudes[line]);
    if (stageOrd - lineOrd >= 2) {
      signals.push({
        type: 'repression',
        line,
        detectedAtMs: now,
        description: `${line} line is significantly below overall stage.`,
      });
    }
  }

  // Existing unresolved shadow ledger entries
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

  // Behavioral shadows: pattern-based detection from encounter history
  if (patterns) {
    for (const pattern of patterns) {
      if (pattern.avoidanceRate > 0.7) {
        signals.push({
          type: 'fixation',
          line: pattern.line,
          detectedAtMs: now,
          description: `${pattern.line}: high avoidance rate (${(pattern.avoidanceRate * 100).toFixed(0)}%) — possible fear-based aversion.`,
        });
      }
      if (pattern.failureStreak >= 3) {
        signals.push({
          type: 'regression',
          line: pattern.line,
          detectedAtMs: now,
          description: `${pattern.line}: ${pattern.failureStreak} consecutive failures — possible defensive shutdown.`,
        });
      }
      if (pattern.defensiveChoiceRate > 0.6) {
        signals.push({
          type: 'fixation',
          line: pattern.line,
          detectedAtMs: now,
          description: `${pattern.line}: high defensive choice rate (${(pattern.defensiveChoiceRate * 100).toFixed(0)}%) — possible golden-shadow bypass.`,
        });
      }
    }
  }

  return signals;
}
