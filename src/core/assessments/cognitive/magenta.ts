import type { StageAssessment } from '../types.js';

export const cognitiveMagenta: StageAssessment = {
  line: 'Cognitive',
  stage: 'Magenta',
  tasks: [
    {
      id: 'cog-mag-nback1',
      type: 'n_back',
      description: 'N=1 n-back: identify immediate repeat',
      parameters: { n: 1, trials: 10, stimulusDurationMs: 1500, interStimulusMs: 500 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-mag-pattern',
      type: 'pattern_prediction',
      description: 'Simple pattern completion: A-B-A-?',
      parameters: { patternLength: 3, patternType: 'alternating', trials: 6 },
      measures: ['accuracy', 'complexity_handled'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 120000,
  driveProbes: {
    agency: {
      description: 'Complete n=1 without hints or prompts',
      task: {
        id: 'cog-mag-probe-agency',
        type: 'n_back',
        description: 'N-back n=1 without hints',
        parameters: { n: 1, trials: 5, stimulusDurationMs: 1500, interStimulusMs: 500, hintsEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Engages independently with simple memory task',
      addictionSignal: 'Refuses any assistance or connection',
      allergySignal: 'Cannot attempt without guarantee of success',
    },
    communion: {
      description: 'Explain pattern to NPC friend',
      task: {
        id: 'cog-mag-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain A-B-A pattern to an NPC friend',
        parameters: { prompt: 'What comes next in the pattern?', maxResponseLength: 200 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares thinking with simple language',
      addictionSignal: 'Cannot hold own understanding while sharing',
      allergySignal: 'Refuses to share or explain',
    },
    eros: {
      description: 'Attempt a longer pattern (A-B-C-A-B-?)',
      task: {
        id: 'cog-mag-probe-eros',
        type: 'pattern_prediction',
        description: 'Attempt longer three-element repeating pattern',
        parameters: { patternLength: 5, patternType: 'repeating', trials: 4 },
        measures: ['accuracy', 'complexity_handled'],
      },
      healthyResponse: 'Reaches toward harder pattern with curiosity',
      addictionSignal: 'Compulsively seeks harder patterns',
      allergySignal: 'Refuses to try beyond simple alternation',
    },
    agape: {
      description: 'Return to simplest A-B-A with full engagement',
      task: {
        id: 'cog-mag-probe-agape',
        type: 'pattern_prediction',
        description: 'Return to simplest alternating pattern',
        parameters: { patternLength: 3, patternType: 'alternating', trials: 3 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple pattern with care and attention',
      addictionSignal: 'Refuses simple patterns as beneath them',
      allergySignal: 'Cannot engage with patterns at all',
    },
  },
};
