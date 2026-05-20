import type { StageAssessment } from '../types.js';

export const emotionalRed: StageAssessment = {
  line: 'Emotional',
  stage: 'Red',
  tasks: [
    {
      id: 'emo-red-self-other',
      type: 'emotion_identification',
      description: 'Self-other emotion identification from scenarios',
      parameters: {
        stimulusType: 'scenario',
        emotionSet: ['anger', 'desire', 'excitement', 'frustration'],
        distinguishSelfOther: true,
      },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'emo-red-intensity',
      type: 'self_report',
      description: 'Rate emotion intensity on a 1-5 scale',
      parameters: { scale: 5, scenarios: 4 },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.55,
    dimensionWeights: {
      accuracy: 0.3,
      depth: 0.3,
      consistency: 0.2,
      coherence: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 150000,
  driveProbes: {
    agency: {
      description: 'Identify your own emotion without group consensus',
      task: {
        id: 'emo-red-probe-agency',
        type: 'emotion_identification',
        description: 'Identify own emotion independently without external validation',
        parameters: { stimulusType: 'scenario', distinguishSelfOther: true, soloMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Names own emotion with confidence',
      addictionSignal: 'Dismisses others emotional reality entirely',
      allergySignal: 'Cannot name emotion without checking with others',
    },
    communion: {
      description: 'Help NPC identify their emotion',
      task: {
        id: 'emo-red-probe-communion',
        type: 'llm_dialogue',
        description: 'Help an NPC character identify what they are feeling',
        parameters: { prompt: 'I feel something but I do not know what it is. Can you help?', maxResponseLength: 300 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Attunes to other without losing own emotional ground',
      addictionSignal: 'Over-merges with other, loses own feeling',
      allergySignal: 'Refuses emotional engagement with other',
    },
    eros: {
      description: 'Attempt to identify a complex/mixed emotion',
      task: {
        id: 'emo-red-probe-eros',
        type: 'emotion_identification',
        description: 'Identify a complex or mixed emotion beyond basic set',
        parameters: { stimulusType: 'scenario', emotionSet: ['bittersweet', 'ambivalence', 'awe'], distinguishSelfOther: true },
        measures: ['accuracy', 'depth'],
      },
      healthyResponse: 'Reaches toward emotional complexity with curiosity',
      addictionSignal: 'Compulsively seeks intensity, cannot tolerate calm',
      allergySignal: 'Refuses emotional complexity, stays with basics only',
    },
    agape: {
      description: 'Return to basic emotion naming with care',
      task: {
        id: 'emo-red-probe-agape',
        type: 'emotion_identification',
        description: 'Return to naming simple basic emotions with full presence',
        parameters: { stimulusType: 'scenario', emotionSet: ['happy', 'sad', 'angry', 'afraid'], distinguishSelfOther: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple naming with full engagement',
      addictionSignal: 'Refuses simple tasks as beneath them',
      allergySignal: 'Cannot engage with emotion even at simple level',
    },
  },
};
