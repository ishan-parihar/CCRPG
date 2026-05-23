/**
 * Core type system for the 64-cell assessment architecture.
 * Spec: docs/STAGE-ASSESSMENT-ARCHITECTURE Part II, Part XI.
 *
 * All types are readonly interfaces. No runtime behavior lives here.
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { Drive } from '../domain/Drive.js';

export type TaskType =
  | 'n_back'
  | 'stroop'
  | 'go_no_go'
  | 'reaction_time'
  | 'rhythm'
  | 'hold'
  | 'pattern_prediction'
  | 'emotion_identification'
  | 'dilemma'
  | 'scenario'
  | 'value_ranking'
  | 'self_report'
  | 'llm_dialogue'
  | 'imitation'
  | 'cooperation';

export type MeasureDimension =
  | 'accuracy'
  | 'response_time'
  | 'consistency'
  | 'depth'
  | 'self_correction'
  | 'complexity_handled'
  | 'transfer'
  | 'metacognition'
  | 'coherence'
  | 'integration';

export type ModuleExecutionMode = 'capacity' | 'encounter' | 'shadow' | 'calibration' | 'practice';

export interface ScoringRubric {
  readonly passThreshold: number;
  readonly dimensionWeights: Partial<Record<MeasureDimension, number>>;
  readonly llmRubric?: string;
}

export interface AssessmentTask {
  readonly id: string;
  readonly type: TaskType;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
  readonly measures: readonly MeasureDimension[];
}

export interface DriveProbe {
  readonly description: string;
  readonly task: AssessmentTask;
  readonly healthyResponse: string;
  readonly addictionSignal: string;
  readonly allergySignal: string;
}

export interface StageAssessment {
  readonly line: Line;
  readonly stage: Stage;
  readonly tasks: readonly AssessmentTask[];
  readonly scoringRubric: ScoringRubric;
  readonly minimumTrials: number;
  readonly estimatedDurationMs: number;
  readonly itemPool?: readonly AssessmentItem[];
  /** Optional single developmental probe for calibration mode. Probes HOW the player thinks, not just performance. */
  readonly calibrationProbe?: AssessmentTask;
  readonly driveProbes: {
    readonly agency: DriveProbe;
    readonly communion: DriveProbe;
    readonly eros: DriveProbe;
    readonly agape: DriveProbe;
  };
}

export interface TrialResult {
  readonly taskId: string;
  readonly timestamp: number;
  readonly dimensions: Partial<Record<MeasureDimension, number>>;
  readonly rawResponse: unknown;
  readonly durationMs: number;
}

export interface AssessmentResult {
  readonly line: Line;
  readonly stage: Stage;
  readonly passed: boolean;
  readonly confidence: number;
  readonly dimensions: Record<MeasureDimension, number>;
  readonly rawTrials: readonly TrialResult[];
}

export interface ShadowAssessmentResult extends AssessmentResult {
  readonly driveHealth: {
    readonly agency: { dark: number; golden: number };
    readonly communion: { dark: number; golden: number };
    readonly eros: { dark: number; golden: number };
    readonly agape: { dark: number; golden: number };
  };
  readonly darkShadowSeverity: number;
  readonly goldenShadowSeverity: number;
  readonly dominantPathology: {
    drive: Drive;
    domain: 'dark' | 'golden';
    type: 'addiction' | 'allergy';
  } | null;
}

export interface AssessmentItem {
  readonly id: string;
  readonly taskType: TaskType;
  readonly difficulty: number; // 0-1
  readonly parameters: Record<string, unknown>;
  readonly measures: readonly MeasureDimension[];
  readonly tags?: readonly string[];
}
