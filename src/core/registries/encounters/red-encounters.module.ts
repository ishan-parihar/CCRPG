/**
 * Red stage encounters — the first vertical slice.
 * 30 side encounters (from data files), 3 mini-bosses, 1 main boss.
 * All tagged with lines, quadrants, role, ray, taskBinds per blueprint.
 */
import { EncounterRegistry } from '../index.js';
import type { EncounterSpec } from '../../domain/Encounter.js';
import { redEncounterData } from '../../data/encounters/red/index.js';

const bosses: EncounterSpec[] = [
  // --- 3 Mini-bosses ---
  {
    id: 'red-mini-01-warlord',
    lines: ['Willpower', 'Somatic', 'Cognitive'],
    stage: 'Red',
    quadrants: ['UR', 'UL'],
    role: 'mini',
    ray: 'Yellow',
    drive: { fixated: 'Agency', absent: 'Communion' },
    taskBinds: [
      { taskSlug: 'go_no_go', line: 'Willpower' },
      { taskSlug: 'reaction_time', line: 'Somatic' },
    ],
    narrative: { theme: 'Domination', allyBeats: ['He rules by force alone.', 'Can you resist his command?'], codexEntry: 'Power without restraint devours itself.' },
    enemy: { name: 'Iron Warlord', stats: { maxHp: 200, maxMana: 20, agility: 10, attack: 22, defense: 14, precision: 10, magic: 6, luck: 5 } },
  },
  {
    id: 'red-mini-02-witch',
    lines: ['Emotional', 'Intrapersonal', 'Spiritual'],
    stage: 'Red',
    quadrants: ['UL', 'LL'],
    role: 'mini',
    ray: 'Yellow',
    drive: { fixated: 'Eros', absent: 'Agape' },
    taskBinds: [
      { taskSlug: 'affect_recognition', line: 'Emotional' },
      { taskSlug: 'stroop', line: 'Intrapersonal' },
    ],
    narrative: { theme: 'Seduction of power', allyBeats: ['Her gaze pulls at your desires.', 'Name what you feel — or be consumed.'], codexEntry: 'Desire unnamed becomes a chain.' },
    enemy: { name: 'Hex Witch', stats: { maxHp: 150, maxMana: 50, agility: 12, attack: 8, defense: 8, precision: 14, magic: 20, luck: 10 } },
  },
  {
    id: 'red-mini-03-champion',
    lines: ['Moral', 'Interpersonal', 'Cognitive'],
    stage: 'Red',
    quadrants: ['LL', 'LR'],
    role: 'mini',
    ray: 'Yellow',
    drive: { fixated: 'Agency', absent: 'Communion' },
    taskBinds: [
      { taskSlug: 'dilemma_choice', line: 'Moral' },
      { taskSlug: 'n_back', line: 'Cognitive' },
    ],
    narrative: { theme: 'Might makes right', allyBeats: ['He offers a deal — betray your ally for power.', 'What is your word worth?'], codexEntry: 'Honour is the first casualty of ambition.' },
    enemy: { name: 'Arena Champion', stats: { maxHp: 180, maxMana: 30, agility: 14, attack: 18, defense: 12, precision: 12, magic: 10, luck: 7 } },
  },
  // --- 1 Main boss (covers all 4 quadrants) ---
  {
    id: 'red-main-tyrant',
    lines: ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal'],
    stage: 'Red',
    quadrants: ['UL', 'UR', 'LL', 'LR'],
    role: 'main',
    ray: 'Yellow',
    drive: { fixated: 'Agency', absent: 'Agape' },
    taskBinds: [
      { taskSlug: 'n_back', line: 'Cognitive' },
      { taskSlug: 'affect_recognition', line: 'Emotional' },
      { taskSlug: 'dilemma_choice', line: 'Moral' },
      { taskSlug: 'go_no_go', line: 'Willpower' },
      { taskSlug: 'reaction_time', line: 'Somatic' },
      { taskSlug: 'breath_rhythm', line: 'Spiritual' },
    ],
    narrative: {
      theme: 'The ego unbound — pure will without wisdom',
      allyBeats: [
        'He sits upon a throne of broken oaths.',
        'Every line of your being is tested here.',
        'To defeat the Tyrant, you must integrate what he cannot.',
      ],
      codexEntry: 'The Red Tyrant is the shadow of unchecked will — the ego that refuses all bonds. To pass beyond Red is to master power without being mastered by it.',
    },
    enemy: { name: 'The Red Tyrant', stats: { maxHp: 400, maxMana: 60, agility: 14, attack: 24, defense: 16, precision: 14, magic: 16, luck: 8 } },
  },
];

export function register(): void {
  // Register the 30 side encounters from data files
  for (const enc of redEncounterData) {
    EncounterRegistry.register(enc.id, enc);
  }
  // Register mini-bosses and main boss
  for (const enc of bosses) {
    EncounterRegistry.register(enc.id, enc);
  }
}
