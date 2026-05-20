import type { StageAssessment } from '../types.js';

export const cognitiveOrange: StageAssessment = {
  line: 'Cognitive',
  stage: 'Orange',
  tasks: [
    {
      id: 'cog-ora-nback3',
      type: 'n_back',
      description: 'N=3 n-back: hold 3 items and identify matches',
      parameters: { n: 3, trials: 16, stimulusDurationMs: 900, interStimulusMs: 300 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-ora-wcst',
      type: 'go_no_go',
      description: 'WCST high switch: frequent rule changes',
      parameters: { goRatio: 0.7, trials: 24, stimulusDurationMs: 500, switchFrequency: 'high' },
      measures: ['accuracy', 'response_time', 'self_correction'],
    },
    {
      id: 'cog-ora-analogy',
      type: 'pattern_prediction',
      description: 'Analogical reasoning: A is to B as C is to ?',
      parameters: { patternType: 'analogical', complexity: 'medium', trials: 8 },
      measures: ['accuracy', 'complexity_handled'],
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
      description: 'Complete n=3 without hints or feedback',
      task: {
        id: 'cog-ora-probe-agency',
        type: 'n_back',
        description: 'N-back n=3 without any feedback',
        parameters: { n: 3, trials: 8, stimulusDurationMs: 900, interStimulusMs: 300, feedbackEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Maintains working memory independently',
      addictionSignal: 'Refuses all feedback, isolated performance',
      allergySignal: 'Cannot perform without constant feedback',
    },
    communion: {
      description: 'Explain analogical reasoning strategy to NPC',
      task: {
        id: 'cog-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain analogy-solving strategy to NPC learner',
        parameters: { prompt: 'How do you figure out what comes next in the pattern?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Articulates reasoning process clearly',
      addictionSignal: 'Hoards strategy, refuses to teach',
      allergySignal: 'Cannot articulate own thinking',
    },
    eros: {
      description: 'Attempt n=4 (above current level)',
      task: {
        id: 'cog-ora-probe-eros',
        type: 'n_back',
        description: 'N-back at n=4 above current assessed level',
        parameters: { n: 4, trials: 8, stimulusDurationMs: 900, interStimulusMs: 300 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward higher complexity with curiosity',
      addictionSignal: 'Compulsive performance, cannot rest at current level',
      allergySignal: 'Refuses growth, treats challenge as threatening',
    },
    agape: {
      description: 'Return to n=2 with full engagement',
      task: {
        id: 'cog-ora-probe-agape',
        type: 'n_back',
        description: 'Return to n=2 with full presence',
        parameters: { n: 2, trials: 6, stimulusDurationMs: 1100, interStimulusMs: 400 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simpler task with care',
      addictionSignal: 'Refuses below-level tasks entirely',
      allergySignal: 'Cannot engage even at comfortable level',
    },
  },
};
