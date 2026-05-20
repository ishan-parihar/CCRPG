import type { StageAssessment } from '../types.js';

export const moralTurquoise: StageAssessment = {
  line: 'Moral',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'mor-tur-systemic',
      type: 'dilemma',
      description: 'Systemic impact: long-term vs short-term ecological/social consequences',
      parameters: { dilemmaType: 'systemic-impact', timeHorizon: 'multi-generational', stakeholders: 6, choices: 4 },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-tur-ecological',
      type: 'llm_dialogue',
      description: 'Ecological moral reasoning: what do we owe future systems?',
      parameters: { prompt: 'This helps people now but degrades the system for future generations. How do you weigh that?', maxResponseLength: 600 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
    llmRubric:
      'Score for integral/systemic moral reasoning. At Turquoise, morality includes systems, future generations, and ecological impact. Depth: does reasoning span multiple timescales and systems? Coherence: is the systemic reasoning internally consistent? Integration: does it honor both individual and systemic needs?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Make systemic moral decision independently',
      task: {
        id: 'mor-tur-probe-agency',
        type: 'dilemma',
        description: 'Make systemic moral choice without group input',
        parameters: { dilemmaType: 'systemic-impact', stakeholders: 4, choices: 3, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Decides with systemic awareness and personal conviction',
      addictionSignal: 'Paralyzed by systemic complexity, cannot choose',
      allergySignal: 'Ignores systemic impact, decides locally only',
    },
    communion: {
      description: 'Discuss systemic ethics with differently-oriented NPC',
      task: {
        id: 'mor-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'Discuss systemic ethics with short-term-focused NPC',
        parameters: { prompt: 'People are suffering NOW. How can you prioritize the future over present pain?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Holds systemic view while honoring present suffering',
      addictionSignal: 'Dismisses present suffering for future good',
      allergySignal: 'Abandons systemic view when confronted with pain',
    },
    eros: {
      description: 'Face dilemma across three timescales simultaneously',
      task: {
        id: 'mor-tur-probe-eros',
        type: 'dilemma',
        description: 'Navigate dilemma spanning immediate, generational, and civilizational timescales',
        parameters: { dilemmaType: 'multi-timescale', timescales: 3, choices: 4 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Holds multiple timescales with clarity',
      addictionSignal: 'Compulsively expands scope, cannot focus',
      allergySignal: 'Refuses to consider longer timescales',
    },
    agape: {
      description: 'Return to simple fairness with presence',
      task: {
        id: 'mor-tur-probe-agape',
        type: 'dilemma',
        description: 'Return to simple fairness with full care',
        parameters: { dilemmaType: 'simple-fairness', choices: 2 },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Returns to simple morality with love',
      addictionSignal: 'Refuses simple morality as naive',
      allergySignal: 'Cannot engage with morality at any level',
    },
  },
};
