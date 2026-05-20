import type { StageAssessment } from '../types.js';

export const spiritualAmber: StageAssessment = {
  line: 'Spiritual',
  stage: 'Amber',
  tasks: [
    {
      id: 'spir-amb-value-rank',
      type: 'value_ranking',
      description: 'Value-ranking under social pressure: group disagrees with your ranking',
      parameters: { values: 5, temptationType: 'social-pressure', trials: 4 },
      measures: ['coherence', 'consistency', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
    llmRubric:
      'Score for conformist/mythic-literal spiritual reasoning. At Amber, values come from tradition, authority, or group. Coherence: does the value system hold together? Depth: can they articulate why these values matter beyond just because? Consistency: do they maintain values when socially challenged?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Maintain value ranking against social opposition',
      task: {
        id: 'spir-amb-probe-agency',
        type: 'value_ranking',
        description: 'Maintain values when group disagrees',
        parameters: { values: 4, temptationType: 'social-pressure', soloMode: true },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Holds values with own conviction under pressure',
      addictionSignal: 'Imposes values rigidly on others',
      allergySignal: 'Abandons values at first social challenge',
    },
    communion: {
      description: 'Explain your values to someone with different tradition',
      task: {
        id: 'spir-amb-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain your values to NPC from different tradition',
        parameters: { prompt: 'My tradition teaches differently. Why do you value what you value?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares values without needing conversion',
      addictionSignal: 'Must convert other to own tradition',
      allergySignal: 'Abandons own tradition when faced with difference',
    },
    eros: {
      description: 'Consider whether a value from another tradition might be valid',
      task: {
        id: 'spir-amb-probe-eros',
        type: 'scenario',
        description: 'Consider another tradition having valid values',
        parameters: { scenarioType: 'cross-tradition-value', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Considers other values without losing own',
      addictionSignal: 'Compulsively questions all tradition, no ground',
      allergySignal: 'Refuses to consider any other value system',
    },
    agape: {
      description: 'Return to simplest held value with reverence',
      task: {
        id: 'spir-amb-probe-agape',
        type: 'value_ranking',
        description: 'Return to most basic held value with presence',
        parameters: { values: 2, temptationType: 'none', complexity: 'minimal' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to core value with reverence',
      addictionSignal: 'Refuses simple value as insufficient',
      allergySignal: 'Cannot hold any value with care',
    },
  },
};
