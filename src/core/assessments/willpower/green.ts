import type { StageAssessment } from '../types.js';

export const willpowerGreen: StageAssessment = {
  line: 'Willpower',
  stage: 'Green',
  tasks: [
    {
      id: 'will-grn-hold-release',
      type: 'hold',
      description: 'Hold AND release: alternate holding and releasing accurately',
      parameters: { targetDurationMs: 6000, releaseDurationMs: 2000, cycles: 4, perturbations: true },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
    {
      id: 'will-grn-switch',
      type: 'reaction_time',
      description: 'Switching accuracy: quickly switch between hold and release on signal',
      parameters: { stimulusType: 'switch-signal', targetCount: 12, minGap: 800, maxGap: 2000 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Switch between hold and release without signals',
      task: {
        id: 'will-grn-probe-agency',
        type: 'hold',
        description: 'Self-paced hold-release cycling without signals',
        parameters: { targetDurationMs: 5000, releaseDurationMs: 2000, cycles: 3, signalEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Self-regulates hold and release with own timing',
      addictionSignal: 'Cannot release, treats letting go as weakness',
      allergySignal: 'Cannot hold, releases prematurely always',
    },
    communion: {
      description: 'Coordinate hold-release cycles with NPC partner',
      task: {
        id: 'will-grn-probe-communion',
        type: 'hold',
        description: 'Coordinate hold-release with NPC partner',
        parameters: { targetDurationMs: 5000, releaseDurationMs: 2000, cycles: 3, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates volitional cycles with other',
      addictionSignal: 'Loses own rhythm to match partner',
      allergySignal: 'Cannot coordinate will with another',
    },
    eros: {
      description: 'Attempt faster switching frequency',
      task: {
        id: 'will-grn-probe-eros',
        type: 'reaction_time',
        description: 'Switch between hold and release at faster pace',
        parameters: { stimulusType: 'switch-signal', targetCount: 16, minGap: 500, maxGap: 1500 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward faster switching with engagement',
      addictionSignal: 'Compulsive switching, cannot hold steady',
      allergySignal: 'Refuses faster pace',
    },
    agape: {
      description: 'Return to simple sustained hold with ease',
      task: {
        id: 'will-grn-probe-agape',
        type: 'hold',
        description: 'Simple sustained hold with full presence',
        parameters: { targetDurationMs: 4000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple hold with ease',
      addictionSignal: 'Refuses simple hold as insufficient',
      allergySignal: 'Cannot engage will at basic level',
    },
  },
};
