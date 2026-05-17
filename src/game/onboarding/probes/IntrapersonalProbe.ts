/**
 * IntrapersonalProbe — measures impulse awareness and self-monitoring.
 * Uses Go/No-Go paradigm: player must tap on "go" stimuli and RESIST
 * tapping on "no-go" stimuli. The ability to inhibit is the intrapersonal
 * capacity to observe one's own impulse and choose not to act.
 */
import Phaser from 'phaser';
import { generateGoNoGoTrial, scoreGoNoGo } from '@core/usecases/GoNoGoTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class IntrapersonalProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Intrapersonal',
    title: 'The Witness',
    instruction: 'Circles will appear.\nTap GREEN circles. Do NOT tap RED circles.\nNotice the urge — then choose.',
    trials: 10,
    hasPractice: true,
    trialTimeoutMs: 1500,
    interTrialDelayMs: 600,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private results: ProbeTrialResult[] = [];
  private currentTrial = 0;
  private practiceTrials = 3;
  private trialActive = false;
  private trialStartMs = 0;
  private currentTrialType: 'go' | 'nogo' = 'go';

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);

    const { width } = scene.scale;
    this.container.add(scene.add.text(width / 2, 100, this.config.instruction, {
      fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    this.scene.time.delayedCall(2500, () => this.runTrial());
  }

  private runTrial(): void {
    const total = this.config.trials + this.practiceTrials;
    if (this.currentTrial >= total) {
      this.finish();
      return;
    }

    const { width, height } = this.scene.scale;
    const isPractice = this.currentTrial < this.practiceTrials;

    // Generate trial (70% go, 30% no-go)
    const trial = generateGoNoGoTrial(Math.random, 0.7);
    this.currentTrialType = trial.type;

    // Clear previous stimulus
    this.container.getAll().forEach(obj => {
      if ((obj as Phaser.GameObjects.GameObject).getData?.('stimulus')) obj.destroy();
    });

    // Show stimulus
    const color = trial.type === 'go' ? 0x44ff88 : 0xff4466;
    const circle = this.scene.add.circle(width / 2, height / 2, 60, color, 0.9)
      .setData('stimulus', true)
      .setInteractive()
      .on('pointerdown', () => this.onResponse(true, isPractice));
    this.container.add(circle);

    this.trialStartMs = performance.now();
    this.trialActive = true;

    // Timeout — if no response, that's correct for no-go, incorrect for go
    this.scene.time.delayedCall(this.config.trialTimeoutMs, () => {
      if (this.trialActive) {
        this.onResponse(false, isPractice);
      }
    });
  }

  private onResponse(tapped: boolean, isPractice: boolean): void {
    if (!this.trialActive) return;
    this.trialActive = false;
    const reactionMs = performance.now() - this.trialStartMs;

    const result = scoreGoNoGo(
      { type: this.currentTrialType },
      { responded: tapped, reactionMs },
    );

    if (!isPractice) {
      this.results.push({ correct: result.correct, reactionMs });
    }

    // Brief feedback for practice
    if (isPractice) {
      const { width, height } = this.scene.scale;
      const fbText = result.correct
        ? (result.outcome === 'correct-rejection' ? '✓ Good restraint' : '✓')
        : (result.outcome === 'false-alarm' ? '✗ Should have resisted' : '✗ Should have tapped');
      const fb = this.scene.add.text(width / 2, height / 2 + 100, fbText, {
        fontSize: '14px', color: result.correct ? '#44ff88' : '#ff6666', fontFamily: 'monospace',
      }).setOrigin(0.5).setData('stimulus', true);
      this.container.add(fb);
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

    this.onComplete({ line: 'Intrapersonal', accuracy, medianReactionMs: medianRT, trials: this.results });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
