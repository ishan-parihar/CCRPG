/**
 * AffectRecognitionTask — facial affect recognition (Ekman 6).
 * Player identifies the emotion displayed in a stimulus.
 */

export type Emotion = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

export const ALL_EMOTIONS: readonly Emotion[] = [
  'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised',
];

export interface AffectTrial {
  /** The correct emotion displayed. */
  readonly correctEmotion: Emotion;
  /** Stimulus identifier (e.g., image filename). */
  readonly stimulusId: string;
}

export interface AffectResponse {
  readonly chosen: Emotion | null;
  readonly reactionMs: number;
}

export interface AffectResult {
  readonly correct: boolean;
  readonly reactionMs: number;
  readonly correctEmotion: Emotion;
}

export function generateAffectTrial(
  rng: () => number = Math.random,
  stimulusPool: readonly string[] = ['stimulus_01'],
): AffectTrial {
  const emotion = ALL_EMOTIONS[Math.floor(rng() * ALL_EMOTIONS.length)]!;
  const stimulusId = stimulusPool[Math.floor(rng() * stimulusPool.length)]!;
  return { correctEmotion: emotion, stimulusId };
}

export function scoreAffect(trial: AffectTrial, response: AffectResponse): AffectResult {
  return {
    correct: response.chosen === trial.correctEmotion,
    reactionMs: response.reactionMs,
    correctEmotion: trial.correctEmotion,
  };
}
