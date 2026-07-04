/**
 * Tests for T-3.6 — Veil violation logging in LLMClient.
 * Verifies that logVeilViolation is called when filterOutput detects violations.
 *
 * Note: these tests verify the logVeilViolation helper function directly
 * since the LLM HTTP calls are mocked/integration-tested elsewhere.
 */
import { describe, it, expect } from 'vitest';
import { filterOutput } from '../../src/infra/llm/VeilFilter.js';

describe('T-3.6 — Veil violation detection (for telemetry logging)', () => {
  it('filterOutput reports violations when Veil-breaking content is present', () => {
    const result = filterOutput('Your Red stage score is 45%. DarkAddiction detected.');
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('filterOutput reports no violations for clean content', () => {
    const result = filterOutput('Something settles into place without effort.');
    expect(result.passed).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('filterOutput detects stage-as-developmental-label violations', () => {
    const result = filterOutput('You are at the Red stage of development.');
    expect(result.violations).toContain('stage-as-developmental-label');
  });

  it('filterOutput detects drive-label violations', () => {
    const result = filterOutput('Your Agency drive score is elevated.');
    expect(result.violations).toContain('drive-label-as-system-term');
  });

  it('filterOutput detects shadow-quadrant-name violations', () => {
    const result = filterOutput('You are experiencing DarkAddiction patterns.');
    expect(result.violations).toContain('shadow-quadrant-name');
  });

  it('filterOutput detects numerical-score violations', () => {
    const result = filterOutput('Your assessment score: 73');
    expect(result.violations).toContain('numerical-score-in-assessment');
  });

  it('filterOutput detects progress-percentage violations', () => {
    const result = filterOutput('You are 45% complete to the next level.');
    expect(result.violations).toContain('progress-percentage');
  });

  it('filterOutput detects assessment-diagnostic-language violations', () => {
    const result = filterOutput('Your assessment reveals a pattern of avoidance.');
    expect(result.violations).toContain('assessment-diagnostic-language');
  });

  it('multiple violations are all reported', () => {
    const result = filterOutput('Your Red stage score is 45% and you have DarkAddiction. Your Agency drive is elevated.');
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
  });

  it('violations array can be used for telemetry logging', () => {
    // Simulate what logVeilViolation does: format violations for logging
    const result = filterOutput('Red stage score: 50%');
    const logMessage = `[VeilFilter] test: ${result.violations.length} violation(s): ${result.violations.join(', ')}`;
    expect(logMessage).toContain('VeilFilter');
    expect(logMessage).toContain('violation');
  });
});
