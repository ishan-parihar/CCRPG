/**
 * SharedTypes -- types extracted from PlayerProfile that are used broadly across the codebase.
 * These remain even after PlayerProfile is deprecated.
 */
import type { Line } from './Line.js';

export type Quadrant = 'UL' | 'UR' | 'LL' | 'LR';

export type TaskSlug =
  | 'n_back'
  | 'stroop'
  | 'simon'
  | 'go_no_go'
  | 'affect_recognition'
  | 'dilemma_choice'
  | 'reaction_time'
  | 'held_input'
  | 'breath_rhythm'
  | 'self_report'
  | 'value_coherence'
  | 'pattern_prediction';

export interface StaircaseState {
  readonly level: number;
  readonly reversals: number;
  readonly lastDirection: 'up' | 'down' | null;
  readonly history: readonly boolean[];
}

export interface ShadowSignal {
  readonly type: 'fixation' | 'regression' | 'repression' | 'goldenAllergy';
  readonly line: Line;
  readonly detectedAtMs: number;
  readonly description: string;
}

export interface CodexEntry {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly unlockedAtMs: number;
}

export interface Vow {
  readonly text: string;
  readonly createdAtMs: number;
  readonly fulfilled: boolean;
}
