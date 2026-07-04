export interface AccessibilitySettings {
  readonly reducedMotion: boolean;
  readonly patienceMode: boolean;
  readonly highContrast: boolean;
  readonly fontSize: 'normal' | 'large' | 'xlarge';
  readonly screenReaderEnabled: boolean;
  /**
   * Telemetry opt-in flag. Co-located here to avoid proliferating stores
   * for a single boolean. Note: clearing accessibility settings will also
   * reset this consent flag. If consent lifecycle needs to diverge from
   * accessibility preferences (e.g., separate revocation flow), extract
   * this into a dedicated ConsentStore in a future iteration.
   */
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
