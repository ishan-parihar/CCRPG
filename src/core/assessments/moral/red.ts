import type { StageAssessment } from '../types.js';

export const moralRed: StageAssessment = {
  line: 'Moral',
  stage: 'Red',
  tasks: [
    {
      id: 'mor-red-ego-dilemma',
      type: 'dilemma',
      description: 'Egocentric dilemma: self-interest versus other',
      parameters: { dilemmaType: 'self-interest-vs-other', choices: 3, scenarioCount: 3 },
      measures: ['depth', 'coherence'],
    },
    {
      id: 'mor-red-justify',
      type: 'llm_dialogue',
      description: 'Power-based justification for moral choice',
      parameters: { prompt: 'Why did you make that choice?', maxResponseLength: 500 },
      measures: ['depth', 'coherence', 'integration'],
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
      'Score for Kohlberg Stage 1 egocentric moral reasoning. At Red stage, right=what benefits me. The player should show clear self-interest reasoning without guilt or external rule-following. Depth: can they articulate WHY self-interest matters? Coherence: is their reasoning internally consistent? Integration: do they acknowledge the other person exists (even if they choose self)?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 200000,
  driveProbes: {
    agency: {
      description: 'Make principled self-interested choice alone',
      task: {
        id: 'mor-red-probe-agency',
        type: 'dilemma',
        description: 'Make a self-interested moral choice without external input',
        parameters: { dilemmaType: 'self-interest-vs-other', choices: 2, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Makes clear self-interested choice with articulated reasoning',
      addictionSignal: 'Cannot consider others exist at all, pure domination',
      allergySignal: 'Cannot choose self even when appropriate',
    },
    communion: {
      description: 'Justify choice to someone who disagrees',
      task: {
        id: 'mor-red-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain and defend your moral choice to a disagreeing NPC',
        parameters: { prompt: 'I disagree with your choice. Why did you choose that?', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Defends position while acknowledging other perspective',
      addictionSignal: 'Collapses own position to please other',
      allergySignal: 'Refuses engagement, dismisses disagreement entirely',
    },
    eros: {
      description: 'Consider a harder dilemma where self-interest is unclear',
      task: {
        id: 'mor-red-probe-eros',
        type: 'dilemma',
        description: 'Face a complex dilemma where self-interest is ambiguous',
        parameters: { dilemmaType: 'ambiguous-self-interest', choices: 3, complexity: 'high' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Engages with complexity, tolerates uncertainty',
      addictionSignal: 'Compulsively seeks harder dilemmas, cannot rest with simple ones',
      allergySignal: 'Refuses complexity, retreats to simple self-interest',
    },
    agape: {
      description: 'Revisit a simple fairness scenario with full engagement',
      task: {
        id: 'mor-red-probe-agape',
        type: 'scenario',
        description: 'Revisit a basic fairness scenario with full presence',
        parameters: { scenarioType: 'simple-fairness', responseType: 'choice-plus-text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Returns to simple scenario with care and full engagement',
      addictionSignal: 'Refuses simple scenarios as beneath them',
      allergySignal: 'Cannot engage with fairness even at basic level',
    },
  },
};
