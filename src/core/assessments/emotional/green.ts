import type { StageAssessment } from '../types.js';

export const emotionalGreen: StageAssessment = {
  line: 'Emotional',
  stage: 'Green',
  tasks: [
    {
      id: 'emo-grn-contradictory',
      type: 'emotion_identification',
      description: 'Identify contradictory emotions held simultaneously',
      parameters: {
        stimulusType: 'scenario',
        emotionSet: ['love-and-anger', 'grief-and-gratitude', 'fear-and-excitement'],
        contradictory: true,
        trials: 6,
      },
      measures: ['accuracy', 'depth', 'integration'],
    },
    {
      id: 'emo-grn-outgroup-empathy',
      type: 'llm_dialogue',
      description: 'Empathy for outgroup member with different values',
      parameters: { prompt: 'This person has values very different from yours. What might they be feeling and why?', maxResponseLength: 500 },
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
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Hold contradictory emotions without resolving prematurely',
      task: {
        id: 'emo-grn-probe-agency',
        type: 'emotion_identification',
        description: 'Hold contradictory emotions independently',
        parameters: { stimulusType: 'scenario', emotionSet: ['love-and-anger'], contradictory: true, soloMode: true },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Holds emotional complexity with stability',
      addictionSignal: 'Seeks emotional intensity compulsively',
      allergySignal: 'Cannot tolerate contradictory feelings',
    },
    communion: {
      description: 'Help NPC hold contradictory feelings',
      task: {
        id: 'emo-grn-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC who feels love and anger simultaneously',
        parameters: { prompt: 'I love them AND I am angry at them. Is that okay?', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Validates both emotions without rushing to fix',
      addictionSignal: 'Over-empathizes, loses own emotional ground',
      allergySignal: 'Dismisses complexity, forces single emotion',
    },
    eros: {
      description: 'Empathize with someone whose values oppose yours',
      task: {
        id: 'emo-grn-probe-eros',
        type: 'llm_dialogue',
        description: 'Find genuine empathy for someone with opposing values',
        parameters: { prompt: 'This person believes the opposite of everything you value. What might they feel?', maxResponseLength: 400 },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Extends empathy across value difference',
      addictionSignal: 'Compulsively empathizes, cannot hold boundaries',
      allergySignal: 'Refuses empathy for those who differ',
    },
    agape: {
      description: 'Return to simple emotion naming with warmth',
      task: {
        id: 'emo-grn-probe-agape',
        type: 'emotion_identification',
        description: 'Return to basic emotion naming with presence',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry'], trials: 4 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simplicity with grace',
      addictionSignal: 'Refuses simple emotion as insufficient',
      allergySignal: 'Cannot engage with emotion at any level',
    },
  },
};
