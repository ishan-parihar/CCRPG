import type { StageAssessment } from '../types.js';

export const intrapersonalWhite: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'White',
  tasks: [
    {
      id: 'intra-wht-describe-without',
      type: 'llm_dialogue',
      description: 'Describe yourself without using roles, traits, or history - the paradox of self-description at the non-dual level',
      parameters: { prompt: 'Describe who you are. You may not use roles (parent, worker, friend), traits (kind, smart, creative), or personal history. What remains?', maxResponseLength: 700, evaluateResidualIdentification: true, evaluateParadoxComfort: true },
      measures: ['depth', 'coherence', 'metacognition', 'integration'],
    },
    {
      id: 'intra-wht-who-is-aware',
      type: 'llm_dialogue',
      description: 'Who is aware right now? Pointing-out instruction - not "what are you aware of" but "who/what IS the awareness?"',
      parameters: { prompt: 'Right now, you are aware. But WHO is aware? Not what you are aware OF - but what IS the awareness itself? Look directly.', maxResponseLength: 600, evaluateDirectness: true, rewardNonConceptual: true },
      measures: ['depth', 'metacognition', 'coherence'],
    },
    {
      id: 'intra-wht-action-without-actor',
      type: 'scenario',
      description: 'Action-without-actor: perform something meaningful while the sense of I-am-doing-it is transparent',
      parameters: { scenarioType: 'action-without-doer', responseType: 'text', scenarios: 2, actionRequired: true, evaluateDoerSense: true },
      measures: ['depth', 'integration', 'coherence'],
    },
    {
      id: 'intra-wht-identity-dissolution',
      type: 'scenario',
      description: 'Face identity dissolution without terror or grasping: what happens when all self-structure dissolves?',
      parameters: { scenarioType: 'identity-dissolution', responseType: 'text', scenarios: 2, provokeDissolution: true, measureResponseQuality: true },
      measures: ['depth', 'integration', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.25,
      coherence: 0.2,
      integration: 0.25,
    },
    llmRubric:
      'Score for genuine self-transparency vs. performed no-self. At White, the self is transparent to awareness - "I am" without predicate. KEY DISTINCTIONS: (1) Does the response come from LIVED self-transparency or from conceptual understanding of non-dual selfhood? Lived transparency feels simple and unremarkable; conceptual understanding feels like an achievement. (2) Is there residual identification-with-the-witness? At White, even the witnessing awareness is not grasped as "mine." (3) Does "no-self" feel like a loss or like natural freedom? Genuine White has no nostalgia for a self that was never real. (4) Can the person act, choose, and relate while self-structure is transparent? Or does transparency require withdrawal? True non-dual self is functional, not dissociative. Red flag: dissociation presented as enlightenment; nihilistic no-self; performed emptiness with subtle spiritual pride underneath.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Act without an actor - agency arising without anyone claiming to be the agent',
      task: {
        id: 'intra-wht-probe-agency',
        type: 'scenario',
        description: 'Choose and act decisively while self-structure is transparent',
        parameters: { scenarioType: 'decisive-action-no-self', responseType: 'text', soloMode: true, actionRequired: true },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Action happens cleanly and decisively without the sense of someone doing it; functional agency without ontological agent',
      addictionSignal: 'Subtle ownership of no-self: "I am the one without a self" becomes new identity territory; spiritual achiever in disguise',
      allergySignal: 'Without a solid self-sense, agency collapses; cannot choose or act when identity structure dissolves',
    },
    communion: {
      description: 'Relate intimately without a fixed self meeting a fixed other',
      task: {
        id: 'intra-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC asks: Who are you to me? Relate without presenting a fixed self.',
        parameters: { prompt: 'I want to know who I am talking to. Not your name - who ARE you? I need to feel you are real.', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Present and intimate without presenting a constructed self; the other can feel presence without needing a personality-mask to relate to',
      addictionSignal: 'Uses no-self as relational avoidance; cannot be met because there is no one home; spiritual bypassing of intimacy',
      allergySignal: 'Under relational pressure, fabricates a self to be more comfortable for the other; cannot hold transparency when asked for solidity',
    },
    eros: {
      description: 'Face complete identity dissolution - not philosophical but experiential',
      task: {
        id: 'intra-wht-probe-eros',
        type: 'llm_dialogue',
        description: 'Everything you know yourself to be dissolves. Right now. What remains?',
        parameters: { prompt: 'Imagine every memory gone. Every role dissolved. Every trait vanished. Every feeling neutral. You cannot even say "I am aware" because there is no I to say it. What is THIS?', maxResponseLength: 600 },
        measures: ['depth', 'metacognition', 'integration'],
      },
      healthyResponse: 'Meets radical dissolution with openness; what remains is not a new thing to grasp but a resting without ground',
      addictionSignal: 'Dissolution-seeking as spiritual practice; uses the edge of identity-loss for intensity; spiritual thrill-seeking',
      allergySignal: 'Genuine existential terror at dissolution; the conceptual understanding does not hold when the experience gets real',
    },
    agape: {
      description: 'Return to simple "I am" with peace - the most basic sense of being, undramatic and complete',
      task: {
        id: 'intra-wht-probe-agape',
        type: 'self_report',
        description: 'Return to the simplest self-statement with complete peace',
        parameters: { prompts: ['What is the simplest true thing you can say about yourself?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Returns to ordinary "I am here" with same quality as deepest inquiry; no hierarchy between simple self-sense and non-dual realization',
      addictionSignal: 'Cannot be simply oneself without adding spiritual depth; ordinary self-sense feels like regression from non-dual attainment',
      allergySignal: 'Has lost access to simple, warm self-sense; everything filtered through non-dual concepts even when simplicity is called for',
    },
  },
};
