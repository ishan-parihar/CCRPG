/**
 * OnboardingScene — the adaptive calibration orchestrator.
 *
 * Runs 8 modular probes (one per line) sequentially, with proper
 * transitions, instructions, and pacing between each. Each probe is
 * its own module that uses the actual cognitive task engine for that line.
 *
 * Total expected duration: 10-20 minutes (not 12 seconds).
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import { calibrate } from '@core/usecases/OnboardingCalibrator.js';
import { createInitialProfile } from '@core/domain/PlayerProfile.js';
import type { OnboardingProbe, ProbeResult } from '../onboarding/ProbeInterface.js';

// Import all 8 modular probes
import { CognitiveProbe } from '../onboarding/probes/CognitiveProbe.js';
import { EmotionalProbe } from '../onboarding/probes/EmotionalProbe.js';
import { MoralProbe } from '../onboarding/probes/MoralProbe.js';
import { IntrapersonalProbe } from '../onboarding/probes/IntrapersonalProbe.js';
import { SpiritualProbe } from '../onboarding/probes/SpiritualProbe.js';
import { SomaticProbe } from '../onboarding/probes/SomaticProbe.js';
import { WillpowerProbe } from '../onboarding/probes/WillpowerProbe.js';
import { InterpersonalProbe } from '../onboarding/probes/InterpersonalProbe.js';

export class OnboardingScene extends Phaser.Scene {
  private probes: OnboardingProbe[] = [];
  private probeResults: ProbeResult[] = [];
  private currentProbeIndex = 0;
  private titleText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.Onboarding });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x080c18);

    // Instantiate all 8 probes in order
    this.probes = [
      new SomaticProbe(),        // Start with body — ground the player
      new CognitiveProbe(),      // Then working memory
      new EmotionalProbe(),      // Then affect recognition
      new IntrapersonalProbe(),  // Then impulse awareness
      new MoralProbe(),          // Then moral reasoning (needs time)
      new SpiritualProbe(),      // Then breath coherence (needs calm)
      new WillpowerProbe(),      // Then sustained effort
      new InterpersonalProbe(),  // Finally, social attunement
    ];

    this.probeResults = [];
    this.currentProbeIndex = 0;

    // Persistent UI elements
    this.titleText = this.add.text(width / 2, 30, '', {
      fontSize: '22px', color: '#c8b8e8', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(200);

    this.progressText = this.add.text(width / 2, height - 30, '', {
      fontSize: '13px', color: '#555577', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(200);

    // Opening sequence
    this.showOpening();
  }

  private showOpening(): void {
    const { width, height } = this.scale;

    const openingText = this.add.text(width / 2, height / 2 - 40,
      'The Dream Sequence\n\nYou are about to enter a series of\nshort challenges — one for each\nfacet of your being.\n\nThere is no pass or fail.\nJust be present, and respond honestly.',
      {
        fontSize: '16px', color: '#ccccee', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
        lineSpacing: 6,
      }).setOrigin(0.5);

    const beginBtn = this.add.text(width / 2, height / 2 + 160, '[ Begin ]', {
      fontSize: '22px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        openingText.destroy();
        beginBtn.destroy();
        this.startNextProbe();
      })
      .on('pointerover', () => beginBtn.setColor('#aaeeff'))
      .on('pointerout', () => beginBtn.setColor('#88ccff'));
  }

  private startNextProbe(): void {
    if (this.currentProbeIndex >= this.probes.length) {
      this.finishOnboarding();
      return;
    }

    const probe = this.probes[this.currentProbeIndex]!;

    // Update persistent UI
    this.titleText.setText(probe.config.title);
    this.progressText.setText(
      `${this.currentProbeIndex + 1} of ${this.probes.length}  ·  ${probe.config.line}`
    );

    // Show transition screen before starting the probe
    this.showProbeTransition(probe);
  }

  private showProbeTransition(probe: OnboardingProbe): void {
    const { width, height } = this.scale;

    const transitionContainer = this.add.container(0, 0).setDepth(150);

    // Dim background
    transitionContainer.add(
      this.add.rectangle(width / 2, height / 2, width, height, 0x080c18, 0.95)
    );

    // Probe title
    transitionContainer.add(
      this.add.text(width / 2, height / 2 - 60, probe.config.title, {
        fontSize: '28px', color: '#e8e8ff', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    // Line name
    transitionContainer.add(
      this.add.text(width / 2, height / 2 - 20, `— ${probe.config.line} —`, {
        fontSize: '14px', color: '#888899', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    // Brief description of what's about to happen
    transitionContainer.add(
      this.add.text(width / 2, height / 2 + 40, probe.config.instruction, {
        fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
        lineSpacing: 4,
      }).setOrigin(0.5)
    );

    // Ready button
    const readyBtn = this.add.text(width / 2, height / 2 + 160, '[ Ready ]', {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        transitionContainer.destroy(true);
        readyBtn.destroy();
        this.launchProbe(probe);
      })
      .on('pointerover', () => readyBtn.setColor('#aaeeff'))
      .on('pointerout', () => readyBtn.setColor('#88ccff'));
    transitionContainer.add(readyBtn);
  }

  private launchProbe(probe: OnboardingProbe): void {
    probe.start(this, (result: ProbeResult) => {
      this.probeResults.push(result);
      probe.destroy();
      this.currentProbeIndex++;

      // Brief pause between probes
      this.showProbeComplete(result);
    });
  }

  private showProbeComplete(result: ProbeResult): void {
    const { width, height } = this.scale;

    const completeContainer = this.add.container(0, 0).setDepth(150);
    completeContainer.add(
      this.add.rectangle(width / 2, height / 2, width, height, 0x080c18, 0.9)
    );

    // Result summary (qualitative, not numerical)
    const qualityLabel = result.accuracy >= 0.8 ? 'Strong'
      : result.accuracy >= 0.5 ? 'Developing'
      : 'Emerging';

    completeContainer.add(
      this.add.text(width / 2, height / 2 - 20, `${result.line}: ${qualityLabel}`, {
        fontSize: '20px', color: '#aaccaa', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    // Auto-advance after 2 seconds
    this.time.delayedCall(2000, () => {
      completeContainer.destroy(true);
      this.startNextProbe();
    });
  }

  private finishOnboarding(): void {
    const { width, height } = this.scale;

    // Clear everything
    this.titleText.setText('');
    this.progressText.setText('');

    // Calibrate
    const calibrationInput = this.probeResults.map(r => ({
      line: r.line,
      accuracy: r.accuracy,
      reactionMs: r.medianReactionMs,
    }));
    const result = calibrate(calibrationInput);
    const baseProfile = createInitialProfile(
      crypto.randomUUID?.() ?? `player-${Date.now()}`,
      result.altitudes,
      result.stage,
      result.driveWeights,
    );
    const profile = { ...baseProfile, onboardingComplete: true, totalSessionsPlayed: 1 };

    // Store
    this.registry.set(RegistryKeys.Profile, profile);

    // Final screen
    this.add.text(width / 2, height / 2 - 80,
      'Calibration Complete\n\nYour developmental profile has been mapped.\nThe world will meet you where you stand.',
      {
        fontSize: '16px', color: '#ccccee', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
        lineSpacing: 6,
      }).setOrigin(0.5);

    // Show summary
    const summaryLines = Object.entries(result.altitudes)
      .map(([line, stage]) => `  ${line}: ${stage}`)
      .join('\n');
    this.add.text(width / 2, height / 2 + 60, summaryLines, {
      fontSize: '13px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 200, `Synthesised Stage: ${result.stage}`, {
      fontSize: '18px', color: '#aaccff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Continue button
    this.add.text(width / 2, height - 80, '[ Enter the World ]', {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => this.scene.start(SceneKeys.MainMenu));
  }
}
