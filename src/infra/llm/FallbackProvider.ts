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

// ---------------------------------------------------------------------------
// Green stage (Pluralistic/Integrative) — diversity, empathy, systemic thinking
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_GREEN: readonly FallbackContent[] = [
  {
    prompt: 'You hold two contradictory truths simultaneously. What does the space between them feel like?',
    followUps: ['Can both be true?', 'What emerges from the tension?'],
  },
  {
    prompt: 'Someone whose worldview is entirely different from yours shares their pain. What moves in you?',
    followUps: ['Can you hold their truth without losing your own?', 'What do you see in them that mirrors you?'],
  },
  {
    prompt: 'The system you belong to causes harm you did not choose. What is your responsibility?',
    followUps: ['Where does accountability end and complicity begin?', 'What would repair look like?'],
  },
];

const SCENARIO_CHOICE_GREEN: readonly FallbackContent[] = [
  {
    scenario: 'A community meeting erupts into conflict between two marginalized groups who both need the same limited resource. Both have legitimate claims. The facilitator looks to you.',
    options: [
      { id: 'mediate', text: 'Facilitate a dialogue where both groups share their stories' },
      { id: 'equity', text: 'Allocate based on greatest need, accepting the political fallout' },
      { id: 'creative', text: 'Propose a collaborative solution neither group has considered' },
    ],
  },
  {
    scenario: 'Your organization partners with a group whose values differ from yours in significant ways. The partnership would achieve a shared goal but requires compromise on deeply held principles.',
    options: [
      { id: 'partner', text: 'Accept the tension — coalition-building requires uncomfortable alliances' },
      { id: 'decline', text: 'Refuse — some principles are non-negotiable' },
    ],
  },
];

const DETERMINISTIC_GREEN: readonly FallbackContent[] = [
  {
    framing: 'Multiple perspectives converge. Hold them all without collapsing into one.',
  },
  {
    framing: 'The pattern contains its own contradiction. Embrace the complexity.',
  },
];

// ---------------------------------------------------------------------------
// Turquoise stage (Integral/Systemic) — holonic awareness, global consciousness
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_TURQUOISE: readonly FallbackContent[] = [
  {
    prompt: 'You feel the pulse of something vast beneath the surface of this moment. What is it?',
    followUps: ['How does it change what you see?', 'What is it asking of you?'],
  },
  {
    prompt: 'Every being you encounter is simultaneously a teacher, a student, and yourself. What shifts when you see this?',
    followUps: ['Can you hold this without losing practicality?', 'Where does this vision meet resistance in you?'],
  },
];

const SCENARIO_CHOICE_TURQUOISE: readonly FallbackContent[] = [
  {
    scenario: 'You perceive the interconnection between a local crisis and a global pattern. The appropriate response spans scales — individual, community, and systemic — simultaneously.',
    options: [
      { id: 'multi', text: 'Act on all three scales at once — the pattern demands integral response' },
      { id: 'local', text: 'Start where you stand — the global will follow the local' },
      { id: 'vision', text: 'Hold the vision — sometimes presence is the most potent action' },
    ],
  },
];

const DETERMINISTIC_TURQUOISE: readonly FallbackContent[] = [
  {
    framing: 'The integral pattern emerges. See the whole within the part.',
  },
];

// ---------------------------------------------------------------------------
// White stage (Superintegral/Meta-systemic) — beyond all frameworks
// ---------------------------------------------------------------------------

const LANGUAGE_REFLECTIVE_WHITE: readonly FallbackContent[] = [
  {
    prompt: 'All maps dissolve. What remains when even the concept of "development" falls away?',
    followUps: ['Is there something here that cannot be named?', 'What does awareness look like without a subject?'],
  },
];

