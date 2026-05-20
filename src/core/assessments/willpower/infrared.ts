import type { StageAssessment } from '../types.js';

export const willpowerInfrared: StageAssessment = {
  line: 'Willpower',
  stage: 'Infrared',
  tasks: [
    {
      id: 'will-ir-brief-hold',
      type: 'hold',
      description: 'Pre-volitional: very brief hold (1 second)',
      parameters: { targetDurationMs: 1000, perturbations: false },
      measures: ['accuracy', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 2,
  estimatedDurationMs: 45000,
  driveProbes: {
    agency: {
      description: 'Hold briefly without countdown',
      task: {
        id: 'will-ir-probe-agency',
        type: 'hold',
        description: 'Brief hold without external countdown',
        parameters: { targetDurationMs: 1000, perturbations: false, countdownEnabled: false },
        measures: ['accuracy'],
      },
      healthyResponse: 'Holds briefly with basic volition',
      addictionSignal: 'Holds beyond required, cannot release',
      allergySignal: 'Cannot sustain even momentary hold',
    },
    communion: {
      description: 'Hold alongside NPC partner',
      task: {
        id: 'will-ir-probe-communion',
        type: 'hold',
        description: 'Brief hold alongside NPC partner',
        parameters: { targetDurationMs: 1000, perturbations: false, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds alongside other with basic awareness',
      addictionSignal: 'Loses own timing to match partner',
      allergySignal: 'Cannot hold with awareness of other',
    },
    eros: {
      description: 'Attempt slightly longer hold (2 seconds)',
      task: {
        id: 'will-ir-probe-eros',
        type: 'hold',
        description: 'Attempt slightly longer hold than baseline',
        parameters: { targetDurationMs: 2000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Reaches toward longer hold with willingness',
      addictionSignal: 'Compulsively extends beyond capacity',
      allergySignal: 'Refuses any extension',
    },
    agape: {
      description: 'Very brief hold with full presence',
      task: {
        id: 'will-ir-probe-agape',
        type: 'hold',
        description: 'Momentary hold with full awareness',
        parameters: { targetDurationMs: 500, perturbations: false },
        measures: ['accuracy'],
      },
      healthyResponse: 'Holds briefly with full presence',
      addictionSignal: 'Refuses brief hold as too easy',
      allergySignal: 'Cannot engage will at all',
    },
  },
};
