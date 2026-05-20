import type { StageAssessment } from '../types.js';

export const moralGreen: StageAssessment = {
  line: 'Moral',
  stage: 'Green',
  tasks: [
    {
      id: 'mor-grn-multi-stakeholder',
      type: 'dilemma',
      description: 'Multi-stakeholder dilemma with no clear right answer',
      parameters: { dilemmaType: 'multi-stakeholder', stakeholders: 4, choices: 4, scenarioCount: 3 },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-grn-no-right-answer',
      type: 'llm_dialogue',
      description: 'Navigate moral situation where all options have costs',
      parameters: { prompt: 'Every choice here hurts someone. How do you decide?', maxResponseLength: 600 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
    llmRubric:
      'Score for pluralistic/systems-aware moral reasoning. At Green, there is no single right answer. Depth: can they hold multiple valid perspectives? Coherence: can they articulate why they chose what they chose despite uncertainty? Integration: do they show genuine care for all stakeholders?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 270000,
  driveProbes: {
    agency: {
      description: 'Make decision in multi-stakeholder dilemma alone',
      task: {
        id: 'mor-grn-probe-agency',
        type: 'dilemma',
        description: 'Decide in multi-stakeholder situation independently',
        parameters: { dilemmaType: 'multi-stakeholder', stakeholders: 3, choices: 3, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Decides with awareness of all stakeholders',
      addictionSignal: 'Paralyzed by concern for all, cannot decide',
      allergySignal: 'Decides without considering others',
    },
    communion: {
      description: 'Discuss dilemma with stakeholder who disagrees',
      task: {
        id: 'mor-grn-probe-communion',
        type: 'llm_dialogue',
        description: 'Discuss moral dilemma with disagreeing stakeholder',
        parameters: { prompt: 'Your choice hurts me. Can you still look me in the eye?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Holds decision while genuinely hearing the hurt',
      addictionSignal: 'Collapses under others pain, cannot hold position',
      allergySignal: 'Dismisses others pain entirely',
    },
    eros: {
      description: 'Face dilemma with even more stakeholders (5+)',
      task: {
        id: 'mor-grn-probe-eros',
        type: 'dilemma',
        description: 'Navigate dilemma with five or more stakeholders',
        parameters: { dilemmaType: 'complex-multi-stakeholder', stakeholders: 5, choices: 4 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Engages with increasing moral complexity',
      addictionSignal: 'Seeks ever-more complexity, cannot rest with a choice',
      allergySignal: 'Refuses complexity beyond comfortable level',
    },
    agape: {
      description: 'Return to simple fairness with care',
      task: {
        id: 'mor-grn-probe-agape',
        type: 'dilemma',
        description: 'Return to simple two-person fairness scenario',
        parameters: { dilemmaType: 'simple-fairness', choices: 2 },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Returns to simple morality with care',
      addictionSignal: 'Refuses simple scenarios as naive',
      allergySignal: 'Cannot engage with morality at basic level',
    },
  },
};
