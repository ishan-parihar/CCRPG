import type { StageAssessment } from '../types.js';

export const interpersonalRed: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Red',
  tasks: [
    {
      id: 'inter-red-pattern',
      type: 'pattern_prediction',
      description: 'Predict NPC simple repeating pattern',
      parameters: { patternLength: 3, repetitions: 4, predictionPoint: 'next' },
      measures: ['accuracy', 'response_time'],
    },
    {
      id: 'inter-red-transactional',
      type: 'scenario',
      description: 'Transactional coordination with simple NPC',
      parameters: { scenarioType: 'predict-simple-npc', npcBehaviour: 'repeating-pattern' },
      measures: ['accuracy', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.55,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.2,
      depth: 0.3,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Predict NPC pattern without hints',
      task: {
        id: 'inter-red-probe-agency',
        type: 'pattern_prediction',
        description: 'Predict NPC behaviour pattern without any hints',
        parameters: { patternLength: 3, repetitions: 3, predictionPoint: 'next', hintsEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Predicts independently with confidence',
      addictionSignal: 'Manipulates NPC rather than predicting',
      allergySignal: 'Cannot predict without confirmation from other',
    },
    communion: {
      description: 'Coordinate timing with NPC partner',
      task: {
        id: 'inter-red-probe-communion',
        type: 'scenario',
        description: 'Coordinate timing and actions with NPC partner',
        parameters: { scenarioType: 'coordination', npcBehaviour: 'cooperative', partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates with other while maintaining own intent',
      addictionSignal: 'Loses own goals to merge with partner',
      allergySignal: 'Refuses to coordinate, acts entirely alone',
    },
    eros: {
      description: 'Attempt to predict an NPC with more complex pattern',
      task: {
        id: 'inter-red-probe-eros',
        type: 'pattern_prediction',
        description: 'Predict a more complex NPC behaviour pattern',
        parameters: { patternLength: 5, repetitions: 3, predictionPoint: 'next' },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward complexity in social reading',
      addictionSignal: 'Compulsively analyzes others, cannot simply be with',
      allergySignal: 'Refuses social complexity, stays with simple patterns only',
    },
    agape: {
      description: 'Return to observing simple patterns with full attention',
      task: {
        id: 'inter-red-probe-agape',
        type: 'pattern_prediction',
        description: 'Observe simple repeating NPC pattern with full presence',
        parameters: { patternLength: 2, repetitions: 4, predictionPoint: 'next' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple observation with full engagement',
      addictionSignal: 'Refuses simple patterns as too easy',
      allergySignal: 'Cannot attend to others even at basic level',
    },
  },
};
