/**
 * DeterministicFraming modality contract.
 * Per foundations/22 section 6.
 * LLM provides narrative framing only; all task mechanics are fixed.
 */
import type { FrequencySpec } from '../FrequencyConditioner.js';
import type { Line } from '../../../core/domain/Line.js';
import type { Stage } from '../../../core/domain/Stage.js';
import type { ModalityContract } from './index.js';

export const DETERMINISTIC_FRAMING_CONTRACT: ModalityContract = {
  name: 'Deterministic',
  fixedMechanics: [
    'ALL task mechanics',
    'timing',
    'scoring',
    'DDA',
    'input detection',
    'response evaluation',
  ],
  llmResponsibilities: [
    'narrative framing only',
    'flavor text for task presentation',
    'brief feedback text for results',
  ],
  generationConstraints: {
    maxWordCount: 40,
    tone: 'Determined by FrequencySpec',
    structure: 'Single atmospheric sentence',
    forbiddenPatterns: [
      'Instructions',
      'Hints',
      'Scoring language',
      'Encouragement',
      'Assessment terms',
    ],
  },
  scoringRubric: {
    dimensions: [
      { name: 'atmosphere', weight: 0.4 },
      { name: 'brevity', weight: 0.3 },
      { name: 'frequency_match', weight: 0.3 },
    ],
    stageCalibration: 'Framing language matches stage vocabulary band exactly',
  },
  outputSchema: {
    framing_text: 'string',
    success_text: 'string',
    failure_text: 'string',
  },
  fallbackBehaviour: 'Pre-authored framing from module item-pool',
};

/**
 * Build an LLM prompt for Deterministic modality narrative framing.
 */
export function buildFramingPrompt(
  frequencySpec: FrequencySpec,
  encounterContext: { readonly line: Line; readonly stage: Stage; readonly taskType: string },
): string {
  const tone = frequencySpec.toneDirective;
  const vocab = frequencySpec.vocabularyBand;
  const taboos = frequencySpec.taboos.join(', ');
  const lens = frequencySpec.valueLens;

  return [
    `[DETERMINISTIC FRAMING]`,
    `Tone: ${tone}`,
    `Vocabulary: ${vocab}`,
    `Value lens: ${lens}`,
    `Avoid: ${taboos}`,
    `Line: ${encounterContext.line}`,
    `Task type: ${encounterContext.taskType}`,
    `Generate a single atmospheric sentence (max 40 words) to frame this task.`,
    `Also provide brief success and failure text. No instructions, hints, or scoring language.`,
    `Output JSON: { "framing_text": string, "success_text": string, "failure_text": string }`,
  ].join('\n');
}
