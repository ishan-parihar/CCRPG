/**
 * Contract registry and shared types for modality contracts.
 * Per foundations/22 sections 6.1-6.3.
 */
import type { Modality } from '../../../core/domain/enums.js';
import { LANGUAGE_REFLECTIVE_CONTRACT } from './LanguageReflective.js';
import { SCENARIO_CHOICE_CONTRACT } from './ScenarioChoice.js';
import { DETERMINISTIC_FRAMING_CONTRACT } from './DeterministicFraming.js';

export interface ScoringDimension {
  readonly name: string;
  readonly weight: number;
}

export interface ScoringRubric {
  readonly dimensions: readonly ScoringDimension[];
  readonly stageCalibration: string;
}

export interface GenerationConstraints {
  readonly maxWordCount: number;
  readonly tone: string;
  readonly structure: string;
  readonly forbiddenPatterns: readonly string[];
}

export interface ModalityContract {
  readonly name: Modality;
  readonly fixedMechanics: readonly string[];
  readonly llmResponsibilities: readonly string[];
  readonly generationConstraints: GenerationConstraints;
  readonly scoringRubric: ScoringRubric;
  readonly outputSchema: Readonly<Record<string, string>>;
  readonly fallbackBehaviour: string;
}

function createPlaceholderContract(modality: Modality): ModalityContract {
  return {
    name: modality,
    fixedMechanics: ['placeholder'],
    llmResponsibilities: ['placeholder'],
    generationConstraints: {
      maxWordCount: 100,
      tone: 'Determined by FrequencySpec',
      structure: 'placeholder',
      forbiddenPatterns: [],
    },
    scoringRubric: {
      dimensions: [{ name: 'placeholder', weight: 1.0 }],
      stageCalibration: 'placeholder',
    },
    outputSchema: { output: 'string' },
    fallbackBehaviour: 'Generic fallback content',
  };
}

export const contractRegistry: Readonly<Record<string, ModalityContract>> = {
  LanguageReflective: LANGUAGE_REFLECTIVE_CONTRACT,
  ScenarioChoice: SCENARIO_CHOICE_CONTRACT,
  Deterministic: DETERMINISTIC_FRAMING_CONTRACT,
  Strategic: createPlaceholderContract('Strategic'),
  Embodied: createPlaceholderContract('Embodied'),
  SocialCooperative: createPlaceholderContract('SocialCooperative'),
  ImmersiveRPG: createPlaceholderContract('ImmersiveRPG'),
};

export function getContract(modality: Modality): ModalityContract {
  return contractRegistry[modality];
}
