import type { StageAssessment } from '../types.js';

export const interpersonalAmber: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Amber',
  tasks: [
    {
      id: 'inter-amb-predict-role',
      type: 'pattern_prediction',
      description: 'Predict NPC behaviour based on their role/rules',
      parameters: { patternLength: 4, patternType: 'role-based', repetitions: 4, predictionPoint: 'next' },
      measures: ['accuracy', 'response_time', 'transfer'],
    },
    {
      id: 'inter-amb-norm-scenario',
      type: 'scenario',
      description: 'Predict what NPC will do when social norm is involved',
      parameters: { scenarioType: 'norm-prediction', npcBehaviour: 'rule-following', scenarios: 3 },
      measures: ['accuracy', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
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
      description: 'Predict NPC behaviour without hints',
      task: {
        id: 'inter-amb-probe-agency',
        type: 'pattern_prediction',
        description: 'Predict role-based NPC behaviour independently',
        parameters: { patternLength: 4, patternType: 'role-based', repetitions: 3, hintsEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Predicts others based on role-understanding',
      addictionSignal: 'Controls others rather than predicting',
      allergySignal: 'Cannot predict without being told answer',
    },
    communion: {
      description: 'Coordinate with NPC following shared rules',
      task: {
        id: 'inter-amb-probe-communion',
        type: 'scenario',
        description: 'Coordinate actions with NPC using shared rules',
        parameters: { scenarioType: 'shared-rules-coordination', npcBehaviour: 'rule-following' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates through shared understanding of rules',
      addictionSignal: 'Imposes rules on other without negotiation',
      allergySignal: 'Cannot coordinate even with shared rules',
    },
    eros: {
      description: 'Predict NPC who sometimes breaks their role',
      task: {
        id: 'inter-amb-probe-eros',
        type: 'pattern_prediction',
        description: 'Predict NPC with occasional role-breaking',
        parameters: { patternLength: 5, patternType: 'role-with-exceptions', repetitions: 3 },
        measures: ['accuracy', 'response_time', 'transfer'],
      },
      healthyResponse: 'Engages with complexity in social prediction',
      addictionSignal: 'Over-analyzes every deviation',
      allergySignal: 'Refuses to acknowledge role-breaking exists',
    },
    agape: {
      description: 'Return to simple pattern prediction with care',
      task: {
        id: 'inter-amb-probe-agape',
        type: 'pattern_prediction',
        description: 'Return to simple repeating NPC pattern',
        parameters: { patternLength: 3, patternType: 'simple-repeating', repetitions: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple prediction with full attention',
      addictionSignal: 'Refuses simple patterns as too easy',
      allergySignal: 'Cannot attend to others at basic level',
    },
  },
};
