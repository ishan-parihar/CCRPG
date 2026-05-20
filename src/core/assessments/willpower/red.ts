import type { StageAssessment } from '../types.js';

export const willpowerRed: StageAssessment = {
  line: 'Willpower',
  stage: 'Red',
  tasks: [
    {
      id: 'will-red-hold',
      type: 'hold',
      description: 'Hold under distraction with perturbations',
      parameters: { targetDurationMs: 4000, perturbations: true, perturbationIntervalMs: 1000 },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
    {
      id: 'will-red-resist',
      type: 'hold',
      description: 'Resist early-release temptation during hold',
      parameters: { targetDurationMs: 3500, earlyReleaseTemptation: true, temptationAt: [1500, 2500] },
      measures: ['accuracy', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      consistency: 0.3,
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Hold without encouragement or countdown',
      task: {
        id: 'will-red-probe-agency',
        type: 'hold',
        description: 'Sustain hold without external encouragement or countdown',
        parameters: { targetDurationMs: 4000, perturbations: false, countdownEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds with self-generated will and timing',
      addictionSignal: 'Holds far beyond required, cannot release',
      allergySignal: 'Cannot hold without external structure',
    },
    communion: {
      description: 'Hold while supporting NPC partner hold',
      task: {
        id: 'will-red-probe-communion',
        type: 'hold',
        description: 'Sustain hold while supporting an NPC partner doing the same',
        parameters: { targetDurationMs: 3500, partnerMode: true, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Maintains own hold while attuning to partner',
      addictionSignal: 'Loses own hold to support other',
      allergySignal: 'Ignores partner entirely, holds in isolation',
    },
    eros: {
      description: 'Attempt a longer hold than last time (risk failure)',
      task: {
        id: 'will-red-probe-eros',
        type: 'hold',
        description: 'Attempt a hold longer than previous success',
        parameters: { targetDurationMs: 6000, perturbations: true, perturbationIntervalMs: 1500 },
        measures: ['accuracy', 'consistency', 'response_time'],
      },
      healthyResponse: 'Reaches toward longer hold with willingness to fail',
      addictionSignal: 'Compulsively extends holds, treats release as weakness',
      allergySignal: 'Refuses to attempt longer hold, stays safe',
    },
    agape: {
      description: 'Do a short easy hold with full presence',
      task: {
        id: 'will-red-probe-agape',
        type: 'hold',
        description: 'Short easy hold with full somatic and mental presence',
        parameters: { targetDurationMs: 2000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to easy hold with full presence and care',
      addictionSignal: 'Refuses short hold as too easy',
      allergySignal: 'Cannot engage willpower even at minimal level',
    },
  },
};
