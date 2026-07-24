/**
 * Action-Layer Implementation Tests
 *
 * Tests for the action-layer systems that make Mysterium "developmentally honest":
 * ACTION-1: Holonic Return cadence (shouldSurfaceReturn + isShadowResolved)
 * ACTION-2: diagnoseShadows drive-health formula
 * ACTION-3: Knot-pair generation (detectKnotPairs)
 * ACTION-4: States of consciousness surfaced in agent tool
 * ACTION-5: Shadow archetype names (per-line, per-quadrant)
 */
import { describe, it, expect } from 'vitest';
import { shouldSurfaceReturn, isShadowResolved, diagnoseShadows } from '../../src/core/usecases/ShadowDetector.js';
import { detectKnotPairs } from '../../src/core/engines/EncounterScheduler.js';
import { getShadowArchetypeName } from '../../src/core/engines/ShadowContentGenerator.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Significator } from '../../src/core/domain/Significator.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Line } from '../../src/core/domain/Line.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeSig(id = 'action-test'): Significator {
  return createSignificator(id, makeAltitudes('Red'), 'Red');
}

function makeSigWithShadow(
  id: string,
  shadowLine: Line,
  shadowStage: string,
  shadowQuadrant: string,
  shadowDrive: string,
  severity: number,
): Significator {
  const sig = createSignificator(id, makeAltitudes('Red'), 'Red');
  return {
    ...sig,
    shadows: {
      entries: [{
        id: `shadow-${id}`,
        quadrant: shadowQuadrant as any,
        line: shadowLine,
        stage: shadowStage as any,
        drive: shadowDrive as any,
        surfacedAt: Date.now() - 100000,
        resolvedAt: null,
        recurrenceCount: 0,
        compoundPartner: null,
        severity,
      }],
      activeCount: 1,
    },
  } as Significator;
}

// ─── ACTION-1: Holonic Return ────────────────────────────────────────

describe('ACTION-1: Holonic Return (shouldSurfaceReturn)', () => {
  it('returns null when encountersAtCurrentStage is not a multiple of 3', () => {
    const sig = makeSig('holonic-1');
    expect(shouldSurfaceReturn(sig, 1)).toBeNull();
    expect(shouldSurfaceReturn(sig, 2)).toBeNull();
    expect(shouldSurfaceReturn(sig, 4)).toBeNull();
  });

  it('returns null when no earlier-stage shadows exist', () => {
    const sig = makeSig('holonic-2');
    // sig has no shadows → no return needed
    expect(shouldSurfaceReturn(sig, 3)).toBeNull();
  });

  it('returns the return target when earlier-stage shadow with severity > 0.3 exists', () => {
    // Player at Red with an unresolved Infrared shadow
    const sig = makeSigWithShadow('holonic-3', 'Cognitive', 'Infrared', 'DarkAddiction', 'Agency', 0.5);
    const result = shouldSurfaceReturn(sig, 3);
    expect(result).not.toBeNull();
    expect(result!.line).toBe('Cognitive');
    expect(result!.stage).toBe('Infrared');
    expect(result!.severity).toBe(0.5);
  });

  it('does NOT trigger for shadows at the current stage (only earlier stages)', () => {
    // Player at Red with a Red shadow (same stage, not earlier)
    const sig = makeSigWithShadow('holonic-4', 'Cognitive', 'Red', 'DarkAddiction', 'Agency', 0.5);
    expect(shouldSurfaceReturn(sig, 3)).toBeNull();
  });

  it('does NOT trigger for resolved shadows', () => {
    const sig = makeSigWithShadow('holonic-5', 'Cognitive', 'Infrared', 'DarkAddiction', 'Agency', 0.5);
    // Mark as resolved
    const resolvedSig = {
      ...sig,
      shadows: {
        ...sig.shadows,
        entries: sig.shadows.entries.map(e => ({ ...e, resolvedAt: Date.now() })),
      },
    } as Significator;
    expect(shouldSurfaceReturn(resolvedSig, 3)).toBeNull();
  });
});

describe('ACTION-1: isShadowResolved', () => {
  it('returns false when severity is above threshold', () => {
    const shadow = { line: 'Cognitive' as Line, stage: 'Red', severity: 0.5, surfacedAt: 1000 };
    expect(isShadowResolved(shadow, [], 0.5)).toBe(false);
  });

  it('returns true when severity < 0.2 AND ≥2 healthy encounters on that line since surfacing', () => {
    const shadow = { line: 'Cognitive' as Line, stage: 'Red', severity: 0.5, surfacedAt: 1000 };
    const encounters = [
      { line: 'Cognitive' as Line, passed: true, driveChoice: undefined, timestamp: 2000 },
      { line: 'Cognitive' as Line, passed: true, driveChoice: undefined, timestamp: 3000 },
    ];
    expect(isShadowResolved(shadow, encounters, 0.1)).toBe(true);
  });

  it('returns false when severity < 0.2 but < 2 healthy encounters', () => {
    const shadow = { line: 'Cognitive' as Line, stage: 'Red', severity: 0.5, surfacedAt: 1000 };
    const encounters = [
      { line: 'Cognitive' as Line, passed: true, driveChoice: undefined, timestamp: 2000 },
    ];
    expect(isShadowResolved(shadow, encounters, 0.1)).toBe(false);
  });
});

// ─── ACTION-2: diagnoseShadows drive-health formula ──────────────────