const SCENARIO_CHOICE_WHITE: readonly FallbackContent[] = [
  {
    scenario: 'You stand at the threshold of something that has no precedent. Every framework you have ever learned offers guidance, and none of them apply.',
    options: [
      { id: 'trust', text: 'Trust what arises — let the response emerge from silence' },
      { id: 'serve', text: 'Ask what is needed, not what is possible' },
    ],
  },
];

const DETERMINISTIC_WHITE: readonly FallbackContent[] = [
  {
    framing: 'Beyond form, beyond measure. What is present without being named?',
  },
];

// Infrared and Magenta stage content
const LANGUAGE_REFLECTIVE_INFRARED: readonly FallbackContent[] = [
  {
    prompt: 'Something stirs in the depths. Before words, before thought — what is it?',
    followUps: ['Can you stay with it?', 'What does the body know?'],
  },
];

const LANGUAGE_REFLECTIVE_MAGENTA: readonly FallbackContent[] = [
  {
    prompt: 'The old stories speak through you. What voice rises when you stop trying to think?',
    followUps: ['Does the story belong to you or to something older?', 'What would happen if you let it finish?'],
  },
];

const SCENARIO_CHOICE_INFRARED: readonly FallbackContent[] = [
  {
    scenario: 'Raw sensation. Before interpretation, before story — something moves through you. It has no name.',
    options: [
      { id: 'follow', text: 'Follow the sensation wherever it leads' },
      { id: 'ground', text: 'Ground into the body and let it pass' },
    ],
  },
];

const SCENARIO_CHOICE_MAGENTA: readonly FallbackContent[] = [
  {
    scenario: 'The ritual has begun. The circle demands participation. Something ancient stirs in the collective space.',
    options: [
      { id: 'join', text: 'Surrender to the ritual — let the current carry you' },
      { id: 'witness', text: 'Hold the edge — observe the mystery without drowning' },
    ],
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
        case 'Infrared': return pickRandom(LANGUAGE_REFLECTIVE_INFRARED);
        case 'Magenta': return pickRandom(LANGUAGE_REFLECTIVE_MAGENTA);
        case 'Red': return pickRandom(LANGUAGE_REFLECTIVE_RED);
        case 'Amber': return pickRandom(LANGUAGE_REFLECTIVE_AMBER);
        case 'Orange': return pickRandom(LANGUAGE_REFLECTIVE_ORANGE);
        case 'Green': return pickRandom(LANGUAGE_REFLECTIVE_GREEN);
        case 'Turquoise': return pickRandom(LANGUAGE_REFLECTIVE_TURQUOISE);
        case 'White': return pickRandom(LANGUAGE_REFLECTIVE_WHITE);
        default: return GENERIC_LANGUAGE_REFLECTIVE;
      }
    case 'ScenarioChoice':
      switch (stage) {
        case 'Infrared': return pickRandom(SCENARIO_CHOICE_INFRARED);
        case 'Magenta': return pickRandom(SCENARIO_CHOICE_MAGENTA);
        case 'Red': return pickRandom(SCENARIO_CHOICE_RED);
        case 'Amber': return pickRandom(SCENARIO_CHOICE_AMBER);
        case 'Orange': return pickRandom(SCENARIO_CHOICE_ORANGE);
        case 'Green': return pickRandom(SCENARIO_CHOICE_GREEN);
        case 'Turquoise': return pickRandom(SCENARIO_CHOICE_TURQUOISE);
        case 'White': return pickRandom(SCENARIO_CHOICE_WHITE);
        default: return GENERIC_SCENARIO_CHOICE;
      }
    case 'Deterministic':
      switch (stage) {
        case 'Red': return pickRandom(DETERMINISTIC_RED);
        case 'Amber': return pickRandom(DETERMINISTIC_AMBER);
        case 'Orange': return pickRandom(DETERMINISTIC_ORANGE);
        case 'Green': return pickRandom(DETERMINISTIC_GREEN);
        case 'Turquoise': return pickRandom(DETERMINISTIC_TURQUOISE);
        case 'White': return pickRandom(DETERMINISTIC_WHITE);
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
