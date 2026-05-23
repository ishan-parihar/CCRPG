import type { AssessmentTask, StageAssessment } from './types.js';

export function getOrCreateCalibrationProbe(module: StageAssessment): AssessmentTask {
  if (module.calibrationProbe) return module.calibrationProbe;

  const line = module.line;
  const stage = module.stage;

  switch (line) {
    case 'Cognitive':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Cognitive ${stage}`,
        parameters: {
          prompt: `Describe your strategy for solving complex problems. How do you handle interference or prioritize competing goals?`,
          maxResponseLength: 400,
          options: [
            'Systematically isolate variables and execute step-by-step.',
            'Trust intuitive patterns and adapt resources dynamically as needed.',
            'Gather community perspectives and build consensus on the plan.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    case 'Somatic':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'hold',
        description: `Calibration probe for Somatic ${stage}`,
        parameters: {
          durationMs: 4000,
          targetDurationMs: 4000,
          trials: 2,
        },
        measures: ['accuracy', 'response_time'],
      };
    case 'Willpower':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'hold',
        description: `Calibration probe for Willpower ${stage}`,
        parameters: {
          durationMs: 5000,
          targetDurationMs: 5000,
          trials: 2,
        },
        measures: ['accuracy', 'response_time'],
      };
    case 'Emotional':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Emotional ${stage}`,
        parameters: {
          prompt: `Two people you care about have deeply conflicting needs. Describe what you feel and how you navigate the emotional tension.`,
          maxResponseLength: 400,
          options: [
            'Prioritize rules or roles to establish order.',
            'Empathize with both perspectives and sit with the tension.',
            'Seek a higher systemic resolution that transcends their individual desires.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    case 'Moral':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Moral ${stage}`,
        parameters: {
          prompt: `Your friend broke a rule to prevent minor harm to a stranger. Authority asks you what happened. What do you say, and why?`,
          maxResponseLength: 400,
          options: [
            'Report the truth immediately because rules are absolute.',
            'Protect my friend because personal loyalty comes first.',
            'Explain the nuance and justify the rule-breaking to the authority.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    case 'Intrapersonal':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Intrapersonal ${stage}`,
        parameters: {
          prompt: `Describe a time you changed your mind about something important. What shifted in your perspective?`,
          maxResponseLength: 400,
          options: [
            'I realized my old view was factually incorrect based on new data.',
            'I integrated a completely different worldview that expanded my own.',
            'I realized my previous stance was causing harm to those around me.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    case 'Spiritual':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Spiritual ${stage}`,
        parameters: {
          prompt: `What does it mean to act in alignment with the greatest good, and how do you experience this in your daily life?`,
          maxResponseLength: 400,
          options: [
            'Strict adherence to cosmic law and duty.',
            'Acting from a place of unconditional love and service to others.',
            'Dissolving the ego to act as a clear channel for the Creator.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    case 'Interpersonal':
      return {
        id: `cal-probe-${line.toLowerCase()}-${stage.toLowerCase()}`,
        type: 'llm_dialogue',
        description: `Calibration probe for Interpersonal ${stage}`,
        parameters: {
          prompt: `Describe how you approach resolving a disagreement with someone who holds a completely different set of core values.`,
          maxResponseLength: 400,
          options: [
            'Explain my rational points and let the facts speak for themselves.',
            'Listen deeply to their perspective to find common emotional ground.',
            'Look for the evolutionary synthesis that makes room for both viewpoints.',
          ],
          isMultiSelect: false,
        },
        measures: ['depth', 'coherence'],
      };
    default:
      return module.tasks[0];
  }
}
