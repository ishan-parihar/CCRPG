export type TelemetryEventType =
  | 'encounter_completed'
  | 'encounter_declined'
  | 'polarity_shift'
  | 'shadow_surfaced'
  | 'shadow_resolved'
  | 'transformation_triggered'
  | 'session_started'
  | 'session_ended'
  | 'user_matrix_summary';

export interface TelemetryEvent {
  readonly id: string;
  readonly type: TelemetryEventType;
  readonly timestamp: number;
  readonly data: Readonly<Record<string, unknown>>;
}

export const ALL_TELEMETRY_EVENT_TYPES: readonly TelemetryEventType[] = [
  'encounter_completed',
  'encounter_declined',
  'polarity_shift',
  'shadow_surfaced',
  'shadow_resolved',
  'transformation_triggered',
  'session_started',
  'session_ended',
  'user_matrix_summary',
];
