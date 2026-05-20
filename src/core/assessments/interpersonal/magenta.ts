import type { StageAssessment } from '../types.js';

export const interpersonalMagenta: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Magenta',
  tasks: [
    {
      id: 'inter-mag-imitate',
      type: 'imitation',
      description: 'Simple imitation: NPC does action, you copy',
      parameters: { actionType: 'gesture-sequence', demonstrations: 3, trials: 6, sequenceLength: 2 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.2,
      depth: 0.3,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'Imitate after single demonstration',
      task: {
        id: 'inter-mag-probe-agency',
        type: 'imitation',
        description: 'Copy NPC action after just one demonstration',
        parameters: { actionType: 'gesture-sequence', demonstrations: 1, trials: 3, sequenceLength: 2 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Imitates with confidence after single view',
      addictionSignal: 'Acts before fully observing',
      allergySignal: 'Needs many repetitions before attempting',
    },
    communion: {
      description: 'Take turns: NPC imitates you, then you imitate NPC',
      task: {
        id: 'inter-mag-probe-communion',
        type: 'imitation',
        description: 'Reciprocal imitation with NPC partner',
        parameters: { actionType: 'gesture-sequence', demonstrations: 2, trials: 4, turnTaking: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Alternates roles with engagement',
      addictionSignal: 'Only wants to be copied, not to copy',
      allergySignal: 'Only copies, cannot lead',
    },
    eros: {
      description: 'Attempt to imitate a 3-step sequence',
      task: {
        id: 'inter-mag-probe-eros',
        type: 'imitation',
        description: 'Imitate longer three-step sequence',
        parameters: { actionType: 'gesture-sequence', demonstrations: 2, trials: 3, sequenceLength: 3 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward longer sequence with effort',
      addictionSignal: 'Overwhelmed but cannot stop trying',
      allergySignal: 'Refuses longer sequences',
    },
    agape: {
      description: 'Return to single-action imitation with care',
      task: {
        id: 'inter-mag-probe-agape',
        type: 'imitation',
        description: 'Return to simple single-action imitation',
        parameters: { actionType: 'single-tap', demonstrations: 3, trials: 3 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple imitation with full attention',
      addictionSignal: 'Refuses simple action as too easy',
      allergySignal: 'Cannot engage with imitation at all',
    },
  },
};
