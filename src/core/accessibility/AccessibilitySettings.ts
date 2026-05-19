export interface AccessibilitySettings {
  readonly reducedMotion: boolean;
  readonly patienceMode: boolean;
  readonly highContrast: boolean;
  readonly fontSize: 'normal' | 'large' | 'xlarge';
  readonly screenReaderEnabled: boolean;
  readonly telemetryOptIn: boolean;
}

export function createDefaultSettings(): AccessibilitySettings {
  return {
    reducedMotion: false,
    patienceMode: false,
    highContrast: false,
    fontSize: 'normal',
    screenReaderEnabled: false,
    telemetryOptIn: false,
  };
}
