import type { StageAssessment } from '../types.js';

export const intrapersonalTurquoise: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'intra-tur-witness',
      type: 'scenario',
      description: 'Witness perspective: observe self from meta-position',
      parameters: { scenarioType: 'witness-self', responseType: 'text', scenarios: 3 },
      measures: ['depth', 'metacognition', 'coherence'],
    },
    {
      id: 'intra-tur-disidentify',
      type: 'llm_dialogue',
      description: 'Dis-identification: describe self without identifying with content',
      parameters: { prompt: 'Who are you when you are not your thoughts, roles, or feelings?', maxResponseLength: 600 },
      measures: ['depth', 'metacognition', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.3,
      coherence: 0.2,
      self_correction: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 270000,
  driveProbes: {
    agency: {
      description: 'Access witness perspective without guidance',
      task: {
        id: 'intra-tur-probe-agency',
        type: 'scenario',
        description: 'Access meta-perspective on self independently',
        parameters: { scenarioType: 'witness-self', responseType: 'text', soloMode: true },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Accesses witness perspective with own stability',
      addictionSignal: 'Dissociates, uses witness as avoidance',
      allergySignal: 'Cannot access meta-position without guidance',
    },
    communion: {
      description: 'Share witness perspective with NPC',
      task: {
        id: 'intra-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'Share what witness perspective reveals to NPC',
        parameters: { prompt: 'What do you see when you watch yourself from above?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares meta-perspective without losing ground',
      addictionSignal: 'Uses witness to avoid genuine relating',
      allergySignal: 'Cannot share inner witness with another',
    },
    eros: {
      description: 'Dis-identify from even the witness itself',
      task: {
        id: 'intra-tur-probe-eros',
        type: 'llm_dialogue',
        description: 'Who watches the watcher?',
        parameters: { prompt: 'You are watching yourself. But who is watching the watcher?', maxResponseLength: 500 },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Reaches toward recursive self-awareness',
      addictionSignal: 'Infinite regress, cannot land anywhere',
      allergySignal: 'Refuses recursive self-inquiry',
    },
    agape: {
      description: 'Return to simple self-report with presence',
      task: {
        id: 'intra-tur-probe-agape',
        type: 'self_report',
        description: 'Return to simple statement of what you are',
        parameters: { prompts: ['What are you, right now?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Returns to simple self-awareness with love',
      addictionSignal: 'Refuses simple self-report as naive',
      allergySignal: 'Cannot engage with self at any level',
    },
  },
};
