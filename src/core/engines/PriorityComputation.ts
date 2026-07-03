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
import type { Drive } from '../domain/Drive.js';
import type { Significator } from '../domain/Significator.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { EncounterCandidate, WorldState } from './CandidateGeneration.js';
import { computeCellStaleness, DEFAULT_THETA_PARAMS } from './ThetaDecay.js';
import { computeUserMatrixPriority, type UserMatrixModel } from './UserMatrixModel.js';

export interface SessionContext {
  readonly encountersSoFar: number;
  readonly sessionDurationMs: number;
  readonly targetSessionLength: number; // encounters
  readonly recentLines: readonly string[];
  readonly estimatedTimeAvailable?: number; // ms
  readonly inferredEnergy?: 'high' | 'moderate' | 'low';
  readonly patienceSignals?: {
    readonly avoidanceRate: number;
    readonly responseLatencyTrend: 'decreasing' | 'stable' | 'increasing';
    readonly earlyExits: number;
  };
  readonly forceLine?: string;
  readonly forceStage?: string;
  readonly forceModality?: string;
  readonly transformationState?: { phase: string }; // G.20: transformation phase for crucible detection
}

export interface PriorityWeights {
  readonly thetaUrgency: number;
  readonly shadowActivation: number;
  readonly polarityAlignment: number;
  readonly transformationReadiness: number;
  readonly driveCorrection: number;
  readonly narrativeCoherence: number;
  readonly sessionFit: number;
  /** T-userMatrix: weight for user-Matrix/Potentiator targeting (random probing
   * in unmapped phase, targeted intervention in crystallized phase). */
  readonly userMatrixTargeting?: number;
}

export const DEFAULT_WEIGHTS: PriorityWeights = {
  thetaUrgency: 0.22,
  shadowActivation: 0.18,
  polarityAlignment: 0.13,
  transformationReadiness: 0.13,
  driveCorrection: 0.09,
  narrativeCoherence: 0.09,
  sessionFit: 0.04,
  userMatrixTargeting: 0.12,
};

export function computePriority(
  candidate: EncounterCandidate,
  sig: Significator,
  world: WorldState,
  session: SessionContext,
  now: number,
  weights: PriorityWeights = DEFAULT_WEIGHTS,
  bleedThrough?: readonly string[],
  userMatrixModel?: UserMatrixModel,
): number {
  const t = computeThetaUrgency(candidate, sig, now);
  const s = computeShadowActivation(candidate, sig);
  const p = computePolarityAlignment(candidate, sig);
  const tr = computeTransformationReadiness(candidate, sig);
  const d = computeDriveCorrection(candidate, sig, world);
  const n = computeNarrativeCoherence(candidate, world);
  const sf = computeSessionFit(candidate, session);
  // T-userMatrix: user-Matrix/Potentiator targeting
  const um = userMatrixModel
    ? computeUserMatrixPriority(userMatrixModel, candidate.line, candidate.stage)
    : 0;

  const baseScore = weights.thetaUrgency * t
    + weights.shadowActivation * s
    + weights.polarityAlignment * p
    + weights.transformationReadiness * tr
    + weights.driveCorrection * d
    + weights.narrativeCoherence * n
    + weights.sessionFit * sf
    + (weights.userMatrixTargeting ?? 0) * um;

  // G.21: Bleed-through boost — stale cells get priority boost
  const cellKey = `${candidate.line}:${candidate.stage}`;
  const bleedBoost = bleedThrough?.includes(cellKey) ? 0.15 : 0;

  const cell = sig.polarity.cells[cellKey];
  const traceCount = cell?.traceCount ?? 0;
  const noveltyBonus = traceCount === 0 ? 0.25 : Math.max(0, 0.25 - traceCount * 0.03);

  // Developmental need: prioritize lines where the player is weakest
  // (lowest altitude relative to the mean across all lines)
  const allAlts = Object.values(sig.altitudes).map(stageOrdinal);
  const meanAlt = allAlts.reduce((a, b) => a + b, 0) / allAlts.length;
  const candidateAlt = stageOrdinal(sig.altitudes[candidate.line] ?? 'Red');
  const weaknessBonus = candidateAlt < meanAlt ? 0.15 : 0;

  // Diversity bonus: penalize lines we've already seen recently
  const recentLines = session.recentLines;
  const diversityBonus = recentLines.includes(candidate.line) ? -0.10 : 0.10;

  // Per-candidate seed based on time + line + modality to prevent identical priorities
  const hash = (candidate.line.charCodeAt(0) * 7 + candidate.modality.charCodeAt(0) * 13 + (now % 2000)) % 200;
  const tieBreaker = hash / 10000; // max 0.02

  return baseScore + noveltyBonus + weaknessBonus + diversityBonus + bleedBoost + tieBreaker;
}

