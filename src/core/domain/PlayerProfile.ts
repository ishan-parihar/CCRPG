/**
 * @deprecated — MIGRATION IN PROGRESS.
 * Use Significator (src/core/domain/Significator.ts) as the sole state vessel.
 * PlayerProfile is retained only for backward compatibility with legacy usecases
 * (ProfileUpdater, StageSynthesizer, ShadowDetector, EncounterScheduler, scenes).
 * These consumers will be migrated to Significator in Phase 1.
 * DO NOT add new imports of PlayerProfile — use Significator instead.
 */
import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Ray } from './Ray.js';
import type { Stage } from './Stage.js';
import type { State } from './State.js';
import type { Quadrant, TaskSlug, StaircaseState, ShadowSignal, CodexEntry, Vow } from './SharedTypes.js';
import type { StateProgress } from './Significator.js';

export type { Quadrant, TaskSlug, StaircaseState, ShadowSignal, CodexEntry, Vow } from './SharedTypes.js';
export type { StateProgress } from './Significator.js';

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
  readonly quadrantCoverage: Partial<Record<Stage, Quadrant[]>>;
  readonly altitudeHistory: readonly { readonly line: Line; readonly stage: Stage; readonly atMs: number }[];
  readonly bossesCleared: readonly Stage[];
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
      self_report: zeroStaircase,
      value_coherence: zeroStaircase,
      pattern_prediction: zeroStaircase,
    },
    quadrantCoverage: {},
    altitudeHistory: [],
    bossesCleared: [],
    vows: [],
    shadows: [],
    codexEntries: [],
    primaryValue: '',
    onboardingComplete: false,
    totalSessionsPlayed: 0,
  };
}
