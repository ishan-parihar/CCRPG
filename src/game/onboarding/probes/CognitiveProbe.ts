/**
 * CognitiveProbe — measures working memory via adaptive n-back.
 * Starts at n=1, uses FastStaircase to converge on the player's n-level.
 * After 2 consecutive correct: step up. After 1 incorrect: step down.
 */
import Phaser from 'phaser';
import { generateNBackSequence } from '@core/usecases/NBackTask.js';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

const COLORS = [0xff4d6d, 0x4ecdc4, 0xffd700, 0x7b68ee, 0x4a90d9];
const SYMBOL_SIZE = 60;

export class CognitiveProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Cognitive',
    title: 'Memory Echo',
    instruction: 'A sequence of symbols will appear.\nTap when the current symbol matches\nthe one N positions back.',
    trials: 8,
    hasPractice: true,
    trialTimeoutMs: 3000,
    interTrialDelayMs: 800,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 1, stepUp: 1.4, stepDown: 1.4, maxReversals: 2, maxTrials: 6 });
  private sequence: ReturnType<typeof generateNBackSequence> = [];
  private currentN = 1;
  private currentTrialIdx = 0;
  private trialStartMs = 0;
  private responded = false;
  private practiceMode = true;
  private consecutiveCorrect = 0;
  private feedbackText!: Phaser.GameObjects.Text;
  private symbolDisplay!: Phaser.GameObjects.Rectangle;
  private statusText!: Phaser.GameObjects.Text;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0);

    this.container.add(scene.add.text(width / 2, 100, this.config.instruction, {
      fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    this.symbolDisplay = scene.add.rectangle(width / 2, height / 2 - 40, SYMBOL_SIZE, SYMBOL_SIZE, 0x333355)
      .setStrokeStyle(3, 0x666688);
    this.container.add(this.symbolDisplay);

    const tapZone = scene.add.rectangle(width / 2, height / 2 + 120, 200, 80, 0x223344, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.onTap());
    const tapLabel = scene.add.text(width / 2, height / 2 + 120, 'TAP if MATCH', {
      fontSize: '18px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add([tapZone, tapLabel]);

    this.feedbackText = scene.add.text(width / 2, height / 2 + 220, '', {
      fontSize: '16px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    this.statusText = scene.add.text(width / 2, 50, '', {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(this.statusText);

    this.generateSequenceForN(this.currentN);
    this.feedbackText.setText('Practice round — get a feel for it');
    this.showNextTrial();
  }

  private generateSequenceForN(n: number): void {
    this.sequence = generateNBackSequence({
      n: Math.max(1, Math.round(n)),
      trials: 10,
      alphabetSize: COLORS.length,
      targetRatio: 0.3,
    });
    this.currentTrialIdx = 0;
  }

  private showNextTrial(): void {
    if (this.currentTrialIdx >= this.sequence.length) {
      // Need more trials at current level — regenerate
      this.generateSequenceForN(this.currentN);
    }

    if (!this.practiceMode && this.results.length >= this.config.trials) {
      this.finish();
      return;
    }

    if (this.practiceMode && this.results.length === 0 && this.currentTrialIdx >= 4) {
      this.practiceMode = false;
      this.feedbackText.setText('Now for real — results count');
      this.generateSequenceForN(this.currentN);
      this.scene.time.delayedCall(1500, () => {
        this.feedbackText.setText('');
        this.presentStimulus();
      });
      return;
    }

    this.presentStimulus();
  }

  private presentStimulus(): void {
    const trial = this.sequence[this.currentTrialIdx]!;
    const color = COLORS[trial.stimulus % COLORS.length]!;

    this.symbolDisplay.setFillStyle(color);
    this.responded = false;
    this.trialStartMs = performance.now();
    this.statusText.setText(this.practiceMode ? 'Practice' : `N=${Math.round(this.currentN)} · Trial ${this.results.length + 1}/${this.config.trials}`);

    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (!this.responded) {
        this.recordResponse(false);
      }
    });
  }

  private onTap(): void {
    if (this.responded) return;
    this.responded = true;
    const trial = this.sequence[this.currentTrialIdx]!;
    const correct = trial.isTarget;
    this.recordResponse(correct, performance.now() - this.trialStartMs);
  }

  private recordResponse(tapped: boolean, reactionMs?: number): void {
    const trial = this.sequence[this.currentTrialIdx]!;
    const correct = tapped ? trial.isTarget : !trial.isTarget;

    if (!this.practiceMode) {
      this.results.push({ correct, reactionMs: reactionMs ?? this.config.trialTimeoutMs });

      if (correct) {
        this.consecutiveCorrect++;
        if (this.consecutiveCorrect >= 2) {
          this.consecutiveCorrect = 0;
          const { done } = this.staircase.recordResult(true);
          this.currentN = this.staircase.getThreshold();
          this.generateSequenceForN(this.currentN);
          if (done) { this.finish(); return; }
        }
      } else {
        this.consecutiveCorrect = 0;
        const { done } = this.staircase.recordResult(false);
        this.currentN = this.staircase.getThreshold();
        this.generateSequenceForN(this.currentN);
        if (done) { this.finish(); return; }
      }
    }

    if (this.practiceMode) {
      this.feedbackText.setText(correct ? '✓' : '✗');
    }

    this.symbolDisplay.setFillStyle(0x333355);
    this.currentTrialIdx++;

    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => {
      this.feedbackText.setText('');
      this.showNextTrial();
    });
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const correctRTs = this.results.filter(r => r.correct && r.reactionMs < this.config.trialTimeoutMs).map(r => r.reactionMs);
    const medianRT = correctRTs.length > 0
      ? correctRTs.sort((a, b) => a - b)[Math.floor(correctRTs.length / 2)]!
      : this.config.trialTimeoutMs;

    this.onComplete({
      line: 'Cognitive',
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
