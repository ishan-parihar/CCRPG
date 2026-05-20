import type { StageAssessment } from '../types.js';

export const willpowerTurquoise: StageAssessment = {
  line: 'Willpower',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'will-tur-long-hold',
      type: 'hold',
      description: 'Long hold (15-20 seconds) with minimal jitter',
      parameters: { targetDurationMs: 18000, perturbations: true, perturbationIntervalMs: 3000, jitterThresholdMs: 50, trials: 3 },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Maintain long hold without any external support',
      task: {
        id: 'will-tur-probe-agency',
        type: 'hold',
        description: 'Long hold without countdown or encouragement',
        parameters: { targetDurationMs: 18000, perturbations: true, countdownEnabled: false, encouragementEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds with deep self-generated stability',
      addictionSignal: 'Holds beyond required, cannot release gracefully',
      allergySignal: 'Cannot sustain hold without external anchoring',
    },
    communion: {
      description: 'Hold while attuning to NPC partner energy',
      task: {
        id: 'will-tur-probe-communion',
        type: 'hold',
        description: 'Long hold while sensing NPC partner state',
        parameters: { targetDurationMs: 15000, perturbations: false, partnerMode: true, attunementRequired: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds own while attuning to other deeply',
      addictionSignal: 'Loses hold in attempt to attune',
      allergySignal: 'Holds rigidly, cannot attune at all',
    },
    eros: {
      description: 'Attempt 25-second hold with distractions',
      task: {
        id: 'will-tur-probe-eros',
        type: 'hold',
        description: 'Attempt hold beyond comfort zone with distractions',
        parameters: { targetDurationMs: 25000, perturbations: true, perturbationIntervalMs: 2000 },
        measures: ['accuracy', 'consistency', 'response_time'],
      },
      healthyResponse: 'Reaches toward extreme endurance with willingness',
      addictionSignal: 'Treats release as failure, cannot let go',
      allergySignal: 'Refuses to attempt beyond known capacity',
    },
    agape: {
      description: 'Brief gentle hold with full ease',
      task: {
        id: 'will-tur-probe-agape',
        type: 'hold',
        description: 'Brief hold with deep ease and presence',
        parameters: { targetDurationMs: 3000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds briefly with grace and presence',
      addictionSignal: 'Refuses brief hold as insufficient challenge',
      allergySignal: 'Cannot engage will even gently',
    },
  },
};
