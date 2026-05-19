import type { EncounterSpec } from '../../../domain/Encounter.js';

export const somaticEncounters: readonly EncounterSpec[] = [
  {
    id: 'red-som-embodied-reflexdrill',
    lines: ['Somatic', 'Cognitive'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Embodied',
    taskBinds: [{ taskSlug: 'reaction_time', line: 'Somatic' }],
    narrative: {
      theme: 'Reflex Training',
      allyBeats: ['Strike the target the instant it appears — hesitation is death.'],
      codexEntry: 'The body trained in reflex moves before thought can slow it.',
    },
    enemy: {
      name: 'Reflex Golem',
      stats: { maxHp: 100, maxMana: 5, agility: 16, attack: 14, defense: 8, precision: 12, magic: 2, luck: 5 },
    },
  },
  {
    id: 'red-som-deterministic-combatposture',
    lines: ['Somatic', 'Willpower'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Deterministic',
    taskBinds: [{ taskSlug: 'held_input', line: 'Somatic' }],
    narrative: {
      theme: 'Combat Posture',
      allyBeats: ['Hold the stance — your body is the shield.'],
      codexEntry: 'Posture is the silent declaration of readiness.',
    },
    enemy: {
      name: 'Iron Stance',
      stats: { maxHp: 120, maxMana: 5, agility: 6, attack: 12, defense: 16, precision: 8, magic: 2, luck: 4 },
    },
  },
  {
    id: 'red-som-strategic-endurancetrial',
    lines: ['Somatic', 'Emotional'],
    stage: 'Red',
    quadrants: ['UR', 'UL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Strategic',
    taskBinds: [{ taskSlug: 'reaction_time', line: 'Somatic' }],
    narrative: {
      theme: 'Endurance Trial',
      allyBeats: ['Pace yourself — the trial ends only when your will does.'],
      codexEntry: 'Endurance is strategy written in flesh and breath.',
    },
    enemy: {
      name: 'Endurance Warden',
      stats: { maxHp: 130, maxMana: 10, agility: 8, attack: 10, defense: 12, precision: 9, magic: 4, luck: 5 },
    },
  },
  {
    id: 'red-som-immersive-pitfighter',
    lines: ['Somatic', 'Interpersonal'],
    stage: 'Red',
    quadrants: ['UR', 'LL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ImmersiveRPG',
    taskBinds: [{ taskSlug: 'reaction_time', line: 'Somatic' }],
    narrative: {
      theme: 'Pit-Fighter Challenge',
      allyBeats: ['The crowd roars — adapt to each opponent or fall.'],
      codexEntry: 'In the pit, the body speaks the only language that matters.',
    },
    enemy: {
      name: 'Pit Champion',
      stats: { maxHp: 110, maxMana: 5, agility: 14, attack: 16, defense: 7, precision: 10, magic: 2, luck: 6 },
    },
  },
];
