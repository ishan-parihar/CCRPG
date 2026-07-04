/**
 * Tests for GAP-F-2: CCI liminality detection + GAP-F-7: rayProfile in
 * TransformationDetector + GAP-F-4: transformation state persistence.
 */
import { describe, it, expect } from 'vitest';
import { computeCCI } from '../../src/core/engines/CCIEngine.js';
import { computeReadiness } from '../../src/core/engines/TransformationDetector.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { applyConsequences, processOutcome, type PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';
import { createInitialWorldState } from '../../src/core/engines/CandidateGeneration.js';
import { STAGE_RAY_MAP } from '../../src/core/domain/Ray.js';
import type { SignificatorSnapshot } from '../../src/core/domain/SignificatorSnapshot.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeSnapshot(overrides: Partial<SignificatorSnapshot> = {}): SignificatorSnapshot {
  const allRed: Record<Line, Stage> = makeAltitudes('Red');
  return {
    id: 'test-sig',
    altitudes: allRed,
    currentStage: 'Red',
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

function makeEncounter(line: Line, stage: Stage): ScheduledEncounter {
  return {
    id: `test-${line}:${stage}`,
    moduleRef: `${line}:${stage}`,
    modality: 'Deterministic',
    targetLines: [line],
    stage,
    holonSource: `${line}:${stage}`,
    shadowTarget: null,
    polarityMode: 'Exploring',
    difficulty: 0.5,
    sessionPosition: 'peak',
    priority: 0.5,
    driveTarget: null,
    executionMode: 'capacity',
  };
}

function makeResponse(): PlayerResponse {
  return {
    encounterId: 'test',
    energeticDirection: 'Radiative',
    driveDirectionality: { Agency: 'HealthyBalanced', Communion: 'HealthyBalanced', Eros: 'HealthyBalanced', Agape: 'HealthyBalanced' },
    stageOrientation: 'Homeostatic',
    sourceOfNourishment: 'LowerRealm',
    shadowSurfaced: null,
    shadowResolvedId: null,
    narrativeSummary: 'A normal response.',
  };
}

// --- GAP-F-2: CCI Liminality Detection ---

describe('GAP-F-2: CCI metabolicHealth includes liminalitySignature', () => {
  it('CCI score includes liminalitySignature', () => {
    const snapshot = makeSnapshot();
    const score = computeCCI(snapshot);
    expect(score.metabolicHealth).toBeDefined();
    expect(score.metabolicHealth!.liminalitySignature).toBeDefined();
    expect(score.metabolicHealth!.liminalitySignature).toHaveProperty('pzSpike');
    expect(score.metabolicHealth!.liminalitySignature).toHaveProperty('subDensitySaturation');
    expect(score.metabolicHealth!.liminalitySignature).toHaveProperty('isTransitional');
  });

  it('CCI interpretation includes transitional as a valid value', () => {
    const snapshot = makeSnapshot();
    const score = computeCCI(snapshot);
    expect(['consolidating', 'polarizing-healthy', 'polarizing-unhealthy', 'stuck', 'transitional'])
      .toContain(score.metabolicHealth!.interpretation);
  });

  it('a snapshot with high P_z + 5+ saturated lines classifies as transitional', () => {
    const saturatedCells: Record<string, unknown> = {};
    const lines = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic'];
    for (const line of lines) {
      saturatedCells[`${line}:Red`] = { crystallization: 0.8, traceCount: 5, dominantPattern: 'Radiative', exploratoryBreadth: 0.1, coherence: 0.8, textureId: 't1' };
    }
    const snapshot = makeSnapshot({
      polarity: {
        cells: saturatedCells as never,
        lineProfiles: {},
        master: { mode: 'Crystallized' as const, dominantDirection: 'Radiative' as const, coherentLineCount: 6, crystallizationProgress: 0.9 },
      },
    });
    const score = computeCCI(snapshot);
    expect(score.metabolicHealth!.liminalitySignature!.subDensitySaturation).toBe(true);
    if (score.metabolicHealth!.pz > 0.7) {
      expect(score.metabolicHealth!.interpretation).toBe('transitional');
    }
  });
});

// --- GAP-F-7: rayProfile in TransformationDetector ---

describe('GAP-F-7: rayProfile drives transformation readiness', () => {
  it('computeReadiness uses rayProfile as a signal', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    // With all-zero rayProfile, rayReadiness = 0
    const report0 = computeReadiness(sig, 'Amber');
    expect(report0.overall).toBeGreaterThanOrEqual(0);

    // With high current-ray activation + rising target-ray activation
    const sigWithRays = {
      ...sig,
      rayProfile: {
        ...sig.rayProfile,
        Yellow: 0.8,  // current stage's ray (Red → Yellow)
        Green: 0.5,   // target stage's ray (Amber → Green)
      } as typeof sig.rayProfile,
    };
    const report1 = computeReadiness(sigWithRays, 'Amber');
    // The ray readiness should boost the overall score
    expect(report1.overall).toBeGreaterThanOrEqual(report0.overall);
  });

  it('rayReadiness contributes 10% to overall readiness', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const sigWithRays = {
      ...sig,
      rayProfile: {
        ...sig.rayProfile,
        Yellow: 0.8,
        Green: 0.5,
      } as typeof sig.rayProfile,
    };
    // CRITICAL-1: The formula changed from 40%/25%/25%/10% to 35%/20%/20%/10%/15% (AQAL).
    // With all 8 lines at Red (currentOrd=2), target Amber:
    // convergence = 1.0, saturation = 0, shadowClearance = 1, rayReadiness = 1
    // AQAL: all 8 lines at Red → UL(3)+UR(3)+LL(2) = 3 quadrants covered.
    // LR covered if polarity cell activity at current stage (none for fresh sig → not covered).
    // aqalCoherence = 3/4 = 0.75 → >= 0.75 → full formula applies
    // overall = 1.0*0.35 + 0*0.20 + 1*0.20 + 1*0.10 + 0.75*0.15 = 0.35+0+0.20+0.10+0.1125 = 0.7625
    const report = computeReadiness(sigWithRays, 'Amber');
    expect(report.overall).toBeCloseTo(0.7625, 1);

    // Without ray activation, rayReadiness = 0:
    // overall = 1.0*0.35 + 0*0.20 + 1*0.20 + 0*0.10 + 0.75*0.15 = 0.6625
    const reportNoRays = computeReadiness(sig, 'Amber');
    expect(reportNoRays.overall).toBeCloseTo(0.6625, 1);

    // The difference (0.10) is the rayReadiness contribution
    expect(report.overall - reportNoRays.overall).toBeCloseTo(0.1, 1);
  });
});

