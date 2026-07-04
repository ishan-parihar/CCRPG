/**
 * ScenarioChoice modality contract.
 * Per foundations/22 section 6.
 */
import type { FrequencySpec } from '../FrequencyConditioner.js';
import type { Line } from '../../../core/domain/Line.js';
import type { Stage } from '../../../core/domain/Stage.js';
import type { ModalityContract } from './index.js';

export const SCENARIO_CHOICE_CONTRACT: ModalityContract = {
  name: 'ScenarioChoice',
  fixedMechanics: [
    'option stage-tags',
    'scoring logic',
    'consequence computation',
    'branch tracking',
  ],
  llmResponsibilities: [
    'generate scenario text',
    'generate 3-5 options with descriptions',
    'describe visible consequences',
  ],
  generationConstraints: {
    maxWordCount: 200,
    tone: 'Determined by FrequencySpec',
    structure: 'Scenario paragraph + numbered options',
    forbiddenPatterns: [
      'Explicit moral judgment',
      'Correct-answer hints',
      'Meta-game language',
      'Assessment terminology',
    ],
  },
  scoringRubric: {
    dimensions: [
      { name: 'scenario_clarity', weight: 0.25 },
      { name: 'option_balance', weight: 0.25 },
      { name: 'consequence_plausibility', weight: 0.25 },
      { name: 'frequency_match', weight: 0.25 },
    ],
    stageCalibration: 'Options reflect value systems appropriate to target stage range',
  },
  outputSchema: {
    scenario: 'string',
    options: 'Array<{id: string, text: string, consequence_hint: string}>',
  },
  fallbackBehaviour: 'Pre-authored scenario from module item-pool',
};

/**
 * Build an LLM prompt for a ScenarioChoice encounter.
 */
export function buildScenarioPrompt(
  frequencySpec: FrequencySpec,
  encounterContext: { readonly line: Line; readonly stage: Stage; readonly purpose: string },
): string {
  const tone = frequencySpec.toneDirective;
  const vocab = frequencySpec.vocabularyBand;
  const taboos = frequencySpec.taboos.join(', ');
  const lens = frequencySpec.valueLens;

  return [
    `[SCENARIO GENERATION]`,
    `Tone: ${tone}`,
    `Vocabulary: ${vocab}`,
    `Value lens: ${lens}`,
    `Avoid: ${taboos}`,
    `Line: ${encounterContext.line}`,
    `Purpose: ${encounterContext.purpose}`,
    `Generate a scenario (max 200 words) presenting a meaningful choice.`,
    `Include 3-5 options, each with a brief consequence hint.`,
    `Do not judge options or hint at a correct answer.`,
    `Output JSON: { "scenario": string, "options": [{id: string, text: string, consequence_hint: string}] }`,
  ].join('\n');
}
