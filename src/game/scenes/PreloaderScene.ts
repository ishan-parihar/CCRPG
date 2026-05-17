import Phaser from 'phaser';
import { RegistryKeys, SceneKeys } from '../keys.js';
import { generateTextures } from '../textures.js';
import type { SaveRepository, SaveData } from '@infra/persistence/SaveRepository.js';

/**
 * PreloaderScene — generates procedural textures, awaits the save
 * promise, and shows a minimal progress indicator while doing so.
 *
 * Per the blueprint: the Preloader "must be programmed to halt
 * transition to the Main Menu until the persistence promises are fully
 * resolved." That guarantee lives here.
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preloader });
  }

  create(): void {
    generateTextures(this);
    this.drawSplash();

    const repo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    if (!repo) {
      this.transition({ ...this.fallbackSave() });
      return;
    }

    repo.load().then(
      (data) => this.transition(data),
      (err) => {
        console.error('Failed to load save, using defaults', err);
        this.transition({ ...this.fallbackSave() });
      },
    );
  }

  private drawSplash(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 60, 'CCRPG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '64px',
        color: '#e7eaf2',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, 'Cognitive Combat', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#9bd9ff',
      })
      .setOrigin(0.5);

    // Indeterminate progress bar.
    const barW = 240;
    const barH = 6;
    const barX = (width - barW) / 2;
    const barY = height / 2 + 60;
    this.add.rectangle(barX, barY, barW, barH, 0x1b2740).setOrigin(0, 0.5);
    const fill = this.add
      .rectangle(barX, barY, 80, barH, 0x4cc9f0)
      .setOrigin(0, 0.5);
    this.tweens.add({
      targets: fill,
      x: barX + barW - 80,
      duration: 700,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private transition(save: SaveData): void {
    this.registry.set(RegistryKeys.Save, save);

    // Try to load a persisted PlayerProfile for returning players
    const repo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    if (repo) {
      repo.loadProfile?.().then(
        (profile) => {
          if (profile) {
            this.registry.set(RegistryKeys.Profile, profile);
          }
          this.scene.start(SceneKeys.MainMenu);
        },
        () => this.scene.start(SceneKeys.MainMenu),
      );
    } else {
      this.scene.start(SceneKeys.MainMenu);
    }
  }

  private fallbackSave(): SaveData {
    // Lazy import to avoid pulling persistence into the bundle hot path.
    return {
      version: 1,
      playerName: 'Hero',
      stats: {
        maxHp: 120,
        maxMana: 60,
        agility: 60,
        attack: 18,
        defense: 12,
        precision: 75,
        magic: 22,
        luck: 10,
      },
      cognitive: {
        nBackAccuracy: 0,
        nBackLevel: 1,
        stroopAccuracy: 0,
        stroopReactionMs: 0,
        totalTrials: 0,
      },
      xp: 0,
      level: 1,
      battlesWon: 0,
      updatedAt: 0,
    };
  }
}
