/**
 * CognitiveProbe — measures working memory via a simplified n-back (n=1).
 * Shows a sequence of colored symbols; player taps when current matches previous.
 */
import Phaser from 'phaser';
import { generateNBackSequence } from '@core/usecases/NBackTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

const COLORS = [0xff4d6d, 0x4ecdc4, 0xffd700, 0x7b68ee, 0x4a90d9];
const SYMBOL_SIZE = 60;

export class CognitiveProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Cognitive',
    title: 'Memory Echo',
    instruction: 'A sequence of symbols will appear.\nTap when the current symbol matches the PREVIOUS one.',
    trials: 8,
    hasPractice: true,
    trialTimeoutMs: 3000,
    interTrialDelayMs: 800,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private sequence: ReturnType<typeof generateNBackSequence> = [];
  private currentTrial = 0;
  private trialStartMs = 0;
  private responded = false;
  private practiceMode = true;
  private feedbackText!: Phaser.GameObjects.Text;
  private symbolDisplay!: Phaser.GameObjects.Rectangle;
  private tapZone!: Phaser.GameObjects.Rectangle;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0);

    // Generate n-back sequence (n=1, 8 trials + 2 practice)
    const totalTrials = this.config.trials + (this.config.hasPractice ? 2 : 0);
    this.sequence = generateNBackSequence({
      n: 1,
      trials: totalTrials,
      alphabetSize: COLORS.length,
      targetRatio: 0.3,
    });

    // Instruction
    const instrText = scene.add.text(width / 2, 120, this.config.instruction, {
      fontSize: '16px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5);
    this.container.add(instrText);

    // Symbol display area
    this.symbolDisplay = scene.add.rectangle(width / 2, height / 2 - 40, SYMBOL_SIZE, SYMBOL_SIZE, 0x333355)
      .setStrokeStyle(3, 0x666688);
    this.container.add(this.symbolDisplay);

    // Tap zone (large, below the symbol)
    this.tapZone = scene.add.rectangle(width / 2, height / 2 + 120, 200, 80, 0x223344, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.onTap());
    const tapLabel = scene.add.text(width / 2, height / 2 + 120, 'TAP if MATCH', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add([this.tapZone, tapLabel]);

    // Feedback text
    this.feedbackText = scene.add.text(width / 2, height / 2 + 220, '', {
      fontSize: '14px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(this.feedbackText);

    // Practice label
    if (this.config.hasPractice) {
      this.feedbackText.setText('Practice round — get a feel for it');
    }

    this.currentTrial = 0;
    this.practiceMode = this.config.hasPractice;
    this.showNextTrial();
  }

  private showNextTrial(): void {
    if (this.currentTrial >= this.sequence.length) {
      this.finish();
      return;
    }

    // Transition from practice to scored
    if (this.practiceMode && this.currentTrial === 2) {
      this.practiceMode = false;
      this.feedbackText.setText('Now for real — results count');
      this.scene.time.delayedCall(1500, () => {
        this.feedbackText.setText('');
        this.presentStimulus();
      });
      return;
    }

    this.presentStimulus();
  }

  private presentStimulus(): void {
    const trial = this.sequence[this.currentTrial]!;
    const color = COLORS[trial.stimulus % COLORS.length]!;

    this.symbolDisplay.setFillStyle(color);
    this.responded = false;
    this.trialStartMs = performance.now();

    // Timeout
    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (!this.responded) {
        this.recordResponse(false);
      }
    });
  }

  private onTap(): void {
    if (this.responded) return;
    this.responded = true;
    const reactionMs = performance.now() - this.trialStartMs;
    const trial = this.sequence[this.currentTrial]!;
    const correct = trial.isTarget; // Tapping is correct only if it's a target
    this.recordResponse(correct, reactionMs);
  }

  private recordResponse(tapped: boolean, reactionMs?: number): void {
    const trial = this.sequence[this.currentTrial]!;

    let correct: boolean;
    if (tapped) {
      correct = trial.isTarget;
    } else {
      correct = !trial.isTarget; // Not tapping on non-target is correct
    }

    if (!this.practiceMode) {
      this.results.push({ correct, reactionMs: reactionMs ?? this.config.trialTimeoutMs });
    }

    // Brief feedback
    if (this.practiceMode) {
      this.feedbackText.setText(correct ? '✓' : '✗');
    }

    this.symbolDisplay.setFillStyle(0x333355); // Reset
    this.currentTrial++;

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
      trials: this.results,
    });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
