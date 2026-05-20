import type { StageAssessment } from '../types.js';

export const interpersonalInfrared: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Infrared',
  tasks: [
    {
      id: 'inter-ir-imitate',
      type: 'imitation',
      description: 'Pre-other minimal: imitate simple NPC action',
      parameters: { actionType: 'single-tap', demonstrations: 3, trials: 4 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.2,
      depth: 0.3,
    },
  },
  minimumTrials: 2,
  estimatedDurationMs: 60000,
  driveProbes: {
    agency: {
      description: 'Imitate without waiting for signal',
      task: {
        id: 'inter-ir-probe-agency',
        type: 'imitation',
        description: 'Imitate NPC action without waiting for go signal',
        parameters: { actionType: 'single-tap', demonstrations: 2, trials: 3, signalEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Initiates imitation with basic agency',
      addictionSignal: 'Acts before observing',
      allergySignal: 'Cannot initiate imitation without explicit signal',
    },
    communion: {
      description: 'Take turns imitating with NPC',
      task: {
        id: 'inter-ir-probe-communion',
        type: 'imitation',
        description: 'Take turns imitating with NPC partner',
        parameters: { actionType: 'single-tap', demonstrations: 2, trials: 3, turnTaking: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Alternates with other with basic awareness',
      addictionSignal: 'Only copies, never leads',
      allergySignal: 'Cannot attend to others actions',
    },
    eros: {
      description: 'Attempt to imitate more complex action',
      task: {
        id: 'inter-ir-probe-eros',
        type: 'imitation',
        description: 'Attempt to imitate a two-step action',
        parameters: { actionType: 'two-step', demonstrations: 3, trials: 3 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward more complex imitation',
      addictionSignal: 'Overwhelmed but cannot stop trying',
      allergySignal: 'Refuses to attempt complex imitation',
    },
    agape: {
      description: 'Return to simplest imitation with presence',
      task: {
        id: 'inter-ir-probe-agape',
        type: 'imitation',
        description: 'Return to simplest single-tap imitation',
        parameters: { actionType: 'single-tap', demonstrations: 3, trials: 2 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple imitation with full attention',
      addictionSignal: 'Refuses simple imitation as too easy',
      allergySignal: 'Cannot engage with other at all',
    },
  },
};
