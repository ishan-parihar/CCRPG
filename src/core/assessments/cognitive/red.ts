import type { StageAssessment } from '../types.js';

export const cognitiveRed: StageAssessment = {
  line: 'Cognitive',
  stage: 'Red',
  tasks: [
    {
      id: 'cog-red-nback2',
      type: 'n_back',
      description: 'Hold 2 items in working memory and identify matches',
      parameters: { n: 2, trials: 12, stimulusDurationMs: 1100, interStimulusMs: 350 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-red-planning',
      type: 'pattern_prediction',
      description: '2-step planning task (Tower of London with 3 disks)',
      parameters: { disks: 3, maxMoves: 2, attempts: 4 },
      measures: ['accuracy', 'complexity_handled', 'self_correction'],
    },
    {
      id: 'cog-red-gonogo',
      type: 'go_no_go',
      description: 'Go/No-Go inhibition task',
      parameters: { goRatio: 0.7, trials: 20, stimulusDurationMs: 500 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Complete n=2 without hints',
      task: {
        id: 'cog-red-probe-agency',
        type: 'n_back',
        description: 'N-back task without help indicators',
        parameters: { n: 2, trials: 6, stimulusDurationMs: 1100, interStimulusMs: 350, hintsEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Sovereign thinking - solved independently',
      addictionSignal: 'Refuses all input, cognitive aggression',
      allergySignal: 'Cannot attempt without guarantee',
    },
    communion: {
      description: 'Explain strategy to NPC companion',
      task: {
        id: 'cog-red-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain n-back strategy to NPC companion',
        parameters: { prompt: 'Can you explain how you remember the items?', maxResponseLength: 300 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares thinking without losing approach',
      addictionSignal: 'Hoards strategy, refuses sharing',
      allergySignal: 'Adopts others strategies without understanding',
    },
    eros: {
      description: 'Attempt n=3 (above current level)',
      task: {
        id: 'cog-red-probe-eros',
        type: 'n_back',
        description: 'N-back task at n=3, above current assessed level',
        parameters: { n: 3, trials: 6, stimulusDurationMs: 1100, interStimulusMs: 350 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward complexity with curiosity',
      addictionSignal: 'Compulsive reaching, cannot rest',
      allergySignal: 'Refuses growth, treats edge as threatening',
    },
    agape: {
      description: 'Do n=1 again with full engagement',
      task: {
        id: 'cog-red-probe-agape',
        type: 'n_back',
        description: 'N-back task at n=1, below current level',
        parameters: { n: 1, trials: 6, stimulusDurationMs: 1100, interStimulusMs: 350 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to foundations without shame',
      addictionSignal: 'Refuses below-level engagement',
      allergySignal: 'Compartmentalises, cannot embody in reality',
    },
  },
};
