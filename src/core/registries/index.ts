/**
 * Canonical registries — live set.
 * ponytail: TaskRegistry, AbilityRegistry, NarrativeRegistry removed (registered but never queried).
 */
import type { Drive } from '../domain/Drive.js';
import type { EncounterSpec } from '../domain/Encounter.js';
import type { Line } from '../domain/Line.js';
import type { Quadrant } from '../domain/SharedTypes.js';
import type { Ray } from '../domain/Ray.js';
import type { Stage } from '../domain/Stage.js';
import { createRegistry } from '../usecases/RegistryEngine.js';

// --- Module shapes ---

export interface LineModule {
  readonly line: Line;
  readonly quadrant: Quadrant;
  readonly taskSlugs?: readonly string[];
  readonly description: string;
}

export interface StageModule {
  readonly stage: Stage;
  readonly ray: Ray;
  readonly description: string;
  readonly stub: boolean;
  readonly palette?: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
  };
  readonly audioMode?: string;
  readonly physicsGravity?: number;
}

export interface RayModule {
  readonly ray: Ray;
  readonly paletteAnchor: string;
  readonly audioMode: string;
  readonly harvestRole: string;
}

export interface EncounterModule extends EncounterSpec {}

export interface DriveModule {
  readonly drive: Drive;
  readonly description: string;
}

// --- Registry instances ---

export const LineRegistry = createRegistry<Line, LineModule>();
export const StageRegistry = createRegistry<Stage, StageModule>();
export const RayRegistry = createRegistry<Ray, RayModule>();
export const EncounterRegistry = createRegistry<string, EncounterModule>();
export const DriveRegistry = createRegistry<Drive, DriveModule>();
