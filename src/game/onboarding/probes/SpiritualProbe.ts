/**
 * SpiritualProbe — measures attentional coherence via breath synchronisation.
 * A pulsing circle expands and contracts. Player taps at the peak of each exhale.
 * Coherence = how well taps align with the rhythm.
 */
import Phaser from 'phaser';
import { generateBreathTrial, scoreBreath } from '@core/usecases/BreathRhythmTask.js';
import type { OnboardingProbe, ProbeConfig, ProbeResult, ProbeTrialResult } from '../ProbeInterface.js';

export class SpiritualProbe implements OnboardingProbe {
  readonly config: ProbeConfig = {
    line: 'Spiritual',
    title: 'The Breath',
    instruction: 'A circle will pulse — expanding and contracting.\nTap at the TOP of each expansion (the peak).\nBreathe with it. Find the rhythm.',
    trials: 4, // 4 cycles
    hasPractice: true,
    trialTimeoutMs: 40000, // Full breath sequence
    interTrialDelayMs: 0,
  };

  private scene!: Phaser.Scene;
  private onComplete!: (result: ProbeResult) => void;
  private container!: Phaser.GameObjects.Container;
  private tapTimestamps: number[] = [];
  private trialStartMs = 0;
  private breathCircle!: Phaser.GameObjects.Arc;

  start(scene: Phaser.Scene, onComplete: (result: ProbeResult) => void): void {
    this.scene = scene;
    this.onComplete = onComplete;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0);

    // Instruction
    this.container.add(scene.add.text(width / 2, 100, this.config.instruction, {
      fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 60 },
    }).setOrigin(0.5));

    // Breath circle
    this.breathCircle = scene.add.circle(width / 2, height / 2, 40, 0x334466, 0.8)
      .setStrokeStyle(3, 0x6688aa);
    this.container.add(this.breathCircle);

    // Tap label
    this.container.add(scene.add.text(width / 2, height / 2 + 130, 'Tap at the peak ↑', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Full-screen tap zone
    const tapZone = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .on('pointerdown', () => this.onTap());
    this.container.add(tapZone);

    // Start after a brief pause
    scene.time.delayedCall(2000, () => this.startBreathing());
  }

  private startBreathing(): void {
    const trial = generateBreathTrial(3500, 3500, this.config.trials + 1); // +1 for practice
    const cycleMs = trial.cycle.inhaleMs + trial.cycle.exhaleMs;

    this.trialStartMs = performance.now();
    this.tapTimestamps = [];

    // Animate the breath circle: expand on inhale, contract on exhale
    this.scene.tweens.add({
      targets: this.breathCircle,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: trial.cycle.inhaleMs,
      ease: 'Sine.easeInOut',
      yoyo: true, // Contract on exhale
      repeat: trial.totalCycles - 1,
      onComplete: () => this.finishBreathing(trial),
    });

    // Also pulse the color
    this.scene.tweens.add({
      targets: this.breathCircle,
      fillAlpha: 1,
      duration: trial.cycle.inhaleMs,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: trial.totalCycles - 1,
    });

    // Counter
    const { width } = this.scene.scale;
    const counter = this.scene.add.text(width / 2, 200, '', {
      fontSize: '14px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.container.add(counter);

    let cycleCount = 0;
    const updateCounter = () => {
      cycleCount++;
      counter.setText(`Cycle ${cycleCount} / ${trial.totalCycles}`);
      if (cycleCount < trial.totalCycles) {
        this.scene.time.delayedCall(cycleMs, updateCounter);
      }
    };
    this.scene.time.delayedCall(cycleMs, updateCounter);
  }

  private onTap(): void {
    const elapsed = performance.now() - this.trialStartMs;
    this.tapTimestamps.push(elapsed);
  }

  private finishBreathing(trial: ReturnType<typeof generateBreathTrial>): void {
    const result = scoreBreath(trial, { tapTimestamps: this.tapTimestamps });

    // Convert coherence to trial results
    const trials: ProbeTrialResult[] = this.tapTimestamps.map(ts => ({
      correct: result.coherence > 0.3,
      reactionMs: ts,
    }));

    // Feedback
    const { width, height } = this.scene.scale;
    const coherenceLabel = result.coherence > 0.7 ? 'Deeply attuned'
      : result.coherence > 0.4 ? 'Finding the rhythm'
      : 'Still searching';

    this.container.add(this.scene.add.text(width / 2, height / 2 + 180, coherenceLabel, {
      fontSize: '18px', color: '#88ccaa', fontFamily: 'monospace',
    }).setOrigin(0.5));

    this.scene.time.delayedCall(2000, () => {
      this.onComplete({
        line: 'Spiritual',
        accuracy: result.coherence,
        medianReactionMs: result.meanDeviationMs,
        trials,
      });
    });
  }

  destroy(): void {
    this.container?.destroy(true);
  }
}
