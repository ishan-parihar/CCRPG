import type { StageAssessment } from '../types.js';

export const intrapersonalMagenta: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Magenta',
  tasks: [
    {
      id: 'intra-mag-want',
      type: 'self_report',
      description: 'What do you want right now? Single word response',
      parameters: { prompts: ['What do you want right now?'], responseType: 'single-word' },
      measures: ['depth', 'coherence'],
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
  minimumTrials: 2,
  estimatedDurationMs: 60000,
  driveProbes: {
    agency: {
      description: 'State desire without prompt repetition',
      task: {
        id: 'intra-mag-probe-agency',
        type: 'self_report',
        description: 'State what you want without external repetition',
        parameters: { prompts: ['What do you want?'], responseType: 'single-word', soloMode: true },
        measures: ['depth'],
      },
      healthyResponse: 'States want clearly from own impulse',
      addictionSignal: 'Demands with aggression',
      allergySignal: 'Cannot identify own want',
    },
    communion: {
      description: 'Tell NPC what you want',
      task: {
        id: 'intra-mag-probe-communion',
        type: 'llm_dialogue',
        description: 'Tell NPC friend what you want right now',
        parameters: { prompt: 'What do you want right now? You can tell me.', maxResponseLength: 100 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares desire without losing it in the sharing',
      addictionSignal: 'Adopts others wants as own',
      allergySignal: 'Cannot share desire with another',
    },
    eros: {
      description: 'Attempt to say what you want AND why',
      task: {
        id: 'intra-mag-probe-eros',
        type: 'self_report',
        description: 'State want and attempt to say why',
        parameters: { prompts: ['What do you want and why?'], responseType: 'text' },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Reaches toward understanding own desire',
      addictionSignal: 'Over-analyzes simple want',
      allergySignal: 'Refuses to explore why',
    },
    agape: {
      description: 'Simply notice what you want without judgment',
      task: {
        id: 'intra-mag-probe-agape',
        type: 'self_report',
        description: 'Notice desire without judging it',
        parameters: { prompts: ['What do you want? It is okay.'], responseType: 'single-word' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Accepts own desire with ease',
      addictionSignal: 'Demands more complexity',
      allergySignal: 'Cannot acknowledge desire at all',
    },
  },
};
