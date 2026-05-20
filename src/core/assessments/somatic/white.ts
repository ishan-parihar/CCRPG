import type { StageAssessment } from '../types.js';

export const somaticWhite: StageAssessment = {
  line: 'Somatic',
  stage: 'White',
  tasks: [
    {
      id: 'som-wht-self-timing',
      type: 'reaction_time',
      description: 'Respond when it feels right: no external cue, self-determined timing from internal readiness',
      parameters: { stimulusType: 'none', targetCount: 10, selfDetermined: true, measureConsistencyOfInternal: true, minGap: 2000, maxGap: 8000, noExternalCue: true },
      measures: ['consistency', 'response_time'],
    },
    {
      id: 'som-wht-effortless-complex',
      type: 'rhythm',
      description: 'Effortless complex action: perform complex rhythm pattern measuring absence of strain via variance analysis',
      parameters: { pattern: [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1], bpm: 90, trials: 4, measureEffort: true, varianceAsKey: true, strainDetection: true },
      measures: ['consistency', 'accuracy', 'response_time'],
    },
    {
      id: 'som-wht-stillness-in-motion',
      type: 'hold',
      description: 'Stillness-in-motion: maintain inner steadiness while responding to changing external stimuli',
      parameters: { targetDurationMs: 15000, movingTarget: true, responseRequired: true, measureInternalStability: true, externalChangeRate: 'variable' },
      measures: ['consistency', 'accuracy', 'response_time'],
    },
    {
      id: 'som-wht-naturalness',
      type: 'reaction_time',
      description: 'Pure naturalness: simple response with no performance anxiety - measuring how close to natural baseline the body moves',
      parameters: { stimulusType: 'gentle-prompt', targetCount: 12, evaluateNaturalness: true, noPerformancePressure: true, baselineComparison: true, minGap: 1500, maxGap: 4000 },
      measures: ['consistency', 'response_time', 'accuracy'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      consistency: 0.4,
      response_time: 0.3,
      accuracy: 0.3,
    },
  },
  minimumTrials: 5,
  estimatedDurationMs: 240000,
  driveProbes: {
    agency: {
      description: 'Move without deliberation - the body acts from its own knowing without mental instruction',
      task: {
        id: 'som-wht-probe-agency',
        type: 'reaction_time',
        description: 'Respond from body-knowing alone, no mental deliberation permitted',
        parameters: { stimulusType: 'none', targetCount: 8, selfDetermined: true, noExternalCue: true, measureSpontaneity: true },
        measures: ['consistency', 'response_time'],
      },
      healthyResponse: 'Body moves at its own timing with remarkable consistency; no mind-body split, just unified action arising',
      addictionSignal: 'Subtle performance of spontaneity; trying to be natural which creates artificiality; the body becomes a spiritual project',
      allergySignal: 'Without external cues or mental instruction, body freezes; spontaneous somatic intelligence not yet trusted',
    },
    communion: {
      description: 'Synchronize with another without trying - let bodies find shared rhythm naturally',
      task: {
        id: 'som-wht-probe-communion',
        type: 'rhythm',
        description: 'Find shared timing with NPC partner without verbal coordination',
        parameters: { pattern: [1, 0, 1, 0, 1, 1, 0, 1], bpm: 75, partnerMode: true, communicationAllowed: false, measureEmergentSync: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Bodies find each other without effort; synchrony emerges rather than being created; natural entrainment without trying',
      addictionSignal: 'Forces synchrony through hyper-attunement; cannot let it emerge, must control the connection somatically',
      allergySignal: 'Cannot let body attune to another; somatic isolation persists even when willing',
    },
    eros: {
      description: 'Meet somatic edge without straining - where movement becomes difficult, maintain effortlessness',
      task: {
        id: 'som-wht-probe-eros',
        type: 'rhythm',
        description: 'Complex polyrhythm at the edge of somatic capacity without increasing effort',
        parameters: { pattern: [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0], bpm: 110, trials: 3, measureStrainAtEdge: true },
        measures: ['consistency', 'accuracy', 'response_time'],
      },
      healthyResponse: 'At the edge of difficulty, effort does not increase; the body meets challenge with the same quality as simple movement',
      addictionSignal: 'Seeks somatic difficulty as proof of advancement; pushes body beyond natural capacity, mistaking strain for growth',
      allergySignal: 'At somatic edge, effortlessness shatters and mechanical strain replaces it; transparency only works in comfort zone',
    },
    agape: {
      description: 'Rest in simplest movement with full presence - a tap is just a tap, fully alive',
      task: {
        id: 'som-wht-probe-agape',
        type: 'reaction_time',
        description: 'Simple single tap with complete somatic presence',
        parameters: { stimulusType: 'simple', targetCount: 5, minGap: 2000, maxGap: 4000, measurePresenceQuality: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Simplest movement performed with same luminous quality as complex; body fully alive in the ordinary',
      addictionSignal: 'Simple movement feels insufficient; body restless without complexity or challenge',
      allergySignal: 'Cannot bring presence to simple movement; somatic awareness only activates for special occasions',
    },
  },
};
