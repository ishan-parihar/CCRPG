import type { StageAssessment } from '../types.js';

export const somaticInfrared: StageAssessment = {
  line: 'Somatic',
  stage: 'Infrared',
  tasks: [
    {
      id: 'som-ir-tap-green',
      type: 'reaction_time',
      description: 'Simple RT: tap when green appears',
      parameters: { stimulusType: 'simple', targetCount: 8, minGap: 1000, maxGap: 3000 },
      measures: ['response_time', 'accuracy'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 60000,
  driveProbes: {
    agency: {
      description: 'Tap when stimulus appears without coaching',
      task: {
        id: 'som-ir-probe-agency',
        type: 'reaction_time',
        description: 'React to green stimulus without coaching',
        parameters: { stimulusType: 'simple', targetCount: 4, minGap: 1000, maxGap: 3000, coachingEnabled: false },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Responds with basic somatic agency',
      addictionSignal: 'Taps frantically without discrimination',
      allergySignal: 'Cannot initiate physical response',
    },
    communion: {
      description: 'Tap alongside NPC doing the same',
      task: {
        id: 'som-ir-probe-communion',
        type: 'reaction_time',
        description: 'React alongside NPC partner',
        parameters: { stimulusType: 'simple', targetCount: 4, minGap: 1000, maxGap: 3000, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Acts alongside other with basic awareness',
      addictionSignal: 'Loses own timing to match other',
      allergySignal: 'Cannot act alongside another',
    },
    eros: {
      description: 'Attempt slightly faster pace',
      task: {
        id: 'som-ir-probe-eros',
        type: 'reaction_time',
        description: 'Attempt faster stimulus response',
        parameters: { stimulusType: 'simple', targetCount: 6, minGap: 600, maxGap: 1800 },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Reaches toward speed with basic engagement',
      addictionSignal: 'Overwhelmed by speed but cannot stop',
      allergySignal: 'Refuses faster pace',
    },
    agape: {
      description: 'Very slow easy tapping with presence',
      task: {
        id: 'som-ir-probe-agape',
        type: 'reaction_time',
        description: 'Very slow tapping with full somatic presence',
        parameters: { stimulusType: 'simple', targetCount: 3, minGap: 2500, maxGap: 5000 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Engages body fully even at slow pace',
      addictionSignal: 'Refuses slow pace as boring',
      allergySignal: 'Cannot engage body at all',
    },
  },
};
