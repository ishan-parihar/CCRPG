/**
 * Encounter — typed encounter specification.
 */
import type { Drive } from './Drive.js';
import type { Modality } from './enums.js';
import type { Line } from './Line.js';
import type { Quadrant, TaskSlug } from './SharedTypes.js';
import type { Ray } from './Ray.js';
import type { Stage } from './Stage.js';

export type EncounterRole = 'side' | 'mini' | 'main' | 'shadow' | 'threshold';

export interface TaskBind {
  readonly taskSlug: TaskSlug;
  readonly line: Line;
}

export interface EncounterNarrative {
  readonly theme: string;
  readonly allyBeats: readonly string[];
  readonly codexEntry: string;
}

export interface EncounterEnemy {
  readonly name: string;
  readonly difficulty: number;
}

export interface EncounterSpec {
  readonly id: string;
  readonly lines: readonly Line[];
  readonly stage: Stage;
  readonly quadrants: readonly Quadrant[];
  readonly role: EncounterRole;
  readonly ray: Ray;
  readonly modality?: Modality;
  readonly drive?: { readonly fixated: Drive; readonly absent: Drive };
  readonly taskBinds: readonly TaskBind[];
  readonly narrative: EncounterNarrative;
  readonly enemy: EncounterEnemy;
  /** GAP-WB-10: holonId for narrative coherence — links encounter to a specific NPC holon. */
  readonly holonId?: string;
  /** GAP-WB-3: For multi-phase boss encounters, the phase index (0-based). */
  readonly phaseIndex?: number;
  /** GAP-WB-3: Total phases for multi-phase boss encounters. */
  readonly totalPhases?: number;
}
