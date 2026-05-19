/**
 * FrequencyConditioner - generates voice/register specs from line x stage signatures.
 * Per foundations/22 sections 4.4, 5.1, 5.2, 5.3.
 */
import type { Line } from '../../core/domain/Line.js';
import type { Stage } from '../../core/domain/Stage.js';
import type { Modality } from '../../core/domain/enums.js';
import { stageOrdinal } from '../../core/domain/Stage.js';

export interface FrequencySpec {
  readonly playerFrequency: { readonly line: Line; readonly stage: Stage };
  readonly holonFrequency: { readonly line: Line; readonly stage: Stage };
  readonly modality: Modality;
  readonly toneDirective: string;
  readonly vocabularyBand: string;
  readonly valueLens: string;
  readonly taboos: readonly string[];
  readonly crossAltitudeDynamic: string | null;
}

interface StageVoice {
  readonly toneDirective: string;
  readonly vocabularyBand: string;
  readonly valueLens: string;
  readonly taboos: readonly string[];
}

const STAGE_VOICE_TABLE: Readonly<Record<Stage, StageVoice>> = {
  Infrared: {
    toneDirective: 'sensory/primal',
    vocabularyBand: 'fragments',
    valueLens: 'survival/warmth',
    taboos: ['abstraction', 'future-planning'],
  },
  Magenta: {
    toneDirective: 'symbolic/animistic',
    vocabularyBand: 'flowing/incantatory',
    valueLens: 'magic/belonging',
    taboos: ['rational analysis'],
  },
  Red: {
    toneDirective: 'action verbs/force-words',
    vocabularyBand: 'short/imperative',
    valueLens: 'power/respect/will',
    taboos: ['vulnerability', 'compromise'],
  },
  Amber: {
    toneDirective: 'formal/duty-words',
    vocabularyBand: 'structured/subordinate',
    valueLens: 'order/tradition/loyalty',
    taboos: ['questioning authority'],
  },
  Orange: {
    toneDirective: 'precise/analytical',
    vocabularyBand: 'complex/logical',
    valueLens: 'reason/merit/evidence',
    taboos: ['dogma', 'sentiment'],
  },
  Green: {
    toneDirective: 'inclusive/feeling-words',
    vocabularyBand: 'empathic/parenthetical',
    valueLens: 'sensitivity/equality',
    taboos: ['hierarchy', 'exclusion'],
  },
  Turquoise: {
    toneDirective: 'integral/paradox-holding',
    vocabularyBand: 'multi-layered/both-and',
    valueLens: 'wholeness/emergence',
    taboos: ['reductionism', 'either/or'],
  },
  White: {
    toneDirective: 'minimal/spacious',
    vocabularyBand: 'sparse/koan-like',
    valueLens: 'presence/release',
    taboos: ['grasping', 'identity-claims'],
  },
};

interface LineRegister {
  readonly style: string;
  readonly focus: string;
  readonly mode: string;
}

const LINE_REGISTER_TABLE: Readonly<Record<Line, LineRegister>> = {
  Cognitive: { style: 'analytical', focus: 'problem-oriented', mode: 'cause-effect' },
  Emotional: { style: 'felt-sense', focus: 'affect-rich', mode: 'atmosphere' },
  Moral: { style: 'principled', focus: 'dilemma-oriented', mode: 'stakeholder' },
  Intrapersonal: { style: 'reflective', focus: 'self-referential', mode: 'pattern-recognition' },
  Spiritual: { style: 'value-laden', focus: 'meaning-oriented', mode: 'mystery' },
  Somatic: { style: 'embodied', focus: 'rhythm-aware', mode: 'sensation' },
  Willpower: { style: 'effort-oriented', focus: 'commitment', mode: 'endurance' },
  Interpersonal: { style: 'relational', focus: 'other-aware', mode: 'attunement' },
};

function computeCrossAltitudeDynamic(playerStage: Stage, holonStage: Stage): string | null {
  const playerOrd = stageOrdinal(playerStage);
  const holonOrd = stageOrdinal(holonStage);
  const diff = playerOrd - holonOrd;

  if (diff === 0) {
    return 'full-mutual-intelligibility';
  }
  if (diff === 1 || diff === -1) {
    return 'productive-tension-slight-misunderstanding';
  }
  if (diff > 1) {
    return 'holon-speaks-authentically-from-its-stage';
  }
  // diff < -1: player lower than holon
  return 'holon-speaks-from-its-stage-player-perceives-awe';
}

export function generateFrequencySpec(
  playerLine: Line,
  playerStage: Stage,
  holonLine: Line,
  holonStage: Stage,
  modality: Modality,
): FrequencySpec {
  const holonVoice = STAGE_VOICE_TABLE[holonStage];
  const holonRegister = LINE_REGISTER_TABLE[holonLine];

  const toneDirective = `${holonVoice.toneDirective}; ${holonRegister.style}/${holonRegister.mode}`;
  const vocabularyBand = `${holonVoice.vocabularyBand}; ${holonRegister.focus}`;
  const valueLens = holonVoice.valueLens;
  const taboos = holonVoice.taboos;
  const crossAltitudeDynamic = computeCrossAltitudeDynamic(playerStage, holonStage);

  return {
    playerFrequency: { line: playerLine, stage: playerStage },
    holonFrequency: { line: holonLine, stage: holonStage },
    modality,
    toneDirective,
    vocabularyBand,
    valueLens,
    taboos,
    crossAltitudeDynamic,
  };
}
