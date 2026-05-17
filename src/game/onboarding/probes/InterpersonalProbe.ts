/**
 * InterpersonalProbe — measures attunement to another's signals.
 * A "companion" NPC shows directional cues (left/right arrows).
 * Player must mirror the companion's direction, ignoring the position
 * of the cue on screen (Simon-task variant framed as social attunement).
 */
import Phaser from 'phaser';
import { generateSimonTrial, type SimonDirection } from '@core/usecases/SimonTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class InterpersonalProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Interpersonal',
    title: 'Mirror the Companion',
    instruction: 'Your companion will point a direction.\nTap the SAME direction they point —\nignore WHERE on screen the arrow appears.',
    trials: 8,
    hasPractice: true,
    trialTimeoutMs: 2500,
    interTrialDelayMs: 800,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private currentTrial = 0;
  private practiceTrials = 2;
  private trialActive = false;
  private trialStartMs = 0;
  private currentCorrectDir: SimonDirection = 'left';
  private leftBtn!: Phaser.GameObjects.Rectangle;
  private rightBtn!: Phaser.GameObjects.Rectangle;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0);

    // Instruction
    this.container.add(scene.add.text(width / 2, 100, this.config.instruction, {
      fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    // Response buttons (always visible at bottom)
    this.leftBtn = scene.add.rectangle(width / 4, height - 120, 140, 80, 0x1a3a4a, 0.9)
      .setStrokeStyle(2, 0x446688)
      .setInteractive()
      .on('pointerdown', () => this.onChoice('left'));
    this.rightBtn = scene.add.rectangle(3 * width / 4, height - 120, 140, 80, 0x1a3a4a, 0.9)
      .setStrokeStyle(2, 0x446688)
      .setInteractive()
      .on('pointerdown', () => this.onChoice('right'));

    this.container.add([this.leftBtn, this.rightBtn]);
    this.container.add(scene.add.text(width / 4, height - 120, '← LEFT', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5));
    this.container.add(scene.add.text(3 * width / 4, height - 120, 'RIGHT →', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.scene.time.delayedCall(2000, () => this.runTrial());
  }

  private runTrial(): void {
    const total = this.config.trials + this.practiceTrials;
    if (this.currentTrial >= total) {
      this.finish();
      return;
    }

    const { width, height } = this.scene.scale;
    const isPractice = this.currentTrial < this.practiceTrials;

    // Generate Simon trial (50% incongruent for interpersonal challenge)
    const trial = generateSimonTrial(Math.random, 0.5);
    this.currentCorrectDir = trial.direction;

    // Clear previous arrow
    this.container.getAll().forEach(obj => {
      if ((obj as Phaser.GameObjects.GameObject).getData?.('arrow')) obj.destroy();
    });

    // Show companion's arrow at the POSITION (which may be incongruent)
    const arrowX = trial.position === 'left' ? width / 4 : 3 * width / 4;
    const arrowText = trial.direction === 'left' ? '◀' : '▶';
    const arrow = this.scene.add.text(arrowX, height / 2, arrowText, {
      fontSize: '64px', color: '#ffcc44',
    }).setOrigin(0.5).setData('arrow', true);
    this.container.add(arrow);

    // Companion label
    const companionLabel = this.scene.add.text(width / 2, height / 2 - 80,
      isPractice ? '(Practice) Companion points:' : 'Companion points:', {
        fontSize: '14px', color: '#666688', fontFamily: 'monospace',
      }).setOrigin(0.5).setData('arrow', true);
    this.container.add(companionLabel);

    this.trialStartMs = performance.now();
    this.trialActive = true;

    // Timeout
    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (this.trialActive) {
        this.trialActive = false;
        if (!isPractice) {
          this.results.push({ correct: false, reactionMs: this.config.trialTimeoutMs });
        }
        this.currentTrial++;
        this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
      }
    });
  }

  private onChoice(chosen: SimonDirection): void {
    if (!this.trialActive) return;
    this.trialActive = false;
    const reactionMs = performance.now() - this.trialStartMs;
    const correct = chosen === this.currentCorrectDir;
    const isPractice = this.currentTrial < this.practiceTrials;

    if (!isPractice) {
      this.results.push({ correct, reactionMs });
    }

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const correctRTs = this.results.filter(r => r.correct).map(r => r.reactionMs);
    const medianRT = correctRTs.length > 0
      ? correctRTs.sort((a, b) => a - b)[Math.floor(correctRTs.length / 2)]!
      : this.config.trialTimeoutMs;

    this.onComplete({ line: 'Interpersonal', accuracy, medianReactionMs: medianRT, trials: this.results });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
