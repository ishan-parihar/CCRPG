import type { StageAssessment } from '../types.js';

export const emotionalMagenta: StageAssessment = {
  line: 'Emotional',
  stage: 'Magenta',
  tasks: [
    {
      id: 'emo-mag-basic-faces',
      type: 'emotion_identification',
      description: 'Identify basic emotions from faces: happy, sad, angry, scared',
      parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry', 'scared'], trials: 8 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      accuracy: 0.2,
      depth: 0.3,
      consistency: 0.2,
      integration: 0.3,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'Identify emotion without second-guessing',
      task: {
        id: 'emo-mag-probe-agency',
        type: 'emotion_identification',
        description: 'Identify basic emotion independently',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry', 'scared'], trials: 4, soloMode: true },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Names emotion with basic confidence',
      addictionSignal: 'Labels impulsively without looking',
      allergySignal: 'Cannot name emotion without help',
    },
    communion: {
      description: 'Tell NPC what the face is feeling',
      task: {
        id: 'emo-mag-probe-communion',
        type: 'llm_dialogue',
        description: 'Tell NPC friend what emotion a face shows',
        parameters: { prompt: 'What is this person feeling?', maxResponseLength: 150 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares perception with simple language',
      addictionSignal: 'Over-explains, loses own perception',
      allergySignal: 'Refuses to share what they see',
    },
    eros: {
      description: 'Attempt to identify surprised vs scared',
      task: {
        id: 'emo-mag-probe-eros',
        type: 'emotion_identification',
        description: 'Distinguish between similar emotions: surprised vs scared',
        parameters: { stimulusType: 'face', emotionSet: ['surprised', 'scared'], trials: 4 },
        measures: ['accuracy', 'depth'],
      },
      healthyResponse: 'Reaches toward finer emotional distinction',
      addictionSignal: 'Obsesses over subtle differences',
      allergySignal: 'Refuses to try finer distinctions',
    },
    agape: {
      description: 'Return to clear happy face with full attention',
      task: {
        id: 'emo-mag-probe-agape',
        type: 'emotion_identification',
        description: 'Return to obvious happy/sad distinction',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad'], trials: 3 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple naming with warmth',
      addictionSignal: 'Refuses simple task as too easy',
      allergySignal: 'Cannot engage with emotions even at basic level',
    },
  },
};
