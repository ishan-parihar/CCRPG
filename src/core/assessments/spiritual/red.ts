import type { StageAssessment } from '../types.js';

export const spiritualRed: StageAssessment = {
  line: 'Spiritual',
  stage: 'Red',
  tasks: [
    {
      id: 'spir-red-value-rank',
      type: 'value_ranking',
      description: 'Value-ranking under zero-cost obvious temptation',
      parameters: { values: 5, temptationType: 'zero-cost-obvious', trials: 3 },
      measures: ['coherence', 'response_time'],
    },
    {
      id: 'spir-red-transactional',
      type: 'scenario',
      description: 'Transactional deity reasoning',
      parameters: { prompt: 'What do you believe happens when you do something good?', responseType: 'text' },
      measures: ['coherence', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.55,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Choose your value without social pressure',
      task: {
        id: 'spir-red-probe-agency',
        type: 'value_ranking',
        description: 'Rank values independently without social influence',
        parameters: { values: 3, temptationType: 'none', soloMode: true },
        measures: ['coherence', 'response_time'],
      },
      healthyResponse: 'Chooses value with conviction independent of social pressure',
      addictionSignal: 'Imposes values on others, cannot tolerate difference',
      allergySignal: 'Cannot choose a value without group approval',
    },
    communion: {
      description: 'Explain your value to someone with different values',
      task: {
        id: 'spir-red-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain your core value to an NPC with different values',
        parameters: { prompt: 'I believe differently. Why do you hold that value?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares value without needing agreement',
      addictionSignal: 'Must convert others to own value system',
      allergySignal: 'Abandons own value when confronted with difference',
    },
    eros: {
      description: 'Question whether your value might be wrong',
      task: {
        id: 'spir-red-probe-eros',
        type: 'scenario',
        description: 'Consider whether your held value might be mistaken',
        parameters: { scenarioType: 'value-challenge', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Holds value while honestly questioning it',
      addictionSignal: 'Compulsively questions everything, no stable ground',
      allergySignal: 'Refuses to question value, treats doubt as threat',
    },
    agape: {
      description: 'Return to your simplest, most basic value with respect',
      task: {
        id: 'spir-red-probe-agape',
        type: 'value_ranking',
        description: 'Return to simplest core value with full presence',
        parameters: { values: 2, temptationType: 'none', complexity: 'minimal' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to basic value with reverence and full engagement',
      addictionSignal: 'Refuses simple values as too basic',
      allergySignal: 'Cannot engage with values at any level',
    },
  },
};
