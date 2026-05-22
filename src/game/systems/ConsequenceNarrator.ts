import type { Modality } from '@core/domain/enums.js';

export interface ConsequenceNarration {
  readonly text: string;
  readonly duration: number;
}

const NARRATIONS: Record<Modality, { passed: string[]; neutral: string[] }> = {
  Deterministic: {
    passed: ["The shrine's light lingers in your eyes.", 'Something quickened.', 'The pattern holds.'],
    neutral: ['The shrine waits.', 'Not yet.', 'The pattern slips away.'],
  },
  LanguageReflective: {
    passed: ['Your companion nods. Words found their mark.', 'Something was named that needed naming.'],
    neutral: ['The words scatter.', 'Meaning slips.'],
  },
  ScenarioChoice: {
    passed: ['The stranger steps aside. Respect earned.', 'A path opens where none was.'],
    neutral: ['The stranger watches. Unmoved.', 'The path remains closed.'],
  },
  Embodied: {
    passed: ['The rhythm settles into your bones.', 'Your body remembers.'],
    neutral: ['The rhythm falters.', 'Your body forgets.'],
  },
  Strategic: {
    passed: ['The plan holds. Clarity.', 'Pieces fall into place.'],
    neutral: ['The pieces scatter.', 'Fog.'],
  },
  SocialCooperative: {
    passed: ['They move as one. Trust.', 'The group breathes together.'],
    neutral: ['They hesitate.', 'The group fractures.'],
  },
  ImmersiveRPG: {
    passed: ['Something shifted. You feel it.', 'The world noticed.'],
    neutral: ['The world is indifferent.', 'Nothing stirs.'],
  },
};

export function narrateConsequence(modality: Modality, passed: boolean): ConsequenceNarration {
  const pool = passed ? NARRATIONS[modality].passed : NARRATIONS[modality].neutral;
  const text = pool[Math.floor(Math.random() * pool.length)]!;
  return { text, duration: 2500 };
}
