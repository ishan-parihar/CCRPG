/**
 * GreaterCycleEngine — computes HoloOS G_z / P_z dual health metrics.
 *
 * HoloOS alignment (per AUDIT-HOLOOS-ALIGNMENT.md §2.5.6):
 * HoloOS requires both G_z (Lesser-Cycle health, Agape, rewards balance/
 * integration) AND P_z (Greater-Cycle health, Eros, rewards polarization/
 * transcendence) for total metabolic health. The two are co-equal and
 * multiply: Total Metabolic Health = G_z · P_z.
 *
 * Ontological derivation (per HoloOS Primal Distortion Genesis Theorem,
 * _THEORY/02_Ontology/08.8.7_Primal_Distortion_Genesis_Theorem.md):
 * - G_z (Agape/integration) ↔ Love-Law (D2, Second Distortion).
 * - P_z (Eros/polarization) ↔ Free-Will-Law (D1, First Distortion).
 * - Light-Law (D3) is the substrate both operate on.
 * A holon at D3 (Light) needs both Free-Will-choice (P_z) and Love-
 * integration (G_z) to be metabolically complete.
 *
 * Status: canonical-hypothesis (CCRPG-specific operationalization; the
 * underlying HoloOS framework is canonical-hypothesis per 02.1 + 08.8.7).
 *
 * This is a SCAFFOLD — Phase 1 deliverable. The CCIEngine will consume
 * these metrics as a 6th dimension (alongside the existing 5) once
 * T-1.8 wires them in.
 *
 * Spec: foundations/25 §1.1 (revised 2026-07-03)
 */
import type { Significator } from '../domain/Significator.js';
import { stageOrdinal } from '../domain/Stage.js';
import { ALL_LINES, LINE_COMPLEX, type Complex } from '../domain/Line.js';

/** Lesser-Cycle health (Agape, rewards balance/integration). [0,1] */
export interface GzMetric {
  readonly value: number;
  readonly driveBalance: number;       // 1 - maxImbalance across 4 drives
  readonly shadowIntegration: number;  // 1 - normalized unresolved shadow severity
  readonly thetaFreshness: number;     // 1 - normalized staleness across cells
  readonly complexBalance: number;     // 1 - maxImbalance across 3 Complex altitudes
}

/** Greater-Cycle health (Eros, rewards polarization/transcendence). [0,1] */
export interface PzMetric {
  readonly value: number;
  readonly polarityCrystallization: number;   // sig.polarity.master.crystallizationIndex
  readonly transformationReadiness: number;   // linesAtEdge / 8 + catalystSaturation, averaged
  readonly greatWayAlignment: number;         // polarity.master.dominantDirection stability over recent encounters
  readonly choiceAuthenticity: number;        // 1 - (avoidance rate from recentEncounters)
}

/** Total Metabolic Health = G_z · P_z (geometric mean). [0,1] */
export interface MetabolicHealth {
  readonly gz: number;
  readonly pz: number;
  readonly total: number;            // gz * pz
  readonly gzBreakdown: GzMetric;
  readonly pzBreakdown: PzMetric;
  readonly interpretation: 'consolidating' | 'polarizing-healthy' | 'polarizing-unhealthy' | 'stuck';
}

/** Compute G_z from Significator state. */
export function computeGz(sig: Significator, now: number): GzMetric {
  // 1. Drive balance: 1 - maxImbalance across 4 drives
  const weights = Object.values(sig.drives.weights);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const driveBalance = 1 - (maxWeight - minWeight);

  // 2. Shadow integration: 1 - normalized unresolved shadow severity
  const unresolved = sig.shadows.entries.filter(e => e.resolvedAt === null);
  const avgSeverity = unresolved.length > 0
    ? unresolved.reduce((s, e) => s + e.severity, 0) / unresolved.length
    : 0;
  const shadowIntegration = 1 - avgSeverity;

  // 3. Theta freshness: 1 - normalized staleness (uses 7-day default half-life)
  const cellKeys = Object.keys(sig.theta.lastEncounter);
  const cellCount = cellKeys.length || 1;
  let totalStaleness = 0;
  for (const key of cellKeys) {
    const lastTs = sig.theta.lastEncounter[key] ?? 0;
    if (lastTs === 0) { totalStaleness += 1; continue; }
    const elapsed = now - lastTs;
    const halfLife = 7 * 24 * 60 * 60 * 1000;
    totalStaleness += 1 - Math.pow(0.5, elapsed / halfLife);
  }
  const thetaFreshness = 1 - (totalStaleness / cellCount);

  // 4. Complex balance: 1 - maxImbalance across 3 Complex altitudes
  const complexAlts = computeComplexAltitudes(sig);
  const complexValues = Object.values(complexAlts);
  const complexBalance = 1 - (Math.max(...complexValues) - Math.min(...complexValues)) / 7;

  // Weighted geometric-style mean (weights sum to 1.0)
  const value = clamp01(
    0.35 * driveBalance +
    0.30 * shadowIntegration +
    0.20 * thetaFreshness +
    0.15 * complexBalance,
  );

  return { value, driveBalance, shadowIntegration, thetaFreshness, complexBalance };
}

