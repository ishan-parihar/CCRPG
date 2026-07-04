/**
 * CompositeOnboarding integration tests.
 * Verifies the binary-search onboarding algorithm correctly converges
 * to the player's developmental altitude for each line.
 */
import { describe, it, expect } from 'vitest';
import {
  CompositeOnboarding,
} from '../../src/game/assessments/CompositeOnboarding.js';
import { ModuleRegistry } from '../../src/core/assessments/registry.js';
import type { StageAssessment, AssessmentResult, AssessmentTask, DriveProbe } from '../../src/core/assessments/types.js';
import { ALL_LINES } from '../../src/core/domain/Line.js';
import { ALL_STAGES } from '../../src/core/domain/Stage.js';
import { stageOrdinal } from '../../src/core/domain/Stage.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { MeasureDimension } from '../../src/core/assessments/types.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function mockTask(id: string): AssessmentTask {
  return {
    id,
    type: 'reaction_time',
    description: 'test task',
    parameters: {},
    measures: ['accuracy'] as readonly MeasureDimension[],
  };
}

function mockDriveProbe(drive: string): DriveProbe {
  return {
    description: `${drive} probe`,
    task: mockTask(`${drive}-probe`),
    healthyResponse: 'healthy',
    addictionSignal: 'addicted',
    allergySignal: 'allergic',
  };
}

function createFullRegistry(): ModuleRegistry {
  const registry = new ModuleRegistry();
  for (const line of ALL_LINES) {
    for (const stage of ALL_STAGES) {
      const module: StageAssessment = {
        line,
        stage,
        tasks: [mockTask(`${line}-${stage}-task`)],
        scoringRubric: { passThreshold: 0.5, dimensionWeights: { accuracy: 1.0 } },
        minimumTrials: 1,
        estimatedDurationMs: 1000,
        driveProbes: {
          agency: mockDriveProbe('agency'),
          communion: mockDriveProbe('communion'),
          eros: mockDriveProbe('eros'),
          agape: mockDriveProbe('agape'),
        },
      };
      registry.register(module);
    }
  }
  return registry;
}

/**
 * Create a mock runModule function that passes if the stage ordinal
 * is at or below the given threshold for that line.
 */
