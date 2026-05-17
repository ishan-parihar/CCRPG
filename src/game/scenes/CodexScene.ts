import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { PlayerProfile, CodexEntry } from '@core/domain/PlayerProfile.js';

/**
 * CodexScene — displays the player's unlocked codex entries as a
 * scrollable list. Each entry shows title and body text.
 */
export class CodexScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Codex });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0a0c14);

    this.add.text(width / 2, 40, 'Codex', {
      fontSize: '26px', color: '#c8c8e8', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const profile = this.registry.get(RegistryKeys.Profile) as PlayerProfile | undefined;
    const entries: readonly CodexEntry[] = profile?.codexEntries ?? [];

    if (entries.length === 0) {
      this.add.text(width / 2, height / 2, 'No entries unlocked yet.\nExplore the world to discover knowledge.', {
        fontSize: '16px', color: '#666688', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 80 },
      }).setOrigin(0.5);
    } else {
      let y = 100;
      for (const entry of entries) {
        this.add.text(40, y, entry.title, {
          fontSize: '18px', color: '#aaccff', fontFamily: 'monospace',
        });
        y += 28;
        this.add.text(40, y, entry.body, {
          fontSize: '14px', color: '#888899', fontFamily: 'monospace',
          wordWrap: { width: width - 80 },
        });
        y += 50;
      }
    }

    // Back button
    this.add.text(60, height - 50, '← Back', {
      fontSize: '18px', color: '#aaaacc', fontFamily: 'monospace',
    }).setInteractive().on('pointerdown', () => {
      this.scene.start(SceneKeys.MainMenu);
    });
  }
}
