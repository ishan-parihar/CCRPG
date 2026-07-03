/**
 * JournalScene — Player codex and vow system.
 * Shows codex entries, active vows, and felt-sense developmental feedback.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { Significator } from '@core/domain/Significator.js';
import type { CodexEntry, Vow } from '@core/domain/SharedTypes.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export class JournalScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Journal });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x080810);
    fadeIn(this, 400);

    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;

    // Title
    this.add.text(width / 2, 50, 'Journal', {
      fontSize: '32px', color: '#ccddff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    let y = 110;

    // Codex entries section
    this.add.text(40, y, 'Codex Entries', {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
    });
    y += 30;

    const entries: readonly CodexEntry[] = sig?.codexEntries ?? [];
    if (entries.length === 0) {
      this.add.text(60, y, 'No entries yet. Explore the world.', {
        fontSize: '21px', color: '#666688', fontFamily: 'monospace',
      });
      y += 30;
    } else {
      entries.slice(0, 5).forEach(entry => {
        this.add.text(60, y, `- ${entry.title}`, {
          fontSize: '21px', color: '#aaaacc', fontFamily: 'monospace',
          wordWrap: { width: width - 100 },
        });
        y += 24;
      });
    }

    y += 20;

    // Active Vows section
    this.add.text(40, y, 'Active Vows', {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
    });
    y += 30;

    const vows: Vow[] = (sig as unknown as { vows?: readonly Vow[] })?.vows ? [...((sig as unknown as { vows: readonly Vow[] }).vows)].filter(v => !v.fulfilled) : [];
    if (vows.length === 0) {
      this.add.text(60, y, 'No vows taken.', {
        fontSize: '21px', color: '#666688', fontFamily: 'monospace',
      });
      y += 30;
    } else {
      vows.slice(0, 3).forEach(vow => {
        this.add.text(60, y, `* "${vow.text}"`, {
          fontSize: '21px', color: '#cccc88', fontFamily: 'monospace',
          wordWrap: { width: width - 100 },
        });
        y += 24;
      });
    }

    y += 20;

    // Felt-sense developmental feedback
    this.add.text(40, y, 'Developmental Insight', {
      fontSize: '20px', color: '#aaccee', fontFamily: 'monospace',
    });
    y += 30;

    const feedback = this.generateFeedback(sig);
    this.add.text(60, y, feedback, {
      fontSize: '21px', color: '#aaaacc', fontFamily: 'monospace',
      wordWrap: { width: width - 100 },
      lineSpacing: 4,
    });

    // Back button
    this.add.text(width / 2, height - 60, '[ Back to World ]', {
      fontSize: '20px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => fadeToScene(this, SceneKeys.World))
      .on('pointerover', function (this: Phaser.GameObjects.Text) { this.setColor('#aaeeff'); })
      .on('pointerout', function (this: Phaser.GameObjects.Text) { this.setColor('#88ccff'); });
  }

  private generateFeedback(sig: Significator | undefined): string {
    if (!sig) {
      return 'Your journey has not yet begun.';
    }

    // T-3.4 (Veil compliance): no stage labels, no encounter counts.
    // Pure qualitative felt-sense descriptions.
    const encounters = sig.totalEncounters;

    if (encounters === 0) {
      return 'Your will is strong but untested by mercy.\nThe volcanic wastes await your first trial.';
    }

    if (encounters < 5) {
      return 'You have begun to test your edges.\nThe fire reveals what words cannot.';
    }

    return 'The pattern of your choices grows clearer.\nWho you become is shaped by each decision.';
  }
}
