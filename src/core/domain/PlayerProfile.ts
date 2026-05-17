/**
 * PlayerProfile — the player's developmental psychograph and game state.
 */
import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Ray } from './Ray.js';
import type { Stage } from './Stage.js';
import type { State } from './State.js';

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
  | 'breath_rhythm';

export interface StaircaseState {
  readonly level: number;
  readonly reversals: number;
  readonly lastDirection: 'up' | 'down' | null;
  readonly history: readonly boolean[];
}

export interface ShadowSignal {
  readonly type: 'fixation' | 'regression' | 'repression';
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

export interface StateProgress {
  readonly unlocked: boolean;
  readonly depth: number;
  readonly minutesPracticed: number;
}

export interface PlayerProfile {
  readonly id: string;
  readonly createdAtMs: number;
  readonly altitudes: Record<Line, Stage>;
  readonly stage: Stage;
  readonly rayProfile: Record<Ray, number>;
  readonly states: Record<State, StateProgress>;
  readonly drives: {
    readonly weights: Record<Drive, number>;
    readonly fixationRisk: Record<Drive, number>;
  };
  readonly taskStaircases: Record<TaskSlug, StaircaseState>;
  readonly vows: readonly Vow[];
  readonly shadows: readonly ShadowSignal[];
  readonly codexEntries: readonly CodexEntry[];
  readonly primaryValue: string;
  readonly onboardingComplete: boolean;
  readonly totalSessionsPlayed: number;
}

export function createInitialProfile(
  id: string,
  altitudes: Record<Line, Stage>,
  stage: Stage,
  driveWeights: Record<Drive, number>,
): PlayerProfile {
  const zeroStaircase: StaircaseState = {
    level: 1,
    reversals: 0,
    lastDirection: null,
    history: [],
  };
  return {
    id,
    createdAtMs: Date.now(),
    altitudes,
    stage,
    rayProfile: { Red: 0, Orange: 0, Yellow: 0, Green: 0, Blue: 0, Indigo: 0, Violet: 0 },
    states: {
      Gross: { unlocked: true, depth: 0, minutesPracticed: 0 },
      Subtle: { unlocked: false, depth: 0, minutesPracticed: 0 },
      Causal: { unlocked: false, depth: 0, minutesPracticed: 0 },
      Witness: { unlocked: false, depth: 0, minutesPracticed: 0 },
      NonDual: { unlocked: false, depth: 0, minutesPracticed: 0 },
    },
    drives: {
      weights: driveWeights,
      fixationRisk: { Agency: 0, Communion: 0, Eros: 0, Agape: 0 },
    },
    taskStaircases: {
      n_back: zeroStaircase,
      stroop: zeroStaircase,
      simon: zeroStaircase,
      go_no_go: zeroStaircase,
      affect_recognition: zeroStaircase,
      dilemma_choice: zeroStaircase,
      reaction_time: zeroStaircase,
      held_input: zeroStaircase,
      breath_rhythm: zeroStaircase,
    },
    vows: [],
    shadows: [],
    codexEntries: [],
    primaryValue: '',
    onboardingComplete: false,
    totalSessionsPlayed: 0,
  };
}
