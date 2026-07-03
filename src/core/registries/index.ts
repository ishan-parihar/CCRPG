/**
 * All eight canonical registries instantiated.
 */
import type { Drive } from '../domain/Drive.js';
import type { EncounterSpec } from '../domain/Encounter.js';
import type { Line } from '../domain/Line.js';
import type { Quadrant, TaskSlug } from '../domain/SharedTypes.js';
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
  /**
   * UX-02: Perceptual-layer palette and audio cues for this stage.
   * Per foundations/21 §2.1, each stage has its own perceptual layer
   * (palette/audio/NPC visibility/encounter eligibility/physics).
   * Optional — stages without palette data fall back to the ray's paletteAnchor.
   */
  readonly palette?: {
    readonly primary: string;     // hex color, e.g. '#8B0000'
    readonly secondary: string;
    readonly accent: string;
  };
  readonly audioMode?: string;    // e.g., 'tribal-drums', 'ambient-bells'
  readonly physicsGravity?: number;  // Phaser arcade gravity override
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
