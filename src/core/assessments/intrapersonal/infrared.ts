import type { StageAssessment } from '../types.js';

export const intrapersonalInfrared: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Infrared',
  tasks: [
    {
      id: 'intra-ir-basic',
      type: 'self_report',
      description: 'Pre-self minimal response check: any self-reference',
      parameters: { prompts: ['Are you here?'], responseType: 'single-word' },
      measures: ['accuracy'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.3,
      coherence: 0.2,
      self_correction: 0.2,
    },
  },
  minimumTrials: 2,
  estimatedDurationMs: 45000,
  driveProbes: {
    agency: {
      description: 'Respond from self without prompt repetition',
      task: {
        id: 'intra-ir-probe-agency',
        type: 'self_report',
        description: 'Minimal self-response without repetition',
        parameters: { prompts: ['Are you here?'], responseType: 'single-word', soloMode: true },
        measures: ['accuracy'],
      },
      healthyResponse: 'Responds from own sense of presence',
      addictionSignal: 'Responds aggressively to assert existence',
      allergySignal: 'Cannot affirm own presence',
    },
    communion: {
      description: 'Acknowledge NPC asking about you',
      task: {
        id: 'intra-ir-probe-communion',
        type: 'llm_dialogue',
        description: 'Respond to NPC asking if you are present',
        parameters: { prompt: 'Are you there?', maxResponseLength: 50 },
        measures: ['depth'],
      },
      healthyResponse: 'Acknowledges self in relation to other',
      addictionSignal: 'Loses self in response to other',
      allergySignal: 'Cannot respond to relational inquiry',
    },
    eros: {
      description: 'Attempt to say more than single word',
      task: {
        id: 'intra-ir-probe-eros',
        type: 'self_report',
        description: 'Attempt to express more about self',
        parameters: { prompts: ['What is it like to be you?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Reaches toward self-expression with curiosity',
      addictionSignal: 'Overwhelmed by self-complexity',
      allergySignal: 'Refuses to elaborate on self',
    },
    agape: {
      description: 'Simple presence affirmation with care',
      task: {
        id: 'intra-ir-probe-agape',
        type: 'self_report',
        description: 'Simple affirmation of own presence',
        parameters: { prompts: ['You are here.'], responseType: 'single-word' },
        measures: ['accuracy'],
      },
      healthyResponse: 'Accepts simple presence with ease',
      addictionSignal: 'Demands more complexity',
      allergySignal: 'Cannot affirm even basic presence',
    },
  },
};
