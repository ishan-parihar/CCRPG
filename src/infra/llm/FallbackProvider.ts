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

// ---------------------------------------------------------------------------
// Orange stage (Growth/Expansion) — achievement, metrics, competition
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_ORANGE: readonly FallbackContent[] = [
  {
    prompt: 'You built something. Was it yours alone, or did others carry it with you?',
    followUps: ['What would change if no one watched?', 'Who benefits most from what you built?'],
  },
  {
    prompt: 'The scoreboard shows you ahead. What does the number mean to you?',
    followUps: ['Would you play if no one kept score?', 'What is the cost of staying ahead?'],
  },
  {
    prompt: 'A rival surpassed you. What rises first — anger or curiosity?',
    followUps: ['Can you learn from someone you compete with?', 'What would you sacrifice to reclaim the lead?'],
  },
];

const SCENARIO_CHOICE_ORANGE: readonly FallbackContent[] = [
  {
    scenario: 'Your company has developed a breakthrough technology. Three paths open: dominate the market, share it freely, or sell to the highest bidder. Each path changes who you become.',
    options: [
      { id: 'dominate', text: 'Control the technology — power comes from ownership' },
      { id: 'share', text: 'Open-source it — progress benefits everyone' },
      { id: 'sell', text: 'Maximize profit — resources enable future innovation' },
    ],
  },
  {
    scenario: 'A promotion requires relocating. Your family roots run deep here, but the opportunity is rare. Your partner supports either choice but you see the weight in their eyes.',
    options: [
      { id: 'move', text: 'Take the promotion — growth demands sacrifice' },
      { id: 'stay', text: 'Decline — some foundations cannot be relocated' },
      { id: 'negotiate', text: 'Propose a hybrid arrangement — remote with quarterly visits' },
    ],
  },
];

const DETERMINISTIC_ORANGE: readonly FallbackContent[] = [
  {
    framing: 'The market shifts. Read the numbers. Act before the window closes.',
  },
  {
    framing: 'Your competitor launches first. How fast can you pivot?',
  },
  {
    framing: 'The data dashboard flickers — three metrics diverge. Which do you trust?',
  },
];

// ---------------------------------------------------------------------------
// Amber stage (Order/Institutional) — rules, belonging, duty
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_AMBER: readonly FallbackContent[] = [
  {
    prompt: 'You followed the rules. Did the rules serve you, or did you serve them?',
    followUps: ['When was the last time you questioned a rule?', 'What happens to those who break the code?'],
  },
  {
    prompt: 'The ceremony demands your presence. What do you bring to it — devotion or habit?',
    followUps: ['Would the community notice if you were absent?', 'What does belonging cost you?'],
  },
  {
    prompt: 'An outsider challenges your tradition. What rises — defense or doubt?',
    followUps: ['Can tradition survive without questioning?', 'What would be lost if the tradition changed?'],
  },
];

const SCENARIO_CHOICE_AMBER: readonly FallbackContent[] = [
  {
    scenario: 'A newcomer violates the community code. The elders demand punishment, but the newcomer acted out of desperation. Your role is to mediate.',
    options: [
      { id: 'enforce', text: 'Uphold the code — mercy without precedent weakens the structure' },
      { id: 'mercy', text: 'Show compassion — the code serves people, not the reverse' },
      { id: 'reform', text: 'Propose updating the code to account for desperation' },
    ],
  },
  {
    scenario: 'Your order receives orders that conflict with your conscience. The chain of command is clear, but the consequences are not. Your oath binds you.',
    options: [
      { id: 'obey', text: 'Follow orders — the structure holds because individuals commit' },
      { id: 'refuse', text: 'Refuse — conscience supersedes orders' },
      { id: 'appeal', text: 'Appeal through proper channels — trust the system' },
    ],
  },
];

const DETERMINISTIC_AMBER: readonly FallbackContent[] = [
  {
    framing: 'The ritual begins. Know your role. Execute with precision.',
  },
  {
    framing: 'The law is clear. Apply it without favor or fear.',
  },
  {
    framing: 'The hierarchy demands order. Where do you stand?',
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
      switch (stage) {
        case 'Red': return pickRandom(LANGUAGE_REFLECTIVE_RED);
        case 'Orange': return pickRandom(LANGUAGE_REFLECTIVE_ORANGE);
        case 'Amber': return pickRandom(LANGUAGE_REFLECTIVE_AMBER);
        default: return GENERIC_LANGUAGE_REFLECTIVE;
      }
    case 'ScenarioChoice':
      switch (stage) {
        case 'Red': return pickRandom(SCENARIO_CHOICE_RED);
        case 'Orange': return pickRandom(SCENARIO_CHOICE_ORANGE);
        case 'Amber': return pickRandom(SCENARIO_CHOICE_AMBER);
        default: return GENERIC_SCENARIO_CHOICE;
      }
    case 'Deterministic':
      switch (stage) {
        case 'Red': return pickRandom(DETERMINISTIC_RED);
        case 'Orange': return pickRandom(DETERMINISTIC_ORANGE);
        case 'Amber': return pickRandom(DETERMINISTIC_AMBER);
        default: return GENERIC_DETERMINISTIC;
      }
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
