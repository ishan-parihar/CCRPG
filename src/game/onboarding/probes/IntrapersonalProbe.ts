/**
 * IntrapersonalProbe — measures self-awareness via emotional scenario prediction.
 * Shows a brief scenario, asks what the player would feel, then reveals outcome.
 * Uses FastStaircase on complexity level (1=basic, 2=mixed, 3=nuanced, 4=paradoxical).
 */
import Phaser from 'phaser';
import { FastStaircase } from '@core/usecases/FastStaircase.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

interface Scenario {
  readonly text: string;
  readonly level: number;
  readonly options: readonly { text: string; score: number }[];
  readonly reveal: string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    text: 'A friend cancels plans at the last minute without explanation.',
    level: 1,
    options: [
      { text: 'Angry', score: 0.5 },
      { text: 'Disappointed', score: 1 },
      { text: 'Relieved', score: 0.3 },
      { text: 'Indifferent', score: 0.2 },
    ],
    reveal: 'They had a family emergency they couldn\'t share yet.',
  },
  {
    text: 'You succeed at something you worked hard on, but a close friend fails the same task.',
    level: 2,
    options: [
      { text: 'Happy', score: 0.3 },
      { text: 'Guilty', score: 0.5 },
      { text: 'A mix of pride and guilt', score: 1 },
      { text: 'Indifferent', score: 0.1 },
    ],
    reveal: 'Your friend congratulates you warmly despite their own disappointment.',
  },
  {
    text: 'Someone you dislike does something genuinely kind for a stranger.',
    level: 3,
    options: [
      { text: 'Suspicious of their motives', score: 0.4 },
      { text: 'Grudging respect mixed with discomfort', score: 1 },
      { text: 'Annoyed', score: 0.2 },
      { text: 'Inspired', score: 0.7 },
    ],
    reveal: 'The kindness was spontaneous and cost them something real.',
  },
  {
    text: 'You must choose between helping someone who wronged you or walking away when they need you most.',
    level: 3,
    options: [
      { text: 'Vengeful satisfaction', score: 0.2 },
      { text: 'Torn between justice and compassion', score: 1 },
      { text: 'Obligated', score: 0.5 },
      { text: 'Numb', score: 0.3 },
    ],
    reveal: 'They never asked for help — you noticed on your own.',
  },
  {
    text: 'You achieve a lifelong goal and feel... empty.',
    level: 4,
    options: [
      { text: 'Confused', score: 0.5 },
      { text: 'A paradox of fulfilment and loss of purpose', score: 1 },
      { text: 'Depressed', score: 0.4 },
      { text: 'Grateful', score: 0.3 },
    ],
    reveal: 'The emptiness passes, replaced by a quiet readiness for what comes next.',
  },
  {
    text: 'A mentor you deeply respect tells you they were wrong about something fundamental they taught you.',
    level: 4,
    options: [
      { text: 'Betrayed', score: 0.3 },
      { text: 'Respect for their honesty alongside grief for lost certainty', score: 1 },
      { text: 'Angry', score: 0.2 },
      { text: 'Relieved', score: 0.4 },
    ],
    reveal: 'Their admission opens a door to deeper understanding between you.',
  },
];

export class IntrapersonalProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Intrapersonal',
    title: 'The Witness',
    instruction: 'You will read short scenarios.\nChoose what you would FEEL.\nThen see what happened next.',
    trials: 5,
    hasPractice: true,
    trialTimeoutMs: 20000,
    interTrialDelayMs: 1500,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private staircase = new FastStaircase({ startLevel: 1, maxTrials: 6, maxReversals: 2 });
  private currentTrial = 0;
  private practiceMode = true;
  private trialStartMs = 0;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
    this.runTrial();
  }

  private getScenarioForLevel(level: number): Scenario {
    const clamped = Math.max(1, Math.min(4, Math.round(level)));
    const matching = SCENARIOS.filter(s => s.level === clamped);
    if (matching.length > 0) {
      return matching[this.currentTrial % matching.length]!;
    }
    return SCENARIOS[this.currentTrial % SCENARIOS.length]!;
  }

  private runTrial(): void {
    const totalScored = this.config.trials;
    const scoredDone = this.results.length;
    if (!this.practiceMode && scoredDone >= totalScored) {
      this.finish();
      return;
    }

    this.container.removeAll(true);
    const { width, height } = this.scene.scale;
    const scenario = this.getScenarioForLevel(this.staircase.getThreshold());

    // Status
    const status = this.practiceMode
      ? 'Practice — get a feel for it'
      : `Scenario ${scoredDone + 1} / ${totalScored}`;
    this.container.add(this.scene.add.text(width / 2, 50, status, {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Scenario text
    this.container.add(this.scene.add.text(width / 2, height / 2 - 120, scenario.text, {
      fontSize: '20px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
      lineSpacing: 4,
    }).setOrigin(0.5));

    // Question
    this.container.add(this.scene.add.text(width / 2, height / 2 - 40, 'What would you feel?', {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Options
    this.trialStartMs = performance.now();
    const startY = height / 2 + 10;
    scenario.options.forEach((opt, i) => {
      const y = startY + i * 60;
      const btn = this.scene.add.rectangle(width / 2, y, width - 100, 48, 0x1a2a3a, 0.9)
        .setStrokeStyle(2, 0x334455)
        .setInteractive()
        .on('pointerdown', () => this.onChoice(scenario, opt.score))
        .on('pointerover', () => btn.setFillStyle(0x2a3a5a))
        .on('pointerout', () => btn.setFillStyle(0x1a2a3a));
      const label = this.scene.add.text(width / 2, y, opt.text, {
        fontSize: '18px', color: '#ccccdd', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.container.add([btn, label]);
    });
  }

  private onChoice(scenario: Scenario, score: number): void {
    const reactionMs = performance.now() - this.trialStartMs;
    const correct = score >= 0.7;

    if (this.practiceMode) {
      this.practiceMode = false;
      this.showReveal(scenario.reveal, correct);
      return;
    }

    this.results.push({ correct, reactionMs });
    const { done } = this.staircase.recordResult(correct);

    if (done || this.results.length >= this.config.trials) {
      this.showReveal(scenario.reveal, correct, true);
    } else {
      this.showReveal(scenario.reveal, correct);
    }
  }

  private showReveal(reveal: string, _correct: boolean, finishing = false): void {
    this.container.removeAll(true);
    const { width, height } = this.scene.scale;

    this.container.add(this.scene.add.text(width / 2, height / 2 - 20, 'What actually happened:', {
      fontSize: '18px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5));
    this.container.add(this.scene.add.text(width / 2, height / 2 + 30, reveal, {
      fontSize: '20px', color: '#aaccaa', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5));

    this.scene.time.delayedCall(2500, () => {
      if (finishing) {
        this.finish();
      } else {
        this.currentTrial++;
        this.runTrial();
      }
    });
  }

  private finish(): void {
    const correctCount = this.results.filter(r => r.correct).length;
    const accuracy = this.results.length > 0 ? correctCount / this.results.length : 0;
    const rts = this.results.map(r => r.reactionMs).sort((a, b) => a - b);
    const medianRT = rts.length > 0 ? rts[Math.floor(rts.length / 2)]! : 5000;

    this.onComplete({
      line: 'Intrapersonal',
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
