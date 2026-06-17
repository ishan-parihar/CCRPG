/**
 * FallbackProvider - provides pre-authored content when LLM is unavailable.
 * Per foundations/22 section 12.
 * Content drawn from concept-drafts for each modality.
 */
import type { Modality } from '../../core/domain/enums.js';
import type { Line } from '../../core/domain/Line.js';
import type { Stage } from '../../core/domain/Stage.js';

export interface FallbackContent {
  readonly prompt?: string;
  readonly scenario?: string;
  readonly options?: readonly { readonly id: string; readonly text: string }[];
  readonly framing?: string;
  readonly followUps?: readonly string[];
}

// ---------------------------------------------------------------------------
// Pre-authored fallback pools (Red stage, from concept-drafts)
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_RED: readonly FallbackContent[] = [
  {
    prompt: 'You struck first. Why?',
    followUps: ['What did the strike feel like?', 'Would you strike again?'],
  },
  {
    prompt: 'The enemy fell. What did you see in that moment?',
    followUps: ['Did you expect that feeling?', 'What remains after victory?'],
  },
  {
    prompt: 'Your blade chose its path. Name the path.',
    followUps: ['Is that path yours or the blade\'s?', 'Where does it lead next?'],
  },
  {
    prompt: 'They offered surrender. You decided. What shaped your choice?',
    followUps: ['Was it strength or something else?', 'What would you lose by choosing differently?'],
  },
  {
    prompt: 'The battle turns. What will you do before it turns again?',
    followUps: ['Is that instinct or will?', 'What is at stake for you?'],
  },
];

const SCENARIO_CHOICE_RED: readonly FallbackContent[] = [
  {
    scenario: 'The mountain pass narrows. Ahead, a fortified outpost blocks the only route to the valley beyond. Your warband is strong but weary. A scout reports the garrison is undermanned, yet the walls are thick.',
    options: [
      { id: 'attack', text: 'Storm the fort at dawn while defenders sleep' },
      { id: 'defend', text: 'Hold the pass and wait for reinforcements' },
      { id: 'negotiate', text: 'Send an emissary with a bold offer of alliance' },
    ],
  },
  {
    scenario: 'A rival chieftain sends a messenger bearing gifts and honeyed words. They propose a pact against a common foe. Your advisors are divided - some smell treachery, others see opportunity.',
    options: [
      { id: 'trust', text: 'Accept the pact and ride together against the common enemy' },
      { id: 'verify', text: 'Demand hostages as guarantee before committing forces' },
      { id: 'betray', text: 'Accept the gifts, then strike the rival while their guard is down' },
    ],
  },
  {
    scenario: 'The conquered territory stretches before you. Three paths lead to dominance, but your forces cannot hold all directions. The harvest season approaches and your people grow restless.',
    options: [
      { id: 'expand', text: 'Push into the fertile eastern lands before winter' },
      { id: 'fortify', text: 'Build strongholds to secure what you already hold' },
      { id: 'raid', text: 'Launch swift raids to gather resources and spread fear' },
    ],
  },
];

const DETERMINISTIC_RED: readonly FallbackContent[] = [
  {
    framing: 'The forge awaits. Steel your mind.',
  },
  {
    framing: 'Runes flash on the shield-wall. Track them.',
  },
  {
    framing: 'Enemies feint. See through deception.',
  },
  {
    framing: 'The war-drum beats. Match its rhythm or fall.',
  },
];

// Generic fallbacks for stages/modalities without specific content
const GENERIC_LANGUAGE_REFLECTIVE: FallbackContent = {
  prompt: 'What moved you to act?',
  followUps: ['Say more about that.', 'What does that tell you?'],
};

const GENERIC_SCENARIO_CHOICE: FallbackContent = {
  scenario: 'A crossroads appears. Each path carries weight.',
  options: [
    { id: 'path_a', text: 'Take the direct route forward' },
    { id: 'path_b', text: 'Seek an alternative approach' },
    { id: 'path_c', text: 'Wait and observe before choosing' },
  ],
};

const GENERIC_DETERMINISTIC: FallbackContent = {
  framing: 'Focus. The moment demands clarity.',
};

// --- Strategic (scenario + options for strategic reasoning) ---
const GENERIC_STRATEGIC: FallbackContent = {
  scenario: 'Resources are limited. The map shows three routes to the objective, each with hidden risks.',
  options: [
    { id: 'direct', text: 'Take the shortest path — speed over safety' },
    { id: 'flank', text: 'Circle wide — longer but concealed' },
    { id: 'fortify', text: 'Establish a forward position first' },
  ],
};

// --- Embodied (somatic awareness prompts) ---
const GENERIC_EMBODIED: FallbackContent = {
  prompt: 'Close your eyes. Where do you feel tension in your body right now?',
  followUps: ['What does that tension want to do?', 'Breathe into it. What shifts?'],
};

// --- SocialCooperative (NPC dialogue / group dynamics) ---
const GENERIC_SOCIAL_COOPERATIVE: FallbackContent = {
  scenario: 'The scouts look to you. The path splits — one leads through danger, the other through uncertainty. They need your word.',
  options: [
    { id: 'lead', text: 'Take the dangerous path — you will not ask them to go where you will not' },
    { id: 'delegate', text: 'Send the fastest scouts ahead while the group holds' },
    { id: 'unanimous', text: 'Let the group decide together — every voice matters' },
  ],
};

// --- ImmersiveRPG (full narrative environment) ---
const GENERIC_IMMERSIVE_RPG: FallbackContent = {
  prompt: 'The world stretches before you. A path winds through unfamiliar terrain. Something waits ahead — you can feel it.',
  followUps: ['What draws you forward?', 'What do you leave behind?'],
};

const GENERIC_FALLBACK: FallbackContent = {
  prompt: 'What is present for you right now?',
  followUps: ['What does that tell you?', 'Where does it lead?'],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: readonly T[]): T {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function getFallback(modality: Modality, _line: Line, stage: Stage): FallbackContent {
  switch (modality) {
    case 'LanguageReflective':
      return stage === 'Red' ? pickRandom(LANGUAGE_REFLECTIVE_RED) : GENERIC_LANGUAGE_REFLECTIVE;
    case 'ScenarioChoice':
      return stage === 'Red' ? pickRandom(SCENARIO_CHOICE_RED) : GENERIC_SCENARIO_CHOICE;
    case 'Deterministic':
      return stage === 'Red' ? pickRandom(DETERMINISTIC_RED) : GENERIC_DETERMINISTIC;
    case 'Strategic':
      return GENERIC_STRATEGIC;
    case 'Embodied':
      return GENERIC_EMBODIED;
    case 'SocialCooperative':
      return GENERIC_SOCIAL_COOPERATIVE;
    case 'ImmersiveRPG':
      return GENERIC_IMMERSIVE_RPG;
    default:
      return GENERIC_FALLBACK;
  }
}