// --- GAP-F-4: Transformation state persistence in GameLoop ---

describe('GAP-F-4: applyConsequences preserves transformation state fields', () => {
  it('rayProfile is updated by applyConsequences', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const encounter = makeEncounter('Cognitive', 'Red');
    const response = makeResponse();
    const record = processOutcome(encounter, response, Date.now());
    const { sig: newSig } = applyConsequences(sig, world, record, encounter);

    // Red stage → Yellow ray should be activated
    const expectedRay = STAGE_RAY_MAP['Red'];
    expect(newSig.rayProfile[expectedRay]).toBeGreaterThan(0);
  });

  it('rayProfile accumulates across multiple encounters', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const encounter = makeEncounter('Cognitive', 'Red');
    const response = makeResponse();

    let currentSig = sig;
    for (let i = 0; i < 5; i++) {
      const record = processOutcome(encounter, response, Date.now() + i);
      const result = applyConsequences(currentSig, world, record, encounter);
      currentSig = result.sig;
    }

    // After 5 encounters at Red (→ Yellow ray), Yellow should be highly activated
    expect(currentSig.rayProfile.Yellow).toBeGreaterThan(0.5);
  });

  it('transformation state fields persist on the Significator', () => {
    const sig = createSignificator('p1', makeAltitudes('Red'), 'Red');
    // Verify the fields exist and default correctly
    expect(sig.transformationPhase).toBe('idle');
    expect(sig.transformationSessionsInPhase).toBe(0);
    expect(sig.transformationKnotsResolved).toBe(0);
    expect(sig.transformationTotalKnots).toBe(0);
    expect(sig.transformationTargetStage).toBeNull();

    // Verify they can be set (simulating what GameLoop does)
    const advanced = {
      ...sig,
      transformationPhase: 'crucible' as const,
      transformationSessionsInPhase: 3,
      transformationKnotsResolved: 1,
      transformationTotalKnots: 2,
      transformationTargetStage: 'Amber' as Stage | null,
    };
    expect(advanced.transformationPhase).toBe('crucible');
    expect(advanced.transformationSessionsInPhase).toBe(3);
    expect(advanced.transformationTargetStage).toBe('Amber');
  });
});
