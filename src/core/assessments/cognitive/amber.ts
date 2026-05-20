import type { StageAssessment } from '../types.js';

export const cognitiveAmber: StageAssessment = {
  line: 'Cognitive',
  stage: 'Amber',
  tasks: [
    {
      id: 'cog-amb-nback2',
      type: 'n_back',
      description: 'N=2 stable n-back with consistent rule application',
      parameters: { n: 2, trials: 14, stimulusDurationMs: 1000, interStimulusMs: 400 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'cog-amb-stroop',
      type: 'stroop',
      description: 'Stroop interference: name color not word',
      parameters: { trials: 16, congruentRatio: 0.5, stimulusDurationMs: 2000 },
      measures: ['accuracy', 'response_time'],
    },
    {
      id: 'cog-amb-gonogo',
      type: 'go_no_go',
      description: 'WCST low switch: maintain rule across trials',
      parameters: { goRatio: 0.75, trials: 20, stimulusDurationMs: 600, switchFrequency: 'low' },
      measures: ['accuracy', 'response_time', 'self_correction'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 5,
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Complete Stroop without timing pressure',
      task: {
        id: 'cog-amb-probe-agency',
        type: 'stroop',
        description: 'Stroop task without external timing pressure',
        parameters: { trials: 8, congruentRatio: 0.5, stimulusDurationMs: 3000, selfPaced: true },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Applies rule consistently with own pacing',
      addictionSignal: 'Rigidly applies rule, cannot flex',
      allergySignal: 'Cannot apply rule without external structure',
    },
    communion: {
      description: 'Explain rule-following strategy to NPC',
      task: {
        id: 'cog-amb-probe-communion',
        type: 'llm_dialogue',
        description: 'Explain how you follow the rule to NPC learner',
        parameters: { prompt: 'How do you know which rule to follow?', maxResponseLength: 300 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Shares strategy without losing own approach',
      addictionSignal: 'Imposes rule on other without flexibility',
      allergySignal: 'Cannot explain own process to another',
    },
    eros: {
      description: 'Attempt rule-switching at higher frequency',
      task: {
        id: 'cog-amb-probe-eros',
        type: 'go_no_go',
        description: 'Go/No-Go with higher switch frequency',
        parameters: { goRatio: 0.7, trials: 12, stimulusDurationMs: 500, switchFrequency: 'medium' },
        measures: ['accuracy', 'response_time', 'self_correction'],
      },
      healthyResponse: 'Reaches toward faster switching with curiosity',
      addictionSignal: 'Compulsively switches, cannot maintain stable rule',
      allergySignal: 'Refuses any rule change, clings to single rule',
    },
    agape: {
      description: 'Return to n=1 with full presence and rule clarity',
      task: {
        id: 'cog-amb-probe-agape',
        type: 'n_back',
        description: 'Return to n=1 n-back with full presence',
        parameters: { n: 1, trials: 6, stimulusDurationMs: 1500, interStimulusMs: 500 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple rule with care and presence',
      addictionSignal: 'Refuses simple tasks as beneath them',
      allergySignal: 'Cannot engage even at simple level',
    },
  },
};
