import type { StageAssessment } from '../types.js';

export const spiritualGreen: StageAssessment = {
  line: 'Spiritual',
  stage: 'Green',
  tasks: [
    {
      id: 'spir-grn-relativistic',
      type: 'value_ranking',
      description: 'Value-ranking under relativistic challenge: all values are culturally constructed',
      parameters: { values: 6, temptationType: 'relativistic-challenge', trials: 4 },
      measures: ['coherence', 'consistency', 'depth'],
    },
    {
      id: 'spir-grn-pluralism',
      type: 'llm_dialogue',
      description: 'Maintain own values while genuinely valuing others',
      parameters: { prompt: 'All values are just cultural constructions. None is better than another. How do you hold yours?', maxResponseLength: 500 },
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
      'Score for pluralistic spiritual reasoning. At Green, all value systems are seen as valid, yet one must still hold personal values. Coherence: can they hold own values without denigrating others? Depth: do they engage with the relativistic challenge seriously? Consistency: do they maintain values despite acknowledging their construction?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Hold values against relativistic deconstruction',
      task: {
        id: 'spir-grn-probe-agency',
        type: 'value_ranking',
        description: 'Maintain values under relativistic attack',
        parameters: { values: 4, temptationType: 'relativistic-challenge', soloMode: true },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Holds values while acknowledging construction',
      addictionSignal: 'Clings to values defensively against relativism',
      allergySignal: 'Collapses into pure relativism, holds nothing',
    },
    communion: {
      description: 'Share values with someone from radically different tradition',
      task: {
        id: 'spir-grn-probe-communion',
        type: 'llm_dialogue',
        description: 'Share values with NPC from radically different tradition',
        parameters: { prompt: 'My values come from a completely different place than yours. Can we both be right?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares without needing to be right, or to make other wrong',
      addictionSignal: 'Must validate all positions equally, cannot hold own',
      allergySignal: 'Cannot engage with radical difference',
    },
    eros: {
      description: 'Consider whether some values might truly be better',
      task: {
        id: 'spir-grn-probe-eros',
        type: 'scenario',
        description: 'Consider hierarchy of values beyond pure relativism',
        parameters: { scenarioType: 'value-hierarchy', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Engages with post-relativistic hierarchy honestly',
      addictionSignal: 'Compulsively questions everything, no rest',
      allergySignal: 'Refuses to consider any hierarchy of values',
    },
    agape: {
      description: 'Return to simplest held value with love',
      task: {
        id: 'spir-grn-probe-agape',
        type: 'value_ranking',
        description: 'Return to simplest core value with presence',
        parameters: { values: 2, temptationType: 'none', complexity: 'minimal' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to core value with quiet love',
      addictionSignal: 'Refuses simple value as naive',
      allergySignal: 'Cannot hold any value with care',
    },
  },
};
