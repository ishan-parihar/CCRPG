import type { StageAssessment } from '../types.js';

export const willpowerMagenta: StageAssessment = {
  line: 'Willpower',
  stage: 'Magenta',
  tasks: [
    {
      id: 'will-mag-delay',
      type: 'hold',
      description: 'Delay of gratification: wait 3 seconds for bigger reward',
      parameters: { targetDurationMs: 3000, rewardType: 'bigger-later', perturbations: false },
      measures: ['accuracy', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.5,
    dimensionWeights: {
      consistency: 0.3,
      complexity_handled: 0.3,
      transfer: 0.2,
      response_time: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'Wait without countdown timer',
      task: {
        id: 'will-mag-probe-agency',
        type: 'hold',
        description: 'Wait for reward without countdown',
        parameters: { targetDurationMs: 3000, rewardType: 'bigger-later', countdownEnabled: false },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Waits with self-generated patience',
      addictionSignal: 'Waits far beyond needed, hoards patience',
      allergySignal: 'Cannot wait without timer',
    },
    communion: {
      description: 'Wait together with NPC for shared reward',
      task: {
        id: 'will-mag-probe-communion',
        type: 'hold',
        description: 'Wait alongside NPC partner for shared reward',
        parameters: { targetDurationMs: 3000, rewardType: 'shared', partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Waits with other, mutual encouragement',
      addictionSignal: 'Loses own timing to match partner',
      allergySignal: 'Cannot wait alongside another',
    },
    eros: {
      description: 'Attempt to wait 5 seconds for even bigger reward',
      task: {
        id: 'will-mag-probe-eros',
        type: 'hold',
        description: 'Attempt longer wait for bigger reward',
        parameters: { targetDurationMs: 5000, rewardType: 'biggest-later' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Reaches toward longer delay with willingness',
      addictionSignal: 'Compulsively extends waiting, cannot stop',
      allergySignal: 'Refuses longer wait entirely',
    },
    agape: {
      description: 'Wait just 1 second with full presence',
      task: {
        id: 'will-mag-probe-agape',
        type: 'hold',
        description: 'Very brief wait with full presence',
        parameters: { targetDurationMs: 1000, rewardType: 'immediate' },
        measures: ['accuracy'],
      },
      healthyResponse: 'Holds briefly with ease and care',
      addictionSignal: 'Refuses brief hold as pointless',
      allergySignal: 'Cannot hold even briefly',
    },
  },
};
