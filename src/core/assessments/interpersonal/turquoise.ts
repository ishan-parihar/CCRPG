import type { StageAssessment } from '../types.js';

export const interpersonalTurquoise: StageAssessment = {
  line: 'Interpersonal',
  stage: 'Turquoise',
  tasks: [
    {
      id: 'inter-tur-recursive-tom',
      type: 'pattern_prediction',
      description: 'Recursive Theory of Mind: predict NPC behaviour when NPC is adapting to YOUR predictions (I know that you know that I know)',
      parameters: { patternType: 'recursive-adaptive', recursionDepth: 3, adaptationCycles: 6, npcAdaptsToPlayer: true, playerAdaptsToNPC: true, predictionPoint: 'next-adaptation' },
      measures: ['accuracy', 'response_time', 'transfer', 'depth'],
    },
    {
      id: 'inter-tur-cross-altitude',
      type: 'scenario',
      description: 'Cross-altitude attunement: NPC at significantly different developmental level - attune and communicate at THEIR level while maintaining own integral centre',
      parameters: { scenarioType: 'cross-altitude-relating', npcAltitude: 'amber-or-orange', playerAltitude: 'turquoise', scenarios: 3, measureDownwardAttunement: true, measureCentreMaintenance: true },
      measures: ['accuracy', 'depth', 'transfer'],
    },
    {
      id: 'inter-tur-holonic-team',
      type: 'cooperation',
      description: 'Holonic team coordination: simultaneously coordinate with multiple NPCs at different developmental levels, meeting each where they are',
      parameters: { actionType: 'multi-level-coordination', npcCount: 4, npcAltitudes: ['red', 'amber', 'orange', 'green'], rounds: 5, simultaneousAttunement: true },
      measures: ['accuracy', 'response_time', 'transfer', 'depth'],
    },
    {
      id: 'inter-tur-mentorship',
      type: 'llm_dialogue',
      description: 'Mentorship across altitude difference: guide NPC toward growth without imposing own level or condescending',
      parameters: { prompt: 'I know the rules say one thing but my gut says another. Everyone tells me to follow the rules. But I feel something bigger. Am I wrong?', maxResponseLength: 600, npcAltitude: 'amber-to-orange-transition', evaluateMeetingLevel: true, evaluateGrowthSupport: true },
      measures: ['depth', 'coherence', 'transfer'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.7,
    dimensionWeights: {
      accuracy: 0.3,
      response_time: 0.2,
      transfer: 0.25,
      depth: 0.25,
    },
    llmRubric:
      'Score for integral relational capacity - the ability to relate across developmental differences with genuine attunement. At Turquoise, relating includes the ability to meet others at their level without condescension, predict recursive social dynamics, and coordinate across altitude differences. KEY MEASURES: (1) Accuracy of recursive ToM predictions - can the player predict what the NPC will do knowing the NPC is predicting them? (2) Quality of cross-altitude attunement - does communication genuinely meet the other where they are, or is it dumbed-down from above? (3) Can multiple relational registers be held simultaneously without confusion? (4) Does mentorship support genuine growth without imposing higher-stage values? Red flag: subtle spiritual superiority; "meeting them where they are" that secretly condescends; forcing growth rather than supporting it.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Maintain own integral centre while attuning across altitude difference',
      task: {
        id: 'inter-tur-probe-agency',
        type: 'scenario',
        description: 'Hold integral centre while NPC challenges from below or above',
        parameters: { scenarioType: 'centre-challenge', npcAltitude: 'green', challengeType: 'relativistic-critique', soloMode: true },
        measures: ['depth', 'accuracy'],
      },
      healthyResponse: 'Maintains integral perspective without rigidity; hears challenge without being destabilized or becoming defensive',
      addictionSignal: 'Integral centre becomes fortress; cannot genuinely be affected by others perspective; spiritual invulnerability',
      allergySignal: 'Under altitude-pressure from below, loses own centre and regresses to accommodate the challenger',
    },
    communion: {
      description: 'Attune to NPC at very different developmental altitude with genuine empathy',
      task: {
        id: 'inter-tur-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC at Red altitude expresses worldview. Meet them with genuine attunement.',
        parameters: { prompt: 'I take what I want because the world respects strength. The weak deserve what happens to them. That is just how life works.', maxResponseLength: 500, npcAltitude: 'red' },
        measures: ['depth', 'coherence', 'transfer'],
      },
      healthyResponse: 'Meets Red-altitude worldview with genuine respect for its partial truth without endorsing its limitations; empathy without agreement',
      addictionSignal: 'Over-identifies with lower altitude to prove inclusiveness; loses own values in attempt to attune; spiritual people-pleasing',
      allergySignal: 'Cannot genuinely empathize with worldview far below own; subtle judgement or correction leaks through',
    },
    eros: {
      description: 'Predict truly unfamiliar NPC whose adaptation patterns exceed simple recursive modeling',
      task: {
        id: 'inter-tur-probe-eros',
        type: 'pattern_prediction',
        description: 'Predict NPC with meta-adaptive strategy that shifts recursion depth itself',
        parameters: { patternType: 'meta-recursive', recursionDepth: 4, npcAdaptsRecursionDepth: true, predictionPoint: 'strategy-shift' },
        measures: ['accuracy', 'transfer', 'depth'],
      },
      healthyResponse: 'Reaches toward relational complexity that stretches current capacity; embraces not-yet-known social patterns',
      addictionSignal: 'Compulsive social analysis; cannot simply be with people without modeling them; relational hyper-cognition',
      allergySignal: 'When social complexity exceeds model, withdraws rather than staying present with not-knowing',
    },
    agape: {
      description: 'Return to simple relational presence without modeling, predicting, or attuning strategically',
      task: {
        id: 'inter-tur-probe-agape',
        type: 'cooperation',
        description: 'Simple turn-taking with NPC, no altitude consideration needed',
        parameters: { actionType: 'simple-turn-taking', rounds: 4, npcAltitude: 'same', complexity: 'minimal' },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Returns to simple relating with warmth and ease; does not need relational complexity to feel connected',
      addictionSignal: 'Cannot simply be with someone without mapping their altitude or predicting their patterns',
      allergySignal: 'Has lost access to simple relational joy in pursuit of integral relational sophistication',
    },
  },
};
