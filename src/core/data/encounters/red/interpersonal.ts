import type { EncounterSpec } from '../../../domain/Encounter.js';

export const interpersonalEncounters: readonly EncounterSpec[] = [
  {
    id: 'red-inter-social-dominanceneg',
    lines: ['Interpersonal', 'Emotional'],
    stage: 'Red',
    quadrants: ['LL', 'UL'],
    role: 'side',
    ray: 'Yellow',
    modality: 'SocialCooperative',
    taskBinds: [{ taskSlug: 'affect_recognition', line: 'Interpersonal' }],
    narrative: {
      theme: 'Dominance Negotiation',
      allyBeats: ['The pack needs a leader — persuade without destroying.'],
      codexEntry: 'Negotiation at the primal level is still dominance by other means.',
    },
    enemy: {
      name: 'Pack Negotiator',
      stats: { maxHp: 75, maxMana: 20, agility: 12, attack: 10, defense: 7, precision: 12, magic: 8, luck: 8 },
    },
  },
  {
    id: 'red-inter-scenario-alliancebuild',
    lines: ['Interpersonal', 'Moral'],
    stage: 'Red',
    quadrants: ['LL', 'LR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ScenarioChoice',
    taskBinds: [{ taskSlug: 'dilemma_choice', line: 'Interpersonal' }],
    narrative: {
      theme: 'Alliance Building',
      allyBeats: ['Two factions offer aid — choose wisely, for the other becomes your foe.'],
      codexEntry: 'Every alliance in Red is forged in mutual need and mutual threat.',
    },
    enemy: {
      name: 'Faction Herald',
      stats: { maxHp: 70, maxMana: 15, agility: 11, attack: 9, defense: 8, precision: 13, magic: 7, luck: 9 },
    },
  },
  {
    id: 'red-inter-language-betrayaldetect',
    lines: ['Interpersonal', 'Cognitive'],
    stage: 'Red',
    quadrants: ['LL', 'UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'LanguageReflective',
    taskBinds: [{ taskSlug: 'n_back', line: 'Interpersonal' }],
    narrative: {
      theme: 'Betrayal Detection',
      allyBeats: ['Their words do not match their deeds — track the inconsistency.'],
      codexEntry: 'Betrayal is detectable to the mind that remembers every promise.',
    },
    enemy: {
      name: 'Oath-Twister',
      stats: { maxHp: 65, maxMana: 25, agility: 13, attack: 8, defense: 5, precision: 14, magic: 10, luck: 10 },
    },
  },
  {
    id: 'red-inter-immersive-warbond',
    lines: ['Interpersonal', 'Willpower'],
    stage: 'Red',
    quadrants: ['LL', 'UR'],
    role: 'side',
    ray: 'Yellow',
    modality: 'ImmersiveRPG',
    taskBinds: [{ taskSlug: 'held_input', line: 'Interpersonal' }],
    narrative: {
      theme: 'War-Bond Trial',
      allyBeats: ['Back to back with a stranger — trust or fall alone.'],
      codexEntry: 'The war-bond is forged when two warriors choose trust over suspicion.',
    },
    enemy: {
      name: 'Bond-Breaker',
      stats: { maxHp: 90, maxMana: 10, agility: 10, attack: 14, defense: 9, precision: 9, magic: 5, luck: 6 },
    },
  },
];
