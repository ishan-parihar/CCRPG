import type { StageAssessment } from '../types.js';

export const interpersonalWhite: StageAssessment = {
  line: 'Interpersonal',
  stage: 'White',
  tasks: [
    {
      id: 'inter-wht-emergent-synchrony',
      type: 'cooperation',
      description: 'Emergent synchrony: act together without explicit communication - coordination quality emerges from shared field',
      parameters: { actionType: 'silent-coordination', rounds: 8, communicationAllowed: false, measureEmergentOrder: true, evaluateSyncWithoutSignal: true, adaptiveNPC: true },
      measures: ['accuracy', 'response_time', 'consistency'],
    },
    {
      id: 'inter-wht-transparent-relating',
      type: 'llm_dialogue',
      description: 'Transparent relating: engage with another without performing any role - no helper, no leader, no equal, just presence meeting presence',
      parameters: { prompt: 'I am here. You are here. We have no defined relationship, no roles, no history together. There is nothing to accomplish. What happens between us?', maxResponseLength: 600, evaluateRoleAbsence: true, evaluateAuthenticPresence: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'inter-wht-who-is-relating',
      type: 'llm_dialogue',
      description: 'Who is relating? Pointing-out instruction in relational context - when self and other are both transparent, what is the relationship?',
      parameters: { prompt: 'You say you are here with me. But who is the you that is here? And who is the me you are here with? If neither of us is a fixed thing, what is this connection?', maxResponseLength: 600, evaluateNonDualRelating: true },
      measures: ['depth', 'coherence', 'transfer'],
    },
    {
      id: 'inter-wht-boundary-dissolution',
      type: 'scenario',
      description: 'No fixed boundary self/other: act in shared field where the distinction between my action and your action becomes transparent',
      parameters: { scenarioType: 'shared-field-action', responseType: 'behavioral', scenarios: 3, boundaryTransparent: true, measureCoordinationSource: true },
      measures: ['accuracy', 'depth', 'transfer', 'response_time'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      accuracy: 0.25,
      depth: 0.3,
      transfer: 0.2,
      response_time: 0.25,
    },
    llmRubric:
      'Score for genuine relational transparency vs. performed oneness. At White, relating happens without fixed selves meeting - the relational field is transparent and communion occurs without fusion. KEY DISTINCTIONS: (1) Is there genuine inter-being or is "we are one" being performed while subtle separation remains? True White relating feels remarkably ordinary - like breathing together. (2) Can the person relate without ANY role, including the role of one-who-relates-without-role? Every subtle position is still a role. (3) Does communion happen without loss of centre? Non-dual relating is NOT merger - it is transparency where distinction and unity are not opposed. (4) Is the relational quality warm and human or abstractly spiritual? White interpersonal should feel more intimate than any earlier stage, not less. Red flag: abstract descriptions of oneness that feel emotionally empty; using non-dual language to avoid genuine vulnerability; spiritual bypass of relational risk.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Maintain centre without boundary - individual presence without wall between self and other',
      task: {
        id: 'inter-wht-probe-agency',
        type: 'scenario',
        description: 'Maintain individual presence while self-other boundary is transparent',
        parameters: { scenarioType: 'centre-without-boundary', responseType: 'text', soloPresenceInRelation: true, measureCentreQuality: true },
        measures: ['depth', 'consistency'],
      },
      healthyResponse: 'Present as this particular expression without needing walls to maintain it; individuality without separation',
      addictionSignal: 'Uses non-dual oneness to avoid the vulnerability of being a particular someone; dissolves into connection to avoid being seen',
      allergySignal: 'Under relational transparency, quietly re-erects boundaries to feel safe; non-dual relating only works at comfortable distance',
    },
    communion: {
      description: 'Merge without losing - allow complete interpenetration without dissolution of either presence',
      task: {
        id: 'inter-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC offers complete openness. Meet it without losing yourself or holding back.',
        parameters: { prompt: 'I am completely open to you. No walls. No protection. I trust you with all of me. What do you do with that?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Meets openness with equal openness without drowning in it; two open presences, distinct and unified simultaneously',
      addictionSignal: 'Dissolves completely into the other; uses another openness as permission to abandon own centre; spiritual enmeshment',
      allergySignal: 'Others complete openness feels threatening; subtle withdrawal or protection arises; cannot match vulnerability with vulnerability',
    },
    eros: {
      description: 'Meet the relational unknown - relate to something genuinely other without making it familiar',
      task: {
        id: 'inter-wht-probe-eros',
        type: 'scenario',
        description: 'Meet a being whose nature is completely unfamiliar - relate without categorizing',
        parameters: { scenarioType: 'radical-other', responseType: 'text', otherType: 'genuinely-unknown', categorization: 'impossible' },
        measures: ['depth', 'transfer', 'response_time'],
      },
      healthyResponse: 'Meets genuine otherness with open curiosity; does not reduce unfamiliar to familiar; relates without needing to understand first',
      addictionSignal: 'Seeks increasingly alien others as relational intensity; uses strangeness for spiritual stimulation',
      allergySignal: 'Genuine otherness triggers subtle retreat to known relational patterns; cannot truly meet what is not already familiar',
    },
    agape: {
      description: 'Return to simple presence-with-another - sitting together is enough',
      task: {
        id: 'inter-wht-probe-agape',
        type: 'cooperation',
        description: 'Simply be present with NPC in ordinary shared moment',
        parameters: { actionType: 'simple-shared-presence', rounds: 3, complexity: 'minimal', measurePresenceQuality: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Being with another person is complete in itself; no need for depth, connection-experience, or spiritual significance',
      addictionSignal: 'Cannot simply sit with someone without making it meaningful; adds non-dual significance to ordinary togetherness',
      allergySignal: 'Simple presence with another feels empty; needs relational intensity or spiritual framing to feel connected',
    },
  },
};
