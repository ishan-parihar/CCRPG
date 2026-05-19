import type { EncounterSpec } from '../../../domain/Encounter.js';

export const willpowerEncounters: readonly EncounterSpec[] = [
  {
    id: 'red-wil-deterministic-goallock',
    lines: ['Willpower', 'Cognitive'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Deterministic',
    taskBinds: [{ taskSlug: 'go_no_go', line: 'Willpower' }],
    narrative: {
      theme: 'Goal-Lock',
      allyBeats: ['Lock onto the target — ignore all distraction.'],
      codexEntry: 'The will that cannot be diverted becomes unstoppable.',
    },
    enemy: {
      name: 'Distraction Fiend',
      stats: { maxHp: 85, maxMana: 15, agility: 13, attack: 10, defense: 7, precision: 14, magic: 8, luck: 6 },
    },
  },
  {
    id: 'red-wil-strategic-defiancepressure',
    lines: ['Willpower', 'Interpersonal'],
    stage: 'Red',
    quadrants: ['UR', 'LL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Strategic',
    taskBinds: [{ taskSlug: 'held_input', line: 'Willpower' }],
    narrative: {
      theme: 'Defiance Under Pressure',
      allyBeats: ['They demand submission — hold your ground.'],
      codexEntry: 'Defiance is will made visible against superior force.',
    },
    enemy: {
      name: 'Pressure Lord',
      stats: { maxHp: 100, maxMana: 10, agility: 9, attack: 16, defense: 10, precision: 8, magic: 4, luck: 5 },
    },
  },
  {
    id: 'red-wil-embodied-sustainedeffort',
    lines: ['Willpower', 'Somatic'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Embodied',
    taskBinds: [{ taskSlug: 'held_input', line: 'Willpower' }],
    narrative: {
      theme: 'Sustained Effort',
      allyBeats: ['Your arms burn — one more rep, one more breath.'],
      codexEntry: 'Sustained effort is where willpower and flesh become one.',
    },
    enemy: {
      name: 'Exhaustion Demon',
      stats: { maxHp: 115, maxMana: 5, agility: 7, attack: 14, defense: 9, precision: 8, magic: 3, luck: 4 },
    },
  },
  {
    id: 'red-wil-immersive-ironcage',
    lines: ['Willpower', 'Emotional'],
    stage: 'Red',
    quadrants: ['UR', 'UL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ImmersiveRPG',
    taskBinds: [{ taskSlug: 'go_no_go', line: 'Willpower' }],
    narrative: {
      theme: 'Iron Cage Trial',
      allyBeats: ['Trapped and provoked — do not act until the moment is right.'],
      codexEntry: 'The iron cage tests whether your will commands your instincts.',
    },
    enemy: {
      name: 'Cage Master',
      stats: { maxHp: 95, maxMana: 15, agility: 10, attack: 13, defense: 11, precision: 9, magic: 6, luck: 5 },
    },
  },
];
