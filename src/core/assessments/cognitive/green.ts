import type { StageAssessment } from '../types.js';

export const cognitiveGreen: StageAssessment = {
  line: 'Cognitive',
  stage: 'Green',
  tasks: [
    {
      id: 'cog-grn-nback34',
      type: 'n_back',
      description: 'N=3-4 n-back with adaptive difficulty',
      parameters: { n: 3, maxN: 4, trials: 18, stimulusDurationMs: 850, interStimulusMs: 300, adaptive: true },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-grn-multi-rule',
      type: 'pattern_prediction',
      description: 'Multi-rule coordination: apply 2 rules simultaneously',
      parameters: { patternType: 'multi-rule', ruleCount: 2, trials: 8, complexity: 'high' },
      measures: ['accuracy', 'complexity_handled', 'self_correction'],
    },
    {
      id: 'cog-grn-both-and',
      type: 'scenario',
      description: 'Both/and reasoning: hold two contradictory truths',
      parameters: { scenarioType: 'paradox-holding', responseType: 'text', scenarios: 3 },
      measures: ['depth', 'complexity_handled', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 5,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Hold both/and without external validation',
      task: {
        id: 'cog-grn-probe-agency',
        type: 'scenario',
        description: 'Hold contradictory truths without needing agreement',
        parameters: { scenarioType: 'paradox-holding', responseType: 'text', soloMode: true },
        measures: ['depth', 'complexity_handled'],
      },
      healthyResponse: 'Holds complexity with own cognitive grounding',
      addictionSignal: 'Makes everything complex, cannot simplify',
      allergySignal: 'Cannot hold contradiction without external support',
    },
    communion: {
      description: 'Help NPC see both sides of a paradox',
      task: {
        id: 'cog-grn-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC hold two truths simultaneously',
        parameters: { prompt: 'But those two things cannot both be true! How do you hold that?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Guides other into both/and thinking with care',
      addictionSignal: 'Forces complexity on other who is not ready',
      allergySignal: 'Cannot share paradox-holding capacity',
    },
    eros: {
      description: 'Attempt 3-rule coordination (above current)',
      task: {
        id: 'cog-grn-probe-eros',
        type: 'pattern_prediction',
        description: 'Coordinate three rules simultaneously',
        parameters: { patternType: 'multi-rule', ruleCount: 3, trials: 6, complexity: 'very-high' },
        measures: ['accuracy', 'complexity_handled'],
      },
      healthyResponse: 'Reaches toward greater cognitive integration',
      addictionSignal: 'Compulsively seeks ever-more rules',
      allergySignal: 'Refuses cognitive growth beyond comfort',
    },
    agape: {
      description: 'Return to simple n=2 with care',
      task: {
        id: 'cog-grn-probe-agape',
        type: 'n_back',
        description: 'Return to n=2 with full presence',
        parameters: { n: 2, trials: 6, stimulusDurationMs: 1100, interStimulusMs: 400 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simpler cognition with grace',
      addictionSignal: 'Refuses simplicity as regression',
      allergySignal: 'Cannot engage even at comfortable level',
    },
  },
};
