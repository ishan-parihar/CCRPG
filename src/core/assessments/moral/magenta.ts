import type { StageAssessment } from '../types.js';

export const moralMagenta: StageAssessment = {
  line: 'Moral',
  stage: 'Magenta',
  tasks: [
    {
      id: 'mor-mag-fairness',
      type: 'dilemma',
      description: 'Simple fairness: who gets the cookie when there is one left?',
      parameters: { dilemmaType: 'simple-fairness', choices: 3, scenarioCount: 3 },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
    llmRubric:
      'Score for pre-conventional magical-stage moral reasoning. At Magenta, fairness is based on immediate feelings, magical thinking, or simple desire. Depth: can they articulate any reason? Coherence: is the reason consistent with their worldview? Integration: do they acknowledge other people have wants too?',
  },
  minimumTrials: 2,
  estimatedDurationMs: 120000,
  driveProbes: {
    agency: {
      description: 'Decide who gets the cookie independently',
      task: {
        id: 'mor-mag-probe-agency',
        type: 'dilemma',
        description: 'Make fairness choice without guidance',
        parameters: { dilemmaType: 'simple-fairness', choices: 2, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Makes clear choice with basic reasoning',
      addictionSignal: 'Demands everything for self without thought',
      allergySignal: 'Cannot make choice, freezes',
    },
    communion: {
      description: 'Explain fairness choice to NPC friend',
      task: {
        id: 'mor-mag-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain why you made that fairness choice to NPC',
        parameters: { prompt: 'Why did you choose that? Was it fair?', maxResponseLength: 200 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares reasoning without losing own position',
      addictionSignal: 'Changes answer to please the other',
      allergySignal: 'Refuses to explain reasoning',
    },
    eros: {
      description: 'Consider a harder fairness scenario with three people',
      task: {
        id: 'mor-mag-probe-eros',
        type: 'dilemma',
        description: 'Fairness scenario with three stakeholders',
        parameters: { dilemmaType: 'three-way-fairness', choices: 3 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Engages with more complex fairness question',
      addictionSignal: 'Overwhelmed but cannot stop engaging',
      allergySignal: 'Refuses complexity, only deals with simple cases',
    },
    agape: {
      description: 'Return to simple two-person sharing with care',
      task: {
        id: 'mor-mag-probe-agape',
        type: 'dilemma',
        description: 'Return to simplest fairness scenario',
        parameters: { dilemmaType: 'simple-fairness', choices: 2 },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to simple fairness with full engagement',
      addictionSignal: 'Refuses simple scenario as too easy',
      allergySignal: 'Cannot engage with fairness at any level',
    },
  },
};
