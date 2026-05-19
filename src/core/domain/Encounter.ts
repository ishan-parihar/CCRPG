/**
 * Encounter — typed encounter specification.
 */
import type { Drive } from './Drive.js';
import type { Modality } from './enums.js';
import type { Line } from './Line.js';
import type { Quadrant, TaskSlug } from './PlayerProfile.js';
import type { Ray } from './Ray.js';
import type { Stage } from './Stage.js';

export type EncounterRole = 'side' | 'mini' | 'main' | 'shadow';

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
  readonly stats: {
    readonly maxHp: number;
    readonly maxMana: number;
    readonly agility: number;
    readonly attack: number;
    readonly defense: number;
    readonly precision: number;
    readonly magic: number;
    readonly luck: number;
  };
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
}
