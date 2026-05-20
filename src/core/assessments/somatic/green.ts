import type { StageAssessment } from '../types.js';

export const somaticGreen: StageAssessment = {
  line: 'Somatic',
  stage: 'Green',
  tasks: [
    {
      id: 'som-grn-freeform',
      type: 'rhythm',
      description: 'Free-form rhythm creation: create your own beat',
      parameters: { bpm: 0, beats: 32, complexity: 'freeform', expressiveness: true },
      measures: ['consistency', 'depth'],
    },
    {
      id: 'som-grn-expressive',
      type: 'self_report',
      description: 'Describe the somatic experience of your rhythm',
      parameters: { prompts: ['What did that rhythm feel like in your body?'], responseType: 'text' },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Create rhythm without any template',
      task: {
        id: 'som-grn-probe-agency',
        type: 'rhythm',
        description: 'Create free rhythm from pure internal impulse',
        parameters: { bpm: 0, beats: 16, complexity: 'freeform', templateEnabled: false },
        measures: ['consistency', 'depth'],
      },
      healthyResponse: 'Creates unique rhythm from own body',
      addictionSignal: 'Performs for audience, not from authentic impulse',
      allergySignal: 'Cannot create without template',
    },
    communion: {
      description: 'Create rhythm with NPC partner',
      task: {
        id: 'som-grn-probe-communion',
        type: 'rhythm',
        description: 'Co-create rhythm with NPC partner',
        parameters: { bpm: 0, beats: 16, complexity: 'freeform', partnerMode: true },
        measures: ['consistency', 'accuracy'],
      },
      healthyResponse: 'Co-creates while maintaining own expression',
      addictionSignal: 'Loses own expression to merge with other',
      allergySignal: 'Cannot create with another person',
    },
    eros: {
      description: 'Attempt to express a specific emotion through rhythm',
      task: {
        id: 'som-grn-probe-eros',
        type: 'rhythm',
        description: 'Express specific emotion through rhythmic movement',
        parameters: { bpm: 0, beats: 16, complexity: 'expressive', emotionTarget: 'joy' },
        measures: ['depth', 'consistency'],
      },
      healthyResponse: 'Reaches toward somatic-emotional integration',
      addictionSignal: 'Forces emotion into body without authenticity',
      allergySignal: 'Refuses to connect emotion and body',
    },
    agape: {
      description: 'Return to simple steady beat with body presence',
      task: {
        id: 'som-grn-probe-agape',
        type: 'rhythm',
        description: 'Return to simple steady beat with full presence',
        parameters: { bpm: 80, beats: 12, complexity: 'simple' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simplicity with full body engagement',
      addictionSignal: 'Refuses simple rhythm as uncreative',
      allergySignal: 'Cannot engage body at basic level',
    },
  },
};
