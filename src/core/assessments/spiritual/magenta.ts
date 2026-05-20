import type { StageAssessment } from '../types.js';

export const spiritualMagenta: StageAssessment = {
  line: 'Spiritual',
  stage: 'Magenta',
  tasks: [
    {
      id: 'spir-mag-magical',
      type: 'scenario',
      description: 'Magical faith belief structure: what happens when you wish?',
      parameters: { scenarioType: 'magical-wish', responseType: 'text', trials: 3 },
      measures: ['coherence', 'depth'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      coherence: 0.4,
      depth: 0.3,
      consistency: 0.3,
    },
    llmRubric:
      'Score for magical/animistic spiritual reasoning. At Magenta, the world is enchanted - wishes come true, spirits are real, rituals work. Coherence: is their magical worldview internally consistent? Depth: how rich is their mythic imagination? Consistency: do they hold the same beliefs across questions?',
  },
  minimumTrials: 2,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'State magical belief without needing agreement',
      task: {
        id: 'spir-mag-probe-agency',
        type: 'scenario',
        description: 'State what you believe happens when you wish',
        parameters: { scenarioType: 'magical-wish', responseType: 'text', soloMode: true },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Holds magical belief with own conviction',
      addictionSignal: 'Imposes belief on others aggressively',
      allergySignal: 'Cannot hold any belief without permission',
    },
    communion: {
      description: 'Share magical belief with NPC',
      task: {
        id: 'spir-mag-probe-communion',
        type: 'llm_dialogue',
        description: 'Share what you believe about wishes with NPC',
        parameters: { prompt: 'Do you believe in magic? Tell me about it.', maxResponseLength: 200 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares belief without needing agreement',
      addictionSignal: 'Loses own belief to match other',
      allergySignal: 'Refuses to share inner world',
    },
    eros: {
      description: 'Consider what happens when wishes do not come true',
      task: {
        id: 'spir-mag-probe-eros',
        type: 'scenario',
        description: 'Face scenario where a wish does not come true',
        parameters: { scenarioType: 'wish-failure', responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Engages with challenge to magical thinking',
      addictionSignal: 'Compulsively questions everything',
      allergySignal: 'Refuses to acknowledge wish can fail',
    },
    agape: {
      description: 'Return to simplest magical feeling with presence',
      task: {
        id: 'spir-mag-probe-agape',
        type: 'scenario',
        description: 'Return to simple wonder and magical feeling',
        parameters: { scenarioType: 'magical-wonder', responseType: 'single-word' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to wonder with ease and openness',
      addictionSignal: 'Demands more complexity from wonder',
      allergySignal: 'Cannot engage with wonder at all',
    },
  },
};
