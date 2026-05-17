/**
 * WillpowerProbe — measures sustained effort and impulse resistance.
 * Player holds a button for a target duration. Uses FastStaircase:
 * success → targetMs *= 1.4, failure → targetMs /= 1.4.
 */
import Phaser from 'phaser';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class WillpowerProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Willpower',
    title: 'The Hold',
    instruction: 'Press and HOLD the circle.\nKeep holding until it fills completely.\nDo not release early — even when distracted.',
    trials: 4,
    hasPractice: true,
    trialTimeoutMs: 15000,
    interTrialDelayMs: 1200,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 2000, stepUp: 1.4, stepDown: 1.4, maxReversals: 2, maxTrials: 4 });
  private currentTrial = 0;
  private practiceTrials = 1;
  private holdStartMs = 0;
  private holding = false;
  private fillBar!: Phaser.GameObjects.Rectangle;
  private targetMs = 2000;
  private fillTween: Phaser.Tweens.Tween | null = null;
  private phase: 'hold' | 'delay' | 'impulse' = 'hold';
  private delayResults: { waited: boolean }[] = [];
  private impulseResults: { resisted: boolean }[] = [];

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
    this.targetMs = 2000;
    this.runTrial();
  }

  private runTrial(): void {
    const total = this.config.trials + this.practiceTrials;
    if (this.currentTrial >= total) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const isPractice = this.currentTrial < this.practiceTrials;

    const status = isPractice ? 'Practice' : `Hold ${this.currentTrial - this.practiceTrials + 1} / ${this.config.trials}`;
    this.container.add(this.scene.add.text(width / 2, 80, status, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    if (this.currentTrial === 0) {
      this.container.add(this.scene.add.text(width / 2, 130, this.config.instruction, {
        fontSize: '20px', color: '#aaaacc', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 60 },
      }).setOrigin(0.5));
    }

    // Target duration display
    this.container.add(this.scene.add.text(width / 2, height / 2 - 130, `Hold for: ${(this.targetMs / 1000).toFixed(1)}s`, {
      fontSize: '18px', color: '#aaccee', fontFamily: 'monospace',
    }).setOrigin(0.5));

    const holdBtn = this.scene.add.circle(width / 2, height / 2, 80, 0x223344, 1)
      .setStrokeStyle(4, 0x446688)
      .setInteractive();
    this.container.add(holdBtn);

    this.fillBar = this.scene.add.rectangle(width / 2, height / 2 + 40, 0, 12, 0x44ff88);
    this.container.add(this.fillBar);

    this.container.add(this.scene.add.text(width / 2, height / 2, 'HOLD', {
      fontSize: '22px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5));

    holdBtn.on('pointerdown', () => {
      this.holding = true;
      this.holdStartMs = performance.now();
      this.fillTween = this.scene.tweens.add({
        targets: this.fillBar,
        width: 140,
        duration: this.targetMs,
        ease: 'Linear',
        onComplete: () => {
          if (this.holding) {
            this.holding = false;
            this.recordHold(true, this.targetMs);
          }
        },
      });

      // Perturbation at 60% of target
      this.scene.time.delayedCall(this.targetMs * 0.6, () => {
        if (this.holding) {
          const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.3);
          this.container.add(flash);
          this.scene.time.delayedCall(200, () => flash.destroy());
        }
      });
    });

    holdBtn.on('pointerup', () => {
      if (!this.holding) return;
      this.holding = false;
      this.fillTween?.stop();
      const heldMs = performance.now() - this.holdStartMs;
      const success = heldMs >= this.targetMs * 0.95;
      this.recordHold(success, heldMs);
    });

    // Timeout if never pressed
    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (!this.holding && this.currentTrial < total && this.fillBar.width === 0) {
        this.recordHold(false, 0);
      }
    });
  }

  private recordHold(success: boolean, heldMs: number): void {
    const isPractice = this.currentTrial < this.practiceTrials;
    const { width, height } = this.scene.scale;

    if (!isPractice) {
      this.results.push({ correct: success, reactionMs: heldMs });
      const { done, currentLevel } = this.staircase.recordResult(success);
      this.targetMs = currentLevel;
      if (done) {
        this.currentTrial = this.config.trials + this.practiceTrials; // force finish
        this.scene.time.delayedCall(500, () => this.finish());
        return;
      }
    }

    const fb = success ? '✓ Held!' : `Released at ${(heldMs / 1000).toFixed(1)}s / ${(this.targetMs / 1000).toFixed(1)}s`;
    this.container.add(this.scene.add.text(width / 2, height / 2 + 140, fb, {
      fontSize: '18px', color: success ? '#44ff88' : '#ff8844', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
  }

  private finish(): void {
    if (this.phase === 'hold') {
      // Move to delay-of-gratification phase
      this.phase = 'delay';
      this.currentTrial = 0;
      this.runDelayTrial();
      return;
    }
    if (this.phase === 'delay') {
      // Move to impulse-resistance phase
      this.phase = 'impulse';
      this.currentTrial = 0;
      this.runImpulseTrial();
      return;
    }

    // Final scoring: combine all three dimensions
    const holdCorrect = this.results.filter(r => r.correct).length;
    const holdAccuracy = this.results.length > 0 ? holdCorrect / this.results.length : 0;
    const delayScore = this.delayResults.length > 0
      ? this.delayResults.filter(d => d.waited).length / this.delayResults.length : 0;
    const impulseScore = this.impulseResults.length > 0
      ? this.impulseResults.filter(i => i.resisted).length / this.impulseResults.length : 0;

    // Composite accuracy: weighted average of all three dimensions
    const compositeAccuracy = holdAccuracy * 0.4 + delayScore * 0.3 + impulseScore * 0.3;

    const medianRT = this.results.length > 0
      ? this.results.map(r => r.reactionMs).sort((a, b) => a - b)[Math.floor(this.results.length / 2)]!
      : 0;

    const thresholdSec = this.staircase.getThreshold() / 1000;

    this.onComplete({
      line: 'Willpower',
      accuracy: compositeAccuracy,
      medianReactionMs: medianRT,
      threshold: thresholdSec,
      trials: this.results,
    });
  }

  private runDelayTrial(): void {
    if (this.currentTrial >= 3) {
      this.phase = 'impulse';
      this.currentTrial = 0;
      this.runImpulseTrial();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const waitSec = 3 + this.currentTrial * 2; // 3s, 5s, 7s

    this.container.add(this.scene.add.text(width / 2, 80, `Delay Challenge ${this.currentTrial + 1} / 3`, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.container.add(this.scene.add.text(width / 2, height / 2 - 80, `Tap NOW for 1 point\nor WAIT ${waitSec} seconds for 3 points`, {
      fontSize: '20px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5));

    let waited = false;
    const nowBtn = this.scene.add.rectangle(width / 2 - 100, height / 2 + 40, 160, 60, 0x4a2020, 0.9)
      .setStrokeStyle(2, 0x884444).setInteractive()
      .on('pointerdown', () => {
        if (waited) return;
        waited = true;
        this.delayResults.push({ waited: false });
        this.currentTrial++;
        this.scene.time.delayedCall(800, () => this.runDelayTrial());
      });
    this.container.add(nowBtn);
    this.container.add(this.scene.add.text(width / 2 - 100, height / 2 + 40, 'Take 1 now', {
      fontSize: '18px', color: '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Auto-reward after wait
    this.scene.time.delayedCall(waitSec * 1000, () => {
      if (!waited) {
        waited = true;
        this.delayResults.push({ waited: true });
        this.container.removeAll(true);
        this.container.add(this.scene.add.text(width / 2, height / 2, '✓ +3 points — patience rewarded', {
          fontSize: '20px', color: '#44ff88', fontFamily: 'monospace',
        }).setOrigin(0.5));
        this.currentTrial++;
        this.scene.time.delayedCall(1000, () => this.runDelayTrial());
      }
    });

    // Countdown display
    let remaining = waitSec;
    const countText = this.scene.add.text(width / 2 + 100, height / 2 + 40, `${remaining}s`, {
      fontSize: '28px', color: '#88ccaa', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(countText);
    const timer = this.scene.time.addEvent({
      delay: 1000, repeat: waitSec - 1,
      callback: () => { remaining--; countText.setText(`${remaining}s`); },
    });
    this.container.add({ destroy: () => timer.destroy() } as unknown as Phaser.GameObjects.GameObject);
  }

  private runImpulseTrial(): void {
    if (this.currentTrial >= 6) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const isGo = Math.random() > 0.4; // 60% go, 40% no-go

    this.container.add(this.scene.add.text(width / 2, 80, `Impulse ${this.currentTrial + 1} / 6 — Tap GREEN only!`, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    const color = isGo ? 0x44ff88 : 0xff4444;
    const circle = this.scene.add.circle(width / 2, height / 2, 60, color)
      .setInteractive();
    this.container.add(circle);

    let responded = false;
    circle.on('pointerdown', () => {
      if (responded) return;
      responded = true;
      if (isGo) {
        this.impulseResults.push({ resisted: true }); // correctly tapped green
      } else {
        this.impulseResults.push({ resisted: false }); // incorrectly tapped red
      }
      this.currentTrial++;
      this.scene.time.delayedCall(600, () => this.runImpulseTrial());
    });

    // Timeout: if they don't tap
    this.scene.time.delayedCall(1500, () => {
      if (!responded) {
        responded = true;
        if (isGo) {
          this.impulseResults.push({ resisted: false }); // missed green (low engagement)
        } else {
          this.impulseResults.push({ resisted: true }); // correctly resisted red
        }
        this.currentTrial++;
        this.scene.time.delayedCall(400, () => this.runImpulseTrial());
      }
    });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
