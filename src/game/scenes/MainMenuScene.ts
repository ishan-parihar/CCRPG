import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import { makeButton } from '../ui/Button.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';
import type { Significator } from '@core/domain/Significator.js';
import type { SaveRepository } from '@infra/persistence/SaveRepository.js';

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
    fadeIn(this, 400);

    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;

    // If no Significator exists, route to onboarding
    if (!sig) {
      fadeToScene(this, SceneKeys.Onboarding);
      return;
    }

    this.drawBackdrop();

    // Title (fade in)
    const title = this.add.text(width / 2, 100, 'CCRPG', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#e7eaf2',
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 100,
      duration: 600,
      ease: 'Cubic.easeOut',
    });

    const subtitle = this.add.text(width / 2, 160, 'Cognitive Combat RPG', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '20px',
      color: '#4cc9f0',
      letterSpacing: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: 'Sine.easeOut',
    });

    // Profile summary (fade in)
    this.drawProfileSummary(width / 2, 420, sig);

    // Navigation buttons (staggered entrance)
    let btnY = 930;
    const buttons: { scene: string; label: string; fill: number; hoverFill: number; w?: number; h?: number; fs?: number }[] = [
      { scene: SceneKeys.World, label: 'Continue to World', fill: 0x2a3a1a, hoverFill: 0x3a5a2a },
      { scene: SceneKeys.RadialChart, label: 'Developmental Profile', fill: 0x1a2a4a, hoverFill: 0x2a3a6a },
      { scene: SceneKeys.Codex, label: 'Codex', fill: 0x2a1a3a, hoverFill: 0x3a2a5a },
    ];

    buttons.forEach((btn, i) => {
      const container = makeButton(this, width / 2, btnY, {
        label: btn.label,
        width: 570,
        height: 108,
        fill: btn.fill,
        hoverFill: btn.hoverFill,
        fontSize: 28,
        onClick: () => fadeToScene(this, btn.scene),
      });
      container.setAlpha(0).setY(btnY + 30);
      this.tweens.add({
        targets: container,
        alpha: 1,
        y: btnY,
        duration: 400,
        delay: 300 + i * 120,
        ease: 'Cubic.easeOut',
      });
      btnY += 135;
    });

    // Reset and Settings (smaller, staggered)
    const secondaryBtns: { scene?: string; label: string; fill: number; hoverFill: number; action: () => void }[] = [
      {
        label: 'New Journey (Reset)',
        fill: 0x2a0a14,
        hoverFill: 0x4a1421,
        action: () => this.resetProfile(),
      },
      {
        scene: SceneKeys.Settings,
        label: 'Settings',
        fill: 0x1a1a2a,
        hoverFill: 0x2a2a4a,
        action: () => fadeToScene(this, SceneKeys.Settings),
      },
    ];

    secondaryBtns.forEach((btn, i) => {
      const container = makeButton(this, width / 2, btnY, {
        label: btn.label,
        width: 450,
        height: 84,
        fill: btn.fill,
        hoverFill: btn.hoverFill,
        fontSize: 24,
        onClick: btn.action,
      });
      container.setAlpha(0).setY(btnY + 20);
      this.tweens.add({
        targets: container,
        alpha: 1,
        y: btnY,
        duration: 350,
        delay: 700 + i * 100,
        ease: 'Cubic.easeOut',
      });
      btnY += 135;
    });

    // Footer
    const footer = this.add.text(width / 2, height - 60, `Stage: ${sig.currentStage}  ·  Sessions: ${sig.totalSessions}`, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '21px',
      color: '#3a4a5e',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: footer,
      alpha: 1,
      duration: 400,
      delay: 1000,
    });
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.lineStyle(1, 0x15233a, 0.15);
    for (let x = 0; x < width; x += 96) g.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 96) g.lineBetween(0, y, width, y);
  }

  private drawProfileSummary(cx: number, cy: number, sig: Significator): void {
    const w = 900;
    const h = 400;

    // Card container for entrance animation
    const card = this.add.container(cx, cy);

    const bg = this.add.rectangle(0, 0, w, h, 0x0c1322, 1).setStrokeStyle(1.5, 0x1a2a4a, 0.9);
    card.add(bg);

    // Top accent line
    const accentLine = this.add.rectangle(0, -h / 2 + 1, w, 2, 0x4cc9f0, 0.3).setOrigin(0.5, 0);
    card.add(accentLine);

    const left = -w / 2 + 36;
    let y = -h / 2 + 30;

    const stageText = this.add.text(left, y, `Current Stage: ${sig.currentStage}`, {
      fontSize: '20px', color: '#e7eaf2', fontFamily: '"Segoe UI", system-ui, sans-serif',
    });
    card.add(stageText);
    y += 32;

    const lineHeader = this.add.text(left, y, 'Line Altitudes:', {
      fontSize: '21px', color: '#4cc9f0', fontFamily: '"Segoe UI", system-ui, sans-serif',
    });
    card.add(lineHeader);
    y += 33;

    const lines = Object.entries(sig.altitudes) as [string, string][];
    const col1 = lines.slice(0, 4);
    const col2 = lines.slice(4);

    col1.forEach(([line, alt], i) => {
      const t = this.add.text(left, y + i * 30, `${line}: ${alt}`, {
        fontSize: '20px', color: '#8899aa', fontFamily: '"Segoe UI", system-ui, sans-serif',
      });
      card.add(t);
    });
    col2.forEach(([line, alt], i) => {
      const t = this.add.text(left + 400, y + i * 30, `${line}: ${alt}`, {
        fontSize: '20px', color: '#8899aa', fontFamily: '"Segoe UI", system-ui, sans-serif',
      });
      card.add(t);
    });

    y += 135;
    const driveStr = Object.entries(sig.drives.weights)
      .map(([d, w]) => `${d}: ${Math.round((w as number) * 100)}%`)
      .join('  ');
    const driveText = this.add.text(left, y, `Drives: ${driveStr}`, {
      fontSize: '18px', color: '#445566', fontFamily: '"Segoe UI", system-ui, sans-serif',
    });
    card.add(driveText);

    // Entrance animation
    card.setAlpha(0).setY(cy + 40);
    this.tweens.add({
      targets: card,
      alpha: 1,
      y: cy,
      duration: 500,
      delay: 150,
      ease: 'Cubic.easeOut',
    });
  }

  private async resetProfile(): Promise<void> {
    this.registry.remove(RegistryKeys.Significator);
    this.registry.remove(RegistryKeys.WorldState);

    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    if (saveRepo) {
      try {
        await saveRepo.resetProfile();
        await saveRepo.resetWorldState();
      } catch (err) {
        console.warn('Failed to reset persisted state:', err);
      }
    }

    fadeToScene(this, SceneKeys.Onboarding);
  }
}
