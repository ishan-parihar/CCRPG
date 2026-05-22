import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { Modality, ShadowQuadrant, PolarityMode } from './enums.js';
import type { ModuleExecutionMode } from '../assessments/types.js';

export interface ScheduledEncounter {
  readonly id: string;
  readonly moduleRef: string;
  readonly modality: Modality;
  readonly targetLines: readonly Line[];
  readonly stage: Stage;
  readonly holonSource: string;
  readonly shadowTarget: ShadowQuadrant | null;
  readonly polarityMode: PolarityMode;
  readonly difficulty: number;
  readonly sessionPosition: 'warmup' | 'peak' | 'cooldown';
  readonly priority: number;
  readonly driveTarget: Drive | null;
  readonly executionMode: ModuleExecutionMode;
}
