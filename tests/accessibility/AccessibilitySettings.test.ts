import { describe, it, expect } from 'vitest';
import { createDefaultSettings } from '../../src/core/accessibility/AccessibilitySettings.js';

describe('AccessibilitySettings', () => {
  it('createDefaultSettings returns all fields off/normal/false', () => {
    const settings = createDefaultSettings();
    expect(settings.reducedMotion).toBe(false);
    expect(settings.patienceMode).toBe(false);
    expect(settings.highContrast).toBe(false);
    expect(settings.fontSize).toBe('normal');
    expect(settings.screenReaderEnabled).toBe(false);
    expect(settings.telemetryOptIn).toBe(false);
  });

  it('returned settings object has correct shape', () => {
    const settings = createDefaultSettings();
    const keys = Object.keys(settings).sort();
    expect(keys).toEqual([
      'fontSize',
      'highContrast',
      'patienceMode',
      'reducedMotion',
      'screenReaderEnabled',
      'telemetryOptIn',
    ]);
  });
});
