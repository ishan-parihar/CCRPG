import type { StageAssessment } from '../types.js';

export const cognitiveTurquoise: StageAssessment = {
  line: 'Cognitive',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'cog-tur-nback4',
      type: 'n_back',
      description: 'N=4+ n-back with high complexity',
      parameters: { n: 4, trials: 20, stimulusDurationMs: 800, interStimulusMs: 250, adaptive: true },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-tur-systems',
      type: 'pattern_prediction',
      description: 'Complex systems prediction: multi-variable outcomes',
      parameters: { patternType: 'systems', variables: 4, trials: 8, feedbackDelay: true },
      measures: ['accuracy', 'complexity_handled', 'transfer'],
    },
    {
      id: 'cog-tur-meta-pattern',
      type: 'scenario',
      description: 'Meta-pattern recognition: patterns of patterns',
      parameters: { scenarioType: 'meta-pattern', levels: 2, responseType: 'text', scenarios: 3 },
      measures: ['depth', 'complexity_handled', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 5,
  estimatedDurationMs: 360000,
  driveProbes: {
    agency: {
      description: 'Identify meta-pattern independently',
      task: {
        id: 'cog-tur-probe-agency',
        type: 'scenario',
        description: 'Identify patterns of patterns without guidance',
        parameters: { scenarioType: 'meta-pattern', levels: 2, responseType: 'text', soloMode: true },
        measures: ['depth', 'complexity_handled'],
      },
      healthyResponse: 'Sees meta-patterns with independent clarity',
      addictionSignal: 'Sees patterns everywhere, cannot stop analyzing',
      allergySignal: 'Cannot see meta-patterns without guidance',
    },
    communion: {
      description: 'Help NPC see system-level pattern',
      task: {
        id: 'cog-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC understand a system-level pattern',
        parameters: { prompt: 'I see the parts but not how they connect. What am I missing?', maxResponseLength: 500 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Guides other toward systems-seeing with patience',
      addictionSignal: 'Forces systems-view on others not ready',
      allergySignal: 'Cannot share systems-level perception',
    },
    eros: {
      description: 'Attempt n=5 and 3-level meta-pattern',
      task: {
        id: 'cog-tur-probe-eros',
        type: 'n_back',
        description: 'N-back at n=5 with maximum complexity',
        parameters: { n: 5, trials: 10, stimulusDurationMs: 750, interStimulusMs: 250 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward highest cognitive integration',
      addictionSignal: 'Compulsive complexity-seeking, cannot rest',
      allergySignal: 'Refuses growth at this level',
    },
    agape: {
      description: 'Return to n=2 with full presence and ease',
      task: {
        id: 'cog-tur-probe-agape',
        type: 'n_back',
        description: 'Return to n=2 with full ease',
        parameters: { n: 2, trials: 6, stimulusDurationMs: 1200, interStimulusMs: 500 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simplicity with grace and presence',
      addictionSignal: 'Refuses simple tasks as regression',
      allergySignal: 'Cannot engage even at simple level',
    },
  },
};
