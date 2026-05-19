import type { EncounterSpec } from '../../../domain/Encounter.js';

export const cognitiveEncounters: readonly EncounterSpec[] = [
  {
    id: 'red-cog-deterministic-warmind',
    lines: ['Cognitive', 'Willpower'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Deterministic',
    taskBinds: [{ taskSlug: 'n_back', line: 'Cognitive' }],
    narrative: {
      theme: 'War-Mind Forge',
      allyBeats: ['Count the strikes — the pattern reveals itself.'],
      codexEntry: 'The War-Mind is sharpened through repetition under fire.',
    },
    enemy: {
      name: 'War-Mind Sentinel',
      stats: { maxHp: 85, maxMana: 15, agility: 10, attack: 14, defense: 8, precision: 12, magic: 4, luck: 5 },
    },
  },
  {
    id: 'red-cog-strategic-tactician',
    lines: ['Cognitive', 'Interpersonal'],
    stage: 'Red',
    quadrants: ['UR', 'LL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'Strategic',
    taskBinds: [{ taskSlug: 'pattern_prediction', line: 'Cognitive' }],
    narrative: {
      theme: 'Predator Tactics',
      allyBeats: ['Predict the next move — strike before they strike.'],
      codexEntry: 'The cunning hunter reads the field three moves ahead.',
    },
    enemy: {
      name: 'Feral Tactician',
      stats: { maxHp: 75, maxMana: 20, agility: 14, attack: 10, defense: 6, precision: 14, magic: 6, luck: 8 },
    },
  },
  {
    id: 'red-cog-immersive-mindbreaker',
    lines: ['Cognitive', 'Emotional'],
    stage: 'Red',
    quadrants: ['UR', 'UL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ImmersiveRPG',
    taskBinds: [{ taskSlug: 'stroop', line: 'Cognitive' }],
    narrative: {
      theme: 'Mind-Breaker Trial',
      allyBeats: ['The illusions swirl — name the colour, not the word.'],
      codexEntry: 'In the arena of perception, clarity is the sharpest blade.',
    },
    enemy: {
      name: 'Mind-Breaker',
      stats: { maxHp: 70, maxMana: 30, agility: 12, attack: 8, defense: 5, precision: 10, magic: 14, luck: 7 },
    },
  },
  {
    id: 'red-cog-language-warcry',
    lines: ['Cognitive', 'Somatic'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'LanguageReflective',
    taskBinds: [{ taskSlug: 'simon', line: 'Cognitive' }],
    narrative: {
      theme: 'War-Cry Decipherment',
      allyBeats: ['Each war-cry encodes a command — decode and obey or defy.'],
      codexEntry: 'Language itself was born as a weapon of coordination.',
    },
    enemy: {
      name: 'Cry-Caller',
      stats: { maxHp: 65, maxMana: 25, agility: 11, attack: 12, defense: 6, precision: 13, magic: 8, luck: 6 },
    },
  },
];
