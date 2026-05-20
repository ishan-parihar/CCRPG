import type { StageAssessment } from '../types.js';

export const intrapersonalRed: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Red',
  tasks: [
    {
      id: 'intra-red-self-concept',
      type: 'self_report',
      description: 'Self-concept clarity: articulate strengths and desires',
      parameters: { prompts: ['What are you good at?', 'What do you want?'], responseType: 'text' },
      measures: ['depth', 'metacognition'],
    },
    {
      id: 'intra-red-needs',
      type: 'scenario',
      description: 'Needs and power identification from scenarios',
      parameters: { scenarios: 3, responseType: 'choice-plus-text' },
      measures: ['coherence', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.3,
      coherence: 0.2,
      self_correction: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 180000,
  driveProbes: {
    agency: {
      description: 'Assert what you want without external validation',
      task: {
        id: 'intra-red-probe-agency',
        type: 'self_report',
        description: 'State what you want without seeking approval',
        parameters: { prompts: ['What do you want right now?'], responseType: 'text', soloMode: true },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'States desires clearly without needing validation',
      addictionSignal: 'Defines self only through dominance over others',
      allergySignal: 'Cannot articulate wants without permission',
    },
    communion: {
      description: 'Describe yourself to another person',
      task: {
        id: 'intra-red-probe-communion',
        type: 'llm_dialogue',
        description: 'Describe who you are to an NPC who asks',
        parameters: { prompt: 'Tell me about yourself. Who are you?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares self-concept without losing it in the sharing',
      addictionSignal: 'Defines self entirely through others eyes',
      allergySignal: 'Refuses to share anything about self',
    },
    eros: {
      description: 'Imagine what you COULD become',
      task: {
        id: 'intra-red-probe-eros',
        type: 'self_report',
        description: 'Imagine a future version of yourself',
        parameters: { prompts: ['What could you become if you grew?'], responseType: 'text' },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Reaches toward future self with curiosity',
      addictionSignal: 'Compulsive self-improvement, cannot accept current self',
      allergySignal: 'Refuses to imagine growth, treats change as threat',
    },
    agape: {
      description: 'Accept what you currently are without judgment',
      task: {
        id: 'intra-red-probe-agape',
        type: 'self_report',
        description: 'Describe what you are right now without changing anything',
        parameters: { prompts: ['What are you, right now, exactly as you are?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Accepts current state with presence and care',
      addictionSignal: 'Refuses self-acceptance, demands constant improvement',
      allergySignal: 'Cannot engage with self-concept at all',
    },
  },
};
