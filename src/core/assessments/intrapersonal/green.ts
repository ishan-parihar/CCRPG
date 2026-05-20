import type { StageAssessment } from '../types.js';

export const intrapersonalGreen: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Green',
  tasks: [
    {
      id: 'intra-grn-contradictions',
      type: 'self_report',
      description: 'Internal contradictions: identify conflicting parts of self',
      parameters: { prompts: ['What parts of you disagree with each other?', 'Where do you contradict yourself?'], responseType: 'text' },
      measures: ['depth', 'metacognition', 'coherence'],
    },
    {
      id: 'intra-grn-parts',
      type: 'llm_dialogue',
      description: 'Parts language: dialogue between conflicting internal parts',
      parameters: { prompt: 'Imagine the part of you that wants X talking to the part that wants Y. What do they say?', maxResponseLength: 600 },
      measures: ['depth', 'metacognition', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.3,
      coherence: 0.2,
      self_correction: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Name internal contradiction without external validation',
      task: {
        id: 'intra-grn-probe-agency',
        type: 'self_report',
        description: 'Name internal contradiction independently',
        parameters: { prompts: ['What in you disagrees with itself?'], responseType: 'text', soloMode: true },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Names contradiction with stability',
      addictionSignal: 'Fragments self endlessly, no integration',
      allergySignal: 'Cannot see any internal contradiction',
    },
    communion: {
      description: 'Share internal conflict with trusted NPC',
      task: {
        id: 'intra-grn-probe-communion',
        type: 'llm_dialogue',
        description: 'Share internal conflict with trusted NPC',
        parameters: { prompt: 'I want to understand you better. What inside you is in conflict?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares internal life without losing integrity',
      addictionSignal: 'Over-shares, loses boundaries',
      allergySignal: 'Refuses to share inner conflict',
    },
    eros: {
      description: 'Attempt to integrate two conflicting parts',
      task: {
        id: 'intra-grn-probe-eros',
        type: 'llm_dialogue',
        description: 'Attempt integration between conflicting parts',
        parameters: { prompt: 'Can these two parts find common ground? What do they both want?', maxResponseLength: 500 },
        measures: ['depth', 'metacognition', 'integration'],
      },
      healthyResponse: 'Reaches toward integration with honesty',
      addictionSignal: 'Forces premature integration',
      allergySignal: 'Refuses to attempt integration',
    },
    agape: {
      description: 'Accept all parts without needing to fix them',
      task: {
        id: 'intra-grn-probe-agape',
        type: 'self_report',
        description: 'Accept all internal parts as they are',
        parameters: { prompts: ['Can you accept all parts of yourself right now, as they are?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Accepts internal multiplicity with compassion',
      addictionSignal: 'Demands integration, cannot accept disorder',
      allergySignal: 'Cannot acknowledge parts at all',
    },
  },
};
