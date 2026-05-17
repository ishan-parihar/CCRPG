/**
 * InterpersonalProbe — measures attunement via pattern prediction.
 * An NPC companion performs a sequence of actions (colored arrows).
 * Player must predict the NEXT action before it's revealed.
 * Uses FastStaircase on pattern complexity.
 */
import Phaser from 'phaser';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

type Direction = 'left' | 'right' | 'up';

const DIR_DISPLAY: Record<Direction, { symbol: string; color: number }> = {
  left: { symbol: '◀', color: 0x4ecdc4 },
  right: { symbol: '▶', color: 0xff4d6d },
  up: { symbol: '▲', color: 0xffd700 },
};

const DIRECTIONS: Direction[] = ['left', 'right', 'up'];

function generatePattern(level: number): Direction[] {
  if (level <= 1) return ['left', 'right', 'left', 'right', 'left', 'right', 'left', 'right'];
  if (level <= 2) return ['left', 'left', 'right', 'left', 'left', 'right', 'left', 'left'];
  if (level <= 3) return ['left', 'right', 'up', 'left', 'right', 'up', 'left', 'right'];
  // Level 4: deceptive — pattern breaks
  return ['left', 'right', 'left', 'right', 'left', 'up', 'right', 'left'];
}

export class InterpersonalProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Interpersonal',
    title: 'Read the Companion',
    instruction: 'Your companion acts in a pattern.\nWatch, then PREDICT their next move\nbefore it\'s revealed.',
    trials: 6,
    hasPractice: true,
    trialTimeoutMs: 5000,
    interTrialDelayMs: 1000,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 1, stepUp: 1.4, stepDown: 1.4, maxReversals: 2, maxTrials: 6 });
  private pattern: Direction[] = [];
  private currentTrial = 0;
  private practiceTrials = 2;
  private trialStartMs = 0;
  private trialActive = false;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);

    const { width } = scene.scale;
    this.container.add(scene.add.text(width / 2, 80, this.config.instruction, {
      fontSize: '20px', color: '#aaaacc', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    this.pattern = generatePattern(1);
    this.scene.time.delayedCall(2000, () => this.showSequenceThenPredict());
  }

  private showSequenceThenPredict(): void {
    const total = this.config.trials + this.practiceTrials;
    if (this.currentTrial >= total) {
      this.finish();
      return;
    }

    // Update pattern for current level
    const level = Math.max(1, Math.min(4, Math.round(this.staircase.getThreshold())));
    this.pattern = generatePattern(level);

    // Show 3 items of the pattern, then ask for prediction of the 4th
    this.showPatternItem(0);
  }

  private showPatternItem(idx: number): void {
    if (idx >= 3) {
      // Now ask for prediction
      this.askPrediction();
      return;
    }

    this.clearStimulus();
    const { width, height } = this.scene.scale;
    const dir = this.pattern[idx]!;
    const display = DIR_DISPLAY[dir];

    const isPractice = this.currentTrial < this.practiceTrials;
    const status = isPractice ? 'Watch the pattern...' : `Trial ${this.currentTrial - this.practiceTrials + 1} / ${this.config.trials}`;
    this.setStatus(status);

    const arrow = this.scene.add.text(width / 2, height / 2 - 40, display.symbol, {
      fontSize: '64px', color: `#${display.color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5).setData('stimulus', true);
    this.container.add(arrow);

    // History display
    const history = this.pattern.slice(0, idx + 1).map(d => DIR_DISPLAY[d].symbol).join(' ');
    const histText = this.scene.add.text(width / 2, height / 2 + 40, history, {
      fontSize: '28px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5).setData('stimulus', true);
    this.container.add(histText);

    this.scene.time.delayedCall(800, () => this.showPatternItem(idx + 1));
  }

  private askPrediction(): void {
    this.clearStimulus();
    const { width, height } = this.scene.scale;

    // Show history
    const history = this.pattern.slice(0, 3).map(d => DIR_DISPLAY[d].symbol).join(' ');
    const histText = this.scene.add.text(width / 2, height / 2 - 80, `${history}  ?`, {
      fontSize: '28px', color: '#ccccee', fontFamily: 'monospace',
    }).setOrigin(0.5).setData('stimulus', true);
    this.container.add(histText);

    this.container.add(this.scene.add.text(width / 2, height / 2 - 30, 'What comes next?', {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
    }).setOrigin(0.5).setData('stimulus', true));

    this.trialStartMs = performance.now();
    this.trialActive = true;

    // Direction buttons
    DIRECTIONS.forEach((dir, i) => {
      const x = width / 2 + (i - 1) * 120;
      const y = height / 2 + 60;
      const display = DIR_DISPLAY[dir];
      const btn = this.scene.add.rectangle(x, y, 100, 80, 0x1a3a4a, 0.9)
        .setStrokeStyle(2, 0x446688)
        .setInteractive()
        .setData('stimulus', true)
        .on('pointerdown', () => this.onChoice(dir))
        .on('pointerover', () => btn.setFillStyle(0x2a4a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a3a4a));
      const lbl = this.scene.add.text(x, y, display.symbol, {
        fontSize: '28px', color: `#${display.color.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5).setData('stimulus', true);
      this.container.add([btn, lbl]);
    });

    // Timeout
    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (this.trialActive) {
        this.trialActive = false;
        this.recordResult(false, this.config.trialTimeoutMs);
      }
    });
  }

  private onChoice(chosen: Direction): void {
    if (!this.trialActive) return;
    this.trialActive = false;
    const reactionMs = performance.now() - this.trialStartMs;
    const expected = this.pattern[3]!;
    const correct = chosen === expected;
    this.recordResult(correct, reactionMs);
  }

  private recordResult(correct: boolean, reactionMs: number): void {
    const isPractice = this.currentTrial < this.practiceTrials;

    if (!isPractice) {
      this.results.push({ correct, reactionMs });
      this.staircase.recordResult(correct);
    }

    // Show answer
    this.clearStimulus();
    const { width, height } = this.scene.scale;
    const expected = this.pattern[3]!;
    const fb = correct ? '✓ Correct!' : `✗ It was: ${DIR_DISPLAY[expected].symbol}`;
    this.container.add(this.scene.add.text(width / 2, height / 2, fb, {
      fontSize: '20px', color: correct ? '#44ff88' : '#ff6666', fontFamily: 'monospace',
    }).setOrigin(0.5).setData('stimulus', true));

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.showSequenceThenPredict());
  }

  private setStatus(text: string): void {
    this.container.getAll().forEach(obj => {
      if ((obj as Phaser.GameObjects.GameObject).getData?.('status')) obj.destroy();
    });
    const { width } = this.scene.scale;
    this.container.add(this.scene.add.text(width / 2, 50, text, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5).setData('status', true));
  }

  private clearStimulus(): void {
    this.container.getAll().forEach(obj => {
      if ((obj as Phaser.GameObjects.GameObject).getData?.('stimulus')) obj.destroy();
    });
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const correctRTs = this.results.filter(r => r.correct).map(r => r.reactionMs);
    const medianRT = correctRTs.length > 0
      ? correctRTs.sort((a, b) => a - b)[Math.floor(correctRTs.length / 2)]!
      : this.config.trialTimeoutMs;

    this.onComplete({
      line: 'Interpersonal',
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
