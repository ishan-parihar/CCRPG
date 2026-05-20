import type { StageAssessment } from '../types.js';

export const emotionalOrange: StageAssessment = {
  line: 'Emotional',
  stage: 'Orange',
  tasks: [
    {
      id: 'emo-ora-complex',
      type: 'emotion_identification',
      description: 'Identify mixed and complex emotions from scenarios',
      parameters: {
        stimulusType: 'scenario',
        emotionSet: ['bittersweet', 'ambivalence', 'contempt', 'awe', 'nostalgia'],
        trials: 8,
      },
      measures: ['accuracy', 'response_time', 'depth'],
    },
    {
      id: 'emo-ora-regulation',
      type: 'scenario',
      description: 'Choose appropriate emotion regulation strategy',
      parameters: { scenarioType: 'regulation-strategy', strategies: ['reappraisal', 'suppression', 'expression', 'acceptance'], scenarios: 4 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.2,
      depth: 0.3,
      consistency: 0.2,
      integration: 0.3,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Choose regulation strategy without guidance',
      task: {
        id: 'emo-ora-probe-agency',
        type: 'scenario',
        description: 'Choose emotion regulation strategy independently',
        parameters: { scenarioType: 'regulation-strategy', strategies: ['reappraisal', 'acceptance'], soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Selects strategy with rational confidence',
      addictionSignal: 'Over-regulates, suppresses all emotion',
      allergySignal: 'Cannot choose strategy without external guidance',
    },
    communion: {
      description: 'Help NPC choose regulation strategy',
      task: {
        id: 'emo-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC select an emotion regulation strategy',
        parameters: { prompt: 'I feel overwhelmed. What should I do with this feeling?', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Guides without imposing, shares knowledge',
      addictionSignal: 'Imposes strategy without listening',
      allergySignal: 'Cannot help others with emotions at all',
    },
    eros: {
      description: 'Face situation requiring novel regulation',
      task: {
        id: 'emo-ora-probe-eros',
        type: 'scenario',
        description: 'Face novel emotional situation requiring creative regulation',
        parameters: { scenarioType: 'novel-emotion', responseType: 'text' },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Creates new regulatory approach with curiosity',
      addictionSignal: 'Compulsively seeks novel emotional experiences',
      allergySignal: 'Refuses unfamiliar emotional territory',
    },
    agape: {
      description: 'Return to basic emotion naming with presence',
      task: {
        id: 'emo-ora-probe-agape',
        type: 'emotion_identification',
        description: 'Return to naming basic emotions with full presence',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry', 'afraid'], trials: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple naming with grace',
      addictionSignal: 'Refuses simple tasks as beneath them',
      allergySignal: 'Cannot engage with emotion at basic level',
    },
  },
};
