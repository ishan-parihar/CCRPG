import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { TransformationSignal } from '../engines/TransformationDetector.js';
import type { AccessibilitySettings } from '../accessibility/AccessibilitySettings.js';
import type { CCIScore } from '../engines/CCIEngine.js';
import type { SessionStrategy, SessionStrategyAdjustment } from '../engines/AutoModeStrategy.js';
import type { AssessmentResult, ModuleExecutionMode } from '../assessments/types.js';

export interface GameEventMap {
  encounter_scheduled: { encounter: ScheduledEncounter };
  encounter_completed: { record: ConsequenceRecord };
  shadow_surfaced: { shadowId: string; line: string; quadrant: string };
  shadow_resolved: { shadowId: string };
  transformation_triggered: { signal: TransformationSignal };
  bleed_through: { cells: readonly string[] };
  session_started: { timestamp: number };
  session_ended: { timestamp: number; encounterCount: number };
  accessibility_changed: { settings: AccessibilitySettings };
  module_lifecycle_active: { module: { line: string; stage: string }; mode: ModuleExecutionMode };
  module_lifecycle_scored: { module: { line: string; stage: string }; result: AssessmentResult };
  module_lifecycle_mutated: { module: { line: string; stage: string }; mutations: string[] };
  module_lifecycle_pool: { module: { line: string; stage: string }; cooldownUntil: number };
  cci_computed: { score: CCIScore; timestamp: number };
  strategy_generated: { strategy: SessionStrategy; timestamp: number };
  strategy_adjusted: { adjustment: SessionStrategyAdjustment; timestamp: number };
}

export type GameEventType = keyof GameEventMap;
