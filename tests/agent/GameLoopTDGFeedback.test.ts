/**
 * Tests for M4: TDG→Mysterium feedback hooks wired into GameLoop.
 *
 * These tests verify the non-regression contract:
 * - startSessionWithTDG returns the same SessionState as startSession when TDG is not running
 * - getTDGTransformationPressure returns null when TDG is not running
 * - Neither function throws when TDG is unavailable
 *
 * When TDG IS running (Mysterium_E2E_TDG=1), the E2E suite in
 * tests/integration/TDGRustE2E.test.ts covers the active path.
 */
import { describe, it, expect } from 'vitest';
import { startSession, startSessionWithTDG, getTDGTransformationPressure } from '../../src/core/GameLoop.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Significator } from '../../src/core/domain/Significator.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { SessionContext } from '../../src/core/engines/PriorityComputation.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeSig(id: string = 'tdg-feedback-player'): Significator {
  return createSignificator(id, makeAltitudes('Red'), 'Red');
}

function makeSession(): SessionContext {
  return {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 10,
    recentLines: [],
  };
}

describe('M4 — startSessionWithTDG (non-regression when TDG absent)', () => {
  it('returns a valid SessionState with all required fields', async () => {
    const sig = makeSig();
    const session = makeSession();
    const state = await startSessionWithTDG(sig, session);

    expect(state).toBeDefined();
    expect(state.strategy).toBeDefined();
    expect(state.cci).toBeDefined();
    expect(state.recentOutcomes).toEqual([]);
    expect(state.encountersSinceRefresh).toBe(0);
    expect(state.transformationState).toBeDefined();
    expect(state.userMatrixModel).toBeDefined();
    expect(state.sessionStartMs).toBeDefined();
  });

  it('produces the same CCI composite as sync startSession when TDG is not running', async () => {
    // TDG-Rust is not running in the unit-test environment, so startSessionWithTDG
    // must fall back to the pure baseline CCI (zero regression). The composite
    // score must match the sync startSession exactly.
    const sig = makeSig('cci-match');
    const session = makeSession();
    const syncState = startSession(sig, session);
    const tdgState = await startSessionWithTDG(sig, session);

    expect(tdgState.cci.composite).toBe(syncState.cci.composite);
    expect(tdgState.cci.dimensions).toEqual(syncState.cci.dimensions);
  });

  it('produces the same strategy theme as sync startSession when TDG is not running', async () => {
    const sig = makeSig('strategy-match');
    const session = makeSession();
    const syncState = startSession(sig, session);
    const tdgState = await startSessionWithTDG(sig, session);

    expect(tdgState.strategy.theme).toBe(syncState.strategy.theme);
    // themeRationale may differ if TDG reflection annotated it, but when TDG is
    // absent the rationale must match exactly.
    expect(tdgState.strategy.themeRationale ?? null).toBe(syncState.strategy.themeRationale ?? null);
  });

  it('never throws even if TDG internals fail', async () => {
    const sig = makeSig('no-throw');
    const session = makeSession();
    // Should resolve, not reject — TDG unavailability is a normal path, not an error
    await expect(startSessionWithTDG(sig, session)).resolves.toBeDefined();
  });
});

describe('M4 — getTDGTransformationPressure (non-regression when TDG absent)', () => {
  it('returns null when TDG is not running', async () => {
    const sig = makeSig('pressure-null');
    const pressure = await getTDGTransformationPressure(sig);
    // TDG-Rust is not running in the unit-test environment — must return null
    expect(pressure).toBeNull();
  });

  it('never throws even if TDG internals fail', async () => {
    const sig = makeSig('pressure-no-throw');
    // Should resolve (not reject) — TDG unavailability is a normal path.
    // We wrap in try/catch to verify no throw; the result may be null.
    let result: number | null = null;
    let threw = false;
    try {
      result = await getTDGTransformationPressure(sig);
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(result === null || typeof result === 'number').toBe(true);
  });
});

describe('M4 — startSessionWithTDG vs startSession equivalence (contract)', () => {
  it('both functions accept the same inputs and produce SessionState with the same shape', async () => {
    const sig = makeSig('shape-match');
    const session = makeSession();

    const syncState = startSession(sig, session);
    const asyncState = await startSessionWithTDG(sig, session);

    // Both must have the same keys
    const syncKeys = Object.keys(syncState).sort();
    const asyncKeys = Object.keys(asyncState).sort();
    expect(asyncKeys).toEqual(syncKeys);
  });

  it('startSessionWithTDG can be used as a drop-in replacement for startSession', async () => {
    // The contract: any code that currently calls startSession() can switch to
    // startSessionWithTDG() without breaking. The returned SessionState must be
    // usable by tickWithStrategy, endSession, etc.
    const sig = makeSig('drop-in');
    const session = makeSession();
    const state = await startSessionWithTDG(sig, session);

    // Verify the state is usable — has the fields downstream code reads
    expect(typeof state.cci.composite).toBe('number');
    expect(state.cci.composite).toBeGreaterThanOrEqual(0);
    expect(state.cci.composite).toBeLessThanOrEqual(1);
    expect(state.strategy.theme).toBeTruthy();
    expect(state.strategy.encounterBudget.totalTarget).toBeGreaterThan(0);
    expect(Array.isArray(state.recentOutcomes)).toBe(true);
  });
});
