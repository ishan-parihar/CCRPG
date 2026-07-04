/**
 * FastStaircase — simplified staircase for onboarding (larger steps, fewer trials).
 * Converges quickly to estimate a player's threshold level.
 */

export interface FastStaircaseConfig {
  readonly startLevel: number;
  readonly stepUp: number;
  readonly stepDown: number;
  readonly maxReversals: number;
  readonly maxTrials: number;
}

const DEFAULTS: Omit<FastStaircaseConfig, 'startLevel'> = {
  stepUp: 1.4,
  stepDown: 1.4,
  maxReversals: 2,
  maxTrials: 6,
};

export class FastStaircase {
  private level: number;
  private readonly config: FastStaircaseConfig;
  private trials = 0;
  private reversals = 0;
  private lastDirection: 'up' | 'down' | null = null;
  private reversalLevels: number[] = [];

  constructor(opts: Partial<FastStaircaseConfig> & { startLevel: number }) {
    this.config = { ...DEFAULTS, ...opts };
    this.level = this.config.startLevel;
  }

  recordResult(correct: boolean): { done: boolean; currentLevel: number } {
    this.trials++;
    const prevDirection = this.lastDirection;

    if (correct) {
      this.level *= this.config.stepUp;
      this.lastDirection = 'up';
    } else {
      this.level /= this.config.stepDown;
      this.lastDirection = 'down';
    }

    if (prevDirection !== null && prevDirection !== this.lastDirection) {
      this.reversals++;
      this.reversalLevels.push(this.level);
    }

    const done = this.reversals >= this.config.maxReversals || this.trials >= this.config.maxTrials;
    return { done, currentLevel: this.level };
  }

  getThreshold(): number {
    if (this.reversalLevels.length >= 2) {
      const last2 = this.reversalLevels.slice(-2);
      return (last2[0]! + last2[1]!) / 2;
    }
    return this.level;
  }
}
