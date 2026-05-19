import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { TransformationSignal } from '../engines/TransformationDetector.js';

export interface GameEventMap {
  encounter_scheduled: { encounter: ScheduledEncounter };
  encounter_completed: { record: ConsequenceRecord };
  shadow_surfaced: { shadowId: string; line: string; quadrant: string };
  shadow_resolved: { shadowId: string };
  transformation_triggered: { signal: TransformationSignal };
  bleed_through: { cells: readonly string[] };
  session_started: { timestamp: number };
  session_ended: { timestamp: number; encounterCount: number };
}

export type GameEventType = keyof GameEventMap;
