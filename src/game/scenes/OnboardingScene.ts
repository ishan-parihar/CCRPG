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
import { createSignificator } from '@core/domain/Significator.js';
import type { Holon } from '@core/domain/Holon.js';
import type { OnboardingProbe, ProbeResult } from '../onboarding/ProbeInterface.js';
import holonsJson from '@core/data/red-layer-holons.json';

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
      this.add.rectangle(width / 2, height / 2, width, height, 0x080c18, 0.92)
    );

    // Compute per-dimension scores
    const correctCount = result.trials.filter(t => t.correct).length;
    const accuracy = result.trials.length > 0 ? correctCount / result.trials.length : 0;
    const rts = result.trials.filter(t => t.correct).map(t => t.reactionMs);
    const avgRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 5000;
    const speedScore = Math.max(0, Math.min(1, 1 - (avgRT - 300) / 4700));
    const rtVariance = rts.length > 1
      ? rts.reduce((a, v) => a + (v - avgRT) ** 2, 0) / rts.length : 0;
    const consistencyScore = Math.max(0, Math.min(1, 1 - Math.sqrt(rtVariance) / 2000));

    // Title
    completeContainer.add(
      this.add.text(width / 2, height / 2 - 100, result.line, {
        fontSize: '24px', color: '#e8e8ff', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    // Dimension bars
    const dims = [
      { label: 'Accuracy', value: accuracy },
      { label: 'Speed', value: speedScore },
      { label: 'Consistency', value: consistencyScore },
    ];
    const barY = height / 2 - 50;
    dims.forEach((dim, i) => {
      const y = barY + i * 40;
      const barWidth = 200;
      const filled = dim.value * barWidth;
      // Label
      completeContainer.add(this.add.text(width / 2 - 140, y, dim.label, {
        fontSize: '16px', color: '#888899', fontFamily: 'monospace',
      }).setOrigin(0, 0.5));
      // Background bar
      completeContainer.add(this.add.rectangle(width / 2 + 40, y, barWidth, 14, 0x222244));
      // Filled bar
      const color = dim.value >= 0.7 ? 0x44cc88 : dim.value >= 0.4 ? 0xccaa44 : 0xcc5544;
      if (filled > 0) {
        completeContainer.add(this.add.rectangle(width / 2 + 40 - (barWidth - filled) / 2, y, filled, 14, color));
      }
      // Percentage
      completeContainer.add(this.add.text(width / 2 + 155, y, `${Math.round(dim.value * 100)}%`, {
        fontSize: '14px', color: '#aaaacc', fontFamily: 'monospace',
      }).setOrigin(0, 0.5));
    });

    // Threshold info
    completeContainer.add(
      this.add.text(width / 2, height / 2 + 80, `Threshold: ${result.threshold.toFixed(1)}`, {
        fontSize: '16px', color: '#666688', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    this.time.delayedCall(3000, () => {
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

    // Create Significator from calibration results
    const playerId = profile.id;
    const sig = createSignificator(playerId, result.altitudes, result.stage);
    this.registry.set(RegistryKeys.Significator, sig);

    // Create initial WorldState from red-layer-holons
    const holonsData: Holon[] = this.loadRedLayerHolons();
    const worldState = {
      holons: holonsData,
      recentEncounterIds: [] as string[],
      cooldowns: {} as Record<string, number>,
    };
    this.registry.set(RegistryKeys.WorldState, worldState);

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
      .on('pointerdown', () => this.scene.start(SceneKeys.World));
  }

  private loadRedLayerHolons(): Holon[] {
    // Static JSON import resolved by Vite at build time
    return holonsJson as unknown as Holon[];
  }

  private lineToTaskSlug(line: string): TaskSlug | undefined {
    const map: Record<string, TaskSlug> = {
      Cognitive: 'n_back',
      Emotional: 'affect_recognition',
      Moral: 'dilemma_choice',
      Intrapersonal: 'self_report',
      Spiritual: 'value_coherence',
      Somatic: 'reaction_time',
      Willpower: 'held_input',
      Interpersonal: 'pattern_prediction',
    };
    return map[line];
  }
}
