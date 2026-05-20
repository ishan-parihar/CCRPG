import type { StageAssessment } from '../types.js';

export const somaticMagenta: StageAssessment = {
  line: 'Somatic',
  stage: 'Magenta',
  tasks: [
    {
      id: 'som-mag-rhythm',
      type: 'rhythm',
      description: 'Simple rhythm tapping: follow a steady beat',
      parameters: { bpm: 80, beats: 16, complexity: 'simple' },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'Maintain rhythm without external metronome',
      task: {
        id: 'som-mag-probe-agency',
        type: 'rhythm',
        description: 'Keep steady beat without metronome support',
        parameters: { bpm: 80, beats: 8, complexity: 'simple', metronomeEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Maintains own rhythm from internal sense',
      addictionSignal: 'Speeds up uncontrollably',
      allergySignal: 'Cannot maintain rhythm without external guide',
    },
    communion: {
      description: 'Tap rhythm alongside NPC partner',
      task: {
        id: 'som-mag-probe-communion',
        type: 'rhythm',
        description: 'Tap rhythm alongside NPC partner',
        parameters: { bpm: 80, beats: 8, complexity: 'simple', partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates rhythm with other while holding own beat',
      addictionSignal: 'Loses own beat to match other exactly',
      allergySignal: 'Cannot adjust to include another',
    },
    eros: {
      description: 'Attempt slightly faster rhythm',
      task: {
        id: 'som-mag-probe-eros',
        type: 'rhythm',
        description: 'Attempt faster-than-comfortable beat',
        parameters: { bpm: 110, beats: 12, complexity: 'simple' },
        measures: ['accuracy', 'consistency', 'response_time'],
      },
      healthyResponse: 'Reaches toward faster pace with effort',
      addictionSignal: 'Compulsively speeds up, cannot slow down',
      allergySignal: 'Refuses to attempt faster pace',
    },
    agape: {
      description: 'Very slow easy rhythm with full presence',
      task: {
        id: 'som-mag-probe-agape',
        type: 'rhythm',
        description: 'Very slow steady beat with full somatic presence',
        parameters: { bpm: 50, beats: 8, complexity: 'simple' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Engages with slow beat with full body awareness',
      addictionSignal: 'Refuses slow beat as too easy',
      allergySignal: 'Cannot maintain even slow rhythm',
    },
  },
};
