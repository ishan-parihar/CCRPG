import type { Drive } from './Drive.js';
import type { DriveDirectionality, EnergeticDirection, StageOrientation, SourceOfNourishment } from './enums.js';

export interface PolarityTrace {
  readonly encounterId: string;
  readonly timestamp: number;
  readonly driveDirectionality: Readonly<Record<Drive, DriveDirectionality>>;
  readonly energeticDirection: EnergeticDirection;
  readonly stageOrientation: StageOrientation;
  readonly sourceOfNourishment: SourceOfNourishment;
}
