/**
 * SpiritualProbe — measures value-priority coherence under temptation.
 * Player ranks 5 values, then faces scenarios that tempt violation of their top value.
 * Uses FastStaircase on temptation intensity (1=obvious, 2=moderate, 3=subtle, 4=ambiguous).
 */
import Phaser from 'phaser';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

const VALUES = ['Truth', 'Love', 'Power', 'Safety', 'Freedom'] as const;

interface Temptation {
  readonly level: number;
  readonly prompt: string;
  readonly holdOption: string;
  readonly betrayOption: string;
}

function getTemptations(topValue: string): readonly Temptation[] {
  const map: Record<string, readonly Temptation[]> = {
    Truth: [
      { level: 1, prompt: 'A stranger offers gold if you lie about your name.', holdOption: 'Refuse — my name is mine', betrayOption: 'Take the gold' },
      { level: 2, prompt: 'A friend asks you to confirm their false alibi to avoid embarrassment.', holdOption: 'Tell the truth gently', betrayOption: 'Confirm the alibi' },
      { level: 3, prompt: 'Revealing a truth will hurt someone who trusts you, but hiding it enables a larger harm.', holdOption: 'Speak the difficult truth', betrayOption: 'Protect them with silence' },
      { level: 4, prompt: 'The truth you hold may be incomplete. Speaking it now could be premature — or it could be the only window.', holdOption: 'Speak what you know', betrayOption: 'Wait for certainty' },
    ],
    Love: [
      { level: 1, prompt: 'A reward is offered for abandoning a wounded companion.', holdOption: 'Stay with them', betrayOption: 'Take the reward' },
      { level: 2, prompt: 'Helping someone means missing an opportunity that won\'t return.', holdOption: 'Help them anyway', betrayOption: 'Seize the opportunity' },
      { level: 3, prompt: 'The person who needs your love has repeatedly hurt you. Helping them risks more pain.', holdOption: 'Extend compassion', betrayOption: 'Protect yourself' },
      { level: 4, prompt: 'Loving this person means accepting they may never change. Your love may never be returned.', holdOption: 'Love without condition', betrayOption: 'Withdraw to preserve yourself' },
    ],
    Power: [
      { level: 1, prompt: 'Someone offers to do your work for you, but you\'d learn nothing.', holdOption: 'Do it myself', betrayOption: 'Let them handle it' },
      { level: 2, prompt: 'Sharing your authority would help the group but diminish your control.', holdOption: 'Share the power', betrayOption: 'Keep control' },
      { level: 3, prompt: 'True strength here means yielding. But yielding looks like weakness to those watching.', holdOption: 'Yield with intention', betrayOption: 'Hold firm for appearances' },
      { level: 4, prompt: 'The most powerful act is surrender — but you cannot know if it will be honoured.', holdOption: 'Surrender', betrayOption: 'Maintain your position' },
    ],
    Safety: [
      { level: 1, prompt: 'A shortcut through danger saves time but risks injury.', holdOption: 'Take the safe path', betrayOption: 'Risk the shortcut' },
      { level: 2, prompt: 'Staying safe means others face the danger alone.', holdOption: 'Stay safe, support from here', betrayOption: 'Join them in danger' },
      { level: 3, prompt: 'Your safety requires a boundary that will isolate you from connection.', holdOption: 'Maintain the boundary', betrayOption: 'Lower it for connection' },
      { level: 4, prompt: 'The safest choice is also the one that prevents growth. Staying here is comfortable but stagnant.', holdOption: 'Stay in safety', betrayOption: 'Step into the unknown' },
    ],
    Freedom: [
      { level: 1, prompt: 'A binding contract offers great reward but limits your choices for a year.', holdOption: 'Decline — stay free', betrayOption: 'Sign for the reward' },
      { level: 2, prompt: 'A commitment to someone you care about means giving up a freedom you cherish.', holdOption: 'Keep your freedom', betrayOption: 'Make the commitment' },
      { level: 3, prompt: 'True freedom here means accepting a responsibility that constrains you — but serves something larger.', holdOption: 'Accept the responsibility', betrayOption: 'Preserve your autonomy' },
      { level: 4, prompt: 'Freedom from attachment means freedom from love. The deepest liberty is also the loneliest.', holdOption: 'Choose connection over pure freedom', betrayOption: 'Choose solitude and liberty' },
    ],
  };
  return map[topValue] ?? map['Truth']!;
}

