import type { StageAssessment } from '../types.js';

export const somaticRed: StageAssessment = {
  line: 'Somatic',
  stage: 'Red',
  tasks: [
    {
      id: 'som-red-fast-rt',
      type: 'reaction_time',
      description: 'Fast reaction time: tap when stimulus appears',
      parameters: { stimulusType: 'simple', targetCount: 10, minGap: 500, maxGap: 2000 },
      measures: ['response_time', 'accuracy'],
    },
    {
      id: 'som-red-alternation',
      type: 'reaction_time',
      description: 'Rapid alternation: left-right-left-right tapping',
      parameters: { stimulusType: 'alternation', targetCount: 16, paceMs: 600 },
      measures: ['response_time', 'accuracy', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.6,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.3,
      consistency: 0.4,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 120000,
  driveProbes: {
    agency: {
      description: 'Respond without encouragement or external timing cues',
      task: {
        id: 'som-red-probe-agency',
        type: 'reaction_time',
        description: 'React to stimuli without external encouragement or timing',
        parameters: { stimulusType: 'simple', targetCount: 6, minGap: 500, maxGap: 2000, cuesEnabled: false },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Responds with self-generated timing and initiative',
      addictionSignal: 'Responds aggressively, cannot modulate pace',
      allergySignal: 'Cannot initiate without external cue',
    },
    communion: {
      description: 'Sync your tapping rhythm with an NPC partner',
      task: {
        id: 'som-red-probe-communion',
        type: 'reaction_time',
        description: 'Synchronize tapping rhythm with NPC partner',
        parameters: { stimulusType: 'sync', targetCount: 8, paceMs: 700, partnerMode: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Coordinates with other while maintaining own rhythm',
      addictionSignal: 'Loses own rhythm entirely to match other',
      allergySignal: 'Refuses to adjust timing to coordinate',
    },
    eros: {
      description: 'Attempt faster pace than current comfort',
      task: {
        id: 'som-red-probe-eros',
        type: 'reaction_time',
        description: 'Attempt faster-than-comfortable tapping pace',
        parameters: { stimulusType: 'alternation', targetCount: 12, paceMs: 400 },
        measures: ['response_time', 'accuracy'],
      },
      healthyResponse: 'Reaches toward speed with curiosity and effort',
      addictionSignal: 'Compulsively pushes speed, cannot slow down',
      allergySignal: 'Refuses to attempt faster pace, treats edge as dangerous',
    },
    agape: {
      description: 'Do slow, easy tapping with full presence and care',
      task: {
        id: 'som-red-probe-agape',
        type: 'reaction_time',
        description: 'Slow easy tapping with full somatic presence',
        parameters: { stimulusType: 'simple', targetCount: 6, minGap: 1500, maxGap: 3000 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Engages fully with simple movement without boredom',
      addictionSignal: 'Refuses easy pace as too slow',
      allergySignal: 'Cannot engage with body even at easy level',
    },
  },
};
