import { describe, it, expect } from 'vitest';
import { AccessibilityManager } from '../../src/game/accessibility/AccessibilityManager.js';
import { createDefaultSettings } from '../../src/core/accessibility/AccessibilitySettings.js';
import { shouldAnimate, getTimingMultiplier, shouldShakeCamera } from '../../src/game/accessibility/ReducedMotionGuard.js';

describe('ReducedMotionGuard', () => {
  it('shouldAnimate returns true when reduced motion is off', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    expect(shouldAnimate(manager)).toBe(true);
  });

  it('shouldAnimate returns false when reduced motion is on', () => {
    const manager = new AccessibilityManager({
      ...createDefaultSettings(),
      reducedMotion: true,
    });
    expect(shouldAnimate(manager)).toBe(false);
  });

  it('shouldShakeCamera returns true when reduced motion is off', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    expect(shouldShakeCamera(manager)).toBe(true);
  });

  it('shouldShakeCamera returns false when reduced motion is on', () => {
    const manager = new AccessibilityManager({
      ...createDefaultSettings(),
      reducedMotion: true,
    });
    expect(shouldShakeCamera(manager)).toBe(false);
  });

  it('getTimingMultiplier returns 1.0 normally', () => {
    const manager = new AccessibilityManager(createDefaultSettings());
    expect(getTimingMultiplier(manager)).toBe(1.0);
  });

  it('getTimingMultiplier returns 2.0 in patience mode', () => {
    const manager = new AccessibilityManager({
      ...createDefaultSettings(),
      patienceMode: true,
    });
    expect(getTimingMultiplier(manager)).toBe(2.0);
  });
});
