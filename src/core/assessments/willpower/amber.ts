import type { StageAssessment } from '../types.js';

export const willpowerAmber: StageAssessment = {
  line: 'Willpower',
  stage: 'Amber',
  tasks: [
    {
      id: 'will-amb-hold',
      type: 'hold',
      description: 'Hold 8-12 seconds with multi-trial consistency',
      parameters: { targetDurationMs: 10000, perturbations: true, perturbationIntervalMs: 2000, trials: 4 },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Hold 10 seconds without countdown or encouragement',
      task: {
        id: 'will-amb-probe-agency',
        type: 'hold',
        description: 'Sustained hold without countdown or support',
        parameters: { targetDurationMs: 10000, perturbations: false, countdownEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds with self-generated discipline',
      addictionSignal: 'Holds rigidly, cannot release when time is up',
      allergySignal: 'Cannot hold without external structure',
    },
    communion: {
      description: 'Hold while supporting NPC partner in their hold',
      task: {
        id: 'will-amb-probe-communion',
        type: 'hold',
        description: 'Hold while supporting NPC partner',
        parameters: { targetDurationMs: 8000, perturbations: false, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Maintains own hold while attuning to partner',
      addictionSignal: 'Loses own hold to support other',
      allergySignal: 'Holds in isolation, ignores partner',
    },
    eros: {
      description: 'Attempt 15-second hold with perturbations',
      task: {
        id: 'will-amb-probe-eros',
        type: 'hold',
        description: 'Attempt longer hold with distractions',
        parameters: { targetDurationMs: 15000, perturbations: true, perturbationIntervalMs: 3000 },
        measures: ['accuracy', 'consistency', 'response_time'],
      },
      healthyResponse: 'Reaches toward longer hold with willingness to fail',
      addictionSignal: 'Compulsively extends, treats release as weakness',
      allergySignal: 'Refuses to attempt beyond comfort zone',
    },
    agape: {
      description: 'Short 4-second hold with full presence',
      task: {
        id: 'will-amb-probe-agape',
        type: 'hold',
        description: 'Short hold with full presence and care',
        parameters: { targetDurationMs: 4000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to short hold with full engagement',
      addictionSignal: 'Refuses short hold as beneath them',
      allergySignal: 'Cannot engage will even at easy level',
    },
  },
};
