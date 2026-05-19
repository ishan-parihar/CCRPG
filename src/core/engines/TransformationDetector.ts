/**
 * TransformationDetector — detects stage-transition thresholds.
 * Spec: foundations/17 §2
 */
import type { Line } from '../domain/Line.js';
import { ALL_LINES } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_STAGES, stageOrdinal } from '../domain/Stage.js';
import type { Significator } from '../domain/Significator.js';

export interface TransformationSignal {
  readonly targetStage: Stage;
  readonly readiness: number; // 0-1
  readonly convergentLines: readonly Line[];
  readonly blockers: readonly string[];
}

export interface ReadinessReport {
  readonly convergence: number; // fraction of lines at edge
  readonly saturation: number; // catalyst processed ratio
  readonly shadowClearance: number; // 0-1, 1 = no blocking shadows
  readonly overall: number; // weighted composite
}

// Lines required at edge for each stage transition
const CONVERGENCE_REQUIREMENTS: Record<number, number> = {
  0: 3, // Infrared→Magenta: 3 lines
  1: 4, // Magenta→Red: 4 lines
  2: 5, // Red→Amber: 5 lines
  3: 5, // Amber→Orange
  4: 6, // Orange→Green
  5: 6, // Green→Turquoise
  6: 7, // Turquoise→White
};

const SATURATION_THRESHOLD = 20; // encounters per line at current stage

/** Detect whether transformation threshold is crossed. */
export function detectThreshold(sig: Significator): TransformationSignal | null {
  const currentOrd = stageOrdinal(sig.currentStage);
  if (currentOrd >= ALL_STAGES.length - 1) return null; // already at White

  const targetStage = ALL_STAGES[currentOrd + 1]!;
  const report = computeReadiness(sig, targetStage);

  if (report.overall >= 0.8) {
    const convergentLines = ALL_LINES.filter(l => stageOrdinal(sig.altitudes[l]) >= currentOrd);
    const blockers: string[] = [];
    if (report.shadowClearance < 0.8) blockers.push('unresolved_critical_shadows');
    if (report.convergence < 0.7) blockers.push('insufficient_line_convergence');

    if (blockers.length === 0) {
      return { targetStage, readiness: report.overall, convergentLines, blockers };
    }
  }

  return null;
}

/** Compute readiness for a specific stage transition. */
export function computeReadiness(sig: Significator, targetStage: Stage): ReadinessReport {
  const targetOrd = stageOrdinal(targetStage);
  const currentOrd = targetOrd - 1;
  const required = CONVERGENCE_REQUIREMENTS[currentOrd] ?? 5;

  // Convergence: how many lines are at or above current stage
  const linesAtEdge = ALL_LINES.filter(l => stageOrdinal(sig.altitudes[l]) >= currentOrd);
  const convergence = Math.min(1, linesAtEdge.length / required);

  // Saturation: encounters processed at current stage
  let totalTraces = 0;
  for (const line of ALL_LINES) {
    const key = `${line}:${ALL_STAGES[currentOrd]}`;
    const cell = sig.polarity.cells[key];
    totalTraces += cell?.traceCount ?? 0;
  }
  const saturation = Math.min(1, totalTraces / (ALL_LINES.length * SATURATION_THRESHOLD));

  // Shadow clearance: no critical unresolved shadows at current stage
  const criticalShadows = sig.shadows.entries.filter(
    e => e.resolvedAt === null && e.severity >= 0.7 && stageOrdinal(e.stage) >= currentOrd,
  );
  const shadowClearance = criticalShadows.length === 0 ? 1 : Math.max(0, 1 - criticalShadows.length * 0.3);

  const overall = convergence * 0.4 + saturation * 0.3 + shadowClearance * 0.3;

  return { convergence, saturation, shadowClearance, overall };
}
