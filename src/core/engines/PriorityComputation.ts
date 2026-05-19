/**
 * PriorityComputation — weighted priority formula for encounter ranking.
 * Spec: foundations/24 §3.2
 *
 * priority = 0.25 * theta_urgency
 *          + 0.20 * shadow_activation
 *          + 0.15 * polarity_alignment
 *          + 0.15 * transformation_readiness
 *          + 0.10 * drive_correction
 *          + 0.10 * narrative_coherence
 *          + 0.05 * session_fit
 */
import type { Significator } from '../domain/Significator.js';
import type { EncounterCandidate, WorldState } from './CandidateGeneration.js';
import { computeCellStaleness, DEFAULT_THETA_PARAMS } from './ThetaDecay.js';

export interface SessionContext {
  readonly encountersSoFar: number;
  readonly sessionDurationMs: number;
  readonly targetSessionLength: number; // encounters
  readonly recentLines: readonly string[];
}

export interface PriorityWeights {
  readonly thetaUrgency: number;
  readonly shadowActivation: number;
  readonly polarityAlignment: number;
  readonly transformationReadiness: number;
  readonly driveCorrection: number;
  readonly narrativeCoherence: number;
  readonly sessionFit: number;
}

export const DEFAULT_WEIGHTS: PriorityWeights = {
  thetaUrgency: 0.25,
  shadowActivation: 0.20,
  polarityAlignment: 0.15,
  transformationReadiness: 0.15,
  driveCorrection: 0.10,
  narrativeCoherence: 0.10,
  sessionFit: 0.05,
};

export function computePriority(
  candidate: EncounterCandidate,
  sig: Significator,
  _world: WorldState,
  session: SessionContext,
  now: number,
  weights: PriorityWeights = DEFAULT_WEIGHTS,
): number {
  const t = computeThetaUrgency(candidate, sig, now);
  const s = computeShadowActivation(candidate, sig);
  const p = computePolarityAlignment(candidate, sig);
  const tr = computeTransformationReadiness(candidate, sig);
  const d = computeDriveCorrection(candidate, sig);
  const n = computeNarrativeCoherence(candidate, session);
  const sf = computeSessionFit(candidate, session);

  return weights.thetaUrgency * t
    + weights.shadowActivation * s
    + weights.polarityAlignment * p
    + weights.transformationReadiness * tr
    + weights.driveCorrection * d
    + weights.narrativeCoherence * n
    + weights.sessionFit * sf;
}

function computeThetaUrgency(c: EncounterCandidate, sig: Significator, now: number): number {
  const key = `${c.line}:${c.stage}`;
  const lastTs = sig.theta.lastEncounter[key] ?? 0;
  if (lastTs === 0) return 1; // never visited = max urgency
  return computeCellStaleness(lastTs, now, DEFAULT_THETA_PARAMS.halfLife);
}

function computeShadowActivation(c: EncounterCandidate, sig: Significator): number {
  const activeShadows = sig.shadows.entries.filter(
    e => e.resolvedAt === null && e.line === c.line,
  );
  if (activeShadows.length === 0) return 0;
  // Higher severity and recurrence = higher activation
  return Math.min(1, activeShadows.reduce((sum, e) => sum + e.severity * (1 + e.recurrenceCount * 0.2), 0));
}

function computePolarityAlignment(c: EncounterCandidate, sig: Significator): number {
  const key = `${c.line}:${c.stage}`;
  const cell = sig.polarity.cells[key];
  if (!cell) return 0.5; // neutral — no data yet
  // In exploring mode, variety is good (moderate score for everything)
  // In crystallizing/crystallized, alignment with dominant pattern scores higher
  if (sig.polarity.master.mode === 'Exploring') return 0.5;
  return cell.coherence;
}

function computeTransformationReadiness(c: EncounterCandidate, sig: Significator): number {
  // Higher score if this encounter is at the edge of current stage (transformation window)
  const key = `${c.line}:${c.stage}`;
  const cell = sig.polarity.cells[key];
  if (!cell) return 0;
  // Encounters at current-stage altitude with high crystallization = transformation prep
  if (c.stage === sig.currentStage && cell.crystallization > 0.6) return cell.crystallization;
  return 0;
}

function computeDriveCorrection(_c: EncounterCandidate, sig: Significator): number {
  // Score higher if the candidate's holon targets a drive with high fixation risk
  const maxFixation = Math.max(...Object.values(sig.drives.fixationRisk));
  if (maxFixation === 0) return 0;
  return maxFixation; // simplified: any encounter helps when fixation is high
}

function computeNarrativeCoherence(c: EncounterCandidate, session: SessionContext): number {
  // Penalize repeating the same line too often in a session
  const recentSameLine = session.recentLines.filter(l => l === c.line).length;
  return Math.max(0, 1 - recentSameLine * 0.3);
}

function computeSessionFit(_c: EncounterCandidate, session: SessionContext): number {
  // Map session progress to warmup/peak/cooldown preference
  const progress = session.encountersSoFar / Math.max(1, session.targetSessionLength);
  if (progress < 0.2) return 0.8; // warmup: prefer easier/familiar
  if (progress > 0.8) return 0.6; // cooldown: prefer lighter
  return 1.0; // peak: full intensity
}
