/**
 * EmotionalProbe — measures affect recognition (Ekman 6).
 * Shows an emotion word/emoji and 4 options; player picks the matching one.
 * Uses FastStaircase to adapt difficulty.
 */
import Phaser from 'phaser';
import { ALL_EMOTIONS, generateAffectTrial, type Emotion } from '@core/usecases/AffectRecognitionTask.js';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

const EMOTION_DISPLAY: Record<Emotion, { emoji: string; color: number }> = {
  happy: { emoji: '😊', color: 0xffd700 },
  sad: { emoji: '😢', color: 0x4a90d9 },
  angry: { emoji: '😠', color: 0xff4d6d },
  fearful: { emoji: '😨', color: 0x9b59b6 },
  disgusted: { emoji: '🤢', color: 0x2ecc71 },
  surprised: { emoji: '😲', color: 0xff8c42 },
};

export class EmotionalProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Emotional',
    title: 'Feeling Reader',
    instruction: 'A face will appear.\nIdentify the emotion by tapping the correct label.',
    trials: 6,
    hasPractice: true,
    trialTimeoutMs: 5000,
    interTrialDelayMs: 1000,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 1, maxTrials: 6, maxReversals: 2 });
  private currentTrial = 0;
  private practiceTrials = 1;
  private trialActive = false;
  private trialStartMs = 0;

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

    const trial = generateAffectTrial();
    const display = EMOTION_DISPLAY[trial.correctEmotion];

    const statusText = isPractice ? 'Practice' : `Trial ${this.currentTrial - this.practiceTrials + 1} / ${this.config.trials}`;
    this.container.add(this.scene.add.text(width / 2, 80, statusText, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    if (this.currentTrial === 0) {
      this.container.add(this.scene.add.text(width / 2, 120, this.config.instruction, {
        fontSize: '20px', color: '#aaaacc', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 60 },
      }).setOrigin(0.5));
    }

    this.container.add(this.scene.add.text(width / 2, height / 2 - 80, display.emoji, {
      fontSize: '72px',
    }).setOrigin(0.5));

    const options = this.getOptions(trial.correctEmotion);
    const btnWidth = 150;
    const btnHeight = 50;
    const startX = width / 2 - btnWidth - 10;
    const startY = height / 2 + 40;

    this.trialStartMs = performance.now();
    this.trialActive = true;

    options.forEach((emotion, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (btnWidth + 20);
      const y = startY + row * (btnHeight + 15);

      const btn = this.scene.add.rectangle(x + btnWidth / 2, y + btnHeight / 2, btnWidth, btnHeight, 0x1a2a4a, 0.9)
        .setStrokeStyle(2, 0x334466)
        .setInteractive()
        .on('pointerdown', () => this.onChoice(trial.correctEmotion, emotion, isPractice))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a4a));

      const label = this.scene.add.text(x + btnWidth / 2, y + btnHeight / 2, emotion, {
        fontSize: '18px', color: '#ccccee', fontFamily: 'monospace',
      }).setOrigin(0.5);

      this.container.add([btn, label]);
    });

    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (this.trialActive) {
        this.trialActive = false;
        if (!isPractice) {
          this.results.push({ correct: false, reactionMs: this.config.trialTimeoutMs });
          this.staircase.recordResult(false);
        }
        this.currentTrial++;
        this.scene.time.delayedCall(500, () => this.runTrial());
      }
    });
  }

  private onChoice(correct: Emotion, chosen: Emotion, isPractice: boolean): void {
    if (!this.trialActive) return;
    this.trialActive = false;
    const reactionMs = performance.now() - this.trialStartMs;
    const isCorrect = chosen === correct;

    if (!isPractice) {
      this.results.push({ correct: isCorrect, reactionMs });
      this.staircase.recordResult(isCorrect);
    }

    const { width } = this.scene.scale;
    const fb = this.scene.add.text(width / 2, this.scene.scale.height - 100, isCorrect ? '✓ Correct' : `✗ It was: ${correct}`, {
      fontSize: '18px', color: isCorrect ? '#44ff88' : '#ff6666', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(fb);

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
  }

  private getOptions(correct: Emotion): Emotion[] {
    const others = ALL_EMOTIONS.filter(e => e !== correct);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...shuffled].sort(() => Math.random() - 0.5);
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const correctRTs = this.results.filter(r => r.correct).map(r => r.reactionMs);
    const medianRT = correctRTs.length > 0
      ? correctRTs.sort((a, b) => a - b)[Math.floor(correctRTs.length / 2)]!
      : this.config.trialTimeoutMs;

    this.onComplete({
      line: 'Emotional',
      accuracy,
      medianReactionMs: medianRT,
      threshold: this.staircase.getThreshold(),
      trials: this.results,
    });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
