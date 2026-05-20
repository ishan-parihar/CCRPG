import Phaser from 'phaser';
import { RegistryKeys, SceneKeys } from '../keys.js';
import { makeButton } from '../ui/Button.js';
import type { PlayerProfile } from '@core/domain/PlayerProfile.js';
import type { Significator } from '@core/domain/Significator.js';

/**
 * MainMenu — primary navigation surface.
 * Routes new players to Onboarding; returning players see their profile
 * and can enter battle, view radial chart, or browse codex.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.MainMenu });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x05070b);

    const profile = this.registry.get(RegistryKeys.Profile) as PlayerProfile | undefined;

    // If no profile exists, route to onboarding
    if (!profile || !profile.onboardingComplete) {
      this.scene.start(SceneKeys.Onboarding);
      return;
    }

    this.drawBackdrop();

    // Title
    this.add.text(width / 2, 100, 'CCRPG', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '64px',
      color: '#e7eaf2',
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, 'Cognitive Combat RPG', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#9bd9ff',
    }).setOrigin(0.5);

    // Profile summary
    this.drawProfileSummary(width / 2, 340, profile);

    // Navigation buttons
    let btnY = 620;

    // Show "Continue to World" if Significator exists
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    if (sig) {
      makeButton(this, width / 2, btnY, {
        label: '🌍  Continue to World',
        width: 380,
        height: 72,
        fill: 0x2a3a1a,
        hoverFill: 0x3a5a2a,
        onClick: () => this.scene.start(SceneKeys.World),
      });
      btnY += 90;
    }

    makeButton(this, width / 2, btnY, {
      label: '🌍  Explore World',
      width: 380,
      height: 72,
      fill: 0x1a3a2a,
      hoverFill: 0x2a5a3a,
      onClick: () => this.scene.start(SceneKeys.World),
    });

    btnY += 90;
    makeButton(this, width / 2, btnY, {
      label: '📊  Developmental Profile',
      width: 380,
      height: 72,
      fill: 0x1a2a4a,
      hoverFill: 0x2a3a6a,
      onClick: () => this.scene.start(SceneKeys.RadialChart),
    });

    btnY += 90;
    makeButton(this, width / 2, btnY, {
      label: '📖  Codex',
      width: 380,
      height: 72,
      fill: 0x2a1a3a,
      hoverFill: 0x3a2a5a,
      onClick: () => this.scene.start(SceneKeys.Codex),
    });

    btnY += 90;
    makeButton(this, width / 2, btnY, {
      label: '🔄  New Journey (Reset)',
      width: 300,
      height: 56,
      fill: 0x2a0a14,
      hoverFill: 0x4a1421,
      onClick: () => this.resetProfile(),
    });

    // Footer
    this.add.text(width / 2, height - 40, `Stage: ${profile.stage}  ·  Sessions: ${profile.totalSessionsPlayed}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#6c7794',
    }).setOrigin(0.5);
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.lineStyle(1, 0x15233a, 0.3);
    for (let x = 0; x < width; x += 64) g.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 64) g.lineBetween(0, y, width, y);
  }

  private drawProfileSummary(cx: number, cy: number, profile: PlayerProfile): void {
    const w = 560;
    const h = 220;
    this.add.rectangle(cx, cy, w, h, 0x0c1322, 1).setStrokeStyle(2, 0x223a5e, 0.9);

    const left = cx - w / 2 + 24;
    let y = cy - h / 2 + 20;

    this.add.text(left, y, `Current Stage: ${profile.stage}`, {
      fontSize: '20px', color: '#e7eaf2', fontFamily: 'monospace',
    });
    y += 32;

    this.add.text(left, y, 'Line Altitudes:', {
      fontSize: '14px', color: '#9bd9ff', fontFamily: 'monospace',
    });
    y += 22;

    const lines = Object.entries(profile.altitudes) as [string, string][];
    const col1 = lines.slice(0, 4);
    const col2 = lines.slice(4);

    col1.forEach(([line, alt], i) => {
      this.add.text(left, y + i * 20, `${line}: ${alt}`, {
        fontSize: '13px', color: '#a8b3c7', fontFamily: 'monospace',
      });
    });
    col2.forEach(([line, alt], i) => {
      this.add.text(left + 260, y + i * 20, `${line}: ${alt}`, {
        fontSize: '13px', color: '#a8b3c7', fontFamily: 'monospace',
      });
    });

    y += 90;
    const driveStr = Object.entries(profile.drives.weights)
      .map(([d, w]) => `${d}: ${Math.round((w as number) * 100)}%`)
      .join('  ');
    this.add.text(left, y, `Drives: ${driveStr}`, {
      fontSize: '12px', color: '#666688', fontFamily: 'monospace',
    });
  }

  private resetProfile(): void {
    this.registry.remove(RegistryKeys.Profile);
    this.scene.start(SceneKeys.Onboarding);
  }
}
