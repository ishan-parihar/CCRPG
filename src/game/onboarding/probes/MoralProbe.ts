/**
 * MoralProbe — measures moral reasoning via dilemma choices.
 * Presents short moral scenarios with 2-3 options. Tracks deliberation time
 * (longer = deeper reasoning) and choice consistency.
 */
import Phaser from 'phaser';
import { scoreDilemma, type DilemmaTrial, type DilemmaOption } from '@core/usecases/DilemmaTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

const DILEMMAS: DilemmaTrial[] = [
  {
    id: 'd1',
    prompt: 'A wounded creature blocks your path.\nIt snarls but cannot move.',
    options: [
      { id: 'kill', text: 'Strike it down — clear the path', orientation: 'autonomy' },
      { id: 'heal', text: 'Tend its wound — risk the delay', orientation: 'care' },
      { id: 'pass', text: 'Step around it — leave it be', orientation: 'justice' },
    ],
  },
  {
    id: 'd2',
    prompt: 'Your companion took food from a stranger\'s camp.\nThe stranger approaches, angry.',
    options: [
      { id: 'defend', text: 'Stand with your companion', orientation: 'care' },
      { id: 'return', text: 'Return the food, apologise', orientation: 'justice' },
      { id: 'flee', text: 'Walk away from both', orientation: 'autonomy' },
    ],
  },
  {
    id: 'd3',
    prompt: 'A locked chest sits unguarded.\nInside you hear something alive.',
    options: [
      { id: 'open', text: 'Break the lock — free whatever is inside', orientation: 'mercy' },
      { id: 'leave', text: 'It is not yours to open', orientation: 'justice' },
      { id: 'guard', text: 'Wait for the owner to return', orientation: 'care' },
    ],
  },
  {
    id: 'd4',
    prompt: 'An elder offers you power in exchange\nfor a promise you may not keep.',
    options: [
      { id: 'accept', text: 'Accept — deal with the promise later', orientation: 'autonomy' },
      { id: 'refuse', text: 'Refuse — a promise must be kept', orientation: 'justice' },
      { id: 'negotiate', text: 'Ask what the promise entails first', orientation: 'care' },
    ],
  },
];

export class MoralProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Moral',
    title: 'The Crossroads',
    instruction: 'You will face moral choices.\nThere is no wrong answer — take your time.\nYour deliberation itself is meaningful.',
    trials: 4,
    hasPractice: false,
    trialTimeoutMs: 30000, // Generous — moral reasoning should not be rushed
    interTrialDelayMs: 1500,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private currentTrial = 0;
  private trialStartMs = 0;
  private trialActive = false;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);

    // Show instruction first
    const { width, height } = scene.scale;
    const instr = scene.add.text(width / 2, height / 2, this.config.instruction, {
      fontSize: '16px', color: '#ccccee', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5);
    this.container.add(instr);

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

    // Progress
    this.container.add(this.scene.add.text(width / 2, 60, `Choice ${this.currentTrial + 1} / ${this.config.trials}`, {
      fontSize: '14px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Prompt
    this.container.add(this.scene.add.text(width / 2, height / 2 - 120, dilemma.prompt, {
      fontSize: '17px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5));

    // Options
    this.trialStartMs = performance.now();
    this.trialActive = true;

    const optionStartY = height / 2;
    dilemma.options.forEach((option, i) => {
      const y = optionStartY + i * 70;
      const btn = this.scene.add.rectangle(width / 2, y, width - 100, 55, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => this.onChoice(dilemma, option))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));

      const label = this.scene.add.text(width / 2, y, option.text, {
        fontSize: '14px', color: '#ccccdd', fontFamily: 'monospace',
      }).setOrigin(0.5);

      this.container.add([btn, label]);
    });
  }

  private onChoice(dilemma: DilemmaTrial, option: DilemmaOption): void {
    if (!this.trialActive) return;
    this.trialActive = false;
    const deliberationMs = performance.now() - this.trialStartMs;

    const result = scoreDilemma(dilemma, { chosenId: option.id, deliberationMs });

    // For moral probe, "correct" means deliberation depth >= 'considered'
    // (we reward thoughtfulness, not any specific answer)
    const correct = result.deliberationDepth !== 'snap';

    this.results.push({ correct, reactionMs: deliberationMs });

    // Brief acknowledgment
    const { width, height } = this.scene.scale;
    this.container.removeAll(true);
    this.container.add(this.scene.add.text(width / 2, height / 2, 'Noted.', {
      fontSize: '18px', color: '#88aa88', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.currentTrial++;
    this.scene.time.delayedCall(this.config.interTrialDelayMs, () => this.runTrial());
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const medianRT = this.results.length > 0
      ? this.results.map(r => r.reactionMs).sort((a, b) => a - b)[Math.floor(this.results.length / 2)]!
      : 5000;

    this.onComplete({ line: 'Moral', accuracy, medianReactionMs: medianRT, trials: this.results });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
