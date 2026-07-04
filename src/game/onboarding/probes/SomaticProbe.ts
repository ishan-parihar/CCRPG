/**
 * SomaticProbe — measures reaction time and motor control.
 * Uses variable foreperiods; player must tap a target the instant it appears.
 * Reports median RT as threshold (lower = better).
 */
import Phaser from 'phaser';
import { generateReactionTimeTrial, scoreReactionTime } from '@core/usecases/ReactionTimeTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class SomaticProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Somatic',
    title: 'Lightning Reflex',
    instruction: 'A circle will appear after a pause.\nTap it the INSTANT it turns green.\nDo NOT tap before it appears.',
    trials: 6,
    hasPractice: true,
    trialTimeoutMs: 2000,
    interTrialDelayMs: 1000,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private currentTrial = 0;
  private practiceTrials = 2;
  private trialStartMs = 0;
  private waitingForStimulus = false;
  private stimulusShown = false;
  private target!: Phaser.GameObjects.Arc;
  private feedbackText!: Phaser.GameObjects.Text;
  private anticipationDetected = false;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0);

    this.container.add(scene.add.text(width / 2, 100, this.config.instruction, {
      fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    this.target = scene.add.circle(width / 2, height / 2, 50, 0x333355, 1)
      .setStrokeStyle(3, 0x555577);
    this.container.add(this.target);

    this.feedbackText = scene.add.text(width / 2, height / 2 + 120, '', {
      fontSize: '18px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    const tapZone = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .on('pointerdown', () => this.onTap());
    this.container.add(tapZone);

    this.runTrial();
  }

  private runTrial(): void {
    const totalTrials = this.config.trials + this.practiceTrials;
    if (this.currentTrial >= totalTrials) {
      this.finish();
      return;
    }

    const isPractice = this.currentTrial < this.practiceTrials;
    if (isPractice && this.currentTrial === 0) {
      this.feedbackText.setText('Practice — get ready...');
    } else if (!isPractice && this.currentTrial === this.practiceTrials) {
      this.feedbackText.setText('Now for real...');
      this.scene.time.delayedCall(1500, () => {
        this.feedbackText.setText('');
        this.startForeperiod();
      });
      return;
    }

    this.startForeperiod();
  }

  private startForeperiod(): void {
    const trial = generateReactionTimeTrial(Math.random, 800, 2500);
    this.target.setFillStyle(0x333355);
    this.waitingForStimulus = true;
    this.stimulusShown = false;
    this.anticipationDetected = false;

    this.scene.time.delayedCall(trial.foreperiodMs, () => {
      if (this.anticipationDetected) return;
      this.showStimulus();
    });
  }

  private showStimulus(): void {
    this.target.setFillStyle(0x44ff88);
    this.stimulusShown = true;
    this.waitingForStimulus = false;
    this.trialStartMs = performance.now();

    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (this.stimulusShown) {
        this.recordResult(false, this.config.trialTimeoutMs);
      }
    });
  }

  private onTap(): void {
    if (this.waitingForStimulus) {
      this.anticipationDetected = true;
      this.waitingForStimulus = false;
      this.target.setFillStyle(0xff4444);
      this.feedbackText.setText('Too early!');
      this.recordResult(false, 0);
      return;
    }

    if (this.stimulusShown) {
      const reactionMs = performance.now() - this.trialStartMs;
      this.stimulusShown = false;
      const result = scoreReactionTime({ reactionMs, anticipated: false });
      this.feedbackText.setText(`${Math.round(reactionMs)}ms`);
      this.recordResult(result.valid, reactionMs);
    }
  }

  private recordResult(correct: boolean, reactionMs: number): void {
    const isPractice = this.currentTrial < this.practiceTrials;
    if (!isPractice) {
      this.results.push({ correct, reactionMs });
    }

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => {
      this.feedbackText.setText('');
      this.runTrial();
    });
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const correctRTs = this.results.filter(r => r.correct && r.reactionMs > 0).map(r => r.reactionMs);
    const medianRT = correctRTs.length > 0
      ? correctRTs.sort((a, b) => a - b)[Math.floor(correctRTs.length / 2)]!
      : 2000;

    this.onComplete({
      line: 'Somatic',
      accuracy,
      medianReactionMs: medianRT,
      threshold: medianRT, // RT in ms is the threshold for somatic
      trials: this.results,
    });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
