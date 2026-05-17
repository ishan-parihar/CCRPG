/**
 * OnboardingScene — the adaptive calibration orchestrator.
 *
 * Runs 8 modular probes (one per line) sequentially, with proper
 * transitions, instructions, and pacing between each. Each probe
 * reports a threshold via FastStaircase.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import { calibrate } from '@core/usecases/OnboardingCalibrator.js';
import { createInitialProfile, type TaskSlug } from '@core/domain/PlayerProfile.js';
import type { OnboardingProbe, ProbeResult } from '../onboarding/ProbeInterface.js';

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

    this.probes = [
      new SomaticProbe(),
      new CognitiveProbe(),
      new EmotionalProbe(),
      new IntrapersonalProbe(),
      new MoralProbe(),
      new SpiritualProbe(),
      new WillpowerProbe(),
      new InterpersonalProbe(),
    ];

    this.probeResults = [];
    this.currentProbeIndex = 0;

    this.titleText = this.add.text(width / 2, 30, '', {
      fontSize: '28px', color: '#c8b8e8', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(200);

    this.progressText = this.add.text(width / 2, height - 30, '', {
      fontSize: '16px', color: '#555577', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(200);

    this.showOpening();
  }

  private showOpening(): void {
    const { width, height } = this.scale;

    const openingText = this.add.text(width / 2, height / 2 - 40,
      'The Dream Sequence\n\nYou are about to enter a series of\nshort challenges — one for each\nfacet of your being.\n\nThere is no pass or fail.\nJust be present, and respond honestly.',
      {
        fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
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
    this.titleText.setText(probe.config.title);
    this.progressText.setText(
      `${this.currentProbeIndex + 1} of ${this.probes.length}  ·  ${probe.config.line}`
    );
    this.showProbeTransition(probe);
  }

  private showProbeTransition(probe: OnboardingProbe): void {
    const { width, height } = this.scale;
    const transitionContainer = this.add.container(0, 0).setDepth(150);

    transitionContainer.add(
      this.add.rectangle(width / 2, height / 2, width, height, 0x080c18, 0.95)
    );
    transitionContainer.add(
      this.add.text(width / 2, height / 2 - 60, probe.config.title, {
        fontSize: '28px', color: '#e8e8ff', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );
    transitionContainer.add(
      this.add.text(width / 2, height / 2 - 20, `— ${probe.config.line} —`, {
        fontSize: '16px', color: '#888899', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );
    transitionContainer.add(
      this.add.text(width / 2, height / 2 + 40, probe.config.instruction, {
        fontSize: '20px', color: '#aaaacc', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
        lineSpacing: 4,
      }).setOrigin(0.5)
    );

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
      this.showProbeComplete(result);
    });
  }

  private showProbeComplete(result: ProbeResult): void {
    const { width, height } = this.scale;
    const completeContainer = this.add.container(0, 0).setDepth(150);
    completeContainer.add(
      this.add.rectangle(width / 2, height / 2, width, height, 0x080c18, 0.9)
    );

    const qualityLabel = result.accuracy >= 0.8 ? 'Strong'
      : result.accuracy >= 0.5 ? 'Developing'
      : 'Emerging';

    completeContainer.add(
      this.add.text(width / 2, height / 2 - 20, `${result.line}: ${qualityLabel}`, {
        fontSize: '20px', color: '#aaccaa', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    this.time.delayedCall(2000, () => {
      completeContainer.destroy(true);
      this.startNextProbe();
    });
  }

  private finishOnboarding(): void {
    const { width, height } = this.scale;
    this.titleText.setText('');
    this.progressText.setText('');

    const result = calibrate(this.probeResults);
    const baseProfile = createInitialProfile(
      crypto.randomUUID?.() ?? `player-${Date.now()}`,
      result.altitudes,
      result.stage,
      result.driveWeights,
    );

    // Seed task staircases from onboarding thresholds
    const seededStaircases = { ...baseProfile.taskStaircases };
    for (const probe of this.probeResults) {
      const slug = this.lineToTaskSlug(probe.line);
      if (slug && slug in seededStaircases) {
        (seededStaircases as Record<string, typeof seededStaircases[TaskSlug]>)[slug] = {
          level: probe.threshold,
          reversals: 0,
          lastDirection: null,
          history: [],
        };
      }
    }

    const profile = { ...baseProfile, taskStaircases: seededStaircases, onboardingComplete: true, totalSessionsPlayed: 1 };
    this.registry.set(RegistryKeys.Profile, profile);

    this.add.text(width / 2, height / 2 - 80,
      'Calibration Complete\n\nYour developmental profile has been mapped.\nThe world will meet you where you stand.',
      {
        fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
        lineSpacing: 6,
      }).setOrigin(0.5);

    const summaryLines = Object.entries(result.altitudes)
      .map(([line, stage]) => `  ${line}: ${stage}`)
      .join('\n');
    this.add.text(width / 2, height / 2 + 60, summaryLines, {
      fontSize: '16px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 200, `Synthesised Stage: ${result.stage}`, {
      fontSize: '20px', color: '#aaccff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 80, '[ Enter the World ]', {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => this.scene.start(SceneKeys.MainMenu));
  }

  private lineToTaskSlug(line: string): TaskSlug | undefined {
    const map: Record<string, TaskSlug> = {
      Cognitive: 'n_back',
      Emotional: 'affect_recognition',
      Moral: 'dilemma_choice',
      Intrapersonal: 'go_no_go',
      Spiritual: 'breath_rhythm',
      Somatic: 'reaction_time',
      Willpower: 'held_input',
      Interpersonal: 'simon',
    };
    return map[line];
  }
}
