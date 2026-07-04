/**
 * The Conqueror — 4-phase boss fight data for the Red stage.
 * Each phase targets one quadrant (UL, UR, LL, LR) with specific
 * cognitive task bindings and HP pools.
 */
import type { Quadrant, TaskSlug } from '../../../domain/SharedTypes.js';

export interface TaskBind {
  readonly taskSlug: TaskSlug;
  readonly description: string;
}

export interface ConquerorPhase {
  readonly quadrant: Quadrant;
  readonly name: string;
  readonly difficulty: number;
  readonly taskBinds: readonly TaskBind[];
  readonly description: string;
}

export const CONQUEROR_PHASES: readonly ConquerorPhase[] = [
  {
    quadrant: 'UL',
    name: 'Empath Read + Witness Pause',
    difficulty: 1,
    taskBinds: [
      { taskSlug: 'affect_recognition', description: 'Read the Conqueror\'s emotional feints' },
      { taskSlug: 'self_report', description: 'Sustain attention through the chaos' },
    ],
    description: 'The Conqueror projects raw dominance. You must read the affect beneath the fury and hold steady awareness.',
  },
  {
    quadrant: 'UR',
    name: 'Echo Cast + Reflex Dodge',
    difficulty: 2,
    taskBinds: [
      { taskSlug: 'n_back', description: 'Track and recall the Conqueror\'s attack patterns' },
      { taskSlug: 'reaction_time', description: 'Dodge the Conqueror\'s power strikes' },
    ],
    description: 'The Conqueror attacks in remembered sequences. Track the pattern and evade with precision.',
  },
  {
    quadrant: 'LL',
    name: 'Attune — Companion Coordination',
    difficulty: 2,
    taskBinds: [
      { taskSlug: 'pattern_prediction', description: 'Coordinate with your companion\'s rhythm' },
      { taskSlug: 'dilemma_choice', description: 'Choose when to shield and when to strike together' },
    ],
    description: 'The Conqueror divides you from your ally. Only through coordination can you break the isolation.',
  },
  {
    quadrant: 'LR',
    name: 'Resource Siege — Strategic Terrain',
    difficulty: 3,
    taskBinds: [
      { taskSlug: 'go_no_go', description: 'Manage resource flow under pressure' },
      { taskSlug: 'held_input', description: 'Hold positions while the terrain shifts' },
    ],
    description: 'The Conqueror commands the battlefield. Manage dwindling resources and hold ground against overwhelming force.',
  },
];

/** Get a specific phase by index (0-based). */
export function getConquerorPhase(phaseIndex: number): ConquerorPhase | undefined {
  return CONQUEROR_PHASES[phaseIndex];
}

/** Check if all 4 phases are completed. */
export function isConquerorDefeated(phasesCompleted: number): boolean {
  return phasesCompleted >= CONQUEROR_PHASES.length;
}
