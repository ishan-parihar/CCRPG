import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { Drive } from './Drive.js';
import type { Ray } from './Ray.js';
import type { State } from './State.js';
import type { PolarityState } from './PolarityCellVector.js';
import type { ShadowLedger } from './ShadowLedger.js';

import { ALL_DRIVES } from './Drive.js';
import { ALL_RAYS } from './Ray.js';
import { ALL_STATES } from './State.js';
import { ALL_LINES } from './Line.js';
import { ALL_STAGES } from './Stage.js';
import { createInitialPolarityState } from './PolarityCellVector.js';
import { createEmptyShadowLedger } from './ShadowLedger.js';

export interface TransformationRecord {
  readonly fromStage: Stage;
  readonly toStage: Stage;
  readonly triggeredAt: number;
  readonly catalystCount: number;
}

export interface ThetaTimestamps {
  readonly lastEncounter: Readonly<Record<string, number>>;
}

export interface DriveState {
  readonly weights: Readonly<Record<Drive, number>>;
  readonly fixationRisk: Readonly<Record<Drive, number>>;
}

export interface StateProgress {
  readonly unlocked: boolean;
  readonly depth: number;
  readonly minutesPracticed: number;
}

export type LifecycleStage =
  | 'Onboarding'
  | 'Exploring'
  | 'Developing'
  | 'Crystallizing'
  | 'Transforming'
  | 'Harvesting';

const VALID_TRANSITIONS: Record<LifecycleStage, readonly LifecycleStage[]> = {
  Onboarding: ['Exploring'],
  Exploring: ['Developing', 'Transforming', 'Harvesting'],
  Developing: ['Crystallizing', 'Exploring'],
  Crystallizing: ['Transforming', 'Exploring'],
  Transforming: ['Exploring'],
  Harvesting: [],
};

export function isValidTransition(from: LifecycleStage, to: LifecycleStage): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface Significator {
  readonly id: string;
  readonly createdAt: number;
  readonly lifecycle: LifecycleStage;
  readonly altitudes: Readonly<Record<Line, Stage>>;
  readonly currentStage: Stage;
  readonly rayProfile: Readonly<Record<Ray, number>>;
  readonly states: Readonly<Record<State, StateProgress>>;
  readonly drives: DriveState;
  readonly polarity: PolarityState;
  readonly shadows: ShadowLedger;
  readonly theta: ThetaTimestamps;
  readonly transformations: readonly TransformationRecord[];
  readonly totalEncounters: number;
  readonly totalSessions: number;
}

function zeroRecord<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map(k => [k, 0])) as Record<K, number>;
}

export function createSignificator(
  id: string,
  initialAltitudes: Record<Line, Stage>,
  stage: Stage,
): Significator {
  const defaultState: StateProgress = { unlocked: false, depth: 0, minutesPracticed: 0 };

  const states = Object.fromEntries(
    ALL_STATES.map((s, i) => [s, i === 0 ? { ...defaultState, unlocked: true } : defaultState]),
  ) as Record<State, StateProgress>;

  const theta: ThetaTimestamps = {
    lastEncounter: Object.fromEntries(
      ALL_LINES.flatMap(l => ALL_STAGES.map(s => [`${l}:${s}`, 0])),
    ) as Record<string, number>,
  };

  return {
    id,
    createdAt: Date.now(),
    lifecycle: 'Exploring',
    altitudes: { ...initialAltitudes },
    currentStage: stage,
    rayProfile: zeroRecord(ALL_RAYS),
    states,
    drives: {
      weights: zeroRecord(ALL_DRIVES),
      fixationRisk: zeroRecord(ALL_DRIVES),
    },
    polarity: createInitialPolarityState(),
    shadows: createEmptyShadowLedger(),
    theta,
    transformations: [],
    totalEncounters: 0,
    totalSessions: 0,
  };
}
