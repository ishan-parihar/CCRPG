import type { StageAssessment } from '../types.js';

export const willpowerWhite: StageAssessment = {
  line: 'Willpower',
  stage: 'White',
  tasks: [
    {
      id: 'will-wht-self-release',
      type: 'hold',
      description: 'Hold until it feels right to release: no external cue, no countdown - self-determined release from internal readiness',
      parameters: { targetDurationMs: 0, selfDeterminedRelease: true, noCountdown: true, noExternalCue: true, measureConsistencyAcrossTrials: true, trials: 5, idealRangeMs: [5000, 20000] },
      measures: ['consistency', 'response_time'],
    },
    {
      id: 'will-wht-outcome-detachment',
      type: 'scenario',
      description: 'Act without outcome attachment: perform meaningful action where success or failure is completely irrelevant',
      parameters: { scenarioType: 'outcome-irrelevant-action', responseType: 'behavioral', scenarios: 3, outcomeHidden: true, measureEffortQuality: true, evaluateGraspingAtResult: true },
      measures: ['consistency', 'accuracy', 'depth'],
    },
    {
      id: 'will-wht-perturbation-noneffort',
      type: 'hold',
      description: 'Hold while disrupted: perturbations arrive but effort does NOT increase - non-reactivity in will itself',
      parameters: { targetDurationMs: 12000, perturbations: true, perturbationIntervalMs: 2000, perturbationType: 'variable-intensity', measureEffortIncrease: true, effortShouldNotIncrease: true, trials: 3 },
      measures: ['consistency', 'accuracy', 'response_time'],
    },
    {
      id: 'will-wht-wu-wei',
      type: 'reaction_time',
      description: 'Wu-wei: accomplish complex task sequence without the sense of willing it - action flowing without doer',
      parameters: { stimulusType: 'complex-sequence', targetCount: 8, sequenceLength: 4, measureFlowState: true, evaluateStriving: true, selfPaced: true },
      measures: ['consistency', 'response_time', 'complexity_handled'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      consistency: 0.35,
      accuracy: 0.25,
      response_time: 0.2,
      complexity_handled: 0.2,
    },
  },
  minimumTrials: 5,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Act without claiming the action - will operates but no one is willing',
      task: {
        id: 'will-wht-probe-agency',
        type: 'hold',
        description: 'Hold and release at self-determined moment without anyone deciding',
        parameters: { targetDurationMs: 0, selfDeterminedRelease: true, noCountdown: true, soloMode: true, measureDecisionAbsence: true },
        measures: ['consistency', 'response_time'],
      },
      healthyResponse: 'Release happens at precisely the right moment without a sense of decision; the will is transparent - action without actor',
      addictionSignal: 'Subtle spiritual pride in effortless willing; wu-wei becomes a performance; watching oneself not-trying becomes trying',
      allergySignal: 'Without a clear decision-point, cannot release; needs the sense of I-decide-now to act; will requires an owner',
    },
    communion: {
      description: 'Coordinate effort with another without trying to coordinate - emergent shared will',
      task: {
        id: 'will-wht-probe-communion',
        type: 'hold',
        description: 'Hold and release in sync with NPC partner without communication',
        parameters: { targetDurationMs: 0, selfDeterminedRelease: true, partnerMode: true, communicationAllowed: false, measureSyncQuality: true },
        measures: ['consistency', 'accuracy'],
      },
      healthyResponse: 'Shared timing emerges without effort; two wills resolve into one movement without either leading or following',
      addictionSignal: 'Hyper-attunes to other at expense of own timing; loses self in attempt to synchronize; communion without agency',
      allergySignal: 'Cannot allow will to be influenced by proximity; maintains rigid independence even when shared timing is natural',
    },
    eros: {
      description: 'Face maximum difficulty without increasing effort - will meets resistance without straining',
      task: {
        id: 'will-wht-probe-eros',
        type: 'hold',
        description: 'Hold under maximum perturbation without effort increase',
        parameters: { targetDurationMs: 15000, perturbations: true, perturbationIntervalMs: 1500, perturbationType: 'maximum', effortShouldNotIncrease: true },
        measures: ['consistency', 'accuracy', 'response_time'],
      },
      healthyResponse: 'Under maximum disruption, effort quality remains unchanged; difficulty does not create straining; will is equally effortless regardless of resistance',
      addictionSignal: 'Seeks difficulty to prove effortlessness; uses resistance as confirmation of attainment; cannot simply hold easy things',
      allergySignal: 'Under real difficulty, effortlessness collapses; will returns to straining when stakes are genuinely high',
    },
    agape: {
      description: 'Release without reluctance - let go completely and immediately without residual holding',
      task: {
        id: 'will-wht-probe-agape',
        type: 'hold',
        description: 'Brief hold then release with complete non-reluctance',
        parameters: { targetDurationMs: 3000, releaseImmediate: true, measureReleaseQuality: true, measureResidualHolding: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Releases completely with no afterimage of holding; letting go is as natural and full as holding; no hierarchy between effort and rest',
      addictionSignal: 'Holds longer than needed because holding has become identity; release feels like loss of spiritual demonstration',
      allergySignal: 'Releases prematurely to avoid engagement; non-effort is actually avoidance of effort',
    },
  },
};
