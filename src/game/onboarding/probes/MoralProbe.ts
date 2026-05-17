/**
 * MoralProbe — measures moral reasoning via dilemma choices.
 * Options are tagged with Kohlberg stages. Player's moral altitude =
 * the modal stage of their choices across all dilemmas.
 */
import Phaser from 'phaser';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

type MoralStage = 'Red' | 'Amber' | 'Orange' | 'Green';

interface MoralOption {
  readonly id: string;
  readonly text: string;
  readonly stage: MoralStage;
}

interface Dilemma {
  readonly prompt: string;
  readonly options: readonly MoralOption[];
}

const DILEMMAS: readonly Dilemma[] = [
  {
    prompt: 'A wounded creature blocks your path.\nIt snarls but cannot move.',
    options: [
      { id: 'kill', text: 'Strike it down — clear the path', stage: 'Red' },
      { id: 'heal', text: 'Tend its wound — risk the delay', stage: 'Green' },
      { id: 'pass', text: 'Step around it — leave it be', stage: 'Orange' },
    ],
  },
  {
    prompt: 'Your companion took food from a stranger\'s camp.\nThe stranger approaches, angry.',
    options: [
      { id: 'defend', text: 'Stand with your companion no matter what', stage: 'Red' },
      { id: 'return', text: 'Return the food, apologise on their behalf', stage: 'Amber' },
      { id: 'mediate', text: 'Hear both sides before deciding', stage: 'Green' },
    ],
  },
  {
    prompt: 'A locked chest sits unguarded.\nInside you hear something alive.',
    options: [
      { id: 'open', text: 'Break the lock — free whatever is inside', stage: 'Orange' },
      { id: 'leave', text: 'It is not yours to open', stage: 'Amber' },
      { id: 'guard', text: 'Wait and consider the consequences for all involved', stage: 'Green' },
    ],
  },
  {
    prompt: 'An elder offers you power in exchange\nfor a promise you may not keep.',
    options: [
      { id: 'accept', text: 'Accept — deal with the promise later', stage: 'Red' },
      { id: 'refuse', text: 'Refuse — a promise must be kept', stage: 'Amber' },
      { id: 'negotiate', text: 'Ask what the promise entails — weigh the ethics', stage: 'Orange' },
    ],
  },
];

const STAGE_SCORES: Record<MoralStage, number> = { Red: 1, Amber: 2, Orange: 3, Green: 4 };

export class MoralProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Moral',
    title: 'The Crossroads',
    instruction: 'You will face moral choices.\nThere is no wrong answer — take your time.\nYour reasoning itself is meaningful.',
    trials: 4,
    hasPractice: false,
    trialTimeoutMs: 30000,
    interTrialDelayMs: 1500,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private choices: MoralStage[] = [];
  private staircase = new FastStaircase({ startLevel: 2, maxTrials: 4, maxReversals: 2 });
  private currentTrial = 0;
  private trialStartMs = 0;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);

    const { width, height } = scene.scale;
    this.container.add(scene.add.text(width / 2, height / 2, this.config.instruction, {
      fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    scene.time.delayedCall(3000, () => {
      this.container.removeAll(true);
      this.runTrial();
    });
  }

  private runTrial(): void {
    if (this.currentTrial >= DILEMMAS.length || this.currentTrial >= this.config.trials) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const dilemma = DILEMMAS[this.currentTrial]!;

    this.container.add(this.scene.add.text(width / 2, 60, `Choice ${this.currentTrial + 1} / ${this.config.trials}`, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.container.add(this.scene.add.text(width / 2, height / 2 - 120, dilemma.prompt, {
      fontSize: '20px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5));

    this.trialStartMs = performance.now();
    const optionStartY = height / 2;
    dilemma.options.forEach((option, i) => {
      const y = optionStartY + i * 70;
      const btn = this.scene.add.rectangle(width / 2, y, width - 100, 55, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => this.onChoice(option))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));
      const label = this.scene.add.text(width / 2, y, option.text, {
        fontSize: '18px', color: '#ccccdd', fontFamily: 'monospace',
        wordWrap: { width: width - 140 },
      }).setOrigin(0.5);
      this.container.add([btn, label]);
    });
  }

  private onChoice(option: MoralOption): void {
    const reactionMs = performance.now() - this.trialStartMs;
    this.choices.push(option.stage);

    // Score: higher Kohlberg stage = "correct" for staircase purposes
    const correct = STAGE_SCORES[option.stage] >= 3;
    this.results.push({ correct, reactionMs });
    this.staircase.recordResult(correct);

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    this.container.add(this.scene.add.text(width / 2, height / 2, 'Noted.', {
      fontSize: '20px', color: '#88aa88', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
  }

  private finish(): void {
    // Modal stage = the most frequently chosen stage
    const counts: Record<MoralStage, number> = { Red: 0, Amber: 0, Orange: 0, Green: 0 };
    for (const c of this.choices) counts[c]++;
    const modalStage = (Object.entries(counts) as [MoralStage, number][])
      .sort((a, b) => b[1] - a[1])[0]![0];

    const accuracy = STAGE_SCORES[modalStage] / 4;
    const rts = this.results.map(r => r.reactionMs).sort((a, b) => a - b);
    const medianRT = rts.length > 0 ? rts[Math.floor(rts.length / 2)]! : 5000;

    this.onComplete({
      line: 'Moral',
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
