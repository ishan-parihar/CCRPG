/**
 * Tests for UserMatrixModel — explicit model of the USER's Matrix/Potentiator.
 * Per AUDIT-USER-MATRIX.md and HoloOS 02.1 §1-4.
 */
import { describe, it, expect } from 'vitest';
import {
  createInitialUserMatrixModel,
  inferFromResponse,
  updateUserMatrix,
  computeUserMatrixPriority,
  promotePhase,
  resetPhaseAfterTransformation,
  summarizeUserMatrix,
} from '../../src/core/engines/UserMatrixModel.js';
import type { Drive } from '../../src/core/domain/Drive.js';
import type { DriveDirectionality } from '../../src/core/domain/enums.js';

function allHealthy(): Record<Drive, DriveDirectionality> {
  return {
    Agency: 'HealthyBalanced',
    Communion: 'HealthyBalanced',
    Eros: 'HealthyBalanced',
    Agape: 'HealthyBalanced',
  };
}

describe('UserMatrixModel — initial state', () => {
  it('creates a model with 64 cells (8 lines × 8 stages)', () => {
    const model = createInitialUserMatrixModel();
    expect(Object.keys(model.cells).length).toBe(64);
  });

  it('starts in unmapped phase with 0 probe coverage', () => {
    const model = createInitialUserMatrixModel();
    expect(model.profilePhase).toBe('unmapped');
    expect(model.probeCoverage).toBe(0);
  });

  it('all cells start with zero loads', () => {
    const model = createInitialUserMatrixModel();
    const cell = model.cells['Cognitive:Red'];
    expect(cell).toBeDefined();
    expect(cell.unprocessedCatalystLoad).toBe(0);
    expect(cell.unprocessedExperienceLoad).toBe(0);
    expect(cell.avoidanceSignal).toBe(0);
    expect(cell.resistanceSignal).toBe(0);
    expect(cell.encounterCount).toBe(0);
  });
});

describe('UserMatrixModel — inferFromResponse', () => {
  it('infers unprocessed catalyst from fixation keywords', () => {
    const inference = inferFromResponse(
      'I must control this. I have to. I can\'t stop. I\'m driven.',
      allHealthy(),
      null,
    );
    expect(inference.unprocessedCatalystDelta).toBeGreaterThan(0.1);
  });

  it('infers avoidance from avoidance keywords', () => {
    const inference = inferFromResponse(
      'I avoid this. I withdraw. I shut down.',
      allHealthy(),
      null,
    );
    expect(inference.avoidanceDelta).toBeGreaterThan(0.1);
  });

  it('infers unprocessed experience from bypass keywords', () => {
    const inference = inferFromResponse(
      'I transcend this. I\'m already past it. I\'m beyond this.',
      allHealthy(),
      null,
    );
    expect(inference.unprocessedExperienceDelta).toBeGreaterThan(0.1);
  });

  it('infers resistance from resistance keywords', () => {
    const inference = inferFromResponse(
      'I don\'t need this. I\'m fine as I am. I refuse.',
      allHealthy(),
      null,
    );
    expect(inference.resistanceDelta).toBeGreaterThan(0.1);
  });

  it('infers from Dark-Addicted drive signal', () => {
    const inference = inferFromResponse(
      'normal response',
      { ...allHealthy(), Agency: 'DarkAddicted' },
      null,
    );
    expect(inference.unprocessedCatalystDelta).toBeGreaterThan(0);
  });

  it('infers from DarkAddiction shadow', () => {
    const inference = inferFromResponse('ok', allHealthy(), 'DarkAddiction');
    expect(inference.unprocessedCatalystDelta).toBeGreaterThan(0.1);
  });

  it('infers from Golden-Addicted drive signal (bypass)', () => {
    const inference = inferFromResponse(
      'normal',
      { ...allHealthy(), Eros: 'GoldenAddicted' },
      null,
    );
    expect(inference.unprocessedExperienceDelta).toBeGreaterThan(0);
  });

  it('infers from GoldenAllergy shadow (resistance)', () => {
    const inference = inferFromResponse('ok', allHealthy(), 'GoldenAllergy');
    expect(inference.resistanceDelta).toBeGreaterThan(0.1);
  });

  it('returns low deltas for healthy balanced response with no keywords', () => {
    const inference = inferFromResponse('A normal response.', allHealthy(), null);
    expect(inference.unprocessedCatalystDelta).toBeLessThanOrEqual(0.05);
    expect(inference.unprocessedExperienceDelta).toBe(0);
    // Short responses (3 words) trigger a mild avoidance signal — this is correct
    expect(inference.avoidanceDelta).toBeLessThanOrEqual(0.1);
    expect(inference.resistanceDelta).toBe(0);
  });

  it('all deltas are clamped to [0, 0.3]', () => {
    const inference = inferFromResponse(
      'must must must avoid withdraw transcend refuse don\'t need',
      { ...allHealthy(), Agency: 'DarkAddicted', Eros: 'GoldenAddicted' },
      'DarkAddiction',
    );
    expect(inference.unprocessedCatalystDelta).toBeLessThanOrEqual(0.3);
    expect(inference.unprocessedExperienceDelta).toBeLessThanOrEqual(0.3);
    expect(inference.avoidanceDelta).toBeLessThanOrEqual(0.3);
    expect(inference.resistanceDelta).toBeLessThanOrEqual(0.3);
  });
});

