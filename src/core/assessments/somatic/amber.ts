import type { StageAssessment } from '../types.js';

export const somaticAmber: StageAssessment = {
  line: 'Somatic',
  stage: 'Amber',
  tasks: [
    {
      id: 'som-amb-sustained-hold',
      type: 'hold',
      description: 'Sustained hold: maintain button press for 8 seconds',
      parameters: { targetDurationMs: 8000, perturbations: false, trials: 3 },
      measures: ['accuracy', 'consistency'],
    },
    {
      id: 'som-amb-rhythm-maintain',
      type: 'rhythm',
      description: 'Rhythm maintenance: keep steady beat over 30 seconds',
      parameters: { bpm: 90, beats: 45, complexity: 'simple', durationMs: 30000 },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Maintain rhythm without external metronome for 20 seconds',
      task: {
        id: 'som-amb-probe-agency',
        type: 'rhythm',
        description: 'Maintain steady beat without metronome',
        parameters: { bpm: 90, beats: 30, complexity: 'simple', metronomeEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Maintains own rhythm from internal sense',
      addictionSignal: 'Rigid beat, cannot vary at all',
      allergySignal: 'Cannot maintain rhythm without external guide',
    },
    communion: {
      description: 'Maintain rhythm while NPC adds harmony beat',
      task: {
        id: 'som-amb-probe-communion',
        type: 'rhythm',
        description: 'Maintain own beat while NPC adds complementary rhythm',
        parameters: { bpm: 90, beats: 20, complexity: 'simple', partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds own beat while hearing partner',
      addictionSignal: 'Loses own rhythm to match partner exactly',
      allergySignal: 'Cannot hear partner while maintaining own rhythm',
    },
    eros: {
      description: 'Attempt longer sustained hold (12 seconds)',
      task: {
        id: 'som-amb-probe-eros',
        type: 'hold',
        description: 'Attempt longer sustained hold than baseline',
        parameters: { targetDurationMs: 12000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Reaches toward longer hold with effort',
      addictionSignal: 'Compulsively extends, cannot release',
      allergySignal: 'Refuses to attempt longer hold',
    },
    agape: {
      description: 'Short easy hold with full somatic presence',
      task: {
        id: 'som-amb-probe-agape',
        type: 'hold',
        description: 'Short hold with full body awareness',
        parameters: { targetDurationMs: 3000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds briefly with full body presence',
      addictionSignal: 'Refuses short hold as too easy',
      allergySignal: 'Cannot engage body even at easy level',
    },
  },
};
