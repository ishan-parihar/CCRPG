import type { StageAssessment } from '../types.js';

export const willpowerOrange: StageAssessment = {
  line: 'Willpower',
  stage: 'Orange',
  tasks: [
    {
      id: 'will-ora-strategic',
      type: 'hold',
      description: 'Strategic effort allocation: choose when to exert and when to rest',
      parameters: { targetDurationMs: 8000, perturbations: true, perturbationIntervalMs: 1500, strategicRest: true, trials: 4 },
      measures: ['accuracy', 'consistency', 'complexity_handled'],
    },
    {
      id: 'will-ora-timing',
      type: 'scenario',
      description: 'Choose optimal moment to exert effort in scenario',
      parameters: { scenarioType: 'effort-timing', choices: 4, scenarios: 3 },
      measures: ['accuracy', 'response_time', 'transfer'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Choose effort allocation strategy independently',
      task: {
        id: 'will-ora-probe-agency',
        type: 'hold',
        description: 'Strategic hold without external guidance',
        parameters: { targetDurationMs: 8000, perturbations: true, strategicRest: true, guidanceEnabled: false },
        measures: ['accuracy', 'complexity_handled'],
      },
      healthyResponse: 'Allocates effort with strategic independence',
      addictionSignal: 'Always exerts maximally, cannot rest strategically',
      allergySignal: 'Cannot choose when to exert without guidance',
    },
    communion: {
      description: 'Coordinate effort timing with NPC partner',
      task: {
        id: 'will-ora-probe-communion',
        type: 'hold',
        description: 'Coordinate effort timing with partner',
        parameters: { targetDurationMs: 6000, strategicRest: true, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates effort with other while maintaining own strategy',
      addictionSignal: 'Loses own strategy to match partner',
      allergySignal: 'Cannot coordinate effort with another',
    },
    eros: {
      description: 'Attempt more complex multi-phase effort allocation',
      task: {
        id: 'will-ora-probe-eros',
        type: 'hold',
        description: 'Complex multi-phase effort with varying demands',
        parameters: { targetDurationMs: 12000, perturbations: true, perturbationIntervalMs: 1000, phases: 3 },
        measures: ['accuracy', 'consistency', 'complexity_handled'],
      },
      healthyResponse: 'Reaches toward complex effort with willingness',
      addictionSignal: 'Compulsively takes on more, cannot limit',
      allergySignal: 'Refuses complex effort demands',
    },
    agape: {
      description: 'Simple hold with no strategy needed',
      task: {
        id: 'will-ora-probe-agape',
        type: 'hold',
        description: 'Simple hold without strategic demands',
        parameters: { targetDurationMs: 4000, perturbations: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple effort with ease',
      addictionSignal: 'Refuses simple effort as too easy',
      allergySignal: 'Cannot engage will at basic level',
    },
  },
};
