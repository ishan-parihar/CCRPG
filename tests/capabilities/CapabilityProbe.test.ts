/**
 * @vitest-environment jsdom
 *
 * Tests for CapabilityProbe.
 *
 * Verifies that the probe correctly detects device capabilities and
 * applies data-* attributes to <html>.
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { detectCapabilities, applyCapabilities } from '../../src/lib/capabilities/CapabilityProbe.js';

// Polyfill matchMedia — jsdom doesn't implement it by default.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  // Polyfill navigator.getGamepads if missing
  if (!navigator.getGamepads) {
    Object.defineProperty(navigator, 'getGamepads', {
      value: () => [null, null, null, null],
      configurable: true,
    });
  }
});

describe('CapabilityProbe', () => {
  describe('detectCapabilities', () => {
    it('returns a valid CapabilityReport', () => {
      const report = detectCapabilities();
      expect(report).toBeDefined();
      expect(['touch', 'mouse', 'gamepad', 'tv']).toContain(report.inputMethod);
      expect(['high', 'medium', 'low']).toContain(report.capability);
      expect(['full', 'reduced']).toContain(report.motion);
      expect(['normal', 'more']).toContain(report.contrast);
      expect(['4g', '3g', '2g', 'slow-2g', 'unknown']).toContain(report.connection);
      expect(['none', '1', '2']).toContain(report.webglVersion);
      expect(typeof report.deviceMemory).toBe('number');
      expect(typeof report.hardwareConcurrency).toBe('number');
      expect(typeof report.screenWidth).toBe('number');
      expect(typeof report.screenHeight).toBe('number');
      expect(['portrait', 'landscape']).toContain(report.orientation);
      expect(typeof report.hasGamepad).toBe('boolean');
    });
  });

  describe('applyCapabilities', () => {
    beforeEach(() => {
      // Clear any data-* attributes on <html> before each test
      const html = document.documentElement;
      html.removeAttribute('data-input');
      html.removeAttribute('data-capability');
      html.removeAttribute('data-motion');
      html.removeAttribute('data-contrast');
      html.removeAttribute('data-connection');
      html.removeAttribute('data-orientation');
    });

    it('sets data-* attributes on <html>', () => {
      applyCapabilities();
      const html = document.documentElement;
      expect(html.getAttribute('data-input')).toBeTruthy();
      expect(html.getAttribute('data-capability')).toBeTruthy();
      expect(html.getAttribute('data-motion')).toBeTruthy();
      expect(html.getAttribute('data-contrast')).toBeTruthy();
      expect(html.getAttribute('data-connection')).toBeTruthy();
      expect(html.getAttribute('data-orientation')).toBeTruthy();
    });

    it('accepts a custom CapabilityReport', () => {
      const customReport = {
        inputMethod: 'tv' as const,
        capability: 'high' as const,
        motion: 'reduced' as const,
        contrast: 'more' as const,
        connection: '4g' as const,
        webglVersion: '2' as const,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape' as const,
        hasGamepad: true,
      };

      applyCapabilities(customReport);
      const html = document.documentElement;
      expect(html.getAttribute('data-input')).toBe('tv');
      expect(html.getAttribute('data-capability')).toBe('high');
      expect(html.getAttribute('data-motion')).toBe('reduced');
      expect(html.getAttribute('data-contrast')).toBe('more');
      expect(html.getAttribute('data-connection')).toBe('4g');
      expect(html.getAttribute('data-orientation')).toBe('landscape');
    });

    it('returns the report that was applied', () => {
      const result = applyCapabilities();
      expect(result).toBeDefined();
      expect(result.inputMethod).toBeTruthy();
    });
  });
});
