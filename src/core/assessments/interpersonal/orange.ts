import type { StageAssessment } from '../types.js';

export const interpersonalOrange: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Orange',
  tasks: [
    {
      id: 'inter-ora-false-belief',
      type: 'scenario',
      description: 'False-belief/theory of mind: predict NPC based on their (wrong) beliefs',
      parameters: { scenarioType: 'false-belief', scenarios: 4, responseType: 'choice-plus-text' },
      measures: ['accuracy', 'depth', 'transfer'],
    },
    {
      id: 'inter-ora-tom-predict',
      type: 'pattern_prediction',
      description: 'Predict NPC behaviour based on their mental state',
      parameters: { patternType: 'mental-state', patternLength: 4, repetitions: 3 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.2,
      depth: 0.3,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Predict NPC false belief without feedback',
      task: {
        id: 'inter-ora-probe-agency',
        type: 'scenario',
        description: 'Predict NPC action from false belief independently',
        parameters: { scenarioType: 'false-belief', soloMode: true },
        measures: ['accuracy', 'depth'],
      },
      healthyResponse: 'Models others mental states independently',
      addictionSignal: 'Manipulates based on knowledge of others beliefs',
      allergySignal: 'Cannot model others beliefs without confirmation',
    },
    communion: {
      description: 'Help NPC understand what another NPC believes',
      task: {
        id: 'inter-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC understand another persons perspective',
        parameters: { prompt: 'Why did they do that? It makes no sense to me.', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Explains others perspective with clarity and care',
      addictionSignal: 'Uses understanding to manipulate',
      allergySignal: 'Cannot explain others perspective',
    },
    eros: {
      description: 'Predict NPC with second-order false belief',
      task: {
        id: 'inter-ora-probe-eros',
        type: 'scenario',
        description: 'Second-order false belief: what does A think B thinks?',
        parameters: { scenarioType: 'second-order-false-belief', responseType: 'choice-plus-text' },
        measures: ['accuracy', 'depth', 'transfer'],
      },
      healthyResponse: 'Reaches toward recursive mental modeling',
      addictionSignal: 'Compulsively models, cannot simply relate',
      allergySignal: 'Refuses recursive perspective-taking',
    },
    agape: {
      description: 'Return to simple NPC pattern prediction',
      task: {
        id: 'inter-ora-probe-agape',
        type: 'pattern_prediction',
        description: 'Return to simple repeating NPC pattern',
        parameters: { patternLength: 3, patternType: 'simple-repeating', repetitions: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple observation with full attention',
      addictionSignal: 'Refuses simple tasks as beneath them',
      allergySignal: 'Cannot attend to others at all',
    },
  },
};