export class SpiritualProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Spiritual',
    title: 'The Vow',
    instruction: 'First, rank these values by importance to you.\nThen face scenarios that test your commitment.',
    trials: 4,
    hasPractice: false,
    trialTimeoutMs: 30000,
    interTrialDelayMs: 1500,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 1, maxTrials: 4, maxReversals: 2 });
  private rankedValues: string[] = [];
  private temptationIndex = 0;
  private trialStartMs = 0;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
    this.showRankingPhase();
  }

  private showRankingPhase(): void {
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const remaining = [...VALUES].filter(v => !this.rankedValues.includes(v));

    if (remaining.length === 0) {
      this.startTemptations();
      return;
    }

    const ordinal = this.rankedValues.length + 1;
    const label = ordinal === 1 ? 'MOST important' : ordinal === 5 ? 'LEAST important' : `#${ordinal}`;

    this.container.add(this.scene.add.text(width / 2, 80, `Rank your values — tap the ${label}:`, {
      fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    if (this.rankedValues.length > 0) {
      const ranked = this.rankedValues.map((v, i) => `${i + 1}. ${v}`).join('\n');
      this.container.add(this.scene.add.text(width / 2, 140, ranked, {
        fontSize: '18px', color: '#88aa88', fontFamily: 'monospace',
        align: 'center',
      }).setOrigin(0.5));
    }

    const startY = height / 2 - 40;
    remaining.forEach((value, i) => {
      const y = startY + i * 60;
      const btn = this.scene.add.rectangle(width / 2, y, width - 120, 48, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => {
          this.rankedValues.push(value);
          this.showRankingPhase();
        })
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));
      const lbl = this.scene.add.text(width / 2, y, value, {
        fontSize: '20px', color: '#ccccdd', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.container.add([btn, lbl]);
    });
  }

  private startTemptations(): void {
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;

    this.container.add(this.scene.add.text(width / 2, height / 2, `Your highest value: ${this.rankedValues[0]}\n\nNow — can you hold it under pressure?`, {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5));

    this.scene.time.delayedCall(3000, () => this.runTemptation());
  }

  private runTemptation(): void {
    if (this.temptationIndex >= this.config.trials) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const topValue = this.rankedValues[0]!;
    const temptations = getTemptations(topValue);
    const level = Math.max(1, Math.min(4, Math.round(this.staircase.getThreshold())));
    const temptation = temptations.find(t => t.level === level) ?? temptations[this.temptationIndex % temptations.length]!;

    // Status
    this.container.add(this.scene.add.text(width / 2, 50, `Trial ${this.temptationIndex + 1} / ${this.config.trials}`, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Prompt
    this.container.add(this.scene.add.text(width / 2, height / 2 - 80, temptation.prompt, {
      fontSize: '20px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
      lineSpacing: 4,
    }).setOrigin(0.5));

    this.trialStartMs = performance.now();

    // Options (randomise order)
    const options = Math.random() > 0.5
      ? [{ text: temptation.holdOption, hold: true }, { text: temptation.betrayOption, hold: false }]
      : [{ text: temptation.betrayOption, hold: false }, { text: temptation.holdOption, hold: true }];

    options.forEach((opt, i) => {
      const y = height / 2 + 40 + i * 70;
      const btn = this.scene.add.rectangle(width / 2, y, width - 100, 55, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => this.onTemptationChoice(opt.hold))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));
      const lbl = this.scene.add.text(width / 2, y, opt.text, {
        fontSize: '18px', color: '#ccccdd', fontFamily: 'monospace',
        wordWrap: { width: width - 140 },
      }).setOrigin(0.5);
      this.container.add([btn, lbl]);
    });
  }

  private onTemptationChoice(held: boolean): void {
    const reactionMs = performance.now() - this.trialStartMs;
    this.results.push({ correct: held, reactionMs });
    this.staircase.recordResult(held);
    this.temptationIndex++;

    // Brief feedback
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const fb = held ? 'You held your value.' : 'You yielded.';
    this.container.add(this.scene.add.text(width / 2, height / 2, fb, {
      fontSize: '20px', color: held ? '#88ccaa' : '#cc8888', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTemptation());
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const rts = this.results.map(r => r.reactionMs).sort((a, b) => a - b);
    const medianRT = rts.length > 0 ? rts[Math.floor(rts.length / 2)]! : 5000;

    this.onComplete({
      line: 'Spiritual',
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
