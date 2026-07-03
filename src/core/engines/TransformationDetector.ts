/**
 * TransformationDetector — detects stage-transition thresholds.
 * Spec: foundations/17 §2
 */
import type { Line } from '../domain/Line.js';
import { ALL_LINES } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_STAGES, stageOrdinal } from '../domain/Stage.js';
import { STAGE_RAY_MAP } from '../domain/Ray.js';
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

  // GAP-F-7: Ray-center activation signal (per HoloOS 08.8.22).
  // When the next-density ray-center is activating while the current saturates,
  // this is a phase-transition signal. The current stage's ray should be highly
  // activated (saturation), and the next stage's ray should be rising (catalytic
  // interference per 08.8.14 §2.3).
  const currentRay = STAGE_RAY_MAP[sig.currentStage] ?? 'Yellow';
  const targetRay = STAGE_RAY_MAP[targetStage] ?? 'Green';
  const currentRayActivation = sig.rayProfile[currentRay] ?? 0;
  const targetRayActivation = sig.rayProfile[targetRay] ?? 0;
  // Ray readiness: current ray saturated (>0.6) AND target ray rising (>0.3)
  const rayReadiness = (currentRayActivation > 0.6 && targetRayActivation > 0.3) ? 1 : 0;

  // Overall: convergence 40% + saturation 25% + shadowClearance 25% + rayReadiness 10%
  const overall = convergence * 0.4 + saturation * 0.25 + shadowClearance * 0.25 + rayReadiness * 0.1;

  return { convergence, saturation, shadowClearance, overall };
}

// ─── Transformation State Machine (R3.1 + R3.5 + R3.6) ───

export type TransformationPhase = 'idle' | 'threshold' | 'unravelling' | 'crucible' | 'emergence' | 'complete';

export interface TransformationState {
  readonly phase: TransformationPhase;
  readonly targetStage: Stage | null;
  readonly sessionsInPhase: number;
  readonly knotsResolved: number;
  readonly totalKnots: number;
}

export function createInitialTransformationState(): TransformationState {
  return { phase: 'idle', targetStage: null, sessionsInPhase: 0, knotsResolved: 0, totalKnots: 0 };
}

/**
 * Advance the transformation state machine based on current conditions.
 * Called after each encounter during an active transformation.
 */
export function advanceTransformation(
  state: TransformationState,
  sig: Significator,
): TransformationState {
  switch (state.phase) {
    case 'idle': {
      const signal = detectThreshold(sig);
      if (signal && signal.readiness >= 0.8) {
        return { ...state, phase: 'threshold', targetStage: signal.targetStage, sessionsInPhase: 0, totalKnots: signal.blockers.length || 1 };
      }
      return state;
    }
    case 'threshold': {
      if (state.sessionsInPhase >= 1) {
        return { ...state, phase: 'unravelling', sessionsInPhase: 0 };
      }
      return { ...state, sessionsInPhase: state.sessionsInPhase + 1 };
    }
    case 'unravelling': {
      if (state.sessionsInPhase >= 2) {
        return { ...state, phase: 'crucible', sessionsInPhase: 0 };
      }
      return { ...state, sessionsInPhase: state.sessionsInPhase + 1 };
    }
    case 'crucible': {
      if (state.knotsResolved >= state.totalKnots || state.sessionsInPhase >= 5) {
        return { ...state, phase: 'emergence', sessionsInPhase: 0 };
      }
      return { ...state, sessionsInPhase: state.sessionsInPhase + 1 };
    }
    case 'emergence': {
      if (state.sessionsInPhase >= 1) {
        return { ...state, phase: 'complete' };
      }
      return { ...state, sessionsInPhase: state.sessionsInPhase + 1 };
    }
    case 'complete':
      return state;
  }
}

/**
 * Record a knot resolution during the crucible phase.
 */
export function recordKnotResolution(state: TransformationState): TransformationState {
  if (state.phase !== 'crucible') return state;
  return { ...state, knotsResolved: state.knotsResolved + 1 };
}

/**
 * Commit the transformation: returns the new target stage.
 * Only valid when phase === 'complete'.
 * The caller is responsible for advancing the Significator's altitude.
 */
export function commitTransformation(state: TransformationState): { targetStage: Stage | null; newState: TransformationState } {
  if (state.phase !== 'complete' || !state.targetStage) {
    return { targetStage: null, newState: state };
  }
  return {
    targetStage: state.targetStage,
    newState: createInitialTransformationState(),
  };
}
