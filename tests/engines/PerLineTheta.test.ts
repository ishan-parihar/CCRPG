/**
 * Tests for T-0.12 (HS-03 fix) — per-line theta half-life in PriorityComputation.
 * Verifies that lines with different configured half-lives produce different theta urgencies.
 */
import { describe, it, expect } from 'vitest';
import { computePriority, DEFAULT_WEIGHTS, type SessionContext } from '../../src/core/engines/PriorityComputation.js';
import { DEFAULT_THETA_PARAMS } from '../../src/core/engines/ThetaDecay.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { EncounterCandidate, WorldState } from '../../src/core/engines/CandidateGeneration.js';
import { createInitialWorldState } from '../../src/core/engines/CandidateGeneration.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeCandidate(line: Line, stage: Stage): EncounterCandidate {
  return {
    moduleRef: `${line}:${stage}`,
    line,
    stage,
    modality: 'Deterministic',
    holonId: `${line}:${stage}`,
    cooldownClear: true,
  };
}

function makeSession(): SessionContext {
  return {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 10,
    recentLines: [],
  };
}

function makeWorld(): WorldState {
  return createInitialWorldState([]);
}

describe('T-0.12 — per-line theta half-life', () => {
  it('DEFAULT_THETA_PARAMS has per-line half-lives configured', () => {
    expect(DEFAULT_THETA_PARAMS.lineHalfLives).toBeDefined();
    expect(DEFAULT_THETA_PARAMS.lineHalfLives!.Somatic).toBeDefined();
    expect(DEFAULT_THETA_PARAMS.lineHalfLives!.Spiritual).toBeDefined();
    // Somatic (Body) should decay faster (shorter half-life) than Spiritual
    expect(DEFAULT_THETA_PARAMS.lineHalfLives!.Somatic).toBeLessThan(
      DEFAULT_THETA_PARAMS.lineHalfLives!.Spiritual,
    );
  });

  it('a line with a shorter half-life produces higher theta urgency for the same elapsed time', () => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000; // 1 day elapsed

    // Two significators: one with Somatic cell last visited 1 day ago,
    // one with Spiritual cell last visited 1 day ago.
    const sigSomatic = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const sigSpiritual = createSignificator('p2', makeAltitudes('Red'), 'Red');

    const sigSomaticVisited = {
      ...sigSomatic,
      theta: {
        lastEncounter: {
          ...sigSomatic.theta.lastEncounter,
          'Somatic:Red': oneDayAgo,
        },
      },
    };
    const sigSpiritualVisited = {
      ...sigSpiritual,
      theta: {
        lastEncounter: {
          ...sigSpiritual.theta.lastEncounter,
          'Spiritual:Red': oneDayAgo,
        },
      },
    };

    const candidateSomatic = makeCandidate('Somatic', 'Red');
    const candidateSpiritual = makeCandidate('Spiritual', 'Red');
    const session = makeSession();
    const world = makeWorld();

    const prioritySomatic = computePriority(
      candidateSomatic, sigSomaticVisited, world, session, now,
      { ...DEFAULT_WEIGHTS, thetaUrgency: 1.0, shadowActivation: 0, polarityAlignment: 0, transformationReadiness: 0, driveCorrection: 0, narrativeCoherence: 0, sessionFit: 0 },
    );
    const prioritySpiritual = computePriority(
      candidateSpiritual, sigSpiritualVisited, world, session, now,
      { ...DEFAULT_WEIGHTS, thetaUrgency: 1.0, shadowActivation: 0, polarityAlignment: 0, transformationReadiness: 0, driveCorrection: 0, narrativeCoherence: 0, sessionFit: 0 },
    );

    // After 1 day: Somatic (3-day half-life) is more decayed → higher urgency
    // than Spiritual (10-day half-life). We isolate thetaUrgency by zeroing
    // other weights, but note that other bonuses (novelty, weakness, diversity)
    // still contribute. The DIFFERENCE should still favor Somatic.
    expect(prioritySomatic).toBeGreaterThan(prioritySpiritual);
  });

  it('a never-visited cell returns max theta urgency (1.0) regardless of line', () => {
    const now = Date.now();
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    // All cells at 0 (never visited) per createSignificator

    const candidateSomatic = makeCandidate('Somatic', 'Red');
    const candidateSpiritual = makeCandidate('Spiritual', 'Red');
    const session = makeSession();
    const world = makeWorld();

    // With theta weight = 1.0 and everything else 0, both should have the
    // same base theta urgency (1.0) since neither has been visited.
    // The difference will be only in the tie-breaker / bonuses.
    const prioritySomatic = computePriority(
      candidateSomatic, sig, world, session, now,
      { ...DEFAULT_WEIGHTS, thetaUrgency: 1.0, shadowActivation: 0, polarityAlignment: 0, transformationReadiness: 0, driveCorrection: 0, narrativeCoherence: 0, sessionFit: 0 },
    );
    const prioritySpiritual = computePriority(
      candidateSpiritual, sig, world, session, now,
      { ...DEFAULT_WEIGHTS, thetaUrgency: 1.0, shadowActivation: 0, polarityAlignment: 0, transformationReadiness: 0, driveCorrection: 0, narrativeCoherence: 0, sessionFit: 0 },
    );

    // Both should be high (theta urgency = 1.0 contributes ~1.0 to the score
    // when weight = 1.0). The difference is only in tie-breakers.
    expect(prioritySomatic).toBeGreaterThan(0.9);
    expect(prioritySpiritual).toBeGreaterThan(0.9);
  });
});
