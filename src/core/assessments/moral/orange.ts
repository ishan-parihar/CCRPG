import type { StageAssessment } from '../types.js';

export const moralOrange: StageAssessment = {
  line: 'Moral',
  stage: 'Orange',
  tasks: [
    {
      id: 'mor-ora-principle-dilemma',
      type: 'dilemma',
      description: 'Principle vs law: when law conflicts with rights',
      parameters: { dilemmaType: 'principle-vs-law', choices: 3, scenarioCount: 3 },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-ora-rights-reasoning',
      type: 'llm_dialogue',
      description: 'Rights-based moral reasoning and justification',
      parameters: { prompt: 'When is it right to break a law? What principle guides you?', maxResponseLength: 600 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
    llmRubric:
      'Score for post-conventional/principled moral reasoning. At Orange, right=universal principles that may supersede rules. Depth: can they articulate the principle? Coherence: does reasoning follow from principle? Integration: do they acknowledge costs of breaking rules even when principled?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Apply moral principle against social pressure',
      task: {
        id: 'mor-ora-probe-agency',
        type: 'dilemma',
        description: 'Apply principle when group disagrees',
        parameters: { dilemmaType: 'principle-vs-group', choices: 2, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Holds principle with own conviction',
      addictionSignal: 'Applies principle without compassion for context',
      allergySignal: 'Cannot hold principle against opposition',
    },
    communion: {
      description: 'Explain principled reasoning to rule-follower',
      task: {
        id: 'mor-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain why principle matters to a rule-follower NPC',
        parameters: { prompt: 'But the rule is clear. Why would you ever break it?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Explains principle while respecting the rule-follower',
      addictionSignal: 'Dismisses rule-following as inferior',
      allergySignal: 'Abandons principle to avoid disagreement',
    },
    eros: {
      description: 'Face dilemma where principles themselves conflict',
      task: {
        id: 'mor-ora-probe-eros',
        type: 'dilemma',
        description: 'Two valid principles in direct conflict',
        parameters: { dilemmaType: 'principle-vs-principle', choices: 3, complexity: 'high' },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Engages with principle-conflict thoughtfully',
      addictionSignal: 'Paralyzed by conflicting principles',
      allergySignal: 'Refuses to admit principles can conflict',
    },
    agape: {
      description: 'Return to simple rule scenario with full engagement',
      task: {
        id: 'mor-ora-probe-agape',
        type: 'scenario',
        description: 'Return to simple moral rule with presence',
        parameters: { scenarioType: 'clear-rule', responseType: 'choice-plus-text' },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Returns to simple morality with care',
      addictionSignal: 'Refuses simple moral scenarios',
      allergySignal: 'Cannot engage with morality at any level',
    },
  },
};
