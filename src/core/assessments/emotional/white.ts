import type { StageAssessment } from '../types.js';

export const emotionalWhite: StageAssessment = {
  line: 'Emotional',
  stage: 'White',
  tasks: [
    {
      id: 'emo-wht-perturbation-recovery',
      type: 'scenario',
      description: 'Emotional perturbation and recovery: provoke genuine emotion, measure return-to-equanimity speed and quality',
      parameters: { scenarioType: 'emotional-perturbation', perturbationType: 'loss-of-meaning', intensityLevel: 'deep', recoveryMeasure: true, measureGraspingAtCalm: true, scenarios: 3 },
      measures: ['consistency', 'depth', 'integration'],
    },
    {
      id: 'emo-wht-pleasant-transparency',
      type: 'llm_dialogue',
      description: 'Non-attachment to pleasant emotion: present beautiful stimulus, measure whether pleasure is held lightly or grasped',
      parameters: { prompt: 'Something deeply beautiful just happened to you. You feel joy and gratitude flooding your body. Now it is passing. Describe your relationship to its passing.', maxResponseLength: 600, evaluateGrasping: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'emo-wht-luminous-affect',
      type: 'llm_dialogue',
      description: 'Emotion as luminous energy: can affect be experienced as energy-in-awareness rather than personal story?',
      parameters: { prompt: 'A wave of grief arises. It is not about anything specific. What is grief when it has no story? Describe what remains.', maxResponseLength: 600, evaluateNonDual: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'emo-wht-meta-emotion',
      type: 'scenario',
      description: 'What is this emotion serving? Meta-emotional awareness without analytical distance',
      parameters: { scenarioType: 'meta-emotion', responseType: 'text', scenarios: 2, emotionPresented: 'complex-mix', evaluateIntimacy: true },
      measures: ['depth', 'metacognition', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      depth: 0.3,
      coherence: 0.25,
      integration: 0.3,
      consistency: 0.15,
    },
    llmRubric:
      'Score for genuine emotional equanimity vs. suppression or spiritual bypassing. At White, all emotions arise and pass without identification - affect is luminous, not gripping. KEY DISTINCTIONS: (1) Is equanimity genuine (emotions fully felt but not grasped) or is it suppression wearing spiritual clothing? Genuine equanimity has WARMTH; suppression feels cold or distant. (2) Does the response indicate emotions are experienced as energy/luminosity without needing to be named, fixed, or transcended? (3) Is there residual grasping at pleasant states or residual aversion to painful ones? At White both dissolve. (4) Is meta-awareness intimate with emotion or observing from above? White intimacy means no distance between awareness and affect. Red flag: clinical detachment presented as equanimity; spiritual vocabulary about emotions without actual emotional aliveness.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 270000,
  driveProbes: {
    agency: {
      description: 'Maintain equanimity independently when deep emotion arises unexpectedly',
      task: {
        id: 'emo-wht-probe-agency',
        type: 'scenario',
        description: 'Unexpected deep emotion arises without context or warning',
        parameters: { scenarioType: 'sudden-affect', intensityLevel: 'deep', warningEnabled: false, soloMode: true },
        measures: ['depth', 'consistency'],
      },
      healthyResponse: 'Emotion arises and is met with intimate equanimity; no reaching for techniques or frameworks, just open presence with what is',
      addictionSignal: 'Subtle pride in equanimity itself; the one-who-is-equanimous becomes a new identity; using non-reactivity as superiority',
      allergySignal: 'When genuinely surprised by emotion, equanimity fractures - revealing it was maintained rather than natural',
    },
    communion: {
      description: 'Witness another being emotionally overwhelmed without being swept or withdrawing',
      task: {
        id: 'emo-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC is overwhelmed by grief. Be present without fixing, teaching, or withdrawing.',
        parameters: { prompt: 'I cannot stop crying. Everything hurts. I do not want wisdom right now. I just want someone to be here.', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Pure presence with the other; no teaching, no fixing, no subtle withdrawal; compassion without efforting at compassion',
      addictionSignal: 'Cannot resist offering non-dual wisdom; subtle spiritual helping even when asked to just be present',
      allergySignal: 'Others raw emotion triggers discomfort; presence falters and distance appears',
    },
    eros: {
      description: 'Face the most intense emotion without flinching - not by enduring but by being transparent to it',
      task: {
        id: 'emo-wht-probe-eros',
        type: 'scenario',
        description: 'Face emotion so intense it threatens to dissolve all structure',
        parameters: { scenarioType: 'overwhelming-affect', intensityLevel: 'maximum', structureDissolution: true, responseType: 'text' },
        measures: ['depth', 'integration'],
      },
      healthyResponse: 'Allows intensity to move through without resistance or performance; the boundary between self and emotion dissolves naturally',
      addictionSignal: 'Seeks emotional intensity as spiritual practice; uses overwhelm to feel alive or advanced',
      allergySignal: 'Genuine overwhelm reveals that transparency was partial; retreats to observer position under real pressure',
    },
    agape: {
      description: 'Return to simple feeling with luminosity - happy is just happy, sad is just sad',
      task: {
        id: 'emo-wht-probe-agape',
        type: 'emotion_identification',
        description: 'Return to simple emotion naming with luminous simplicity',
        parameters: { stimulusType: 'face', emotionSet: ['happy', 'sad', 'angry'], trials: 4, measurePresenceQuality: true },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Simple emotions met with same quality of presence as profound ones; no hierarchy, just luminous simplicity',
      addictionSignal: 'Simple emotions feel beneath achieved awareness; cannot meet ordinary feeling without adding depth',
      allergySignal: 'Has lost touch with simple emotional literacy in pursuit of non-dual equanimity',
    },
  },
};
