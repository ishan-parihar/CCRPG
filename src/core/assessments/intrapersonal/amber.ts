import type { StageAssessment } from '../types.js';

export const intrapersonalAmber: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Amber',
  tasks: [
    {
      id: 'intra-amb-role-identity',
      type: 'self_report',
      description: 'Role-based identity: who are you in your group/role?',
      parameters: { prompts: ['Who are you in your group?', 'What role do you play?'], responseType: 'text' },
      measures: ['depth', 'coherence', 'metacognition'],
    },
    {
      id: 'intra-amb-predict-self',
      type: 'scenario',
      description: 'Predict own behaviour in a rule-following situation',
      parameters: { scenarioType: 'predict-own-behaviour', scenarios: 3, responseType: 'choice-plus-text' },
      measures: ['metacognition', 'coherence', 'self_correction'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
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
      description: 'Define your role without needing group validation',
      task: {
        id: 'intra-amb-probe-agency',
        type: 'self_report',
        description: 'State your role identity without group validation',
        parameters: { prompts: ['What is your role?'], responseType: 'text', soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Defines role with own conviction',
      addictionSignal: 'Defines self only through rigid role',
      allergySignal: 'Cannot define any role without group telling them',
    },
    communion: {
      description: 'Describe your role to someone outside your group',
      task: {
        id: 'intra-amb-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain your role to an outsider NPC',
        parameters: { prompt: 'What is your role and why does it matter?', maxResponseLength: 300 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares role identity without losing it',
      addictionSignal: 'Role changes to please the outsider',
      allergySignal: 'Refuses to share role with outsider',
    },
    eros: {
      description: 'Imagine having a different role',
      task: {
        id: 'intra-amb-probe-eros',
        type: 'self_report',
        description: 'Imagine yourself in a different role',
        parameters: { prompts: ['What if you had a completely different role?'], responseType: 'text' },
        measures: ['depth', 'metacognition'],
      },
      healthyResponse: 'Considers different role with curiosity',
      addictionSignal: 'Compulsively reinvents self, no stable identity',
      allergySignal: 'Refuses to consider any other role',
    },
    agape: {
      description: 'Accept current role as it is, with presence',
      task: {
        id: 'intra-amb-probe-agape',
        type: 'self_report',
        description: 'Accept and describe current role without changing it',
        parameters: { prompts: ['Describe your role exactly as it is.'], responseType: 'text' },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Accepts current role with presence',
      addictionSignal: 'Demands role be more impressive',
      allergySignal: 'Cannot engage with role concept at all',
    },
  },
};