describe('UserMatrixModel — updateUserMatrix', () => {
  it('increments encounter count on the target cell', () => {
    const model = createInitialUserMatrixModel();
    const inference = inferFromResponse('must control', allHealthy(), null);
    const updated = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    expect(updated.cells['Cognitive:Red'].encounterCount).toBe(1);
  });

  it('increases unprocessedCatalystLoad on the target cell', () => {
    const model = createInitialUserMatrixModel();
    const inference = inferFromResponse('must control have to', allHealthy(), null);
    const updated = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    expect(updated.cells['Cognitive:Red'].unprocessedCatalystLoad).toBeGreaterThan(0);
  });

  it('does not modify other cells\' encounter counts', () => {
    const model = createInitialUserMatrixModel();
    const inference = inferFromResponse('ok', allHealthy(), null);
    const updated = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    expect(updated.cells['Emotional:Red'].encounterCount).toBe(0);
  });

  it('updates probeCoverage after probing', () => {
    const model = createInitialUserMatrixModel();
    const inference = inferFromResponse('ok', allHealthy(), null);
    const updated = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    expect(updated.probeCoverage).toBeGreaterThan(0);
    expect(updated.probeCoverage).toBeLessThanOrEqual(1);
  });

  it('transitions from unmapped to mapping after enough probing', () => {
    let model = createInitialUserMatrixModel();
    const inference = inferFromResponse('ok', allHealthy(), null);
    // Probe 10 cells (10/64 = 0.156 > 0.15 threshold)
    const lines = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal', 'Cognitive', 'Emotional'];
    const stages = ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Amber', 'Amber'];
    for (let i = 0; i < 10; i++) {
      model = updateUserMatrix(model, lines[i] as never, stages[i] as never, inference, Date.now());
    }
    expect(model.profilePhase).toBe('mapping');
  });
});

