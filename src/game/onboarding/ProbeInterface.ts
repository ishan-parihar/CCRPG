/**
 * OnboardingProbe — the interface every per-line onboarding probe must implement.
 *
 * Each probe is a self-contained mini-game that:
 * 1. Presents itself with clear instructions and a practice round
 * 2. Runs scored trials using FastStaircase to converge on a threshold
 * 3. Reports a ProbeResult (accuracy + reaction time + threshold) when complete
 * 4. Cleans up its own visuals
 */
import type { Line } from '@core/domain/Line.js';

export interface ProbeConfig {
  readonly line: Line;
  readonly title: string;
  readonly instruction: string;
  readonly trials: number;
  readonly hasPractice: boolean;
  readonly trialTimeoutMs: number;
  readonly interTrialDelayMs: number;
}

export interface ProbeTrialResult {
  readonly correct: boolean;
  readonly reactionMs: number;
}

export interface ProbeResult {
  readonly line: Line;
  readonly accuracy: number;
  readonly medianReactionMs: number;
  readonly threshold: number;
  readonly trials: readonly ProbeTrialResult[];
}

export interface OnboardingProbe {
  readonly config: ProbeConfig;
  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void;
  destroy(): void;
}
