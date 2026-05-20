/**
 * Assessment Lifecycle - 7-stage state machine.
 * Stages: Pool -> Candidate -> Selected -> Active -> Scored -> Mutate -> Repool
 *
 * Pure state machine: no side effects, deterministic transitions.
 */

export type LifecyclePhase =
  | 'Pool'
  | 'Candidate'
  | 'Selected'
  | 'Active'
  | 'Scored'
  | 'Mutate'
  | 'Repool';

export type LifecycleEvent =
  | 'nominate'
  | 'select'
  | 'activate'
  | 'score'
  | 'mutate'
  | 'repool'
  | 'reject';

export interface LifecycleState {
  readonly phase: LifecyclePhase;
  readonly enteredAt: number;
  readonly transitionCount: number;
  readonly metadata: Record<string, unknown>;
}

const TRANSITIONS: Record<LifecyclePhase, Partial<Record<LifecycleEvent, LifecyclePhase>>> = {
  Pool: { nominate: 'Candidate' },
  Candidate: { select: 'Selected', reject: 'Pool' },
  Selected: { activate: 'Active', reject: 'Pool' },
  Active: { score: 'Scored' },
  Scored: { mutate: 'Mutate', repool: 'Repool' },
  Mutate: { repool: 'Repool' },
  Repool: { nominate: 'Candidate' },
};

/**
 * Advance the lifecycle state machine given an event.
 * If the transition is invalid for the current phase, returns current state unchanged.
 */
export function advanceLifecycle(
  current: LifecycleState,
  event: LifecycleEvent,
): LifecycleState {
  const validTransitions = TRANSITIONS[current.phase];
  const nextPhase = validTransitions[event];

  if (nextPhase === undefined) {
    return current;
  }

  return {
    phase: nextPhase,
    enteredAt: Date.now(),
    transitionCount: current.transitionCount + 1,
    metadata: current.metadata,
  };
}

/**
 * Create the initial lifecycle state starting at Pool.
 */
export function createInitialState(): LifecycleState {
  return {
    phase: 'Pool',
    enteredAt: Date.now(),
    transitionCount: 0,
    metadata: {},
  };
}
