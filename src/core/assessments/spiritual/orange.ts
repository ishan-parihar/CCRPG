import type { StageAssessment } from '../types.js';

export const spiritualOrange: StageAssessment = {
  line: 'Spiritual',
  stage: 'Orange',
  tasks: [
    {
      id: 'spir-ora-value-logic',
      type: 'value_ranking',
      description: 'Value-ranking under logical argument temptation',
      parameters: { values: 6, temptationType: 'logical-argument', trials: 4 },
      measures: ['coherence', 'consistency', 'depth'],
    },
    {
      id: 'spir-ora-rational-challenge',
      type: 'llm_dialogue',
      description: 'Maintain values against rational deconstruction',
      parameters: { prompt: 'Can you prove your value is correct? What if I logically disprove it?', maxResponseLength: 500 },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
    llmRubric:
      'Score for rational/individual spiritual stage. At Orange, values must survive logical scrutiny. Coherence: can they articulate a rational basis for their values? Depth: do they recognize the limits of pure rationality for meaning? Consistency: do values hold under intellectual challenge?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Maintain value against rational argument',
      task: {
        id: 'spir-ora-probe-agency',
        type: 'value_ranking',
        description: 'Maintain values under logical attack',
        parameters: { values: 4, temptationType: 'logical-argument', soloMode: true },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Holds values with rational conviction',
      addictionSignal: 'Dogmatically holds despite valid critique',
      allergySignal: 'Abandons values at first logical challenge',
    },
    communion: {
      description: 'Discuss values with someone who reasons differently',
      task: {
        id: 'spir-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Discuss values with differently-reasoning NPC',
        parameters: { prompt: 'My logic leads me elsewhere. Can we both be right?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Engages in rational dialogue without losing values',
      addictionSignal: 'Must win the argument to hold value',
      allergySignal: 'Cannot discuss values in rational terms',
    },
    eros: {
      description: 'Consider a value beyond rational justification',
      task: {
        id: 'spir-ora-probe-eros',
        type: 'scenario',
        description: 'Consider value that transcends rational proof',
        parameters: { scenarioType: 'trans-rational-value', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Reaches toward meaning beyond reason with openness',
      addictionSignal: 'Compulsively seeks the trans-rational',
      allergySignal: 'Refuses anything beyond rational proof',
    },
    agape: {
      description: 'Return to simplest value with ease',
      task: {
        id: 'spir-ora-probe-agape',
        type: 'value_ranking',
        description: 'Return to basic value with simple clarity',
        parameters: { values: 2, temptationType: 'none', complexity: 'minimal' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to core value with quiet confidence',
      addictionSignal: 'Refuses simple value as intellectually insufficient',
      allergySignal: 'Cannot hold any value with care',
    },
  },
};
