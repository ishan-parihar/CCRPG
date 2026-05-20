import type { StageAssessment } from '../types.js';

export const cognitiveInfrared: StageAssessment = {
  line: 'Cognitive',
  stage: 'Infrared',
  tasks: [
    {
      id: 'cog-ir-simple-rt',
      type: 'reaction_time',
      description: 'Simple reaction time: tap when green appears',
      parameters: { stimulusType: 'simple', targetCount: 8, minGap: 800, maxGap: 2500 },
      measures: ['response_time', 'accuracy'],
    },
    {
      id: 'cog-ir-object-tracking',
      type: 'pattern_prediction',
      description: 'Object permanence: does hidden object still exist?',
      parameters: { objectCount: 1, hideDurationMs: 2000, trials: 6 },
      measures: ['accuracy', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.4,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      complexity_handled: 0.3,
      self_correction: 0.2,
    },
  },
  minimumTrials: 3,
  estimatedDurationMs: 90000,
  driveProbes: {
    agency: {
      description: 'Respond to stimulus without prompting',
      task: {
        id: 'cog-ir-probe-agency',
        type: 'reaction_time',
        description: 'React to stimulus without external prompts',
        parameters: { stimulusType: 'simple', targetCount: 4, minGap: 800, maxGap: 2500, promptsEnabled: false },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Initiates response independently',
      addictionSignal: 'Responds impulsively to everything',
      allergySignal: 'Cannot respond without external trigger',
    },
    communion: {
      description: 'Respond in sync with NPC partner',
      task: {
        id: 'cog-ir-probe-communion',
        type: 'reaction_time',
        description: 'React to stimuli alongside an NPC partner',
        parameters: { stimulusType: 'simple', targetCount: 4, minGap: 800, maxGap: 2500, partnerMode: true },
        measures: ['response_time', 'consistency'],
      },
      healthyResponse: 'Responds alongside other without losing own timing',
      addictionSignal: 'Ignores partner entirely',
      allergySignal: 'Only responds when partner does first',
    },
    eros: {
      description: 'Attempt faster stimulus sequence',
      task: {
        id: 'cog-ir-probe-eros',
        type: 'reaction_time',
        description: 'React to faster stimulus sequence',
        parameters: { stimulusType: 'simple', targetCount: 6, minGap: 500, maxGap: 1500 },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Reaches toward faster pace with engagement',
      addictionSignal: 'Overwhelmed but cannot stop',
      allergySignal: 'Refuses faster pace entirely',
    },
    agape: {
      description: 'Do very slow easy reaction with full presence',
      task: {
        id: 'cog-ir-probe-agape',
        type: 'reaction_time',
        description: 'Very slow easy reaction with full attention',
        parameters: { stimulusType: 'simple', targetCount: 3, minGap: 2000, maxGap: 4000 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Engages fully even at very easy level',
      addictionSignal: 'Refuses easy pace as boring',
      allergySignal: 'Cannot sustain attention even at slow pace',
    },
  },
};
