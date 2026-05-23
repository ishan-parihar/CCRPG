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

export class OnboardingScene extends Phaser.Scene {
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.Onboarding });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x080c18);
    this.showOpening();
  }

  private showOpening(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 80,
      'The Dream Sequence\n\nCalibrate your developmental profile\nthrough a series of short challenges.',
      { fontSize: '20px', color: '#ccccee', fontFamily: 'monospace', align: 'center', wordWrap: { width: width - 80 }, lineSpacing: 6 },
    ).setOrigin(0.5);

    this.makeButton(width / 2, height / 2 + 80, '[ Full Calibration ]', () => this.begin('full'));
    this.makeButton(width / 2, height / 2 + 130, '[ Quick Start ]', () => this.begin('quick-calibration'));

    this.progressText = this.add.text(width / 2, height - 40, '', {
      fontSize: '16px', color: '#555577', fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, { fontSize: '20px', color: '#88ccff', fontFamily: 'monospace' })
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
      fontSize: '20px', color: '#ccccee', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const moduleRegistry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry;
    const onboarding = new CompositeOnboarding(moduleRegistry, { sessionSplit: split });
    const lines = onboarding.getLinesForSession();
    let lineIndex = 0;

    const runModule = (module: StageAssessment): Promise<AssessmentResult> => {
      return new Promise<AssessmentResult>((resolve) => {
        lineIndex++;
        this.progressText.setText(`Line ${lineIndex} of ${lines.length}  ·  ${module.line}`);

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
    const sig = result.significator as Significator & { driveWeights?: Record<string, number> };
    (sig as any).driveWeights = seedDriveWeights(result.lineResults);

    // Persist
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository;
    await saveRepo.saveProfile(sig);
    this.registry.set(RegistryKeys.Significator, sig);

    // Create and persist WorldState
    const worldState = createInitialWorldState(holonsJson as unknown as Holon[]);
    this.registry.set(RegistryKeys.WorldState, worldState);

    this.showComplete(result.significator);
  }

  private showComplete(sig: Significator): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60,
      'Calibration Complete\n\nYour developmental profile has been mapped.',
      { fontSize: '20px', color: '#ccccee', fontFamily: 'monospace', align: 'center', wordWrap: { width: width - 80 }, lineSpacing: 6 },
    ).setOrigin(0.5);

    const summary = Object.entries(sig.altitudes)
      .map(([line, stage]) => `  ${line}: ${stage}`)
      .join('\n');
    this.add.text(width / 2, height / 2 + 40, summary, {
      fontSize: '14px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.makeButton(width / 2, height - 80, '[ Enter the World ]', () => {
      this.scene.start(SceneKeys.World);
    });
  }
}
