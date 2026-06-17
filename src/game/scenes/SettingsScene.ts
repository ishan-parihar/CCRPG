import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { AccessibilityManager } from '../accessibility/AccessibilityManager.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Settings });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x05070b);
    fadeIn(this, 400);

    this.add.text(width / 2, 80, 'Settings', {
      fontSize: '32px', color: '#e7eaf2', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const acc = this.registry.get(RegistryKeys.Accessibility) as AccessibilityManager | undefined;
    let highContrast = acc?.isHighContrast() ?? false;
    let telemetry = true;

    // High Contrast toggle
    const hcText = this.add.text(width / 2, 220, `High Contrast: ${highContrast ? 'ON' : 'OFF'}`, {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        highContrast = !highContrast;
        acc?.update({ highContrast });
        hcText.setText(`High Contrast: ${highContrast ? 'ON' : 'OFF'}`);
      });

    // Telemetry toggle
    const telText = this.add.text(width / 2, 320, `Telemetry: ${telemetry ? 'ON' : 'OFF'}`, {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        telemetry = !telemetry;
        telText.setText(`Telemetry: ${telemetry ? 'ON' : 'OFF'}`);
      });

    // Reset Profile
    this.add.text(width / 2, 440, '[ Reset Profile ]', {
      fontSize: '20px', color: '#ff6666', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => this.confirmReset(width, height));

    // Back
    this.add.text(width / 2, height - 100, '← Back', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => fadeToScene(this, SceneKeys.MainMenu));
  }

  private confirmReset(width: number, height: number): void {
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(200);
    const msg = this.add.text(width / 2, height / 2 - 40, 'Reset all progress?', {
      fontSize: '22px', color: '#ff8888', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(201);

    const yes = this.add.text(width / 2 - 80, height / 2 + 30, '[ Yes ]', {
      fontSize: '20px', color: '#ff4444', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(201).setInteractive()
      .on('pointerdown', async () => {
        this.registry.remove(RegistryKeys.Significator);
        this.registry.remove(RegistryKeys.WorldState);
        const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as { resetProfile?: () => Promise<void>; resetWorldState?: () => Promise<void> } | undefined;
        if (saveRepo?.resetProfile) {
          try {
            await saveRepo.resetProfile();
            await saveRepo.resetWorldState?.();
          } catch (err) {
            console.warn('Failed to reset persisted state:', err);
          }
        }
        fadeToScene(this, SceneKeys.Onboarding);
      });

    const no = this.add.text(width / 2 + 80, height / 2 + 30, '[ No ]', {
      fontSize: '20px', color: '#88ff88', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(201).setInteractive()
      .on('pointerdown', () => { overlay.destroy(); msg.destroy(); yes.destroy(); no.destroy(); });
  }
}
