import type { EncounterSpec } from '../../../domain/Encounter.js';

export const intrapersonalEncounters: readonly EncounterSpec[] = [
  {
    id: 'red-intra-language-impulserecog',
    lines: ['Intrapersonal', 'Emotional'],
    stage: 'Red',
    quadrants: ['UL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'LanguageReflective',
    taskBinds: [{ taskSlug: 'self_report', line: 'Intrapersonal' }],
    narrative: {
      theme: 'Impulse Recognition',
      allyBeats: ['Name the urge before it names you.'],
      codexEntry: 'Self-awareness begins when impulse is witnessed, not obeyed.',
    },
    enemy: {
      name: 'Impulse Shade',
      stats: { maxHp: 60, maxMana: 30, agility: 14, attack: 8, defense: 5, precision: 12, magic: 12, luck: 9 },
    },
  },
  {
    id: 'red-intra-scenario-pressureself',
    lines: ['Intrapersonal', 'Willpower'],
    stage: 'Red',
    quadrants: ['UL', 'UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ScenarioChoice',
    taskBinds: [{ taskSlug: 'stroop', line: 'Intrapersonal' }],
    narrative: {
      theme: 'Self-Awareness Under Pressure',
      allyBeats: ['The arena roars — can you still hear your own voice?'],
      codexEntry: 'Pressure reveals who you truly are beneath the mask.',
    },
    enemy: {
      name: 'Mirror Gladiator',
      stats: { maxHp: 85, maxMana: 15, agility: 11, attack: 13, defense: 7, precision: 10, magic: 6, luck: 6 },
    },
  },
  {
    id: 'red-intra-immersive-shadowduel',
    lines: ['Intrapersonal', 'Cognitive'],
    stage: 'Red',
    quadrants: ['UL', 'UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ImmersiveRPG',
    taskBinds: [{ taskSlug: 'self_report', line: 'Intrapersonal' }],
    narrative: {
      theme: 'Shadow Duel',
      allyBeats: ['Your own shadow rises — it knows every move you will make.'],
      codexEntry: 'The warrior who defeats their shadow gains self-mastery.',
    },
    enemy: {
      name: 'Shadow Self',
      stats: { maxHp: 90, maxMana: 20, agility: 13, attack: 12, defense: 8, precision: 11, magic: 10, luck: 7 },
    },
  },
];
