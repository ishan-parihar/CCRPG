import { describe, it, expect } from 'vitest';
import { recordTrace, computeCellCoherence, computeLineProfile, computeMasterPolarity, detectCrystallizationMode } from '../../src/core/engines/PolarityEngine.js';
import { createInitialPolarityState } from '../../src/core/domain/PolarityCellVector.js';
import type { PolarityTrace } from '../../src/core/domain/PolarityTrace.js';

function makeTrace(direction: 'Radiative' | 'Absorptive' | 'Sovereign' | 'Diffuse'): PolarityTrace {
  return {
    encounterId: 'test-1',
    timestamp: Date.now(),
    driveDirectionality: { Agency: 'HealthyBalanced', Communion: 'HealthyBalanced', Eros: 'HealthyBalanced', Agape: 'HealthyBalanced' },
    energeticDirection: direction,
    stageOrientation: 'Homeostatic',
    sourceOfNourishment: 'Ambivalent',
  };
}

describe('PolarityEngine', () => {
  describe('recordTrace', () => {
    it('creates a new cell on first trace', () => {
      const state = createInitialPolarityState();
      const result = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      expect(result.cells['Cognitive:Red']).toBeDefined();
      expect(result.cells['Cognitive:Red']!.traceCount).toBe(1);
    });

    it('accumulates traces in existing cell', () => {
      let state = createInitialPolarityState();
      state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      expect(state.cells['Cognitive:Red']!.traceCount).toBe(2);
    });

    it('increases coherence when direction is consistent', () => {
      let state = createInitialPolarityState();
      state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      const c1 = state.cells['Cognitive:Red']!.coherence;
      // Record many consistent traces
      for (let i = 0; i < 10; i++) {
        state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      }
      expect(state.cells['Cognitive:Red']!.coherence).toBeGreaterThan(c1);
    });

    it('decreases coherence when direction is inconsistent', () => {
      let state = createInitialPolarityState();
      // Build up coherence
      for (let i = 0; i < 10; i++) {
        state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      }
      const highCoherence = state.cells['Cognitive:Red']!.coherence;
      // Now switch direction
      state = recordTrace(state, makeTrace('Absorptive'), 'Cognitive', 'Red');
      expect(state.cells['Cognitive:Red']!.coherence).toBeLessThan(highCoherence);
    });
  });

  describe('computeCellCoherence', () => {
    it('returns cell coherence value', () => {
      let state = createInitialPolarityState();
      state = recordTrace(state, makeTrace('Radiative'), 'Cognitive', 'Red');
      const cell = state.cells['Cognitive:Red']!;
      expect(computeCellCoherence(cell)).toBe(cell.coherence);
    });
  });

  describe('computeLineProfile', () => {
    it('returns null direction for empty cells', () => {
      const profile = computeLineProfile([]);
      expect(profile.direction).toBeNull();
      expect(profile.mode).toBe('Exploring');
    });
  });

  describe('computeMasterPolarity', () => {
    it('returns Exploring when no lines are coherent', () => {
      const profiles = Array(8).fill({ direction: null, coherence: 0.1, mode: 'Exploring' as const });
      const master = computeMasterPolarity(profiles);
      expect(master.mode).toBe('Exploring');
    });
  });

  describe('detectCrystallizationMode', () => {
    it('returns the master mode', () => {
      const master = { mode: 'Exploring' as const, dominantDirection: null, coherentLineCount: 0, crystallizationProgress: 0 };
      expect(detectCrystallizationMode(master)).toBe('Exploring');
    });
  });
});
