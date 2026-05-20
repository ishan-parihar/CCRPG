import type { StageAssessment } from '../types.js';

export const spiritualInfrared: StageAssessment = {
  line: 'Spiritual',
  stage: 'Infrared',
  tasks: [
    {
      id: 'spir-ir-basic',
      type: 'scenario',
      description: 'Pre-spiritual minimal baseline: respond to wonder stimulus',
      parameters: { scenarioType: 'wonder-stimulus', responseType: 'single-word', trials: 2 },
      measures: ['coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
  },
  minimumTrials: 2,
  estimatedDurationMs: 45000,
  driveProbes: {
    agency: {
      description: 'Respond to wonder from own impulse',
      task: {
        id: 'spir-ir-probe-agency',
        type: 'scenario',
        description: 'Respond to wonder stimulus independently',
        parameters: { scenarioType: 'wonder-stimulus', responseType: 'single-word', soloMode: true },
        measures: ['coherence'],
      },
      healthyResponse: 'Responds to wonder with own impulse',
      addictionSignal: 'Dominates wonder with assertion',
      allergySignal: 'Cannot respond to wonder at all',
    },
    communion: {
      description: 'Share wonder response with NPC',
      task: {
        id: 'spir-ir-probe-communion',
        type: 'llm_dialogue',
        description: 'Share response to wonder with NPC',
        parameters: { prompt: 'What do you notice?', maxResponseLength: 50 },
        measures: ['depth'],
      },
      healthyResponse: 'Shares perception without losing it',
      addictionSignal: 'Cannot hold wonder alone',
      allergySignal: 'Refuses to share inner experience',
    },
    eros: {
      description: 'Attempt to say why wonder matters',
      task: {
        id: 'spir-ir-probe-eros',
        type: 'scenario',
        description: 'Attempt to articulate why wonder matters',
        parameters: { scenarioType: 'wonder-why', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Reaches toward meaning with curiosity',
      addictionSignal: 'Compulsively seeks meaning in everything',
      allergySignal: 'Refuses to engage with meaning',
    },
    agape: {
      description: 'Return to simple noticing with presence',
      task: {
        id: 'spir-ir-probe-agape',
        type: 'scenario',
        description: 'Return to simple noticing without analysis',
        parameters: { scenarioType: 'wonder-stimulus', responseType: 'single-word' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to simple noticing with ease',
      addictionSignal: 'Demands deeper meaning from simple stimulus',
      allergySignal: 'Cannot notice even at basic level',
    },
  },
};
