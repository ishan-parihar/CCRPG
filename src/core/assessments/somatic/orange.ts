import type { StageAssessment } from '../types.js';

export const somaticOrange: StageAssessment = {
  line: 'Somatic',
  stage: 'Orange',
  tasks: [
    {
      id: 'som-ora-polyrhythm',
      type: 'rhythm',
      description: 'Complex polyrhythm: 3 against 2',
      parameters: { bpm: 100, beats: 24, complexity: 'polyrhythm', ratio: '3:2' },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
    {
      id: 'som-ora-precision',
      type: 'reaction_time',
      description: 'Precision tapping: hit targets within narrow time window',
      parameters: { stimulusType: 'precision', targetCount: 12, windowMs: 50, minGap: 400, maxGap: 1200 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Maintain polyrhythm without metronome',
      task: {
        id: 'som-ora-probe-agency',
        type: 'rhythm',
        description: 'Maintain complex rhythm without metronome support',
        parameters: { bpm: 100, beats: 16, complexity: 'polyrhythm', ratio: '3:2', metronomeEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Holds complex rhythm from internal sense',
      addictionSignal: 'Performs mechanically, no somatic engagement',
      allergySignal: 'Cannot maintain complex rhythm without guide',
    },
    communion: {
      description: 'Maintain one rhythm while NPC plays complementary',
      task: {
        id: 'som-ora-probe-communion',
        type: 'rhythm',
        description: 'Hold rhythm while NPC plays complementary pattern',
        parameters: { bpm: 100, beats: 16, complexity: 'polyrhythm', ratio: '3:2', partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates complex timing with other',
      addictionSignal: 'Loses own rhythm to match other',
      allergySignal: 'Cannot hear other while maintaining own',
    },
    eros: {
      description: 'Attempt faster polyrhythm (4 against 3)',
      task: {
        id: 'som-ora-probe-eros',
        type: 'rhythm',
        description: 'Attempt more complex 4:3 polyrhythm',
        parameters: { bpm: 100, beats: 16, complexity: 'polyrhythm', ratio: '4:3' },
        measures: ['accuracy', 'consistency', 'response_time'],
      },
      healthyResponse: 'Reaches toward higher complexity with effort',
      addictionSignal: 'Compulsively seeks complexity, cannot rest',
      allergySignal: 'Refuses to attempt harder rhythm',
    },
    agape: {
      description: 'Return to simple steady beat with full presence',
      task: {
        id: 'som-ora-probe-agape',
        type: 'rhythm',
        description: 'Return to simple steady beat with somatic presence',
        parameters: { bpm: 80, beats: 12, complexity: 'simple' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple rhythm with full body awareness',
      addictionSignal: 'Refuses simple rhythm as beneath ability',
      allergySignal: 'Cannot engage body at simple level',
    },
  },
};
