import type { StageAssessment } from '../types.js';

export const emotionalTurquoise: StageAssessment = {
  line: 'Emotional',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'emo-tur-signal',
      type: 'scenario',
      description: 'Emotion-as-signal: read emotional information without reactivity',
      parameters: { scenarioType: 'emotion-as-signal', scenarios: 4, responseType: 'text', intensityLevel: 'high' },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'emo-tur-non-reactive',
      type: 'llm_dialogue',
      description: 'Non-reactivity: acknowledge emotion without being driven by it',
      parameters: { prompt: 'Something deeply unfair happened. What do you feel and what do you do with that feeling?', maxResponseLength: 500 },
      measures: ['depth', 'integration', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      accuracy: 0.2,
      depth: 0.3,
      consistency: 0.2,
      integration: 0.3,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 270000,
  driveProbes: {
    agency: {
      description: 'Read emotional signal without reactivity independently',
      task: {
        id: 'emo-tur-probe-agency',
        type: 'scenario',
        description: 'Read strong emotion as signal without being swept away',
        parameters: { scenarioType: 'emotion-as-signal', intensityLevel: 'high', soloMode: true },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Reads emotion clearly without reactivity',
      addictionSignal: 'Suppresses emotion entirely as noise',
      allergySignal: 'Overwhelmed by emotion, cannot read signal',
    },
    communion: {
      description: 'Help NPC read their emotion as signal',
      task: {
        id: 'emo-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC use their emotion as information',
        parameters: { prompt: 'I am overwhelmed by this feeling. What is it telling me?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Helps other read emotion without imposing interpretation',
      addictionSignal: 'Interprets others emotions without permission',
      allergySignal: 'Cannot engage with others emotional experience',
    },
    eros: {
      description: 'Face very high intensity emotion without reactivity',
      task: {
        id: 'emo-tur-probe-eros',
        type: 'scenario',
        description: 'Face extreme emotional intensity with non-reactivity',
        parameters: { scenarioType: 'extreme-intensity', intensityLevel: 'maximum', responseType: 'text' },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Stays present with extreme emotion without being driven',
      addictionSignal: 'Seeks extreme emotion for spiritual bypass',
      allergySignal: 'Avoids intensity, cannot stay present',
    },
    agape: {
      description: 'Return to basic emotion with gentle awareness',
      task: {
        id: 'emo-tur-probe-agape',
        type: 'emotion_identification',
        description: 'Return to basic emotion naming with gentle awareness',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad'], trials: 3 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple emotion with gentle presence',
      addictionSignal: 'Refuses simple emotion as insufficient',
      allergySignal: 'Cannot engage with emotion at all',
    },
  },
};
