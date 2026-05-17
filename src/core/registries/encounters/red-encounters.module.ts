/**
 * Red stage encounters — the first vertical slice.
 * 8 side characters, 3 mini-bosses, 1 main boss.
 * All tagged with lines, quadrants, role, ray, taskBinds per blueprint.
 */
import { EncounterRegistry } from '../index.js';
import type { EncounterSpec } from '../../domain/Encounter.js';

const encounters: EncounterSpec[] = [
  // --- 8 Side encounters ---
  {
    id: 'red-side-01-brawler',
    lines: ['Somatic', 'Willpower'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'reaction_time', line: 'Somatic' }],
    narrative: { theme: 'Raw aggression', allyBeats: ['A fist swings — dodge or be struck.'], codexEntry: 'The body remembers before the mind.' },
    enemy: { name: 'Pit Brawler', stats: { maxHp: 80, maxMana: 10, agility: 12, attack: 14, defense: 6, precision: 8, magic: 2, luck: 5 } },
  },
  {
    id: 'red-side-02-thief',
    lines: ['Cognitive', 'Interpersonal'],
    stage: 'Red',
    quadrants: ['UR', 'LL'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'n_back', line: 'Cognitive' }],
    narrative: { theme: 'Cunning theft', allyBeats: ['Track the shell game — where did it go?'], codexEntry: 'Memory is the first weapon.' },
    enemy: { name: 'Alley Thief', stats: { maxHp: 60, maxMana: 20, agility: 16, attack: 8, defense: 4, precision: 14, magic: 6, luck: 10 } },
  },
  {
    id: 'red-side-03-bully',
    lines: ['Emotional', 'Moral'],
    stage: 'Red',
    quadrants: ['UL', 'LL'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'affect_recognition', line: 'Emotional' }],
    narrative: { theme: 'Intimidation', allyBeats: ['Read the face — is it rage or fear?'], codexEntry: 'Beneath every bully is a wound.' },
    enemy: { name: 'Yard Bully', stats: { maxHp: 90, maxMana: 5, agility: 8, attack: 16, defense: 8, precision: 6, magic: 2, luck: 4 } },
  },
  {
    id: 'red-side-04-trickster',
    lines: ['Cognitive', 'Intrapersonal'],
    stage: 'Red',
    quadrants: ['UL', 'UR'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'simon', line: 'Cognitive' }],
    narrative: { theme: 'Misdirection', allyBeats: ['The pattern shifts — stay centred.'], codexEntry: 'Attention is the root of power.' },
    enemy: { name: 'Trickster Imp', stats: { maxHp: 50, maxMana: 30, agility: 18, attack: 6, defense: 3, precision: 12, magic: 10, luck: 12 } },
  },
  {
    id: 'red-side-05-berserker',
    lines: ['Willpower', 'Somatic'],
    stage: 'Red',
    quadrants: ['UR'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'held_input', line: 'Willpower' }],
    narrative: { theme: 'Blind rage', allyBeats: ['Hold your ground — do not flinch.'], codexEntry: 'Will is the muscle of the soul.' },
    enemy: { name: 'Berserker', stats: { maxHp: 120, maxMana: 0, agility: 6, attack: 20, defense: 4, precision: 4, magic: 0, luck: 3 } },
  },
  {
    id: 'red-side-06-whisperer',
    lines: ['Interpersonal', 'Emotional'],
    stage: 'Red',
    quadrants: ['LL'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'affect_recognition', line: 'Emotional' }],
    narrative: { theme: 'Manipulation', allyBeats: ['Words drip like poison — discern truth.'], codexEntry: 'Not all weapons draw blood.' },
    enemy: { name: 'Whisperer', stats: { maxHp: 55, maxMana: 35, agility: 14, attack: 4, defense: 5, precision: 10, magic: 14, luck: 8 } },
  },
  {
    id: 'red-side-07-scavenger',
    lines: ['Moral', 'Cognitive'],
    stage: 'Red',
    quadrants: ['LL', 'LR'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'dilemma_choice', line: 'Moral' }],
    narrative: { theme: 'Survival ethics', allyBeats: ['They steal to eat — strike or spare?'], codexEntry: 'Morality is tested in scarcity.' },
    enemy: { name: 'Scavenger', stats: { maxHp: 65, maxMana: 10, agility: 14, attack: 10, defense: 5, precision: 8, magic: 4, luck: 9 } },
  },
  {
    id: 'red-side-08-drummer',
    lines: ['Somatic', 'Spiritual'],
    stage: 'Red',
    quadrants: ['UR', 'UL'],
    role: 'side',
    ray: 'Yellow',
    taskBinds: [{ taskSlug: 'breath_rhythm', line: 'Somatic' }],
    narrative: { theme: 'Primal rhythm', allyBeats: ['Match the beat or lose your footing.'], codexEntry: 'Rhythm is the body\'s oldest language.' },
    enemy: { name: 'War Drummer', stats: { maxHp: 70, maxMana: 15, agility: 10, attack: 12, defense: 7, precision: 10, magic: 8, luck: 6 } },
  },
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
  for (const enc of encounters) {
    EncounterRegistry.register(enc.id, enc);
  }
}
