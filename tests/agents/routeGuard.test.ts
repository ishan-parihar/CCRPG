/**
 * Tests for the agentic route guard.
 *
 * Decision 10 (Failure Integrity): when llmStatus is offline,
 * navigating to /onboarding, /play, or /diagnostic must redirect
 * the player to /setup. Non-agentic paths pass through.
 *
 * We exercise the path-classification logic only; the Svelte
 * runtime's goto() invocation is bypassed because the guard runs
 * outside Svelte context in unit tests.
 */

import { describe, it, expect } from 'vitest';
import { isAgenticPath } from '../../src/lib/agents/routeGuard.js';

describe('isAgenticPath', () => {
  it('recognises /onboarding', () => {
    expect(isAgenticPath('/onboarding')).toBe(true);
    expect(isAgenticPath('/onboarding/')).toBe(true);
  });

  it('recognises /play', () => {
    expect(isAgenticPath('/play')).toBe(true);
  });

  it('recognises /diagnostic', () => {
    expect(isAgenticPath('/diagnostic')).toBe(true);
  });

  it('does not flag /setup or /profile or /journal', () => {
    expect(isAgenticPath('/setup')).toBe(false);
    expect(isAgenticPath('/profile')).toBe(false);
    expect(isAgenticPath('/journal')).toBe(false);
  });

  it('does not flag unrelated sub-paths', () => {
    expect(isAgenticPath('/profiles/list')).toBe(false);
    // Onboarding subpaths also count as agentic (still in the surface tree).
    expect(isAgenticPath('/onboarding/history/foo')).toBe(true);
  });

  it('does not flag /games or /admin', () => {
    expect(isAgenticPath('/games')).toBe(false);
    expect(isAgenticPath('/admin')).toBe(false);
    expect(isAgenticPath('/')).toBe(false);
  });
});
