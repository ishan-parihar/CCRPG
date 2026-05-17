/**
 * WillpowerProbe — measures sustained effort and impulse resistance.
 * Player must hold a button for a target duration. Perturbations (visual
 * distractions) tempt early release.
 */
import Phaser from 'phaser';
import { generateHeldInputTrial, scoreHeldInput } from '@core/usecases/HeldInputTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class WillpowerProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Willpower',
    title: 'The Hold',
    instruction: 'Press and HOLD the circle.\nKeep holding until it fills completely.\nDo not release early — even when distracted.',
    trials: 4,
    hasPractice: true,
    trialTimeoutMs: 5000,
    interTrialDelayMs: 1200,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private currentTrial = 0;
  private practiceTrials = 1;
  private holdStartMs = 0;
  private holding = false;
  private fillBar!: Phaser.GameObjects.Rectangle;
  private targetMs = 3000;
  private fillTween: Phaser.Tweens.Tween | null = null;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
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

    const trial = generateHeldInputTrial(Math.random, this.targetMs, 0.5);

    // Status
    const status = isPractice ? 'Practice' : `Hold ${this.currentTrial - this.practiceTrials + 1} / ${this.config.trials}`;
    this.container.add(this.scene.add.text(width / 2, 80, status, {
      fontSize: '14px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    if (this.currentTrial === 0) {
      this.container.add(this.scene.add.text(width / 2, 130, this.config.instruction, {
        fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 60 },
      }).setOrigin(0.5));
    }

    // Hold target (large circle)
    const holdBtn = this.scene.add.circle(width / 2, height / 2, 80, 0x223344, 1)
      .setStrokeStyle(4, 0x446688)
      .setInteractive();
    this.container.add(holdBtn);

    // Fill bar (inside the circle, grows as you hold)
    this.fillBar = this.scene.add.rectangle(width / 2, height / 2 + 40, 0, 12, 0x44ff88);
    this.container.add(this.fillBar);

    // Label
    this.container.add(this.scene.add.text(width / 2, height / 2, 'HOLD', {
      fontSize: '20px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5));

    holdBtn.on('pointerdown', () => {
      this.holding = true;
      this.holdStartMs = performance.now();
      this.fillTween = this.scene.tweens.add({
        targets: this.fillBar,
        width: 140,
        duration: trial.targetMs,
        ease: 'Linear',
      });

      // Perturbation (visual distraction)
      if (trial.hasPerturbation) {
        this.scene.time.delayedCall(trial.perturbationAtMs, () => {
          if (this.holding) {
            // Flash the screen red briefly
            const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.3);
            this.container.add(flash);
            this.scene.time.delayedCall(200, () => flash.destroy());
          }
        });
      }
    });

    holdBtn.on('pointerup', () => {
      if (!this.holding) return;
      this.holding = false;
      this.fillTween?.stop();
      const heldMs = performance.now() - this.holdStartMs;
      const result = scoreHeldInput(trial, { heldMs, releasedDuringPerturbation: heldMs < trial.perturbationAtMs });

      if (!isPractice) {
        this.results.push({ correct: result.success, reactionMs: heldMs });
      }

      // Feedback
      const fb = result.success ? '✓ Held!' : `Released at ${Math.round(heldMs)}ms / ${trial.targetMs}ms`;
      this.container.add(this.scene.add.text(width / 2, height / 2 + 140, fb, {
        fontSize: '14px', color: result.success ? '#44ff88' : '#ff8844', fontFamily: 'monospace',
      }).setOrigin(0.5));

      this.currentTrial++;
      this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
    });

    // Timeout (if they never press)
    this.scene.time.delayedCall(this.config.trialTimeoutMs + 2000, () => {
      if (!this.holding && this.currentTrial < total) {
        if (!isPractice) {
          this.results.push({ correct: false, reactionMs: 0 });
        }
        this.currentTrial++;
        this.runTrial();
      }
    });
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const medianRT = this.results.length > 0
      ? this.results.map(r => r.reactionMs).sort((a, b) => a - b)[Math.floor(this.results.length / 2)]!
      : 0;

    this.onComplete({ line: 'Willpower', accuracy, medianReactionMs: medianRT, trials: this.results });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
