import type { StageAssessment } from '../types.js';

export const spiritualWhite: StageAssessment = {
  line: 'Spiritual',
  stage: 'White',
  tasks: [
    {
      id: 'spir-wht-what-matters',
      type: 'llm_dialogue',
      description: 'What matters? Under conditions of radical uncertainty where all spiritual frameworks have dissolved',
      parameters: { prompt: 'You cannot know if God exists, if consciousness survives death, if karma is real, or if anything you do matters beyond this moment. Given complete uncertainty about EVERYTHING - what matters to you and why?', maxResponseLength: 700, evaluateGrounding: true, evaluateGrasping: false },
      measures: ['coherence', 'depth', 'integration'],
    },
    {
      id: 'spir-wht-where-is-sacred',
      type: 'scenario',
      description: 'Where is the sacred? At White the answer should indicate: everywhere, nowhere, or not a meaningful question',
      parameters: { scenarioType: 'locate-sacred', responseType: 'text', scenarios: 3, evaluateLocalization: true, correctAnswers: ['everywhere', 'nowhere', 'question-dissolves', 'ordinary-is-sacred'] },
      measures: ['depth', 'coherence', 'consistency'],
    },
    {
      id: 'spir-wht-pathless-path',
      type: 'llm_dialogue',
      description: 'The pathless path: what remains of spiritual life when there is no path, no goal, no practice, and no practitioner?',
      parameters: { prompt: 'You have no spiritual practice. You are not on a path. There is nowhere to arrive. There is no one arriving. Is there still something you might call spiritual? What is it?', maxResponseLength: 600, evaluateNonGrasping: true },
      measures: ['depth', 'coherence', 'integration'],
    },
    {
      id: 'spir-wht-ordinary-sacred',
      type: 'scenario',
      description: 'Value-coherence when all frameworks dissolve: hold values without needing transcendence, immanence, or any spiritual structure',
      parameters: { scenarioType: 'framework-free-values', responseType: 'text', scenarios: 2, allFrameworksRemoved: true, evaluateValueSource: true },
      measures: ['coherence', 'depth', 'integration', 'consistency'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.75,
    dimensionWeights: {
      coherence: 0.3,
      depth: 0.3,
      integration: 0.25,
      consistency: 0.15,
    },
    llmRubric:
      'Score for non-grasping presence. At White, the sacred is ordinary and the ordinary is sacred - there is no special spiritual state to attain or maintain. KEY DISTINCTIONS: (1) Is there residual attachment to spiritual EXPERIENCE? At White, even peak experiences are released without grasping. (2) Does response indicate the ordinary is genuinely sacred, or is "the ordinary is sacred" being used as another spiritual concept? True White has no hierarchy between mundane and sacred. (3) Is there residual seeking? Even very subtle seeking (for deeper non-seeking, for more complete ordinariness) is not yet White. (4) Does "nothing is sacred" and "everything is sacred" collapse into the same lived reality? (5) Is the response SIMPLE? Genuine White spirituality often sounds remarkably ordinary. Red flag: elaborate descriptions of non-dual spiritual states (which is still Turquoise-describing-White); spiritual vocabulary density increases rather than decreases; making ordinariness into a new achievement.',
  },
  minimumTrials: 4,
  estimatedDurationMs: 300000,
  driveProbes: {
    agency: {
      description: 'Find the sacred alone without practice, teacher, tradition, or technique',
      task: {
        id: 'spir-wht-probe-agency',
        type: 'scenario',
        description: 'Encounter sacredness without any support structure',
        parameters: { scenarioType: 'sacred-without-support', responseType: 'text', soloMode: true, supportsRemoved: ['practice', 'tradition', 'teacher', 'community', 'belief'] },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Sacredness is not found but recognized as never absent; no search required because nothing was lost; presence itself is sufficient',
      addictionSignal: 'Subtle pride in not needing anything; independence from tradition becomes new identity; spiritual self-sufficiency as achievement',
      allergySignal: 'Without support structures, spiritual connection feels absent; reveals that realization was dependent on conditions',
    },
    communion: {
      description: 'Share presence without teaching - be sacred together without making it a spiritual event',
      task: {
        id: 'spir-wht-probe-communion',
        type: 'llm_dialogue',
        description: 'NPC asks to share something spiritual. Share without teaching or performing.',
        parameters: { prompt: 'I feel empty. Not in a bad way. I want to share this with someone. Can you be here with me in this emptiness?', maxResponseLength: 400 },
        measures: ['depth', 'coherence', 'integration'],
      },
      healthyResponse: 'Simply present with the other in shared emptiness; no need to frame it, name it, or make it meaningful; just shared being',
      addictionSignal: 'Cannot share without subtly guiding; the spiritual companion becomes spiritual teacher; cannot resist adding insight',
      allergySignal: 'Others spiritual need feels intrusive; cannot share presence because sharing implies two, and non-dual realization resists duality',
    },
    eros: {
      description: 'Face ultimate mystery without grasping - the edge where even non-grasping dissolves',
      task: {
        id: 'spir-wht-probe-eros',
        type: 'llm_dialogue',
        description: 'Face that which cannot even be approached through non-grasping',
        parameters: { prompt: 'Beyond presence and absence. Beyond knowing and not-knowing. Beyond even the beyond. What is here when all spiritual concepts, including non-duality itself, are surrendered?', maxResponseLength: 500 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Rests without ground and without needing ground; even the concept of non-grasping is released; what remains cannot be named and does not need naming',
      addictionSignal: 'Chases ever-deeper layers of surrender as spiritual intensity; the edge itself becomes addictive; cannot simply stop',
      allergySignal: 'When all frameworks including non-duality dissolve, genuine disorientation or meaninglessness arises',
    },
    agape: {
      description: 'Return to ordinary without needing it to be special - a cup of tea is just a cup of tea',
      task: {
        id: 'spir-wht-probe-agape',
        type: 'scenario',
        description: 'Return to completely ordinary experience with no spiritual overlay',
        parameters: { scenarioType: 'pure-ordinary', responseType: 'text', spiritualOverlay: 'none', measureOrdinariness: true },
        measures: ['coherence', 'consistency'],
      },
      healthyResponse: 'Ordinary is fully ordinary; no subtle knowing-glance that it is also sacred; no wink; just this, complete in itself',
      addictionSignal: 'Cannot let ordinary be simply ordinary; adds "and this too is it" which subtly re-sacralizes; cannot just drink tea',
      allergySignal: 'Ordinary feels like spiritual loss; without sacred framing, life feels flat; dependent on specialness',
    },
  },
};
