/**
 * HoldRenderer - Renders willpower sustained-hold tasks.
 *
 * This renderer serves the Willpower developmental line. It measures the player's
 * capacity for sustained volitional effort - pressing and holding a target for
 * specified durations, optionally under perturbation/distraction.
 *
 * Domain context by stage:
 * - Infrared: Minimal baseline (very short hold, 1-2s)
 * - Magenta: Delay of gratification (wait 3s for reward)
 * - Red: Hold under distraction with perturbations, resist early-release temptation
 * - Amber: Sustained 8-12s holds with multi-trial consistency
 * - Orange: Strategic effort allocation across multiple holds
 * - Green: Hold AND release (switching between sustained hold and intentional release)
 * - Turquoise: Long holds (15-20s) with minimal jitter
 * - White: Hold-until-right-to-release (self-timing, no external target shown)
 *
 * The core mechanic:
 * - Player presses and sustains contact on a hold target
 * - Duration, consistency (jitter in pressure), and timing accuracy are measured
 * - Perturbations (visual distractions) test resistance to distraction
 * - Early release temptation (fake "release" prompts) tests impulse control
 *
 * Parameters from task.parameters:
 *   targetDurationMs: number - target hold duration
 *   perturbations: boolean - whether distractions appear during hold
 *   perturbationIntervalMs?: number - how often perturbations appear
 *   trials?: number - number of hold trials (default 1)
 *   earlyReleaseTemptation?: boolean - show fake release prompts
 *   temptationAt?: number[] - ms timestamps for temptation prompts
 *   countdownEnabled?: boolean - whether to show countdown (false for agency probes)
 *   partnerMode?: boolean - hold alongside NPC (communion probe)
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

interface HoldTrialData {
  readonly trialIndex: number;
  readonly targetDurationMs: number;
  readonly actualDurationMs: number;
  readonly released: boolean;
  readonly releasedEarly: boolean;
  readonly perturbationCount: number;
  readonly temptationResisted: number;
  readonly timestamp: number;
}

export class HoldRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private targetDurationMs: number;
  private perturbations: boolean;
  private perturbationIntervalMs: number;
  private totalTrials: number;
  private earlyReleaseTemptation: boolean;
  private temptationAt: number[];
  private countdownEnabled: boolean;
  private partnerMode: boolean;

  // State
  private trialData: HoldTrialData[] = [];
  private currentTrial = 0;
  private isHolding = false;
  private holdStartTime = 0;
  private perturbationCount = 0;
  private temptationsResisted = 0;
  private temptationsShown = 0;

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private holdButton!: Phaser.GameObjects.Container;
  private holdCircle!: Phaser.GameObjects.Ellipse;
  private holdRing!: Phaser.GameObjects.Arc;
  private holdLabel!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private perturbationObject!: Phaser.GameObjects.Text;
  private partnerIndicator!: Phaser.GameObjects.Ellipse;
  private trialCounter!: Phaser.GameObjects.Text;
  private progressGraphics!: Phaser.GameObjects.Graphics;
  private updateEvent: Phaser.Time.TimerEvent | null = null;
  private perturbationTimer: Phaser.Time.TimerEvent | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.targetDurationMs = (params.targetDurationMs as number) ?? 4000;
    this.perturbations = (params.perturbations as boolean) ?? false;
    this.perturbationIntervalMs = (params.perturbationIntervalMs as number) ?? 1500;
    this.totalTrials = (params.trials as number) ?? 1;
    this.earlyReleaseTemptation = (params.earlyReleaseTemptation as boolean) ?? false;
    this.temptationAt = (params.temptationAt as number[]) ?? [];
    this.countdownEnabled = (params.countdownEnabled as boolean) ?? true;
    this.partnerMode = (params.partnerMode as boolean) ?? false;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentTrial = 0;
    this.trialData = [];

    // Trial counter
    this.trialCounter = this.scene.add.text(width / 2, 90, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#667788',
    }).setOrigin(0.5);
    this.container.add(this.trialCounter);

    // Instruction
    const instruction = this.getInstruction();
    this.instructionText = this.scene.add.text(width / 2, 130, instruction, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#8899aa',
      align: 'center',
      wordWrap: { width: width - 60 },
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Hold target: concentric circles forming a button
    const centerY = height / 2 - 20;

    // Progress ring (drawn with graphics)
    this.progressGraphics = this.scene.add.graphics();
    this.progressGraphics.setPosition(width / 2, centerY);
    this.container.add(this.progressGraphics);

    // Outer ring
    this.holdRing = this.scene.add.arc(width / 2, centerY, 90, 0, 360, false, 0x2a3b5e, 0.4)
      .setStrokeStyle(4, 0x4cc9f0, 0.6);
    this.container.add(this.holdRing);

    // Hold circle (main interactive area)
    this.holdCircle = this.scene.add.ellipse(width / 2, centerY, 140, 140, 0x1b2740)
      .setStrokeStyle(3, 0x4cc9f0, 0.8);
    this.container.add(this.holdCircle);

    // Hold label
    this.holdLabel = this.scene.add.text(width / 2, centerY, 'HOLD', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      color: '#e7eaf2',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.holdLabel);

    // Timer display (below hold area)
    this.timerText = this.scene.add.text(width / 2, centerY + 100, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#4cc9f0',
    }).setOrigin(0.5);
    this.container.add(this.timerText);

    // Perturbation text (appears at random positions to distract)
    this.perturbationObject = this.scene.add.text(0, 0, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#ff6644',
    }).setOrigin(0.5).setAlpha(0);
    this.container.add(this.perturbationObject);

    // NPC partner indicator (for communion drive probes)
    if (this.partnerMode) {
      this.partnerIndicator = this.scene.add.ellipse(width / 2 + 160, centerY, 60, 60, 0x2244aa, 0.5)
        .setStrokeStyle(2, 0x4488ff, 0.5);
      this.container.add(this.partnerIndicator);
      const partnerLabel = this.scene.add.text(width / 2 + 160, centerY + 50, 'Partner', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#4488ff',
      }).setOrigin(0.5);
      this.container.add(partnerLabel);
    }

    // Make hold area interactive
    this.holdCircle.setInteractive({ useHandCursor: true });
    this.holdCircle.on('pointerdown', () => this.onHoldStart());
    this.holdCircle.on('pointerup', () => this.onHoldEnd());
    this.holdCircle.on('pointerupoutside', () => this.onHoldEnd());

    this.startTrial();
  }

  destroy(): void {
    if (this.updateEvent) this.updateEvent.destroy();
    if (this.perturbationTimer) this.perturbationTimer.destroy();
    for (const timer of this.timers) timer.destroy();
    this.timers = [];
    this.progressGraphics.destroy();
    this.container.destroy(true);
  }

  private startTrial(): void {
    if (this.currentTrial >= this.totalTrials) {
      this.completeTask();
      return;
    }

    this.isHolding = false;
    this.perturbationCount = 0;
    this.temptationsResisted = 0;
    this.temptationsShown = 0;

    if (this.totalTrials > 1) {
      this.trialCounter.setText(`Hold ${this.currentTrial + 1} of ${this.totalTrials}`);
    }

    this.holdLabel.setText('HOLD');
    this.holdCircle.setFillStyle(0x1b2740);
    this.timerText.setText(this.countdownEnabled ? `Target: ${(this.targetDurationMs / 1000).toFixed(1)}s` : '');
    this.drawProgressRing(0);
  }

  private onHoldStart(): void {
    if (this.isHolding) return;
    this.isHolding = true;
    this.holdStartTime = Date.now();

    // Visual feedback: circle lights up
    this.holdCircle.setFillStyle(0x1a3355);
    this.holdLabel.setText('HOLDING...');
    this.holdLabel.setColor('#4cc9f0');

    // Start update loop for progress ring
    this.updateEvent = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => this.updateHold(),
    });

    // Start perturbations if enabled
    if (this.perturbations) {
      this.perturbationTimer = this.scene.time.addEvent({
        delay: this.perturbationIntervalMs,
        loop: true,
        callback: () => this.showPerturbation(),
      });
    }

    // Schedule temptation prompts
    if (this.earlyReleaseTemptation && this.temptationAt.length > 0) {
      for (const ms of this.temptationAt) {
        const timer = this.scene.time.delayedCall(ms, () => this.showTemptation());
        this.timers.push(timer);
      }
    }

    // Animate partner "holding" alongside
    if (this.partnerMode && this.partnerIndicator) {
      this.scene.tweens.add({
        targets: this.partnerIndicator,
        fillAlpha: 0.8,
        duration: 300,
      });
    }
  }

  private onHoldEnd(): void {
    if (!this.isHolding) return;
    this.isHolding = false;

    const actualDuration = Date.now() - this.holdStartTime;
    const releasedEarly = actualDuration < this.targetDurationMs;

    // Stop timers
    if (this.updateEvent) {
      this.updateEvent.destroy();
      this.updateEvent = null;
    }
    if (this.perturbationTimer) {
      this.perturbationTimer.destroy();
      this.perturbationTimer = null;
    }
    for (const timer of this.timers) timer.destroy();
    this.timers = [];

    // Visual feedback
    this.holdCircle.setFillStyle(releasedEarly ? 0x332211 : 0x113322);
    this.holdLabel.setText(releasedEarly ? 'Released early' : 'Complete!');
    this.holdLabel.setColor(releasedEarly ? '#ff8844' : '#44cc66');

    // Partner releases too
    if (this.partnerMode && this.partnerIndicator) {
      this.scene.tweens.add({
        targets: this.partnerIndicator,
        fillAlpha: 0.3,
        duration: 300,
      });
    }

    // Record trial
    this.trialData.push({
      trialIndex: this.currentTrial,
      targetDurationMs: this.targetDurationMs,
      actualDurationMs: actualDuration,
      released: true,
      releasedEarly,
      perturbationCount: this.perturbationCount,
      temptationResisted: this.temptationsResisted,
      timestamp: this.holdStartTime,
    });

    this.currentTrial++;
    this.perturbationObject.setAlpha(0);

    // Brief pause then next trial
    this.scene.time.delayedCall(800, () => this.startTrial());
  }

  private updateHold(): void {
    if (!this.isHolding) return;

    const elapsed = Date.now() - this.holdStartTime;
    const progress = Math.min(1, elapsed / this.targetDurationMs);

    // Update progress ring
    this.drawProgressRing(progress);

    // Update timer text
    if (this.countdownEnabled) {
      const remaining = Math.max(0, this.targetDurationMs - elapsed);
      this.timerText.setText(`${(remaining / 1000).toFixed(1)}s`);
    } else {
      this.timerText.setText(`${(elapsed / 1000).toFixed(1)}s`);
    }

    // Auto-complete at target (for capacity mode - player can also hold beyond)
    if (elapsed >= this.targetDurationMs && this.countdownEnabled) {
      // Show "release" indicator but don't force release
      this.holdLabel.setText('RELEASE');
      this.holdLabel.setColor('#44cc66');
    }
  }

  private drawProgressRing(progress: number): void {
    this.progressGraphics.clear();
    if (progress <= 0) return;

    const angle = progress * 360;
    this.progressGraphics.lineStyle(6, 0x4cc9f0, 0.8);
    this.progressGraphics.beginPath();
    this.progressGraphics.arc(0, 0, 90, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + angle), false);
    this.progressGraphics.strokePath();
  }

  private showPerturbation(): void {
    if (!this.isHolding) return;
    this.perturbationCount++;

    const { width, height } = this.scene.scale;
    // Random position away from hold target
    const px = 60 + Math.random() * (width - 120);
    const py = 200 + Math.random() * (height / 2 - 100);

    const distractors = ['!', '?!', 'RELEASE', 'STOP', 'LOOK', '\u26A0'];
    const text = distractors[Math.floor(Math.random() * distractors.length)];

    this.perturbationObject.setPosition(px, py);
    this.perturbationObject.setText(text);
    this.perturbationObject.setAlpha(1);

    // Fade out after brief display
    this.scene.tweens.add({
      targets: this.perturbationObject,
      alpha: 0,
      duration: 600,
      delay: 300,
    });
  }

  private showTemptation(): void {
    if (!this.isHolding) return;
    this.temptationsShown++;

    // Flash "Let go!" text near the hold button
    const { width, height } = this.scene.scale;
    const temptText = this.scene.add.text(width / 2, height / 2 + 140, 'Let go now!', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#ffaa33',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(temptText);

    this.scene.tweens.add({
      targets: temptText,
      alpha: 0,
      y: height / 2 + 160,
      duration: 1200,
      onComplete: () => {
        temptText.destroy();
        // If player is still holding after temptation fades, they resisted
        if (this.isHolding) {
          this.temptationsResisted++;
        }
      },
    });
  }

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      // Accuracy: proportion of target duration achieved (capped at 1.0)
      const holdRatio = Math.min(1.0, trial.actualDurationMs / trial.targetDurationMs);
      dimensions.accuracy = holdRatio;

      // Consistency: how close to target (overshoot and undershoot both penalized)
      const deviation = Math.abs(trial.actualDurationMs - trial.targetDurationMs) / trial.targetDurationMs;
      dimensions.consistency = Math.max(0, 1 - deviation);

      // Response time: for hold tasks, this represents precision of release timing
      // 0 deviation = 1.0, 500ms+ deviation = 0.0
      const releaseDeviation = Math.abs(trial.actualDurationMs - trial.targetDurationMs);
      dimensions.response_time = Math.max(0, Math.min(1, 1 - releaseDeviation / 2000));

      // Complexity handled: perturbation resistance
      if (trial.perturbationCount > 0) {
        // Score higher if hold was maintained despite perturbations
        dimensions.complexity_handled = trial.releasedEarly
          ? Math.max(0, holdRatio - 0.2) // Penalize early release under perturbation
          : 1.0;
      }

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          targetDurationMs: trial.targetDurationMs,
          actualDurationMs: trial.actualDurationMs,
          releasedEarly: trial.releasedEarly,
          perturbationCount: trial.perturbationCount,
          temptationResisted: trial.temptationResisted,
          holdRatio,
        },
        durationMs: trial.actualDurationMs,
      };
    });

    this.onComplete(results);
  }

  private getInstruction(): string {
    if (!this.countdownEnabled) {
      return 'Press and hold. Release when it feels right.';
    }
    if (this.perturbations) {
      return 'Press and hold. Ignore distractions.';
    }
    if (this.earlyReleaseTemptation) {
      return 'Press and hold until the ring completes.\nResist temptation to let go early.';
    }
    if (this.partnerMode) {
      return 'Hold together with your partner.';
    }
    return 'Press and hold until the ring completes.';
  }
}