describe('UserMatrixModel — computeUserMatrixPriority', () => {
  it('returns high priority for unprobed cells in unmapped phase', () => {
    const model = createInitialUserMatrixModel();
    const priority = computeUserMatrixPriority(model, 'Cognitive', 'Red');
    expect(priority).toBe(0.3); // unprobed cell in unmapped phase
  });

  it('returns 0 for probed cells in unmapped phase', () => {
    let model = createInitialUserMatrixModel();
    const inference = inferFromResponse('ok', allHealthy(), null);
    model = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    const priority = computeUserMatrixPriority(model, 'Cognitive', 'Red');
    expect(priority).toBe(0); // already probed
  });

  it('returns higher priority for cells with high unprocessed load in mapping phase', () => {
    let model = createInitialUserMatrixModel();
    // Probe 12 DIFFERENT cells to reach mapping phase (coverage 12/64 = 0.1875 > 0.15)
    const lines = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual',
                   'Somatic', 'Willpower', 'Interpersonal', 'Cognitive', 'Emotional',
                   'Moral', 'Intrapersonal'];
    const stages = ['Red', 'Red', 'Red', 'Red', 'Red',
                    'Red', 'Red', 'Red', 'Amber', 'Amber',
                    'Amber', 'Amber'];
    const heavyInference = inferFromResponse('must control have to driven', allHealthy(), null);
    for (let i = 0; i < 12; i++) {
      model = updateUserMatrix(model, lines[i] as never, stages[i] as never, heavyInference, Date.now());
    }
    expect(model.profilePhase).toBe('mapping');
    // Cognitive:Red was probed with heavy inference → should have load > 0
    const priority = computeUserMatrixPriority(model, 'Cognitive', 'Red');
    expect(priority).toBeGreaterThan(0);
  });

  it('returns 0 for unprobed cells in crystallized phase', () => {
    let model = createInitialUserMatrixModel();
    model = promotePhase(model, 'Crystallized');
    const priority = computeUserMatrixPriority(model, 'Cognitive', 'Red');
    expect(priority).toBe(0); // no shadow pattern → 0 in crystallized
  });
});

describe('UserMatrixModel — promotePhase', () => {
  it('promotes to crystallizing when polarity mode is Crystallizing', () => {
    const model = createInitialUserMatrixModel();
    const promoted = promotePhase(model, 'Crystallizing');
    expect(promoted.profilePhase).toBe('crystallizing');
  });

  it('promotes to crystallized when polarity mode is Crystallized', () => {
    const model = createInitialUserMatrixModel();
    const promoted = promotePhase(model, 'Crystallized');
    expect(promoted.profilePhase).toBe('crystallized');
  });

  it('does not regress from crystallized to crystallizing', () => {
    let model = createInitialUserMatrixModel();
    model = promotePhase(model, 'Crystallized');
    model = promotePhase(model, 'Crystallizing');
    expect(model.profilePhase).toBe('crystallized');
  });

  it('does not change phase when polarity mode is Exploring', () => {
    const model = createInitialUserMatrixModel();
    const promoted = promotePhase(model, 'Exploring');
    expect(promoted.profilePhase).toBe(model.profilePhase);
  });
});

describe('UserMatrixModel — resetPhaseAfterTransformation', () => {
  it('resets crystallized back to unmapped after transformation', () => {
    let model = createInitialUserMatrixModel();
    model = promotePhase(model, 'Crystallized');
    expect(model.profilePhase).toBe('crystallized');
    model = resetPhaseAfterTransformation(model);
    expect(model.profilePhase).toBe('unmapped');
  });
});

describe('UserMatrixModel — summarizeUserMatrix', () => {
  it('returns phase, coverage, and top unprocessed cells', () => {
    let model = createInitialUserMatrixModel();
    const inference = inferFromResponse('must control have to', allHealthy(), null);
    model = updateUserMatrix(model, 'Cognitive', 'Red', inference, Date.now());
    model = updateUserMatrix(model, 'Emotional', 'Red', inference, Date.now());

    const summary = summarizeUserMatrix(model);
    expect(summary.phase).toBe('unmapped');
    expect(summary.coverage).toBeGreaterThan(0);
    expect(summary.topUnprocessedCells.length).toBeGreaterThan(0);
    expect(summary.topUnprocessedCells[0].load).toBeGreaterThan(0);
  });

  it('totalAvoidance and totalResistance are non-negative', () => {
    const model = createInitialUserMatrixModel();
    const summary = summarizeUserMatrix(model);
    expect(summary.totalAvoidance).toBeGreaterThanOrEqual(0);
    expect(summary.totalResistance).toBeGreaterThanOrEqual(0);
  });
});
