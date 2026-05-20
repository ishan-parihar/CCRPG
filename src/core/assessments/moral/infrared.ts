import type { StageAssessment } from '../types.js';

export const moralInfrared: StageAssessment = {
  line: 'Moral',
  stage: 'Infrared',
  tasks: [
    {
      id: 'mor-ir-fairness',
      type: 'scenario',
      description: 'Pre-moral baseline: single fairness check (equal sharing)',
      parameters: { scenarioType: 'equal-split', choices: 2, trials: 3 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
  },
  minimumTrials: 2,
  estimatedDurationMs: 60000,
  driveProbes: {
    agency: {
      description: 'Make fairness choice independently',
      task: {
        id: 'mor-ir-probe-agency',
        type: 'scenario',
        description: 'Choose fair or unfair split without guidance',
        parameters: { scenarioType: 'equal-split', choices: 2, soloMode: true },
        measures: ['accuracy'],
      },
      healthyResponse: 'Makes choice with basic agency',
      addictionSignal: 'Grabs everything without awareness',
      allergySignal: 'Cannot make any choice at all',
    },
    communion: {
      description: 'Share with NPC partner',
      task: {
        id: 'mor-ir-probe-communion',
        type: 'scenario',
        description: 'Decide how to share with NPC partner',
        parameters: { scenarioType: 'sharing', choices: 2, partnerMode: true },
        measures: ['accuracy'],
      },
      healthyResponse: 'Acknowledges other exists in sharing',
      addictionSignal: 'Gives everything away without self-regard',
      allergySignal: 'Cannot acknowledge other in sharing',
    },
    eros: {
      description: 'Face slightly more complex sharing scenario',
      task: {
        id: 'mor-ir-probe-eros',
        type: 'scenario',
        description: 'Sharing scenario with unequal resources',
        parameters: { scenarioType: 'unequal-resources', choices: 3 },
        measures: ['accuracy', 'depth'],
      },
      healthyResponse: 'Engages with complexity even at pre-moral level',
      addictionSignal: 'Overwhelmed but cannot disengage',
      allergySignal: 'Refuses any complexity in moral space',
    },
    agape: {
      description: 'Return to simplest sharing with presence',
      task: {
        id: 'mor-ir-probe-agape',
        type: 'scenario',
        description: 'Return to simplest equal split with full attention',
        parameters: { scenarioType: 'equal-split', choices: 2 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Engages with simple scenario fully',
      addictionSignal: 'Refuses simple scenario as beneath them',
      allergySignal: 'Cannot engage with sharing at all',
    },
  },
};
