import Phaser from 'phaser';
import { RegistryKeys, SceneKeys } from '../keys.js';
import { makeButton } from '../ui/Button.js';
import type { SaveData, SaveRepository } from '@infra/persistence/SaveRepository.js';

/**
 * MainMenu — primary navigation surface. Shows the player's level, XP,
 * the cognitive profile (n-back level / accuracy, Stroop accuracy), and
 * launches battles. Per the blueprint this scene is also where the
 * "stats screen" lives so the player sees their cognitive growth.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.MainMenu });
  }

  create(): void {
    const { width, height } = this.scale;
    const save = this.registry.get(RegistryKeys.Save) as SaveData | undefined;

    this.cameras.main.setBackgroundColor(0x05070b);
    this.drawBackdrop();

    // Title.
    this.add
      .text(width / 2, 140, 'CCRPG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '72px',
        color: '#e7eaf2',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 210, 'Cognitive Combat', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#9bd9ff',
      })
      .setOrigin(0.5);

    // Stats card.
    if (save) this.drawStatsCard(width / 2, 410, save);

    // Buttons.
    makeButton(this, width / 2, 820, {
      label: 'Begin Battle',
      width: 360,
      height: 80,
      fill: 0x223a5e,
      hoverFill: 0x2f4f80,
      onClick: () => this.scene.start(SceneKeys.Battle),
    });
    makeButton(this, width / 2, 920, {
      label: 'Reset Progress',
      width: 280,
      height: 64,
      fill: 0x2a0a14,
      hoverFill: 0x4a1421,
      onClick: () => this.confirmReset(),
    });

    // Footer / hint.
    this.add
      .text(
        width / 2,
        height - 60,
        'Tip: spell power scales with your N-back accuracy.\nDefend by inhibiting the word — match the INK color.',
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          color: '#6c7794',
          align: 'center',
        },
      )
      .setOrigin(0.5);
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale;
    // Subtle grid lines for visual interest.
    const g = this.add.graphics();
    g.lineStyle(1, 0x15233a, 0.5);
    for (let x = 0; x < width; x += 64) {
      g.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 64) {
      g.lineBetween(0, y, width, y);
    }
  }

  private drawStatsCard(cx: number, cy: number, save: SaveData): void {
    const w = 560;
    const h = 320;

    this.add
      .rectangle(cx, cy, w, h, 0x0c1322, 1)
      .setStrokeStyle(2, 0x223a5e, 0.9);

    const left = cx - w / 2 + 28;
    let y = cy - h / 2 + 28;

    const heading = (text: string, color: string = '#9bd9ff') =>
      this.add.text(left, y, text, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color,
      });

    heading(`${save.playerName}  ·  Level ${save.level}`, '#e7eaf2');
    y += 30;
    heading(`XP: ${save.xp}  ·  Wins: ${save.battlesWon}`);
    y += 36;

    heading('— Combat —', '#9bd9ff');
    y += 26;
    const stat = (label: string, value: number) => {
      this.add.text(left, y, label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#a8b3c7',
      });
      this.add
        .text(left + 320, y, String(value), {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          color: '#e7eaf2',
        })
        .setOrigin(0, 0);
      y += 22;
    };
    stat('HP (Endurance)', save.stats.maxHp);
    stat('Mana (Working Memory)', save.stats.maxMana);
    stat('Agility (Processing Speed)', save.stats.agility);
    stat('Defense (Inhibition)', save.stats.defense);
    stat('Precision (Attention)', save.stats.precision);

    y += 12;
    heading('— Cognitive —', '#9bd9ff');
    y += 26;
    const pct = (n: number) => `${Math.round(n * 100)}%`;
    stat('N-back level', save.cognitive.nBackLevel);
    this.add.text(left, y, 'N-back accuracy', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#a8b3c7',
    });
    this.add.text(left + 320, y, pct(save.cognitive.nBackAccuracy), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#e7eaf2',
    });
  }

  private async confirmReset(): Promise<void> {
    const repo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    if (!repo) return;
    await repo.reset();
    const fresh = await repo.load();
    this.registry.set(RegistryKeys.Save, fresh);
    this.scene.restart();
  }
}