/** Compute P_z from Significator state. */
export function computePz(sig: Significator): PzMetric {
  // 1. Polarity crystallization
  const polarityCrystallization = clamp01(sig.polarity.master.crystallizationProgress ?? 0);

  // 2. Transformation readiness: linesAtEdge / 8 + catalystSaturation, averaged
  const currentOrd = stageOrdinal(sig.currentStage);
  const linesAtEdge = Object.values(sig.altitudes).filter(
    alt => stageOrdinal(alt) >= currentOrd,
  ).length;
  const lineRatio = linesAtEdge / ALL_LINES.length;

  const cellKeys = Object.keys(sig.polarity.cells);
  const crystallizedCells = cellKeys.filter(
    k => (sig.polarity.cells[k]?.crystallization ?? 0) > 0.7,
  ).length;
  const catalystSaturation = cellKeys.length > 0 ? crystallizedCells / cellKeys.length : 0;
  const transformationReadiness = clamp01((lineRatio + catalystSaturation) / 2);

  // 3. Great-Way alignment: polarity.master.dominantDirection stability
  // (proxy: if crystallizationIndex > 0.5, alignment is high; else low)
  const greatWayAlignment = polarityCrystallization > 0.5 ? polarityCrystallization : polarityCrystallization * 0.5;

  // 4. Choice authenticity: 1 - avoidance rate from recentEncounters
  const recent = sig.recentEncounters ?? [];
  const avoidanceRate = recent.length > 0
    ? recent.filter(e => !e.passed).length / recent.length
    : 0;
  const choiceAuthenticity = 1 - avoidanceRate;

  // Weighted mean
  const value = clamp01(
    0.35 * polarityCrystallization +
    0.30 * transformationReadiness +
    0.20 * greatWayAlignment +
    0.15 * choiceAuthenticity,
  );

  return { value, polarityCrystallization, transformationReadiness, greatWayAlignment, choiceAuthenticity };
}

/** Compute total Metabolic Health = G_z · P_z. */
export function computeMetabolicHealth(sig: Significator, now: number = Date.now()): MetabolicHealth {
  const gzBreakdown = computeGz(sig, now);
  const pzBreakdown = computePz(sig);
  const gz = gzBreakdown.value;
  const pz = pzBreakdown.value;
  const total = gz * pz;

  let interpretation: MetabolicHealth['interpretation'];
  if (gz < 0.3 && pz < 0.3) {
    interpretation = 'stuck';
  } else if (gz > 0.6 && pz < 0.3) {
    interpretation = 'consolidating'; // healthy but not advancing
  } else if (pz > 0.6 && gz < 0.3) {
    interpretation = 'polarizing-unhealthy'; // advancing without integration
  } else {
    interpretation = 'polarizing-healthy'; // both metrics reasonably nonzero
  }

  return { gz, pz, total, gzBreakdown, pzBreakdown, interpretation };
}

/** Synthesize Complex-level altitude (hysteresis across Lines within a Complex). */
export function computeComplexAltitudes(sig: Significator): Record<Complex, number> {
  const result = { Mind: 0, Body: 0, Spirit: 0 } as Record<Complex, number>;
  for (const complex of ['Mind', 'Body', 'Spirit'] as const) {
    const lines = ALL_LINES.filter(l => LINE_COMPLEX[l] === complex);
    const ords = lines.map(l => stageOrdinal(sig.altitudes[l]));
    // Use max (most-developed line in the complex) rather than min —
    // a Complex's altitude is led by its strongest Line.
    result[complex] = Math.max(...ords);
  }
  return result;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
