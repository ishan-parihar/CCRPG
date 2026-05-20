import type { StageAssessment } from '../types.js';

export const somaticTurquoise: StageAssessment = {
  line: 'Somatic',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'som-tur-anticipatory',
      type: 'reaction_time',
      description: 'Anticipatory timing: respond just before stimulus (predict timing)',
      parameters: { stimulusType: 'predictable-pattern', targetCount: 12, anticipationWindowMs: 100 },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'som-tur-interoceptive',
      type: 'scenario',
      description: 'Interoceptive precision: describe internal somatic state',
      parameters: { scenarioType: 'interoceptive-report', responseType: 'text', scenarios: 4 },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Anticipate timing without external cues',
      task: {
        id: 'som-tur-probe-agency',
        type: 'reaction_time',
        description: 'Anticipate timing from internal sense only',
        parameters: { stimulusType: 'predictable-pattern', targetCount: 8, anticipationWindowMs: 100, cuesEnabled: false },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Anticipates from internal somatic knowing',
      addictionSignal: 'Over-controls timing, mechanical precision',
      allergySignal: 'Cannot anticipate without external cues',
    },
    communion: {
      description: 'Synchronize anticipatory timing with NPC',
      task: {
        id: 'som-tur-probe-communion',
        type: 'reaction_time',
        description: 'Synchronize anticipatory timing with NPC partner',
        parameters: { stimulusType: 'predictable-pattern', targetCount: 8, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Syncs anticipation with other while holding own',
      addictionSignal: 'Loses own timing to sync perfectly',
      allergySignal: 'Cannot sync somatic timing with another',
    },
    eros: {
      description: 'Attempt anticipation with irregular pattern',
      task: {
        id: 'som-tur-probe-eros',
        type: 'reaction_time',
        description: 'Anticipate timing in subtly irregular pattern',
        parameters: { stimulusType: 'slightly-irregular', targetCount: 10, anticipationWindowMs: 75 },
        measures: ['accuracy', 'response_time'],
      },
      healthyResponse: 'Reaches toward subtle pattern detection',
      addictionSignal: 'Forces pattern onto randomness',
      allergySignal: 'Refuses engagement with irregular pattern',
    },
    agape: {
      description: 'Return to simple reaction with somatic ease',
      task: {
        id: 'som-tur-probe-agape',
        type: 'reaction_time',
        description: 'Simple reaction with full somatic ease',
        parameters: { stimulusType: 'simple', targetCount: 6, minGap: 1500, maxGap: 3000 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple body response with ease',
      addictionSignal: 'Refuses simple somatic engagement',
      allergySignal: 'Cannot engage body at any level',
    },
  },
};
