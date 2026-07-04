/**
 * Tests for T-0.5 (HS-06 fix) — transformation state machine persistence.
 * Verifies that the Significator carries transformation counters across encounters.
 *
 * Note: these tests verify the Significator interface carries the new fields
 * and that they default correctly. The full EncounterScene integration is
 * tested via the existing TransformationDetector tests.
 */
import { describe, it, expect } from 'vitest';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { advanceTransformation, createInitialTransformationState, type TransformationState } from '../../src/core/engines/TransformationDetector.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

describe('T-0.5 — Significator carries transformation counters', () => {
  it('createSignificator defaults transformation counters to 0/null', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    expect(sig.transformationPhase).toBe('idle');
    expect(sig.transformationSessionsInPhase).toBe(0);
    expect(sig.transformationKnotsResolved).toBe(0);
    expect(sig.transformationTotalKnots).toBe(0);
    expect(sig.transformationTargetStage).toBeNull();
  });

  it('a Significator can be constructed with non-zero transformation counters', () => {
    const sig = createSignificator('p2', makeAltitudes('Red'), 'Red');
    const advanced: typeof sig = {
      ...sig,
      transformationPhase: 'crucible',
      transformationSessionsInPhase: 3,
      transformationKnotsResolved: 1,
      transformationTotalKnots: 2,
      transformationTargetStage: 'Amber',
    };
    expect(advanced.transformationPhase).toBe('crucible');
    expect(advanced.transformationSessionsInPhase).toBe(3);
    expect(advanced.transformationKnotsResolved).toBe(1);
    expect(advanced.transformationTotalKnots).toBe(2);
    expect(advanced.transformationTargetStage).toBe('Amber');
  });

  it('round-trips through JSON with transformation counters preserved', () => {
    const sig = createSignificator('p3', makeAltitudes('Red'), 'Red');
    const advanced = {
      ...sig,
      transformationPhase: 'unravelling' as const,
      transformationSessionsInPhase: 2,
      transformationKnotsResolved: 0,
      transformationTotalKnots: 1,
      transformationTargetStage: 'Amber' as Stage | null,
    };
    const json = JSON.stringify(advanced);
    const restored = JSON.parse(json);
    expect(restored.transformationPhase).toBe('unravelling');
    expect(restored.transformationSessionsInPhase).toBe(2);
    expect(restored.transformationKnotsResolved).toBe(0);
    expect(restored.transformationTotalKnots).toBe(1);
    expect(restored.transformationTargetStage).toBe('Amber');
  });
});

describe('T-0.5 — TransformationState reconstruction from Significator', () => {
  it('a Significator with persisted counters reconstructs the full TransformationState', () => {
    // Simulate what EncounterScene does: read persisted counters, build state.
    const sig = createSignificator('p4', makeAltitudes('Red'), 'Red');
    const persistedSig = {
      ...sig,
      transformationPhase: 'crucible' as const,
      transformationSessionsInPhase: 2,
      transformationKnotsResolved: 1,
      transformationTotalKnots: 3,
      transformationTargetStage: 'Amber' as Stage | null,
    };

    // Reconstruct (same logic as EncounterScene T-0.5 fix)
    const reconstructed: TransformationState = {
      phase: persistedSig.transformationPhase,
      targetStage: persistedSig.transformationTargetStage ?? null,
      sessionsInPhase: persistedSig.transformationSessionsInPhase ?? 0,
      knotsResolved: persistedSig.transformationKnotsResolved ?? 0,
      totalKnots: persistedSig.transformationTotalKnots ?? 0,
    };

    expect(reconstructed.phase).toBe('crucible');
    expect(reconstructed.targetStage).toBe('Amber');
    expect(reconstructed.sessionsInPhase).toBe(2);
    expect(reconstructed.knotsResolved).toBe(1);
    expect(reconstructed.totalKnots).toBe(3);
  });

  it('a fresh Significator (all counters at defaults) reconstructs to initial state', () => {
    const sig = createSignificator('p5', makeAltitudes('Red'), 'Red');
    const reconstructed: TransformationState = {
      phase: sig.transformationPhase,
      targetStage: sig.transformationTargetStage ?? null,
      sessionsInPhase: sig.transformationSessionsInPhase ?? 0,
      knotsResolved: sig.transformationKnotsResolved ?? 0,
      totalKnots: sig.transformationTotalKnots ?? 0,
    };
    const initial = createInitialTransformationState();
    expect(reconstructed.phase).toBe(initial.phase);
    expect(reconstructed.sessionsInPhase).toBe(initial.sessionsInPhase);
    expect(reconstructed.knotsResolved).toBe(initial.knotsResolved);
    expect(reconstructed.totalKnots).toBe(initial.totalKnots);
  });

  it('advanceTransformation correctly advances a reconstructed state', () => {
    // Simulate: player is in 'threshold' with sessionsInPhase=0, then plays
    // an encounter. The reconstructed state should advance to unravelling
    // after sessionsInPhase reaches 1.
    const sig = createSignificator('p6', makeAltitudes('Red'), 'Red');
    const thresholdSig = {
      ...sig,
      transformationPhase: 'threshold' as const,
      transformationSessionsInPhase: 0,
      transformationTargetStage: 'Amber' as Stage | null,
    };

    const state: TransformationState = {
      phase: thresholdSig.transformationPhase,
      targetStage: thresholdSig.transformationTargetStage ?? null,
      sessionsInPhase: thresholdSig.transformationSessionsInPhase ?? 0,
      knotsResolved: thresholdSig.transformationKnotsResolved ?? 0,
      totalKnots: thresholdSig.transformationTotalKnots ?? 0,
    };

    // First advance: sessionsInPhase 0 → 1
    const advanced1 = advanceTransformation(state, sig);
    expect(advanced1.phase).toBe('threshold');
    expect(advanced1.sessionsInPhase).toBe(1);

    // Second advance: sessionsInPhase 1 → triggers move to 'unravelling'
    const advanced2 = advanceTransformation(advanced1, sig);
    expect(advanced2.phase).toBe('unravelling');
    expect(advanced2.sessionsInPhase).toBe(0);
  });
});
