import { describe, it, expect } from 'vitest';
import { AccessibilityManager } from '../../src/game/accessibility/AccessibilityManager.js';
import { createDefaultSettings } from '../../src/core/accessibility/AccessibilitySettings.js';
import { EventBus } from '../../src/core/events/EventBus.js';

describe('AccessibilityManager', () => {
  it('reports default values from createDefaultSettings', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    expect(manager.isReducedMotion()).toBe(false);
    expect(manager.isPatienceMode()).toBe(false);
    expect(manager.isHighContrast()).toBe(false);
    expect(manager.getFontSize()).toBe('normal');
    expect(manager.isScreenReaderEnabled()).toBe(false);
  });

  it('reports custom initial settings', () => {
    const settings = {
      ...createDefaultSettings(),
      reducedMotion: true,
      patienceMode: true,
      highContrast: true,
      fontSize: 'xlarge' as const,
      screenReaderEnabled: true,
    };
    const manager = new AccessibilityManager(settings);
    expect(manager.isReducedMotion()).toBe(true);
    expect(manager.isPatienceMode()).toBe(true);
    expect(manager.isHighContrast()).toBe(true);
    expect(manager.getFontSize()).toBe('xlarge');
    expect(manager.isScreenReaderEnabled()).toBe(true);
  });

  it('update() changes values', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    manager.update({ reducedMotion: true, fontSize: 'large' });
    expect(manager.isReducedMotion()).toBe(true);
    expect(manager.getFontSize()).toBe('large');
    expect(manager.isPatienceMode()).toBe(false);
  });

  it('getTimingMultiplier returns 1.0 normally', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    expect(manager.getTimingMultiplier()).toBe(1.0);
  });

  it('getTimingMultiplier returns 2.0 in patience mode', () => {
    const manager = new AccessibilityManager({
      ...createDefaultSettings(),
      patienceMode: true,
    });
    expect(manager.getTimingMultiplier()).toBe(2.0);
  });

  it('getSettings returns current settings object', () => {
    const initial = createDefaultSettings();
    const manager = new AccessibilityManager(initial);
    expect(manager.getSettings()).toEqual(initial);
  });

  it('update emits accessibility_changed event on EventBus', () => {
    const bus = new EventBus();
    const manager = new AccessibilityManager(createDefaultSettings(), bus);
    let received: unknown = null;
    bus.on('accessibility_changed', (payload) => {
      received = payload;
    });
    manager.update({ highContrast: true });
    expect(received).toEqual({
      settings: { ...createDefaultSettings(), highContrast: true },
    });
  });
});
