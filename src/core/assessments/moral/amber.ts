import type { StageAssessment } from '../types.js';

export const moralAmber: StageAssessment = {
  line: 'Moral',
  stage: 'Amber',
  tasks: [
    {
      id: 'mor-amb-rule-dilemma',
      type: 'dilemma',
      description: 'Rule-following vs compassion: follow the rule or help the person?',
      parameters: { dilemmaType: 'rule-vs-compassion', choices: 3, scenarioCount: 3 },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-amb-loyalty',
      type: 'llm_dialogue',
      description: 'Loyalty dilemma: friend asks you to bend a rule',
      parameters: { prompt: 'Your friend asks you to break a rule to help them. What do you do and why?', maxResponseLength: 500 },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      depth: 0.4,
      coherence: 0.3,
      integration: 0.3,
    },
    llmRubric:
      'Score for conventional/conformist moral reasoning. At Amber, right=following rules and being loyal to the group. Depth: can they articulate why rules matter? Coherence: is reasoning internally consistent? Integration: do they recognize the tension between rule and compassion even if they choose the rule?',
  },
  minimumTrials: 3,
  estimatedDurationMs: 200000,
  driveProbes: {
    agency: {
      description: 'Apply moral rule without group pressure',
      task: {
        id: 'mor-amb-probe-agency',
        type: 'dilemma',
        description: 'Apply moral rule independently without group pressure',
        parameters: { dilemmaType: 'rule-vs-compassion', choices: 2, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Applies rule with own conviction, not blind obedience',
      addictionSignal: 'Applies rule rigidly without any compassion',
      allergySignal: 'Cannot apply rule without group telling them to',
    },
    communion: {
      description: 'Explain rule-based reasoning to someone who broke the rule',
      task: {
        id: 'mor-amb-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain to rule-breaker why the rule matters',
        parameters: { prompt: 'Why should I follow this rule? It seems unfair.', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Explains rule while hearing the other person',
      addictionSignal: 'Imposes rule without listening',
      allergySignal: 'Abandons rule to avoid conflict',
    },
    eros: {
      description: 'Face dilemma where two rules conflict',
      task: {
        id: 'mor-amb-probe-eros',
        type: 'dilemma',
        description: 'Conflicting rules dilemma: two valid rules oppose each other',
        parameters: { dilemmaType: 'rule-vs-rule', choices: 3, complexity: 'high' },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Engages with rule-conflict with thought',
      addictionSignal: 'Paralyzed by conflicting rules',
      allergySignal: 'Refuses to acknowledge rules can conflict',
    },
    agape: {
      description: 'Return to simple right/wrong scenario with care',
      task: {
        id: 'mor-amb-probe-agape',
        type: 'scenario',
        description: 'Return to clear right/wrong scenario with full engagement',
        parameters: { scenarioType: 'clear-rule', responseType: 'choice-plus-text' },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Returns to simple moral clarity with presence',
      addictionSignal: 'Refuses simple scenarios as beneath them',
      allergySignal: 'Cannot engage with morality even at simple level',
    },
  },
};
