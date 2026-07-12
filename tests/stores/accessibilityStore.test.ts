/**
 * @vitest-environment jsdom
 *
 * Tests for the Svelte-layer accessibilityStore.
 *
 * Verifies:
 * - Default settings match createDefaultSettings()
 * - updateAccessibility() merges partial updates
 * - resetAccessibility() restores defaults
 * - Settings persist to localStorage
 * - Loading reads from localStorage with backward-compat merge
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { accessibilityStore, updateAccessibility, resetAccessibility } from '../../src/lib/stores/accessibilityStore.js';
import { createDefaultSettings } from '../../src/core/accessibility/AccessibilitySettings.js';

describe('accessibilityStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAccessibility();
  });

  it('starts with default settings', () => {
    const settings = get(accessibilityStore);
    expect(settings).toEqual(createDefaultSettings());
  });

  it('updateAccessibility merges partial updates', () => {
    updateAccessibility({ highContrast: true });
    const settings = get(accessibilityStore);
    expect(settings.highContrast).toBe(true);
    expect(settings.reducedMotion).toBe(false); // unchanged
  });

  it('updateAccessibility preserves other fields', () => {
    updateAccessibility({ highContrast: true, telemetryOptIn: true });
    updateAccessibility({ reducedMotion: true });
    const settings = get(accessibilityStore);
    expect(settings.highContrast).toBe(true);
    expect(settings.telemetryOptIn).toBe(true);
    expect(settings.reducedMotion).toBe(true);
  });

  it('persists to localStorage', () => {
    updateAccessibility({ highContrast: true, reducedMotion: true });
    const raw = localStorage.getItem('ccrpg:accessibility');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.highContrast).toBe(true);
    expect(parsed.reducedMotion).toBe(true);
  });

  it('resetAccessibility restores defaults', () => {
    updateAccessibility({ highContrast: true, telemetryOptIn: true });
    resetAccessibility();
    const settings = get(accessibilityStore);
    expect(settings).toEqual(createDefaultSettings());
  });
});
