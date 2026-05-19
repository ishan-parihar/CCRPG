/**
 * LanguageReflective modality contract.
 * Per foundations/22 section 6.2.
 */
import type { FrequencySpec } from '../FrequencyConditioner.js';
import type { Line } from '../../../core/domain/Line.js';
import type { Stage } from '../../../core/domain/Stage.js';
import type { ModalityContract } from './index.js';

export const LANGUAGE_REFLECTIVE_CONTRACT: ModalityContract = {
  name: 'LanguageReflective',
  fixedMechanics: [
    'session timing',
    'response recording',
    'score computation',
    'drive-signal extraction',
    'progression tracking',
    'anti-repetition',
  ],
  llmResponsibilities: [
    'generate reflective prompt',
    'generate follow-up probes',
    'score response against rubric',
    'produce narrative acknowledgment',
  ],
  generationConstraints: {
    maxWordCount: 80,
    tone: 'Determined by FrequencySpec',
    structure: 'Single prompt; no lists; no instructions',
    forbiddenPatterns: [
      'Clinical language',
      'Explicit praise/evaluation',
      'Scoring references',
      'Frame-breaking',
      'Leading questions',
    ],
  },
  scoringRubric: {
    dimensions: [
      { name: 'depth', weight: 0.3 },
      { name: 'coherence', weight: 0.2 },
      { name: 'self_reference', weight: 0.2 },
      { name: 'stage_indicators', weight: 0.2 },
      { name: 'drive_signals', weight: 0.1 },
    ],
    stageCalibration: 'Calibrated to player current stage; higher stages expect more nuanced self-reference',
  },
  outputSchema: {
    prompt: 'string',
    follow_ups: 'string[]',
    scoring_anchors: 'string[]',
  },
  fallbackBehaviour: 'Pre-authored prompt from module item-pool; keyword-matching heuristic scoring',
};

/**
 * Build an LLM prompt for a Language-Reflective encounter.
 */
export function buildPrompt(
  frequencySpec: FrequencySpec,
  encounterContext: { readonly line: Line; readonly stage: Stage; readonly purpose: string },
): string {
  const tone = frequencySpec.toneDirective;
  const vocab = frequencySpec.vocabularyBand;
  const taboos = frequencySpec.taboos.join(', ');
  const lens = frequencySpec.valueLens;

  return [
    `[REFLECTIVE PROMPT GENERATION]`,
    `Tone: ${tone}`,
    `Vocabulary: ${vocab}`,
    `Value lens: ${lens}`,
    `Avoid: ${taboos}`,
    `Line: ${encounterContext.line}`,
    `Purpose: ${encounterContext.purpose}`,
    `Generate a single reflective prompt (max 80 words) that invites the player to name or explain`,
    `an experience through the value lens above. Do not list, instruct, or evaluate.`,
    `Output JSON: { "prompt": string, "follow_ups": string[], "scoring_anchors": string[] }`,
  ].join('\n');
}

/**
 * Score a player's response against the rubric (local heuristic, no LLM call).
 * Returns a score 0-1 and signal strings.
 */
export function scoreResponse(
  response: string,
  _stage: Stage,
): { readonly score: number; readonly signals: readonly string[] } {
  const signals: string[] = [];
  const words = response.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Self-referential language detection
  const selfRefPattern = /\b(I|my|me|myself|I'm|I've|I'd|I'll)\b/gi;
  const selfRefMatches = response.match(selfRefPattern) ?? [];
  const selfRefRatio = wordCount > 0 ? selfRefMatches.length / wordCount : 0;

  // Concrete vs abstract heuristic (concrete words tend to be shorter, more common)
  const concreteWords = words.filter((w) => w.length <= 6);
  const concreteRatio = wordCount > 0 ? concreteWords.length / wordCount : 0;

  // Length adequacy (too short = low, sweet spot = 15-80 words)
  let lengthScore = 0;
  if (wordCount >= 15 && wordCount <= 80) {
    lengthScore = 1.0;
  } else if (wordCount >= 5 && wordCount < 15) {
    lengthScore = wordCount / 15;
  } else if (wordCount > 80) {
    lengthScore = 0.8;
  } else {
    lengthScore = wordCount / 5 * 0.3;
  }

  // Depth: longer, more developed responses score higher
  const depthScore = Math.min(1.0, wordCount / 30);

  // Coherence: presence of connective words
  const connectivePattern = /\b(because|since|therefore|so|but|although|however|when|after|before)\b/gi;
  const connectives = response.match(connectivePattern) ?? [];
  const coherenceScore = Math.min(1.0, connectives.length * 0.3 + 0.2);

  // Self-reference score
  const selfRefScore = Math.min(1.0, selfRefRatio * 5);

  // Stage indicators (any evidence of value-system language)
  const stageIndicatorScore = concreteRatio > 0.3 ? 0.5 : 0.3;

  // Drive signals
  const driveScore = selfRefMatches.length > 0 ? 0.4 : 0.1;

  // Weighted sum per rubric
  const score =
    depthScore * 0.3 +
    coherenceScore * 0.2 +
    selfRefScore * 0.2 +
    stageIndicatorScore * 0.2 +
    driveScore * 0.1;

  const finalScore = Math.min(1.0, Math.max(0, score * lengthScore + (1 - lengthScore) * score * 0.3));

  // Collect signals
  if (selfRefMatches.length > 0) {
    signals.push('self-referential language detected');
  }
  if (connectives.length > 0) {
    signals.push('causal reasoning present');
  }
  if (wordCount < 5) {
    signals.push('minimal response');
  }
  if (wordCount >= 30) {
    signals.push('substantial elaboration');
  }
  if (depthScore > 0.7) {
    signals.push('depth indicator');
  }

  return { score: Math.round(finalScore * 1000) / 1000, signals };
}
