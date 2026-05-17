/**
 * OnboardingProbe — the interface every per-line onboarding probe must implement.
 *
 * Each probe is a self-contained mini-game that:
 * 1. Presents itself with clear instructions and a practice round
 * 2. Runs 3-6 scored trials using the actual cognitive task engine for that line
 * 3. Reports a ProbeResult (accuracy + reaction time) when complete
 * 4. Cleans up its own visuals
 *
 * Probes are modular: one file per line. Adding a new line's probe is a
 * single-file addition, never a modification to the orchestrator.
 */
import type { Line } from '@core/domain/Line.js';

export interface ProbeConfig {
  /** The line this probe measures. */
  readonly line: Line;
  /** Human-readable name shown to the player. */
  readonly title: string;
  /** Brief instruction text. */
  readonly instruction: string;
  /** Number of scored trials (after practice). */
  readonly trials: number;
  /** Whether to show a practice trial first. */
  readonly hasPractice: boolean;
  /** Maximum time per trial in ms. */
  readonly trialTimeoutMs: number;
  /** Delay between trials in ms (for the player to breathe). */
  readonly interTrialDelayMs: number;
}

export interface ProbeTrialResult {
  readonly correct: boolean;
  readonly reactionMs: number;
}

export interface ProbeResult {
  readonly line: Line;
  /** Accuracy across all scored trials [0, 1]. */
  readonly accuracy: number;
  /** Median reaction time across correct trials. */
  readonly medianReactionMs: number;
  /** Raw trial results for detailed analysis. */
  readonly trials: readonly ProbeTrialResult[];
}

/**
 * A probe lifecycle:
 * 1. scene calls probe.start(scene) — probe takes over the scene's display
 * 2. probe runs its trials internally
 * 3. probe calls the onComplete callback with its ProbeResult
 * 4. probe.destroy() is called to clean up
 */
export interface OnboardingProbe {
  readonly config: ProbeConfig;
  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void;
  destroy(): void;
}
