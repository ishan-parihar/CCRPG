import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { Modality, ShadowQuadrant, PolarityMode } from './enums.js';
import type { ModuleExecutionMode } from '../assessments/types.js';
import type { DepthRubric } from '../curriculum/types.js';

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
  /** Codex entry text unlocked upon completing this encounter. */
  readonly codexEntry?: string;
  /**
   * Curriculum expansion: when present, this is a curriculum encounter
   * (knowledge study) rather than a developmental encounter (assessment).
   * The conceptId identifies which curriculum holon is being studied.
   */
  readonly curriculumConceptId?: string;
  /** Curriculum action: review, deepen, new_material, or connect. */
  readonly curriculumAction?: 'review' | 'deepen' | 'new_material' | 'connect';
  /**
   * Curriculum expansion: when present, the depth rubric for the concept
   * being studied. Used by DepthAssessment to classify response quality
   * into a specific depth level rather than binary pass/fail.
   */
  readonly depthRubric?: DepthRubric;
}
