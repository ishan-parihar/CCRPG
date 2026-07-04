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
      { id: 'ignore', text: 'Step over it — not my problem', stage: 'Red' },
      { id: 'duty', text: 'End its suffering — it\'s the merciful thing', stage: 'Amber' },
      { id: 'rights', text: 'It has a right to live — find another way', stage: 'Orange' },
      { id: 'heal', text: 'Tend its wound — even if it costs me time and safety', stage: 'Green' },
    ],
  },
  {
    prompt: 'Your companion took food from a stranger\'s camp.\nThe stranger approaches, angry.',
    options: [
      { id: 'fight', text: 'Threaten the stranger — we need the food more', stage: 'Red' },
      { id: 'defend', text: 'Stand with your companion — loyalty above all', stage: 'Amber' },
      { id: 'return', text: 'Return the food — theft is wrong regardless', stage: 'Orange' },
      { id: 'mediate', text: 'Hear both sides — understand the full situation', stage: 'Green' },
      { id: 'share', text: 'Offer to share what we have — transform the conflict', stage: 'Green' },
    ],
  },
  {
    prompt: 'A locked chest sits unguarded.\nInside you hear something alive.',
    options: [
      { id: 'take', text: 'Break it open — whatever\'s inside is mine now', stage: 'Red' },
      { id: 'leave', text: 'It is not mine to open — respect the lock', stage: 'Amber' },
      { id: 'open', text: 'Free whatever is inside — life shouldn\'t be caged', stage: 'Orange' },
      { id: 'investigate', text: 'Find out who locked it and why before acting', stage: 'Green' },
      { id: 'wait', text: 'Sit with the uncertainty — not every question needs an immediate answer', stage: 'Green' },
    ],
  },
  {
    prompt: 'An elder offers you power in exchange\nfor a promise you may not be able to keep.',
    options: [
      { id: 'accept', text: 'Accept — deal with the promise later', stage: 'Red' },
      { id: 'refuse_rule', text: 'Refuse — a promise must always be kept', stage: 'Amber' },
      { id: 'negotiate', text: 'Ask what the promise entails — weigh the ethics', stage: 'Orange' },
      { id: 'question', text: 'Ask why they need this promise — what are they afraid of?', stage: 'Green' },
      { id: 'decline_power', text: 'Decline — power that requires binding is not true power', stage: 'Green' },
    ],
  },
  {
    prompt: 'A child steals medicine for their sick parent.\nYou are the only witness.',
    options: [
      { id: 'take_share', text: 'Take some for yourself too — opportunity knocks', stage: 'Red' },
      { id: 'report', text: 'Report them — rules exist for a reason', stage: 'Amber' },
      { id: 'allow', text: 'Look away — their need justifies the act', stage: 'Orange' },
      { id: 'help', text: 'Help them find a legal way to get the medicine', stage: 'Green' },
      { id: 'systemic', text: 'Question why medicine is inaccessible — address the root cause', stage: 'Green' },
    ],
  },
  {
    prompt: 'Your group must decide who eats tonight.\nThere is only enough for half.',
    options: [
      { id: 'self', text: 'Take yours first — survival comes first', stage: 'Red' },
      { id: 'hierarchy', text: 'The strongest/eldest should eat — that\'s the natural order', stage: 'Amber' },
      { id: 'fair', text: 'Draw lots — everyone gets an equal chance', stage: 'Orange' },
      { id: 'need', text: 'Those who need it most should eat — the weakest first', stage: 'Green' },
      { id: 'creative', text: 'Find a way to make it stretch — nobody goes completely without', stage: 'Green' },
    ],
  },
  {
    prompt: 'You discover your leader has been lying\nto protect the group from a hard truth.',
    options: [
      { id: 'exploit', text: 'Use this knowledge as leverage for yourself', stage: 'Red' },
      { id: 'obey', text: 'Trust the leader — they must have good reasons', stage: 'Amber' },
      { id: 'expose', text: 'The truth must come out — people deserve to know', stage: 'Orange' },
      { id: 'private', text: 'Speak to the leader privately — understand their reasoning first', stage: 'Green' },
      { id: 'both', text: 'Hold both truths — the lie was wrong AND the intention was protective', stage: 'Green' },
    ],
  },
  {
    prompt: 'An enemy who once harmed you is now\nvulnerable and asks for mercy.',
    options: [
      { id: 'revenge', text: 'This is justice — they deserve what they gave', stage: 'Red' },
      { id: 'conditional', text: 'Mercy, but only if they submit to the group\'s judgement', stage: 'Amber' },
      { id: 'principle', text: 'Grant mercy — everyone deserves a second chance on principle', stage: 'Orange' },
      { id: 'empathy', text: 'See the person behind the enemy — understand what led them here', stage: 'Green' },
      { id: 'transform', text: 'Offer not just mercy but relationship — transform enemy into ally', stage: 'Green' },
    ],
  },
];

const STAGE_SCORES: Record<MoralStage, number> = { Red: 1, Amber: 2, Orange: 3, Green: 4 };

export class MoralProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Moral',
    title: 'The Crossroads',
    instruction: 'You will face moral choices.\nThere is no wrong answer — take your time.\nYour reasoning itself is meaningful.',
    trials: 5,
    hasPractice: false,
    trialTimeoutMs: 30000,
    interTrialDelayMs: 1500,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private choices: MoralStage[] = [];
  private staircase = new FastStaircase({ startLevel: 2, maxTrials: 5, maxReversals: 2 });
  private currentTrial = 0;
  private trialStartMs = 0;
  private shuffledDilemmas: Dilemma[] = [];

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
    // Shuffle and pick 5 dilemmas from the pool
    this.shuffledDilemmas = [...DILEMMAS].sort(() => Math.random() - 0.5).slice(0, this.config.trials);

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
    if (this.currentTrial >= this.shuffledDilemmas.length || this.currentTrial >= this.config.trials) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const dilemma = this.shuffledDilemmas[this.currentTrial]!;
    // Shuffle options so position doesn't reveal stage
    const shuffledOptions = [...dilemma.options].sort(() => Math.random() - 0.5);

    this.container.add(this.scene.add.text(width / 2, 60, `Choice ${this.currentTrial + 1} / ${this.config.trials}`, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.container.add(this.scene.add.text(width / 2, height / 2 - 120, dilemma.prompt, {
      fontSize: '20px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5));

    this.trialStartMs = performance.now();
    const optionStartY = height / 2 - 20;
    shuffledOptions.forEach((option, i) => {
      const y = optionStartY + i * 60;
      const btn = this.scene.add.rectangle(width / 2, y, width - 80, 50, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => this.onChoice(option))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));
      const label = this.scene.add.text(width / 2, y, option.text, {
        fontSize: '16px', color: '#ccccdd', fontFamily: 'monospace',
        wordWrap: { width: width - 120 },
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
