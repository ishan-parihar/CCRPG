/**
 * Tests for T-1.8 — G_z/P_z metabolic health in CCIEngine.
 * Per foundations/25 §1.1 and AUDIT-HOLOOS-ALIGNMENT.md §2.5.6.
 */
import { describe, it, expect } from 'vitest';
import { computeCCI } from '../../src/core/engines/CCIEngine.js';
import type { SignificatorSnapshot } from '../../src/core/domain/SignificatorSnapshot.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';

function makeMinimalSnapshot(overrides: Partial<SignificatorSnapshot> = {}): SignificatorSnapshot {
  const allInfrared: Record<Line, Stage> = {
    Cognitive: 'Infrared', Emotional: 'Infrared', Moral: 'Infrared',
    Intrapersonal: 'Infrared', Spiritual: 'Infrared', Somatic: 'Infrared',
    Willpower: 'Infrared', Interpersonal: 'Infrared',
  };
  return {
    id: 'test-sig',
    altitudes: allInfrared,
    currentStage: 'Infrared',
    drives: { weights: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 }, fixationRisk: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 } },
    polarity: {
      cells: {},
      lineProfiles: {},
      master: { mode: 'Exploring' as const, dominantDirection: null, coherentLineCount: 0, crystallizationProgress: 0 },
    },
    shadows: { entries: [], activeCount: 0 },
    theta: { lastEncounter: {} },
    transformations: [],
    totalEncounters: 0,
    totalSessions: 10,
    driveBalance: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 },
    fixationRisk: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 },
    compoundShadows: [],
    recentEncounterHistory: [],
    transformationReadiness: {
      linesAtEdge: 0,
      shadowClearance: true,
      catalystSaturation: 0,
      pendingTransformation: false,
      targetStage: null,
      sessionsSinceLastTransformation: 10,
    },
    ...overrides,
  };
}

describe('T-1.8 — CCI metabolicHealth (G_z / P_z)', () => {
  it('includes a metabolicHealth field on every CCIScore', () => {
    const snapshot = makeMinimalSnapshot();
    const score = computeCCI(snapshot);
    expect(score.metabolicHealth).toBeDefined();
    expect(score.metabolicHealth).not.toBeNull();
  });

  it('gz and pz are both in [0, 1]', () => {
    const snapshot = makeMinimalSnapshot();
    const score = computeCCI(snapshot);
    expect(score.metabolicHealth!.gz).toBeGreaterThanOrEqual(0);
    expect(score.metabolicHealth!.gz).toBeLessThanOrEqual(1);
    expect(score.metabolicHealth!.pz).toBeGreaterThanOrEqual(0);
    expect(score.metabolicHealth!.pz).toBeLessThanOrEqual(1);
  });

  it('total = gz * pz (geometric mean)', () => {
    const snapshot = makeMinimalSnapshot();
    const score = computeCCI(snapshot);
    expect(score.metabolicHealth!.total).toBeCloseTo(
      score.metabolicHealth!.gz * score.metabolicHealth!.pz,
      5,
    );
  });

  it('interpretation is one of the 4 valid values', () => {
    const snapshot = makeMinimalSnapshot();
    const score = computeCCI(snapshot);
    expect(['consolidating', 'polarizing-healthy', 'polarizing-unhealthy', 'stuck'])
      .toContain(score.metabolicHealth!.interpretation);
  });

  it('a snapshot with balanced drives + no shadows produces a higher gz than one with imbalanced drives + shadows', () => {
    const healthy = makeMinimalSnapshot({
      drives: {
        weights: { Agency: 0.25, Communion: 0.25, Eros: 0.25, Agape: 0.25 },
        fixationRisk: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 },
      },
      shadows: { entries: [], activeCount: 0 },
    });
    const unhealthy = makeMinimalSnapshot({
      drives: {
        weights: { Agency: 0.9, Communion: 0.04, Eros: 0.03, Agape: 0.03 },
        fixationRisk: { Agency: 0.8, Communion: 0, Eros: 0, Agape: 0 },
      },
      shadows: {
        entries: [
          { id: 's1', quadrant: 'DarkAddiction', line: 'Cognitive', stage: 'Infrared', drive: 'Agency', surfacedAt: 0, resolvedAt: null, recurrenceCount: 3, compoundPartner: null, severity: 0.9 },
        ],
        activeCount: 1,
      },
    });
    const healthyScore = computeCCI(healthy);
    const unhealthyScore = computeCCI(unhealthy);
    expect(healthyScore.metabolicHealth!.gz).toBeGreaterThan(unhealthyScore.metabolicHealth!.gz);
  });

  it('a snapshot with high polarity crystallization produces a higher pz than one with none', () => {
    const lowPolar = makeMinimalSnapshot({
      polarity: {
        cells: {},
        lineProfiles: {},
        master: { mode: 'Exploring', dominantDirection: null, coherentLineCount: 0, crystallizationProgress: 0 },
      },
    });
    const highPolar = makeMinimalSnapshot({
      polarity: {
        cells: {},
        lineProfiles: {},
        master: { mode: 'Crystallized', dominantDirection: 'Radiative', coherentLineCount: 5, crystallizationProgress: 0.9 },
      },
    });
    const lowScore = computeCCI(lowPolar);
    const highScore = computeCCI(highPolar);
    expect(highScore.metabolicHealth!.pz).toBeGreaterThan(lowScore.metabolicHealth!.pz);
  });
});
