import type { StageAssessment } from '../types.js';

export const cognitiveWhite: StageAssessment = {
  line: 'Cognitive',
  stage: 'White',
  tasks: [
    {
      id: 'cog-wht-nback-effortless',
      type: 'n_back',
      description: 'N=5 n-back measuring effortlessness: consistency and absence of strain rather than raw accuracy',
      parameters: { n: 5, trials: 25, stimulusDurationMs: 900, interStimulusMs: 300, adaptive: false, measureEffortlessness: true, varianceThreshold: 0.05 },
      measures: ['accuracy', 'consistency', 'response_time'],
    },
    {
      id: 'cog-wht-paradox-resolution',
      type: 'llm_dialogue',
      description: 'Paradox resolution: present logical paradox and measure quality of response without time pressure',
      parameters: { prompt: 'A master says: "The thought that seeks truth IS the obstacle to truth. But without seeking, how will you find it?" Respond not with an answer but with what arises.', maxResponseLength: 800, timePressure: false, evaluateNonConceptual: true },
      measures: ['depth', 'coherence', 'complexity_handled'],
    },
    {
      id: 'cog-wht-what-is-question',
      type: 'scenario',
      description: 'Present complex scenario; ask player to identify the REAL question rather than answer the apparent one',
      parameters: { scenarioType: 'hidden-question', scenarios: 3, responseType: 'text', surfaceQuestion: 'What should the village do about the drought?', hiddenDepth: 'identity-of-asker', evaluateLevels: ['surface', 'structural', 'ontological'] },
      measures: ['depth', 'coherence', 'self_correction', 'complexity_handled'],
    },
    {
      id: 'cog-wht-transparent-thought',
      type: 'llm_dialogue',
      description: 'Describe thinking itself without content: can cognition observe its own arising without grasping at the content?',
      parameters: { prompt: 'Without describing WHAT you think, describe the nature of thinking itself. What is thought before it becomes about something?', maxResponseLength: 600, evaluateNonDual: true },
      measures: ['depth', 'metacognition', 'coherence'],
    },
    {
      id: 'cog-wht-unknowing',
      type: 'scenario',
      description: 'Encounter genuine unknowability: can the mind rest in not-knowing without collapsing into pseudo-answers?',
      parameters: { scenarioType: 'radical-unknowing', responseType: 'text', scenarios: 2, presentUnanswerable: true, measureGraspingAtAnswers: true },
      measures: ['depth', 'coherence', 'integration'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      depth: 0.3,
      coherence: 0.25,
      complexity_handled: 0.2,
      self_correction: 0.15,
      consistency: 0.1,
    },
    llmRubric:
      'Score for non-dual cognitive transparency. At White, thought is transparent to itself - it arises and dissolves without the knower grasping. KEY DISTINCTIONS: (1) Does the response demonstrate EFFORTLESS knowing vs. effortful analysis? Genuine White cognition does not strain. (2) Is there residual grasping-at-understanding, or does not-knowing feel as natural as knowing? (3) Does paradox dissolve naturally rather than being "solved" or "transcended" (which would be Turquoise performance)? (4) Is the player performing non-dual cognition (using the right words) vs. genuinely embodying it (the words arise from lived transparency)? Red flag: sophisticated spiritual vocabulary without lived quality.',
  },
  minimumTrials: 5,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Resolve paradox alone without deliberation - direct knowing without the knower',
      task: {
        id: 'cog-wht-probe-agency',
        type: 'llm_dialogue',
        description: 'Face paradox alone and let resolution arise without deliberation',
        parameters: { prompt: 'You know something that cannot be thought. Express it without using concepts you have learned from others.', maxResponseLength: 500, soloMode: true },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Direct knowing arises without strain or performance; words emerge from silence rather than from accumulated knowledge',
      addictionSignal: 'Subtle pride in being the one who knows-without-knowing; non-dual insight becomes identity territory',
      allergySignal: 'Collapses back into conceptual frameworks because resting in unknowing feels like cognitive failure',
    },
    communion: {
      description: 'Help NPC see beyond concepts without imposing non-conceptual framework',
      task: {
        id: 'cog-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC is trapped in over-thinking. Help them see beyond concepts without teaching a technique.',
        parameters: { prompt: 'I keep thinking and thinking but I cannot find the answer. What am I doing wrong?', maxResponseLength: 500 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Meets the other where they are and presence itself dissolves the fixation; does not teach non-duality as another concept',
      addictionSignal: 'Teaches non-duality as a superior framework; subtle guru-identity performing the helper-beyond-concepts role',
      allergySignal: 'Cannot communicate non-conceptual knowing to others; retreats into private silence',
    },
    eros: {
      description: 'Face an unknowable paradox that dissolves all frameworks including non-dual ones',
      task: {
        id: 'cog-wht-probe-eros',
        type: 'scenario',
        description: 'A paradox that cannot be resolved even through non-dual awareness',
        parameters: { scenarioType: 'meta-paradox', responseType: 'text', paradoxLevel: 'self-referential-non-dual' },
        measures: ['depth', 'coherence', 'complexity_handled'],
      },
      healthyResponse: 'Rests in the paradox without needing resolution and without performing resting-in-paradox; genuine ease with groundlessness',
      addictionSignal: 'Keeps reaching for deeper layers of paradox as spiritual entertainment; complexity becomes subtle grasping',
      allergySignal: 'The meta-paradox triggers anxiety; falls back to simpler frameworks for safety',
    },
    agape: {
      description: 'Return to simple knowing with full presence - think a simple thought with complete transparency',
      task: {
        id: 'cog-wht-probe-agape',
        type: 'n_back',
        description: 'Return to n=2 with absolute effortlessness and transparency',
        parameters: { n: 2, trials: 6, stimulusDurationMs: 1500, interStimulusMs: 600 },
        measures: ['accuracy', 'consistency'],
      },
      healthyResponse: 'Simple cognition performed with same transparency as highest; no hierarchy between simple and complex knowing',
      addictionSignal: 'Cannot return to simple thought without feeling it is beneath achieved awareness; subtle spiritual pride',
      allergySignal: 'Over-effortful even at simplest level; transparency has not actually pervaded ordinary cognition',
    },
  },
};
