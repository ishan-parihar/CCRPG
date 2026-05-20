import type { StageAssessment } from '../types.js';

export const intrapersonalOrange: StageAssessment = {
  line: 'Intrapersonal',
  stage: 'Orange',
  tasks: [
    {
      id: 'intra-ora-self-assess',
      type: 'self_report',
      description: 'Self-assessment accuracy: rate own performance then compare',
      parameters: { prompts: ['How well did you do?', 'What would you change?'], responseType: 'text', compareToActual: true },
      measures: ['metacognition', 'self_correction', 'depth'],
    },
    {
      id: 'intra-ora-bias',
      type: 'scenario',
      description: 'Bias awareness: identify own cognitive biases in scenarios',
      parameters: { scenarioType: 'bias-identification', biases: ['confirmation', 'anchoring', 'availability'], scenarios: 4 },
      measures: ['metacognition', 'depth', 'coherence'],
    },
  ],
  scoringRubric: {
    passThreshold: 0.65,
    dimensionWeights: {
      depth: 0.3,
      metacognition: 0.3,
      coherence: 0.2,
      self_correction: 0.2,
    },
  },
  minimumTrials: 4,
  estimatedDurationMs: 210000,
  driveProbes: {
    agency: {
      description: 'Assess own biases without external feedback',
      task: {
        id: 'intra-ora-probe-agency',
        type: 'self_report',
        description: 'Identify own biases without feedback',
        parameters: { prompts: ['What biases might you have here?'], responseType: 'text', soloMode: true },
        measures: ['metacognition', 'depth'],
      },
      healthyResponse: 'Identifies biases with honest self-assessment',
      addictionSignal: 'Over-analyzes self to point of paralysis',
      allergySignal: 'Cannot identify any personal biases',
    },
    communion: {
      description: 'Help NPC identify their bias',
      task: {
        id: 'intra-ora-probe-communion',
        type: 'llm_dialogue',
        description: 'Help NPC notice their cognitive bias',
        parameters: { prompt: 'I keep choosing the same thing. Am I biased?', maxResponseLength: 400 },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Helps other see bias without judgment',
      addictionSignal: 'Judges others biases harshly',
      allergySignal: 'Cannot discuss bias with others',
    },
    eros: {
      description: 'Face situation where self-knowledge is uncomfortable',
      task: {
        id: 'intra-ora-probe-eros',
        type: 'scenario',
        description: 'Face uncomfortable self-knowledge scenario',
        parameters: { scenarioType: 'uncomfortable-truth', responseType: 'text' },
        measures: ['depth', 'metacognition', 'self_correction'],
      },
      healthyResponse: 'Engages with uncomfortable self-knowledge',
      addictionSignal: 'Compulsively seeks self-criticism',
      allergySignal: 'Refuses to face uncomfortable truths',
    },
    agape: {
      description: 'Accept current self-knowledge without judgment',
      task: {
        id: 'intra-ora-probe-agape',
        type: 'self_report',
        description: 'Accept what you know about yourself with compassion',
        parameters: { prompts: ['What do you know about yourself right now?'], responseType: 'text' },
        measures: ['depth', 'coherence'],
      },
      healthyResponse: 'Accepts self-knowledge with compassion',
      addictionSignal: 'Refuses self-acceptance, demands perfection',
      allergySignal: 'Cannot engage with self-knowledge at all',
    },
  },
};