function createMockRunner(passUpTo: Partial<Record<Line, number>>) {
  return async (module: StageAssessment): Promise<AssessmentResult> => {
    const threshold = passUpTo[module.line] ?? 0;
    const ordinal = stageOrdinal(module.stage);
    const passed = ordinal <= threshold;
    return {
      line: module.line,
      stage: module.stage,
      passed,
      confidence: passed ? 0.8 : 0.3,
      dimensions: { accuracy: passed ? 0.8 : 0.3 } as Record<MeasureDimension, number>,
      rawTrials: [],
    };
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CompositeOnboarding', () => {
  describe('calibration probes fallback', () => {
    it('returns calibrationProbe from module if defined', async () => {
      // @ts-ignore
      const { getOrCreateCalibrationProbe } = await import('../../src/core/assessments/calibrationProbes.js');
      const task = mockTask('test-probe');
      const mockModule = {
        line: 'Moral' as const,
        stage: 'Red' as const,
        tasks: [],
        scoringRubric: { passThreshold: 0.5, dimensionWeights: {} },
        minimumTrials: 1,
        estimatedDurationMs: 1000,
        calibrationProbe: task,
        driveProbes: {} as any,
      };
      const probe = getOrCreateCalibrationProbe(mockModule);
      expect(probe.id).toBe('test-probe');
    });

    it('creates a dynamic calibrationProbe based on line and stage if undefined', async () => {
      // @ts-ignore
      const { getOrCreateCalibrationProbe } = await import('../../src/core/assessments/calibrationProbes.js');
      const mockModule = {
        line: 'Moral' as const,
        stage: 'Red' as const,
        tasks: [mockTask('default-task')],
        scoringRubric: { passThreshold: 0.5, dimensionWeights: {} },
        minimumTrials: 1,
        estimatedDurationMs: 1000,
        driveProbes: {} as any,
      };
      const probe = getOrCreateCalibrationProbe(mockModule);
      expect(probe.id).toBe('cal-probe-moral-red');
      expect(probe.type).toBe('llm_dialogue');
    });
  });

  describe('binary search convergence', () => {
    it('converges for below-Red player (passes Infrared+Magenta, fails Red)', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      // passUpTo ordinal 1 = Magenta
      const runner = createMockRunner({ Cognitive: 1 });
      const result = await onboarding.assessLine('Cognitive', runner);

      expect(result.line).toBe('Cognitive');
      expect(result.altitude).toBe('Magenta');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('converges for Red player (passes through Red, fails Amber)', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      // passUpTo ordinal 2 = Red
      const runner = createMockRunner({ Emotional: 2 });
      const result = await onboarding.assessLine('Emotional', runner);

      expect(result.line).toBe('Emotional');
      expect(result.altitude).toBe('Red');
    });

    it('reaches White for player passing all stages', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      // passUpTo ordinal 7 = White (all stages pass)
      const runner = createMockRunner({ Moral: 7 });
      const result = await onboarding.assessLine('Moral', runner);

      expect(result.line).toBe('Moral');
      expect(result.altitude).toBe('White');
      expect(result.confidence).toBe(0.8);
    });

    it('converges for Green player (passes through Green, fails Turquoise)', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      // passUpTo ordinal 5 = Green
      const runner = createMockRunner({ Intrapersonal: 5 });
      const result = await onboarding.assessLine('Intrapersonal', runner);

      expect(result.line).toBe('Intrapersonal');
      expect(result.altitude).toBe('Green');
    });

    it('returns Infrared when all stages fail', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      // passUpTo -1 means nothing passes
      const runner = createMockRunner({ Somatic: -1 });
      const result = await onboarding.assessLine('Somatic', runner);

      expect(result.altitude).toBe('Infrared');
      expect(result.confidence).toBe(0);
    });

    it('converges within MAX_ASSESSMENTS (4) for any target altitude', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });

      // Test at various target altitudes
      const targets = [0, 1, 2, 3, 4, 5, 6, 7];
      for (const target of targets) {
        const runner = createMockRunner({ Willpower: target });
        const result = await onboarding.assessLine('Willpower', runner);
        expect(result.assessmentsRun).toBeLessThanOrEqual(4);
      }
    });

    it('instantly converges to inferredStage when returned by LLM in rawResponse', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      
      const runner = async (module: StageAssessment): Promise<AssessmentResult> => {
        return {
          line: module.line,
          stage: module.stage,
          passed: true,
          confidence: 0.8,
          dimensions: {} as any,
          rawTrials: [{
            taskId: 'test-task',
            timestamp: Date.now(),
            dimensions: {},
            rawResponse: {
              score: 0.9,
              feedback: 'Perfect alignment',
              inferredStage: 'Turquoise',
              confidence: 0.95
            },
            durationMs: 1000
          }]
        };
      };
      
      const result = await onboarding.assessLine('Cognitive', runner);
      
      expect(result.altitude).toBe('Turquoise');
      expect(result.assessmentsRun).toBe(1); // Converged on first trial!
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('quick calibration mode', () => {
    it('runs only 1 assessment per line', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'quick-calibration',
      });
      const runner = createMockRunner({ Cognitive: 5 });
      const result = await onboarding.assessLine('Cognitive', runner);

      expect(result.assessmentsRun).toBe(1);
    });

    it('returns stage at starting ordinal when passed', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'quick-calibration',
      });
      // The starting ordinal is Math.floor(8/2) = 4 (Orange)
      const runner = createMockRunner({ Emotional: 7 }); // passes everything
      const result = await onboarding.assessLine('Emotional', runner);

      // Should return Orange (ordinal 4) since quick-calibration only tests at starting point
      expect(result.altitude).toBe(ALL_STAGES[4]); // Orange
      expect(result.assessmentsRun).toBe(1);
    });
  });

  describe('three-session split', () => {
    it('session 1 returns Somatic, Cognitive, Emotional lines', () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'three-session',
        currentSession: 1,
      });
      const lines = onboarding.getLinesForSession();

      expect(lines).toEqual(['Somatic', 'Cognitive', 'Emotional']);
    });

    it('session 2 returns Moral, Intrapersonal, Spiritual lines', () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'three-session',
        currentSession: 2,
      });
      const lines = onboarding.getLinesForSession();

      expect(lines).toEqual(['Moral', 'Intrapersonal', 'Spiritual']);
    });

    it('session 3 returns Willpower, Interpersonal lines', () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'three-session',
        currentSession: 3,
      });
      const lines = onboarding.getLinesForSession();

      expect(lines).toEqual(['Willpower', 'Interpersonal']);
    });
  });

  describe('full onboarding produces valid Significator', () => {
    it('runs all 8 lines and produces Significator with correct altitudes', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });

      // Each line passes up to a different altitude
      const passMap: Partial<Record<Line, number>> = {
        Cognitive: 4,      // Orange
        Emotional: 3,      // Amber
        Moral: 2,          // Red
        Intrapersonal: 5,  // Green
        Spiritual: 1,      // Magenta
        Somatic: 6,        // Turquoise
        Willpower: 3,      // Amber
        Interpersonal: 4,  // Orange
      };
      const runner = createMockRunner(passMap);
      const result = await onboarding.runOnboarding(runner);

      expect(result.lineResults).toHaveLength(8);
      expect(result.significator).toBeDefined();

      // Verify each line's altitude matches expected
      expect(result.significator.altitudes.Cognitive).toBe('Orange');
      expect(result.significator.altitudes.Emotional).toBe('Amber');
      expect(result.significator.altitudes.Moral).toBe('Red');
      expect(result.significator.altitudes.Intrapersonal).toBe('Green');
      expect(result.significator.altitudes.Spiritual).toBe('Magenta');
      expect(result.significator.altitudes.Somatic).toBe('Turquoise');
      expect(result.significator.altitudes.Willpower).toBe('Amber');
      expect(result.significator.altitudes.Interpersonal).toBe('Orange');

      // Verify the significator has a valid currentStage (centre of gravity)
      const currentOrdinal = stageOrdinal(result.significator.currentStage);
      expect(currentOrdinal).toBeGreaterThanOrEqual(0);
      expect(currentOrdinal).toBeLessThanOrEqual(7);
    });

    it('reports correct sessionsCompleted for full mode', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, { sessionSplit: 'full' });
      const runner = createMockRunner({ Cognitive: 3 });
      const result = await onboarding.runOnboarding(runner);

      expect(result.sessionsCompleted).toBe(1);
    });

    it('reports correct sessionsCompleted for three-session mode', async () => {
      const registry = createFullRegistry();
      const onboarding = new CompositeOnboarding(registry, {
        sessionSplit: 'three-session',
        currentSession: 2,
      });
      const runner = createMockRunner({ Moral: 3, Intrapersonal: 4, Spiritual: 2 });
      const result = await onboarding.runOnboarding(runner);

      expect(result.sessionsCompleted).toBe(2);
    });
  });
});
