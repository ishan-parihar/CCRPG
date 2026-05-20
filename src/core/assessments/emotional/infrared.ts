import type { StageAssessment } from '../types.js';

export const emotionalInfrared: StageAssessment = {
  line: 'Emotional',
  stage: 'Infrared',
  tasks: [
    {
      id: 'emo-ir-binary',
      type: 'emotion_identification',
      description: 'Binary emotion identification: happy or not-happy from faces',
      parameters: { stimulusType: 'face', emotionSet: ['happy', 'not-happy'], trials: 8 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      accuracy: 0.2,
      depth: 0.3,
      consistency: 0.2,
      integration: 0.3,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 60000,
  driveProbes: {
    agency: {
      description: 'Identify emotion without assistance',
      task: {
        id: 'emo-ir-probe-agency',
        type: 'emotion_identification',
        description: 'Identify happy or not-happy without help',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'not-happy'], trials: 4, soloMode: true },
        measures: ['accuracy'],
      },
      healthyResponse: 'Makes binary judgment independently',
      addictionSignal: 'Labels everything forcefully',
      allergySignal: 'Cannot make judgment without help',
    },
    communion: {
      description: 'Share what face looks like to NPC',
      task: {
        id: 'emo-ir-probe-communion',
        type: 'llm_dialogue',
        description: 'Describe what emotion a face shows to an NPC',
        parameters: { prompt: 'What do you see on this face?', maxResponseLength: 100 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares perception without losing own view',
      addictionSignal: 'Refuses to share perception',
      allergySignal: 'Only sees what others tell them to see',
    },
    eros: {
      description: 'Attempt to distinguish sad from angry',
      task: {
        id: 'emo-ir-probe-eros',
        type: 'emotion_identification',
        description: 'Attempt finer distinction between sad and angry',
        parameters: { stimulusType: 'face', emotionSet: ['sad', 'angry'], trials: 4 },
        measures: ['accuracy'],
      },
      healthyResponse: 'Reaches toward finer distinction with curiosity',
      addictionSignal: 'Overwhelmed by complexity but cannot stop',
      allergySignal: 'Refuses to try finer distinctions',
    },
    agape: {
      description: 'Return to simple happy/not-happy with care',
      task: {
        id: 'emo-ir-probe-agape',
        type: 'emotion_identification',
        description: 'Return to binary emotion with full presence',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'not-happy'], trials: 3 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple task with full engagement',
      addictionSignal: 'Refuses simple task as too easy',
      allergySignal: 'Cannot engage with emotion at all',
    },
  },
};
