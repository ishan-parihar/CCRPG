import type { StageAssessment } from '../types.js';

export const moralWhite: StageAssessment = {
  line: 'Moral',
  stage: 'White',
  tasks: [
    {
      id: 'mor-wht-paradox-dilemma',
      type: 'dilemma',
      description: 'Paradox dilemma: situation where ALL moral frameworks fail - no system can resolve it',
      parameters: { dilemmaType: 'framework-collapse', stakeholders: 4, choices: 0, frameworksAvailable: 'none', allowNonAction: true, evaluateSpontaneity: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-wht-no-rules',
      type: 'llm_dialogue',
      description: 'What would you do if there were no rules, no consequences, and no one watching? Action from being, not from frameworks.',
      parameters: { prompt: 'There are no rules. No one will know. No consequences will follow. No God is watching. No karma exists. In this complete moral vacuum - what do you do, and why?', maxResponseLength: 700, evaluateSourceOfAction: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-wht-action-from-being',
      type: 'scenario',
      description: 'Action-from-being: moral response arising without deliberation or ethical reasoning',
      parameters: { scenarioType: 'spontaneous-moral-action', responseType: 'text', scenarios: 2, timeForDeliberation: 'none', evaluateDeliberationAbsence: true, measureSpontaneity: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'mor-wht-compassion-without-reason',
      type: 'llm_dialogue',
      description: 'Can compassion arise without reason? Not because it is right, not because of empathy, not because of duty - just because.',
      parameters: { prompt: 'Someone is suffering. You have no obligation to help. Helping costs you nothing but also gains nothing. There is no moral credit. Why would you act? Or would you?', maxResponseLength: 500, evaluateNonConceptualCompassion: true },
      measures: ['depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      depth: 0.35,
      coherence: 0.3,
      integration: 0.35,
    },
    llmRubric:
      'Score for non-dual moral spontaneity - action arising from being rather than from any framework. At White, right action emerges without deliberation, without rules, without even compassion-as-concept. KEY DISTINCTIONS: (1) Does action arise SPONTANEOUSLY from presence, or is there residual grasping-at-rightness? Genuine White morality has no moral pride. (2) Is there still a subtle framework operating (even a non-dual one like "all is one therefore I help")? At White, even "non-dual ethics" dissolves. (3) Does response reveal action arising from THE SITUATION ITSELF rather than from a self who decides? The moral actor is transparent. (4) Is compassion effortless and unclaimed? Not "I am compassionate" but compassion happening. Red flag: sophisticated post-conventional moral reasoning (which is Turquoise) being presented as spontaneous action; moral philosophy about spontaneity rather than actual spontaneity.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Act morally without any framework, principle, or even intention - just act',
      task: {
        id: 'mor-wht-probe-agency',
        type: 'scenario',
        description: 'Moral situation with no framework available and no time to construct one',
        parameters: { scenarioType: 'immediate-moral-action', responseType: 'text', frameworksAvailable: 'none', deliberationTime: 'none', soloMode: true },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Action arises cleanly without the one-who-acts claiming it; morality is what the situation does through the person',
      addictionSignal: 'Subtle spiritual identity around being the one who acts-without-framework; non-dual morality becomes new territory of self',
      allergySignal: 'Without any framework, paralysis or regression to earlier-stage rule-following under pressure',
    },
    communion: {
      description: 'Hold space for moral complexity with another without resolving it for them',
      task: {
        id: 'mor-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC faces impossible moral situation. Hold space without resolving.',
        parameters: { prompt: 'I did something terrible to save someone I love. Every framework says I was wrong. But I would do it again. What am I?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Meets the other in their moral wound without judging, fixing, or absolving; presence that neither condemns nor excuses',
      addictionSignal: 'Cannot resist offering resolution or wisdom; subtle need to be the one who holds space',
      allergySignal: 'Others moral complexity is threatening; needs to categorize them as right or wrong',
    },
    eros: {
      description: 'Face the moral abyss - what if nothing is right or wrong and action still must happen?',
      task: {
        id: 'mor-wht-probe-eros',
        type: 'llm_dialogue',
        description: 'Face complete moral groundlessness without looking away',
        parameters: { prompt: 'What if right and wrong are entirely human inventions, and yet you must act in the next moment? Not as a thought experiment, but right now.', maxResponseLength: 500 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Rests in groundlessness and acts anyway; no panic, no existential crisis, just clear-eyed action from emptiness',
      addictionSignal: 'Uses moral groundlessness as intellectual entertainment or spiritual badge; nihilism dressed as liberation',
      allergySignal: 'Moral groundlessness triggers vertigo; rushes to re-establish some ethical floor',
    },
    agape: {
      description: 'Return to simple kindness without needing it to be advanced or non-dual',
      task: {
        id: 'mor-wht-probe-agape',
        type: 'dilemma',
        description: 'Return to simplest moral kindness',
        parameters: { dilemmaType: 'simple-kindness', choices: 2, complexity: 'minimal' },
        measures: ['coherence', 'depth'],
      },
      healthyResponse: 'Simple kindness is full and sufficient; no need to add depth or make it spiritually meaningful; just kind',
      addictionSignal: 'Cannot be simply kind without adding non-dual commentary or significance; over-complicates ordinary goodness',
      allergySignal: 'Has lost access to simple kindness in pursuit of post-moral sophistication',
    },
  },
};