/**
 * §3.2.1 — Math.pow(decayLevel, 1.5). Only scores > 0 if candidate's
 * line AND stage match the decaying cell.
 *
 * T-0.12 (HS-03 fix): use per-line theta half-life when configured, instead
 * of the global default. HoloOS alignment per §2.5.8: different Complexes
 * (Mind/Body/Spirit) decay at different rates (Body fastest, Spirit slowest).
 */
function computeThetaUrgency(c: EncounterCandidate, sig: Significator, now: number): number {
  const key = `${c.line}:${c.stage}`;
  const lastTs = sig.theta.lastEncounter[key] ?? 0;
  if (lastTs === 0) return 1; // never visited = max urgency
  const halfLife = DEFAULT_THETA_PARAMS.lineHalfLives?.[c.line] ?? DEFAULT_THETA_PARAMS.halfLife;
  const decayLevel = computeCellStaleness(lastTs, now, halfLife);
  return Math.pow(decayLevel, 1.5);
}

/**
 * §3.2.2 — Match on BOTH line AND stage. Base = min(count * 0.4, 1.0).
 * +0.3 if any matching shadow has compoundPartner !== null. Cap at 1.0.
 */
function computeShadowActivation(c: EncounterCandidate, sig: Significator): number {
  const matching = sig.shadows.entries.filter(
    e => e.resolvedAt === null && e.line === c.line && e.stage === c.stage,
  );
  if (matching.length === 0) return 0;
  let score = Math.min(matching.length * 0.4, 1.0);
  if (matching.some(e => e.compoundPartner !== null)) score += 0.3;
  return Math.min(score, 1.0);
}

/**
 * §3.2.3 — Mode-specific:
 * Exploring → 0.5, Crystallizing → counter-polarity 0.8 / deepening 0.6,
 * Crystallized → aligned 0.9 / misaligned 0.1
 */
function computePolarityAlignment(c: EncounterCandidate, sig: Significator): number {
  const mode = sig.polarity.master.mode;
  if (mode === 'Exploring') return 0.5;

  const key = `${c.line}:${c.stage}`;
  const cell = sig.polarity.cells[key];
  const candidateTexture = cell?.dominantPattern ?? null;
  const dominant = sig.polarity.master.dominantDirection;

  if (mode === 'Crystallizing') {
    return candidateTexture !== null && candidateTexture !== dominant ? 0.8 : 0.6;
  }
  // Crystallized
  return candidateTexture === dominant ? 0.9 : 0.1;
}

/**
 * §3.2.4 — Returns 0 if linesAtEdge < 3 AND no pendingTransformation.
 * Otherwise: isEdgeLine → +0.5, isDualShadow → +0.5.
 */
function computeTransformationReadiness(c: EncounterCandidate, sig: Significator): number {
  const targetStageOrd = stageOrdinal(sig.currentStage) + 1;
  const linesAtEdge = Object.values(sig.altitudes).filter(
    alt => stageOrdinal(alt) >= stageOrdinal(sig.currentStage),
  ).length;
  const pendingTransformation = sig.lifecycle === 'Transforming';

  if (linesAtEdge < 3 && !pendingTransformation) return 0;

  let score = 0;
  // isEdgeLine: candidate's line altitude >= targetStage - 1
  const candidateLineAlt = stageOrdinal(sig.altitudes[c.line]);
  if (candidateLineAlt >= targetStageOrd - 1) score += 0.5;

  // isDualShadow: candidate targets shadow at centreOfGravity or targetStage
  const cogOrd = stageOrdinal(sig.currentStage);
  const hasShadowAtCoG = sig.shadows.entries.some(
    e => e.resolvedAt === null && e.line === c.line && stageOrdinal(e.stage) === cogOrd,
  );
  const hasShadowAtTarget = sig.shadows.entries.some(
    e => e.resolvedAt === null && e.line === c.line && stageOrdinal(e.stage) === targetStageOrd,
  );
  if (hasShadowAtCoG || hasShadowAtTarget) score += 0.5;

  return score;
}

