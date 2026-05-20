import type { StageAssessment } from '../types.js';

export const spiritualTurquoise: StageAssessment = {
  line: 'Spiritual',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'spir-tur-paradox',
      type: 'value_ranking',
      description: 'Value-coherence under paradox: hold values when logic says they contradict',
      parameters: { values: 6, temptationType: 'paradox-challenge', trials: 4, paradoxLevel: 'high' },
      measures: ['coherence', 'consistency', 'depth'],
    },
    {
      id: 'spir-tur-integral',
      type: 'llm_dialogue',
      description: 'Hold values that transcend AND include lower stages',
      parameters: { prompt: 'How can you honor your tradition AND transcend it? Is that not contradictory?', maxResponseLength: 600 },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
    llmRubric:
      'Score for integral/vision-logic spiritual reasoning. At Turquoise, values include paradox - they transcend yet include all previous stages. Coherence: can they hold paradox without collapse? Depth: do they demonstrate genuine trans-rational knowing? Consistency: do values hold even when logic fails?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 270000,
  driveProbes: {
    agency: {
      description: 'Hold value-paradox without external support',
      task: {
        id: 'spir-tur-probe-agency',
        type: 'value_ranking',
        description: 'Maintain values under paradox independently',
        parameters: { values: 4, temptationType: 'paradox-challenge', soloMode: true },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Holds paradox with personal stability',
      addictionSignal: 'Clings to paradox as identity, cannot be simple',
      allergySignal: 'Collapses paradox into either/or',
    },
    communion: {
      description: 'Share paradoxical value-holding with NPC',
      task: {
        id: 'spir-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'Share how you hold paradox with NPC',
        parameters: { prompt: 'That makes no logical sense. How do you hold both?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares paradox without needing other to get it',
      addictionSignal: 'Forces paradox-awareness on unprepared other',
      allergySignal: 'Cannot communicate paradoxical knowing',
    },
    eros: {
      description: 'Face ultimate paradox: value and valuelessness',
      task: {
        id: 'spir-tur-probe-eros',
        type: 'scenario',
        description: 'Face paradox of holding values while knowing all values are empty',
        parameters: { scenarioType: 'ultimate-paradox', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Holds ultimate paradox without collapse or inflation',
      addictionSignal: 'Spiritual inflation, uses paradox to avoid commitment',
      allergySignal: 'Refuses to engage with emptiness of values',
    },
    agape: {
      description: 'Return to simplest value with devotion',
      task: {
        id: 'spir-tur-probe-agape',
        type: 'value_ranking',
        description: 'Return to simplest value with full devotion',
        parameters: { values: 2, temptationType: 'none', complexity: 'minimal' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to simple value with deep devotion',
      addictionSignal: 'Refuses simplicity as beneath integral awareness',
      allergySignal: 'Cannot hold value with devotion at any level',
    },
  },
};
