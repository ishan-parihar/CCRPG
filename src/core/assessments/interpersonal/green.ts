import type { StageAssessment } from '../types.js';

export const interpersonalGreen: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Green',
  tasks: [
    {
      id: 'inter-grn-cooperation',
      type: 'cooperation',
      description: 'Cooperative timing: synchronize actions with NPC for mutual benefit',
      parameters: { actionType: 'timed-cooperation', rounds: 6, adaptationRequired: true },
      measures: ['accuracy', 'response_time', 'transfer'],
    },
    {
      id: 'inter-grn-mutual-adapt',
      type: 'pattern_prediction',
      description: 'Mutual adaptation: predict NPC who adapts to YOU',
      parameters: { patternType: 'adaptive-npc', patternLength: 5, repetitions: 4, npcAdapts: true },
      measures: ['accuracy', 'depth', 'transfer'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.2,
      depth: 0.3,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Cooperate while maintaining own goals',
      task: {
        id: 'inter-grn-probe-agency',
        type: 'cooperation',
        description: 'Cooperative task while maintaining own goals',
        parameters: { actionType: 'timed-cooperation', rounds: 4, ownGoalsPresent: true },
        measures: ['accuracy', 'transfer'],
      },
      healthyResponse: 'Cooperates without losing own direction',
      addictionSignal: 'Dominates cooperation, imposes own goals',
      allergySignal: 'Loses all own goals to cooperate',
    },
    communion: {
      description: 'Adapt to NPC partner who is struggling',
      task: {
        id: 'inter-grn-probe-communion',
        type: 'cooperation',
        description: 'Adapt cooperation to struggling NPC',
        parameters: { actionType: 'adaptive-cooperation', rounds: 4, partnerSkillLevel: 'lower' },
        measures: ['accuracy', 'depth'],
      },
      healthyResponse: 'Adapts to others level without condescension',
      addictionSignal: 'Over-accommodates, loses own contribution',
      allergySignal: 'Cannot adjust to others needs',
    },
    eros: {
      description: 'Cooperate with NPC who has very different strategy',
      task: {
        id: 'inter-grn-probe-eros',
        type: 'cooperation',
        description: 'Cooperate with NPC using unfamiliar strategy',
        parameters: { actionType: 'novel-strategy-cooperation', rounds: 4, npcStrategy: 'unfamiliar' },
        measures: ['accuracy', 'transfer', 'depth'],
      },
      healthyResponse: 'Adapts to novel strategy with curiosity',
      addictionSignal: 'Compulsively adapts, no stable strategy',
      allergySignal: 'Refuses to engage with unfamiliar approach',
    },
    agape: {
      description: 'Return to simple turn-taking with presence',
      task: {
        id: 'inter-grn-probe-agape',
        type: 'pattern_prediction',
        description: 'Return to simple NPC pattern with full attention',
        parameters: { patternLength: 3, patternType: 'simple-repeating', repetitions: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple interaction with care',
      addictionSignal: 'Refuses simple interaction as boring',
      allergySignal: 'Cannot engage with others at basic level',
    },
  },
};
