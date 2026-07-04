import type { AccessibilityManager } from './AccessibilityManager.js';

export function shouldAnimate(manager: AccessibilityManager): boolean {
  return !manager.isReducedMotion();
}

export function getTimingMultiplier(manager: AccessibilityManager): number {
  return manager.getTimingMultiplier();
}

export function shouldShakeCamera(manager: AccessibilityManager): boolean {
  return !manager.isReducedMotion();
}
