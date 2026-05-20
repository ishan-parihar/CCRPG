import type { StageAssessment } from '../types.js';

export const emotionalAmber: StageAssessment = {
  line: 'Emotional',
  stage: 'Amber',
  tasks: [
    {
      id: 'emo-amb-social-emotion',
      type: 'emotion_identification',
      description: 'Identify emotions in social scenarios with norm awareness',
      parameters: {
        stimulusType: 'scenario',
        emotionSet: ['embarrassment', 'guilt', 'pride', 'shame', 'loyalty'],
        contextType: 'social-norm',
        trials: 8,
      },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'emo-amb-norm-scenario',
      type: 'scenario',
      description: 'How should you feel when breaking a social norm?',
      parameters: { scenarioType: 'norm-violation', responseType: 'choice-plus-text', scenarios: 4 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      accuracy: 0.2,
      depth: 0.3,
      consistency: 0.2,
      integration: 0.3,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Identify social emotion without group confirmation',
      task: {
        id: 'emo-amb-probe-agency',
        type: 'emotion_identification',
        description: 'Identify social emotion independently',
        parameters: { stimulusType: 'scenario', emotionSet: ['guilt', 'pride', 'shame'], soloMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Identifies social emotion with own confidence',
      addictionSignal: 'Dismisses social emotions as weakness',
      allergySignal: 'Cannot identify emotion without group consensus',
    },
    communion: {
      description: 'Help NPC understand why they feel guilty',
      task: {
        id: 'emo-amb-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC understand their social emotion',
        parameters: { prompt: 'I broke a rule and I feel bad. What is this feeling?', maxResponseLength: 300 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Attunes to social emotion without losing own ground',
      addictionSignal: 'Over-identifies with others guilt',
      allergySignal: 'Dismisses others social emotions',
    },
    eros: {
      description: 'Face a scenario with conflicting social emotions',
      task: {
        id: 'emo-amb-probe-eros',
        type: 'scenario',
        description: 'Navigate scenario producing conflicting social emotions',
        parameters: { scenarioType: 'conflicting-norms', responseType: 'text' },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Engages with emotional complexity at social level',
      addictionSignal: 'Compulsively seeks emotional intensity',
      allergySignal: 'Refuses complexity, stays with single clear emotion',
    },
    agape: {
      description: 'Return to naming simple emotions with warmth',
      task: {
        id: 'emo-amb-probe-agape',
        type: 'emotion_identification',
        description: 'Return to basic emotion naming with presence',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry'], trials: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple emotion naming with care',
      addictionSignal: 'Refuses simple tasks as beneath them',
      allergySignal: 'Cannot engage with emotion at basic level',
    },
  },
};
