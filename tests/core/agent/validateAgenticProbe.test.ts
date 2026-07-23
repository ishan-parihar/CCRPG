/**
 * Tests for the 4+1 contract validator.
 *
 * Three layers per BACKGROUND-AGENTIC-ARCHITECTURE Decision 13:
 *   1. Contract: positive cases validate exactly.
 *   2. Contract: negative cases throw on each rule violation.
 *   3. Type-guard: isAgenticProbe returns boolean without throwing.
 */

import { describe, it, expect } from 'vitest';
import {
  assertAgenticProbe,
  isAgenticProbe,
  AgenticProbeValidationError,
} from '../../../src/core/agent/validateAgenticProbe.js';

const VALID_PROBE = {
  id: 'probe-1',
  prompt: 'A short poetic prompt.',
  options: [
    { label: 'Stop and listen', polarity: 'reflective' },
    { label: 'Step forward', polarity: 'action' },
    { label: 'Lean toward another', polarity: 'communion' },
    { label: 'Hold the paradox', polarity: 'integrative' },
  ],
  freeInputPlaceholder: 'say more...',
  metadata: {
    intent: 'To probe where you are unused to standing.',
    trajectory: 'Toward an integrative quadrant.',
    signalWeight: 0.4,
  },
};

describe('assertAgenticProbe — positive', () => {
  it('returns a strictly typed AgenticProbe on valid input', () => {
    const out = assertAgenticProbe(VALID_PROBE);
    expect(out.id).toBe('probe-1');
    expect(out.options).toHaveLength(4);
    // The tuple is preserved as a 4-element array.
    expect(out.options.map((o) => o.polarity)).toEqual([
      'reflective',
      'action',
      'communion',
      'integrative',
    ]);
    expect(out.metadata.signalWeight).toBe(0.4);
  });
});

describe('assertAgenticProbe — negative', () => {
  it('throws when options has 3 entries', () => {
    const bad = {
      ...VALID_PROBE,
      options: VALID_PROBE.options.slice(0, 3),
    };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/OPTIONS_COUNT/);
  });

  it('throws when an option has an unknown polarity', () => {
    const bad = {
      ...VALID_PROBE,
      options: [
        ...VALID_PROBE.options.slice(0, 3),
        { label: 'Hold it', polarity: 'unknown-polarity' },
      ],
    };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/POLARITY/);
  });

  it('throws when an option label is empty', () => {
    const bad = {
      ...VALID_PROBE,
      options: [
        { label: '', polarity: 'reflective' },
        ...VALID_PROBE.options.slice(1),
      ],
    };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/EMPTY/);
  });

  it('throws when signalWeight is out of [0,1]', () => {
    const bad = {
      ...VALID_PROBE,
      metadata: { ...VALID_PROBE.metadata, signalWeight: 1.5 },
    };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/RANGE/);
  });

  it('throws when id is missing', () => {
    const bad = { ...VALID_PROBE };
    delete (bad as Record<string, unknown>)['id'];
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
  });

  it('throws when freeInputPlaceholder is missing', () => {
    const bad = { ...VALID_PROBE, freeInputPlaceholder: '' };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/EMPTY/);
  });

  it('throws when options is not an array', () => {
    const bad = { ...VALID_PROBE, options: 'not an array' };
    expect(() => assertAgenticProbe(bad)).toThrow(AgenticProbeValidationError);
    expect(() => assertAgenticProbe(bad)).toThrow(/OPTIONS_TYPE/);
  });
});

describe('isAgenticProbe — type-guard', () => {
  it('returns true on valid input without throwing', () => {
    expect(isAgenticProbe(VALID_PROBE)).toBe(true);
  });
  it('returns false on negative cases without throwing', () => {
    expect(isAgenticProbe({ id: 'x' })).toBe(false);
    expect(isAgenticProbe(null)).toBe(false);
    expect(isAgenticProbe(undefined)).toBe(false);
    expect(isAgenticProbe('string')).toBe(false);
  });
});
