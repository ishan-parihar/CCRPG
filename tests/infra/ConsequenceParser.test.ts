import { describe, it, expect } from 'vitest';
import { parseConsequence } from '../../src/infra/llm/ConsequenceParser.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';

const MOCK_ENCOUNTER: ScheduledEncounter = {
  id: 'enc-001',
  moduleRef: 'mod-red-cognitive',
  modality: 'LanguageReflective',
  targetLines: ['Cognitive'],
  stage: 'Red',
  holonSource: 'holon-warlord',
  shadowTarget: null,
  polarityMode: 'Exploring',
  difficulty: 0.5,
  sessionPosition: 'peak',
  priority: 1,
  driveTarget: null,
};

describe('ConsequenceParser', () => {
  it('parses valid JSON with all fields successfully', () => {
    const input = JSON.stringify({
      affectedHolons: [
        { holonId: 'holon-001', field: 'loyalty', delta: 0.1 },
        { holonId: 'holon-002', field: 'strength', delta: -0.2 },
      ],
      polarityDirection: 'sto',
      polarityMagnitude: 0.6,
      shadowSignal: { quadrant: 'DarkAddiction', line: 'Willpower', intensity: 0.3 },
      narrativeSummary: 'The warrior chose to protect the village.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(true);
    expect(result.record).not.toBeNull();
    expect(result.record!.affectedHolons).toHaveLength(2);
    expect(result.record!.polarityDirection).toBe('sto');
    expect(result.record!.polarityMagnitude).toBe(0.6);
    expect(result.record!.shadowSignal).not.toBeNull();
    expect(result.record!.narrativeSummary).toBe('The warrior chose to protect the village.');
    expect(result.errors).toHaveLength(0);
  });

  it('returns error for invalid JSON', () => {
    const result = parseConsequence('not json at all {{{', MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.record).toBeNull();
    expect(result.errors).toContain('Invalid JSON');
  });

  it('returns errors listing missing required fields', () => {
    const input = JSON.stringify({ someField: 'hello' });
    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes('affectedHolons'))).toBe(true);
    expect(result.errors.some((e) => e.includes('polarityDirection'))).toBe(true);
    expect(result.errors.some((e) => e.includes('narrativeSummary'))).toBe(true);
  });

  it('returns validation error for delta > 0.3', () => {
    const input = JSON.stringify({
      affectedHolons: [{ holonId: 'h1', field: 'power', delta: 0.5 }],
      polarityDirection: 'sto',
      polarityMagnitude: 0.5,
      shadowSignal: null,
      narrativeSummary: 'Something happened.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('delta') && e.includes('0.5'))).toBe(true);
  });

  it('returns validation error for delta < -0.3', () => {
    const input = JSON.stringify({
      affectedHolons: [{ holonId: 'h1', field: 'power', delta: -0.4 }],
      polarityDirection: 'neutral',
      polarityMagnitude: 0.2,
      shadowSignal: null,
      narrativeSummary: 'The power waned.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('delta') && e.includes('-0.4'))).toBe(true);
  });

  it('returns error for invalid polarityDirection', () => {
    const input = JSON.stringify({
      affectedHolons: [],
      polarityDirection: 'invalid_direction',
      polarityMagnitude: 0.5,
      shadowSignal: null,
      narrativeSummary: 'A thing occurred.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('polarityDirection'))).toBe(true);
  });

  it('returns error for polarityMagnitude > 1', () => {
    const input = JSON.stringify({
      affectedHolons: [],
      polarityDirection: 'sto',
      polarityMagnitude: 1.5,
      shadowSignal: null,
      narrativeSummary: 'An action was taken.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('polarityMagnitude'))).toBe(true);
  });

  it('returns error for shadowSignal intensity > 1', () => {
    const input = JSON.stringify({
      affectedHolons: [],
      polarityDirection: 'sts',
      polarityMagnitude: 0.3,
      shadowSignal: { quadrant: 'DarkAllergy', line: 'Emotional', intensity: 2.0 },
      narrativeSummary: 'Shadow surfaced.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('intensity'))).toBe(true);
  });

  it('accepts empty affectedHolons array as valid', () => {
    const input = JSON.stringify({
      affectedHolons: [],
      polarityDirection: 'neutral',
      polarityMagnitude: 0.0,
      shadowSignal: null,
      narrativeSummary: 'Nothing changed outwardly.',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(true);
    expect(result.record!.affectedHolons).toHaveLength(0);
  });

  it('reports multiple validation errors at once', () => {
    const input = JSON.stringify({
      affectedHolons: [{ holonId: 'h1', field: 'x', delta: 0.9 }],
      polarityDirection: 'bad',
      polarityMagnitude: 5.0,
      shadowSignal: { quadrant: 'Q', line: 'L', intensity: 3.0 },
      narrativeSummary: '',
    });

    const result = parseConsequence(input, MOCK_ENCOUNTER);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('never throws even with completely unexpected input', () => {
    expect(() => parseConsequence('', MOCK_ENCOUNTER)).not.toThrow();
    expect(() => parseConsequence('null', MOCK_ENCOUNTER)).not.toThrow();
    expect(() => parseConsequence('[]', MOCK_ENCOUNTER)).not.toThrow();
    expect(() => parseConsequence('123', MOCK_ENCOUNTER)).not.toThrow();
  });
});