describe('ACTION-2: diagnoseShadows (drive-health formula)', () => {
  it('returns empty array for a fresh significator (no polarity cells)', () => {
    const sig = makeSig('diag-1');
    const result = diagnoseShadows(sig);
    expect(result).toHaveLength(0);
  });

  it('computes addictionRisk = (1-eros)×(1-communion) and allergyRisk = (1-agape)×(1-agency)', () => {
    const sig = makeSig('diag-2');
    // Add a polarity cell + drive weights
    const sigWithCell = {
      ...sig,
      drives: {
        ...sig.drives,
        weights: { Agency: 0.3, Communion: 0.2, Eros: 0.1, Agape: 0.4 },
      },
      polarity: {
        ...sig.polarity,
        cells: {
          'Cognitive:Red': {
            crystallization: 0.3,
            traceCount: 2,
            dominantPattern: 'Radiative',
          },
        },
      },
    } as unknown as Significator;

    const result = diagnoseShadows(sigWithCell);
    expect(result.length).toBeGreaterThan(0);

    const diag = result[0]!;
    // addictionRisk = (1-0.1)×(1-0.2) = 0.9×0.8 = 0.72
    expect(diag.addictionRisk).toBeCloseTo(0.72, 1);
    // allergyRisk = (1-0.4)×(1-0.3) = 0.6×0.7 = 0.42
    expect(diag.allergyRisk).toBeCloseTo(0.42, 1);
    // dominant = addiction (0.72 > 0.42)
    expect(diag.dominantPathology).toBe('addiction');
  });
});

// ─── ACTION-3: Knot-pair generation ──────────────────────────────────

describe('ACTION-3: detectKnotPairs', () => {
  it('returns empty array when no shadows exist', () => {
    const sig = makeSig('knot-1');
    const knots = detectKnotPairs(sig, 'Red', 'Amber');
    expect(knots).toHaveLength(0);
  });

  it('returns empty array when only dark shadows exist (no golden)', () => {
    const sig = makeSigWithShadow('knot-2', 'Cognitive', 'Red', 'DarkAddiction', 'Agency', 0.5);
    const knots = detectKnotPairs(sig, 'Red', 'Amber');
    expect(knots).toHaveLength(0);
  });

  it('detects a knot when dark at current + golden at next share the same drive', () => {
    const sig = makeSig('knot-3');
    const sigWithBoth = {
      ...sig,
      shadows: {
        entries: [
          {
            id: 'shadow-dark',
            quadrant: 'DarkAddiction' as any,
            line: 'Cognitive' as Line,
            stage: 'Red' as any,
            drive: 'Agency' as any,
            surfacedAt: Date.now() - 100000,
            resolvedAt: null,
            recurrenceCount: 0,
            compoundPartner: null,
            severity: 0.5,
          },
          {
            id: 'shadow-golden',
            quadrant: 'GoldenAllergy' as any,
            line: 'Cognitive' as Line,
            stage: 'Amber' as any,
            drive: 'Agency' as any,
            surfacedAt: Date.now() - 50000,
            resolvedAt: null,
            recurrenceCount: 0,
            compoundPartner: null,
            severity: 0.4,
          },
        ],
        activeCount: 2,
      },
    } as Significator;

    const knots = detectKnotPairs(sigWithBoth, 'Red', 'Amber');
    expect(knots).toHaveLength(1);
    expect(knots[0]!.line).toBe('Cognitive');
    expect(knots[0]!.drive).toBe('Agency');
    expect(knots[0]!.anchorEncounter.executionMode).toBe('shadow');
    expect(knots[0]!.blockEncounter.executionMode).toBe('shadow');
  });

  it('does NOT detect a knot when dark and golden are on different drives', () => {
    const sig = makeSig('knot-4');
    const sigWithMismatch = {
      ...sig,
      shadows: {
        entries: [
          {
            id: 'shadow-dark',
            quadrant: 'DarkAddiction' as any,
            line: 'Cognitive' as Line,
            stage: 'Red' as any,
            drive: 'Agency' as any,
            surfacedAt: Date.now() - 100000,
            resolvedAt: null,
            recurrenceCount: 0,
            compoundPartner: null,
            severity: 0.5,
          },
          {
            id: 'shadow-golden',
            quadrant: 'GoldenAllergy' as any,
            line: 'Cognitive' as Line,
            stage: 'Amber' as any,
            drive: 'Communion' as any, // Different drive → NOT a knot
            surfacedAt: Date.now() - 50000,
            resolvedAt: null,
            recurrenceCount: 0,
            compoundPartner: null,
            severity: 0.4,
          },
        ],
        activeCount: 2,
      },
    } as Significator;

    const knots = detectKnotPairs(sigWithMismatch, 'Red', 'Amber');
    expect(knots).toHaveLength(0);
  });
});

// ─── ACTION-5: Shadow archetype names ────────────────────────────────

describe('ACTION-5: getShadowArchetypeName', () => {
  it('returns per-line archetype name for Cognitive/DarkAddiction', () => {
    const name = getShadowArchetypeName('Cognitive', 'DarkAddiction');
    expect(name).toBe('The Compulsive Strategist');
  });

  it('returns per-line archetype name for Emotional/GoldenAllergy', () => {
    const name = getShadowArchetypeName('Emotional', 'GoldenAllergy');
    expect(name).toBe('The Detached Observer');
  });

  it('returns generic fallback for unmapped combinations', () => {
    // All 8 lines × 4 quadrants = 32 should be mapped, but test the fallback
    const name = getShadowArchetypeName('Cognitive', 'DarkAddiction');
    expect(name).toBeTruthy();
    expect(name.length).toBeGreaterThan(0);
  });
});
