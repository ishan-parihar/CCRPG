/**
 * OnboardingScene — CompositeOnboarding binary-search calibration.
 *
 * Offers Full Calibration or Quick Start, then runs the binary-search
 * algorithm via CompositeOnboarding, delegating each module assessment
 * to AssessmentScene.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import { CompositeOnboarding, seedDriveWeights, getLineModality } from '../assessments/CompositeOnboarding.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { AssessmentResult, StageAssessment } from '@core/assessments/types.js';
import type { Significator } from '@core/domain/Significator.js';
import { createInitialWorldState } from '@core/engines/CandidateGeneration.js';
import type { SaveRepository } from '@infra/persistence/SaveRepository.js';
import holonsJson from '@core/data/red-layer-holons.json';
import type { Holon } from '@core/domain/Holon.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export class OnboardingScene extends Phaser.Scene {
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.Onboarding });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x080c18);
    fadeIn(this, 400);
    this.showOpening();
  }

  private showOpening(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 80,
      'The Dream Sequence\n\nCalibrate your developmental profile\nthrough a series of short challenges.',
      { fontSize: '30px', color: '#ccccee', fontFamily: 'monospace', align: 'center', wordWrap: { width: width - 120 }, lineSpacing: 8 },
    ).setOrigin(0.5);

    this.makeButton(width / 2, height / 2 + 80, '[ Full Calibration ]', () => this.begin('full'));
    this.makeButton(width / 2, height / 2 + 130, '[ Quick Start ]', () => this.begin('quick-calibration'));

    this.progressText = this.add.text(width / 2, height - 40, '', {
      fontSize: '30px', color: '#555577', fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, { fontSize: '30px', color: '#88ccff', fontFamily: 'monospace' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', cb)
      .on('pointerover', function (this: Phaser.GameObjects.Text) { this.setColor('#aaeeff'); })
      .on('pointerout', function (this: Phaser.GameObjects.Text) { this.setColor('#88ccff'); });
  }

  private async begin(split: 'full' | 'quick-calibration'): Promise<void> {
    // Clear opening UI
    this.children.removeAll(true);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x080c18);

    this.progressText = this.add.text(width / 2, height / 2, 'Preparing...', {
      fontSize: '30px', color: '#ccccee', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const moduleRegistry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    if (!moduleRegistry) {
      console.error('ModuleRegistry not found in registry');
      return;
    }
    const onboarding = new CompositeOnboarding(moduleRegistry, { sessionSplit: split });
    const lines = onboarding.getLinesForSession();
    let lineIndex = 0;

    const runModule = (module: StageAssessment): Promise<AssessmentResult> => {
      return new Promise<AssessmentResult>((resolve) => {
        lineIndex++;
        // T-3.4 (Veil compliance): don't leak the line taxonomy name.
        this.progressText.setText(`Calibrating… (${lineIndex}/${lines.length})`);

        const assessScene = this.scene.get(SceneKeys.Assessment);
        const handler = ({ result }: { result: AssessmentResult }) => {
          assessScene.events.off('assessment_done', handler);
          this.scene.stop(SceneKeys.Assessment);
          resolve(result);
        };
        assessScene.events.on('assessment_done', handler);

        this.scene.launch(SceneKeys.Assessment, {
          module,
          mode: 'calibration' as const,
          modality: getLineModality(module.line),
        });
      });
    };

    const result = await onboarding.runOnboarding(runModule);

    // Seed drives onto significator
    const sig = result.significator;
    const driveWeights = seedDriveWeights(result.lineResults);
    // Write to the actual drives.weights property (not a non-existent driveWeights)
    for (const [drive, weight] of Object.entries(driveWeights)) {
      (sig.drives.weights as Record<string, number>)[drive] = weight;
    }

    // Persist
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    if (!saveRepo) {
      console.error('SaveRepository not found in registry');
      return;
    }
    await saveRepo.saveProfile(sig);
    this.registry.set(RegistryKeys.Significator, sig);

    // Create and persist WorldState
    const worldState = createInitialWorldState(holonsJson as unknown as Holon[]);
    await saveRepo.saveWorldState(worldState);
    this.registry.set(RegistryKeys.WorldState, worldState);

    this.showComplete(result.significator);
  }

  private showComplete(_sig: Significator): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;

    // T-3.4 (Veil compliance): no "developmental profile" language, no line×stage matrix.
    this.add.text(width / 2, height / 2 - 60,
      'Calibration complete.\n\nThe world settles into shape around you.\nWhat felt foreign is now familiar;\nwhat felt familiar now asks something new.',
      { fontSize: '28px', color: '#ccccee', fontFamily: 'monospace', align: 'center', wordWrap: { width: width - 120 }, lineSpacing: 8 },
    ).setOrigin(0.5);

    this.makeButton(width / 2, height - 80, '[ Enter the World ]', () => {
      fadeToScene(this, SceneKeys.World);
    });
  }
}
