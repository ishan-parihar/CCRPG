/**
 * All eight canonical registries instantiated.
 */
import type { Drive } from '../domain/Drive.js';
import type { EncounterSpec } from '../domain/Encounter.js';
import type { Line } from '../domain/Line.js';
import type { Quadrant, TaskSlug } from '../domain/PlayerProfile.js';
import type { Ray } from '../domain/Ray.js';
import type { Stage } from '../domain/Stage.js';
import { createRegistry } from '../usecases/RegistryEngine.js';

// --- Module shapes ---

export interface LineModule {
  readonly line: Line;
  readonly quadrant: Quadrant;
  readonly taskSlugs: readonly TaskSlug[];
  readonly description: string;
}

export interface StageModule {
  readonly stage: Stage;
  readonly ray: Ray;
  readonly description: string;
  readonly stub: boolean;
}

export interface RayModule {
  readonly ray: Ray;
  readonly paletteAnchor: string;
  readonly audioMode: string;
  readonly harvestRole: string;
}

export interface TaskModule {
  readonly slug: TaskSlug;
  readonly line: Line;
  readonly networkClaim: string;
}

export interface AbilityModule {
  readonly slug: string;
  readonly line: Line;
  readonly taskSlug: TaskSlug;
  readonly name: string;
}

export interface EncounterModule extends EncounterSpec {}

export interface DriveModule {
  readonly drive: Drive;
  readonly description: string;
}

export interface NarrativeBeatModule {
  readonly beatId: string;
  readonly stage: Stage;
  readonly text: string;
}

// --- Registry instances ---

export const LineRegistry = createRegistry<Line, LineModule>();
export const StageRegistry = createRegistry<Stage, StageModule>();
export const RayRegistry = createRegistry<Ray, RayModule>();
export const TaskRegistry = createRegistry<TaskSlug, TaskModule>();
export const AbilityRegistry = createRegistry<string, AbilityModule>();
export const EncounterRegistry = createRegistry<string, EncounterModule>();
export const DriveRegistry = createRegistry<Drive, DriveModule>();
export const NarrativeRegistry = createRegistry<string, NarrativeBeatModule>();
