import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import {
  calibrate,
  type ProbeResult,
} from '@core/usecases/OnboardingCalibrator.js';
import { createInitialProfile } from '@core/domain/PlayerProfile.js';
import type { Line } from '@core/domain/Line.js';

/**
 * OnboardingScene — the adaptive calibration sequence from MVP-BLUEPRINT Part III.
 *
 * Runs a short series of probes (one per line) to estimate the player's
 * developmental altitude. Each probe is a simple timed interaction:
 * - Tap accuracy → maps to accuracy score
 * - Reaction time → stored for staircase seeding
 *
 * After all probes complete, calibrates a PlayerProfile and transitions
 * to the main game.
 */
export class OnboardingScene extends Phaser.Scene {
  private probeResults: ProbeResult[] = [];
  private currentProbeIndex = 0;
  private probeText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private probeStartMs = 0;
  private probeActive = false;
  private targetCircle: Phaser.GameObjects.Arc | null = null;

  private readonly probeDescriptions: readonly { line: Line; instruction: string }[] = [
    { line: 'Cognitive', instruction: 'Tap the symbol when it appears' },
    { line: 'Emotional', instruction: 'Identify the feeling — tap the matching face' },
    { line: 'Moral', instruction: 'Choose: save the ember or let it fall' },
    { line: 'Intrapersonal', instruction: 'Hold still — resist the urge to tap' },
    { line: 'Spiritual', instruction: 'Breathe in sync with the pulse' },
    { line: 'Somatic', instruction: 'Tap the rhythm as it plays' },
    { line: 'Willpower', instruction: 'Hold the circle until it fills' },
    { line: 'Interpersonal', instruction: 'Mirror the companion\'s gesture' },
  ];

  constructor() {
    super({ key: SceneKeys.Onboarding });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0a0e1a);

    this.add.text(width / 2, 60, 'The Dream Sequence', {
      fontSize: '28px', color: '#c8b8e8', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.instructionText = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '20px', color: '#aaaacc', fontFamily: 'monospace',
      wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    this.probeText = this.add.text(width / 2, height - 80, '', {
      fontSize: '16px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.startNextProbe();
  }

  private startNextProbe(): void {
    if (this.currentProbeIndex >= this.probeDescriptions.length) {
      this.finishOnboarding();
      return;
    }

    const probe = this.probeDescriptions[this.currentProbeIndex]!;
    this.probeText.setText(`Probe ${this.currentProbeIndex + 1} / ${this.probeDescriptions.length}`);
    this.instructionText.setText(probe.instruction);

    // Show a target after a brief delay
    this.time.delayedCall(1000, () => {
      this.showTarget();
    });
  }

  private showTarget(): void {
    const { width, height } = this.scale;
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(height / 2 - 50, height / 2 + 150);

    this.targetCircle = this.add.circle(x, y, 40, 0x44aaff, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.onProbeResponse());

    this.probeStartMs = performance.now();
    this.probeActive = true;

    // Auto-fail after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.probeActive) {
        this.onProbeTimeout();
      }
    });
  }

  private onProbeResponse(): void {
    if (!this.probeActive) return;
    this.probeActive = false;

    const reactionMs = performance.now() - this.probeStartMs;
    // Map reaction time to accuracy: <300ms = 1.0, >2500ms = 0.1
    const accuracy = Math.max(0.1, Math.min(1.0, 1.0 - (reactionMs - 300) / 2200));

    const probe = this.probeDescriptions[this.currentProbeIndex]!;
    this.probeResults.push({ line: probe.line, accuracy, reactionMs });

    this.cleanupTarget();
    this.currentProbeIndex++;
    this.time.delayedCall(500, () => this.startNextProbe());
  }

  private onProbeTimeout(): void {
    this.probeActive = false;
    const probe = this.probeDescriptions[this.currentProbeIndex]!;
    this.probeResults.push({ line: probe.line, accuracy: 0.1, reactionMs: 3000 });

    this.cleanupTarget();
    this.currentProbeIndex++;
    this.time.delayedCall(500, () => this.startNextProbe());
  }

  private cleanupTarget(): void {
    if (this.targetCircle) {
      this.targetCircle.destroy();
      this.targetCircle = null;
    }
  }

  private finishOnboarding(): void {
    const result = calibrate(this.probeResults);
    const profile = createInitialProfile(
      crypto.randomUUID?.() ?? `player-${Date.now()}`,
      result.altitudes,
      result.stage,
      result.driveWeights,
    );

    // Store profile in game registry for other scenes
    this.registry.set(RegistryKeys.Profile, profile);

    this.instructionText.setText('Calibration complete.\nYour journey begins...');
    this.probeText.setText('');

    this.time.delayedCall(2000, () => {
      this.scene.start(SceneKeys.MainMenu);
    });
  }
}
