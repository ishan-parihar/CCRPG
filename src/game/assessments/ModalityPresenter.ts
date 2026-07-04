import type { Modality } from '@core/domain/enums.js';
import type { Stage } from '@core/domain/Stage.js';

export interface NarrativeFrame {
  readonly intro: string;
  readonly outro: { success: string; neutral: string };
}

const RED_FRAMES: Record<Modality, NarrativeFrame> = {
  Deterministic: {
    intro: 'The carved pillar pulses with ancient patterns. Match the sequence.',
    outro: { success: 'The shrine brightens. You feel sharper.', neutral: 'The shrine dims. It will wait.' },
  },
  LanguageReflective: {
    intro: 'Your companion sits by the dying fire. Their eyes hold a question.',
    outro: { success: 'They nod slowly. Something shifted.', neutral: 'The fire crackles. Words hang in the air.' },
  },
  ScenarioChoice: {
    intro: 'A figure steps from the shadows. Their intent is unclear.',
    outro: { success: 'They step aside. The path opens.', neutral: 'They watch you pass. Judgment withheld.' },
  },
  Embodied: {
    intro: 'The war-drums begin. Your body knows this rhythm.',
    outro: { success: 'The rhythm settles into your bones.', neutral: 'The drums fade. The beat escapes you.' },
  },
  Strategic: {
    intro: 'The war-table is spread before you. Three routes. Limited forces.',
    outro: { success: 'The plan holds. Your mind is clear.', neutral: 'The map blurs. Another approach needed.' },
  },
  SocialCooperative: {
    intro: 'The scout looks to you. Others wait for direction.',
    outro: { success: 'They move as one. Trust earned.', neutral: 'Hesitation. The moment passes.' },
  },
  ImmersiveRPG: {
    intro: 'The world stretches before you. What calls?',
    outro: { success: 'Something has changed. You feel it.', neutral: 'The world continues. Unchanged.' },
  },
};

const GENERIC_FRAME: NarrativeFrame = {
  intro: 'Something stirs. Attend.',
  outro: { success: 'A shift. Subtle but real.', neutral: 'The moment passes.' },
};

export function getModalityFrame(modality: Modality, stage: Stage): NarrativeFrame {
  if (stage === 'Red') return RED_FRAMES[modality];
  return GENERIC_FRAME;
}
