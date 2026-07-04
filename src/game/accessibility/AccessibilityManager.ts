import type { AccessibilitySettings } from '../../core/accessibility/AccessibilitySettings.js';
import type { EventBus } from '../../core/events/EventBus.js';

export class AccessibilityManager {
  private settings: AccessibilitySettings;
  private eventBus: EventBus | null;

  constructor(initial: AccessibilitySettings, eventBus?: EventBus) {
    this.settings = initial;
    this.eventBus = eventBus ?? null;
  }

  isReducedMotion(): boolean {
    return this.settings.reducedMotion;
  }

  isPatienceMode(): boolean {
    return this.settings.patienceMode;
  }

  isHighContrast(): boolean {
    return this.settings.highContrast;
  }

  getFontSize(): 'normal' | 'large' | 'xlarge' {
    return this.settings.fontSize;
  }

  isScreenReaderEnabled(): boolean {
    return this.settings.screenReaderEnabled;
  }

  getTimingMultiplier(): number {
    return this.settings.patienceMode ? 2.0 : 1.0;
  }

  getSettings(): AccessibilitySettings {
    return this.settings;
  }

  update(partial: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...partial };
    if (this.eventBus) {
      this.eventBus.emit('accessibility_changed', { settings: this.settings });
    }
  }
}