const DRIVE_COMPLEMENT: Record<Drive, Drive> = {
  Agency: 'Communion',
  Communion: 'Agency',
  Eros: 'Agape',
  Agape: 'Eros',
};

/**
 * §3.2.5 — Only activates when max drive imbalance >= 0.3.
 * Scores if candidate's driveTarget is the COMPLEMENT of the most fixated drive.
 * Score = the fixation magnitude.
 */
function computeDriveCorrection(c: EncounterCandidate, sig: Significator, world: WorldState): number {
  const fixations = sig.drives.fixationRisk;
  let maxDrive: Drive = 'Agency';
  let maxVal = 0;
  for (const [d, v] of Object.entries(fixations) as [Drive, number][]) {
    if (v > maxVal) { maxVal = v; maxDrive = d; }
  }
  if (maxVal < 0.3) return 0;

  // Derive candidate's drive target from its holon
  const holon = world.holons.find(h => h.id === c.holonId);
  const candidateDrive = holon?.drives.dominant ?? null;
  if (!candidateDrive) return 0;

  return candidateDrive === DRIVE_COMPLEMENT[maxDrive] ? maxVal : 0;
}

/**
 * §3.2.6 — Active narrative beat match → 1.0.
 * Else if holon has existing relationship → 0.4 (static or dynamic). Else 0.
 */
function computeNarrativeCoherence(c: EncounterCandidate, world: WorldState): number {
  const holon = world.holons.find(h => h.id === c.holonId);
  if (!holon) return 0;

  // Check dynamic NPC relationships from ConsequenceEngine
  const dynamicRel = world.npcRelationships?.find(r => r.holonId === c.holonId);
  if (dynamicRel && dynamicRel.strength > 0.3) return 0.4;

  // Fall back to static holon relationship data
  if (holon.relationships.length > 0) return 0.4;
  return 0;
}

/**
 * §3.2.7 — Three sub-scores averaged:
 * Duration: short+short → 0.4, long+long → 0.2, else 0.1
 * Energy: low+low → 0.3, high+high → 0.3, mismatch → 0
 * Modality preference: 0.3 * (preference score, default 0.5)
 */
function computeSessionFit(c: EncounterCandidate, session: SessionContext): number {
  // Duration sub-score
  const shortSession = (session.estimatedTimeAvailable ?? session.sessionDurationMs) < 900_000; // < 15min
  const shortEncounter = c.modality === 'Deterministic' || c.modality === 'Embodied';
  const longEncounter = c.modality === 'ImmersiveRPG' || c.modality === 'SocialCooperative';
  let duration: number;
  if (shortSession && shortEncounter) duration = 0.4;
  else if (!shortSession && longEncounter) duration = 0.2;
  else duration = 0.1;

  // Energy sub-score
  const energy = session.inferredEnergy ?? 'moderate';
  const highIntensity = c.modality === 'ImmersiveRPG' || c.modality === 'Strategic';
  const lowIntensity = c.modality === 'LanguageReflective' || c.modality === 'ScenarioChoice';
  let energyScore: number;
  if (energy === 'low' && lowIntensity) energyScore = 0.3;
  else if (energy === 'high' && highIntensity) energyScore = 0.3;
  else if (energy === 'moderate') energyScore = 0.15;
  else energyScore = 0;

  // Modality preference sub-score (no preference data available, use default 0.5)
  const modalityPref = 0.3 * 0.5;

  return (duration + energyScore + modalityPref) / 3;
}
