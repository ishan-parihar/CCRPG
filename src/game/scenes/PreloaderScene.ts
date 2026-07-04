import Phaser from 'phaser';
import { RegistryKeys, SceneKeys } from '../keys.js';
import { generateTextures } from '../textures.js';
import { Services } from '../main.js';
import type { SaveData } from '@infra/persistence/SaveRepository.js';
import { fadeIn } from '../ui/SceneTransitions.js';

/**
 * PreloaderScene — animated logo splash + asset generation + save loading.
 *
 * Shows a procedural geometric logo, animated title reveal, tagline,
 * and a polished progress bar while textures generate and save data loads.
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preloader });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x05070b);

    // Fade in from black
    fadeIn(this, 600);

    // ── Background atmosphere ────────────────────────────────────────
    this.drawBackground(width, height);

    // ── Logo group ───────────────────────────────────────────────────
    const logoY = height * 0.32;
    this.drawLogo(width / 2, logoY);

    // ── Title text (revealed with typewriter) ────────────────────────
    const titleY = logoY + 140;
    const title = this.add.text(width / 2, titleY, '', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#e7eaf2',
      letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    // Typewriter reveal for "CCRPG"
    const fullTitle = 'CCRPG';
    let charIdx = 0;
    this.time.addEvent({
      delay: 120,
      repeat: fullTitle.length - 1,
      callback: () => {
        charIdx++;
        title.setText(fullTitle.substring(0, charIdx));
        title.setAlpha(1);
      },
    });

    // ── Tagline ──────────────────────────────────────────────────────
    const tagline = this.add.text(width / 2, titleY + 60, 'Cognitive Combat', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '26px',
      color: '#4cc9f0',
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: tagline,
      alpha: 1,
      duration: 800,
      delay: 700,
      ease: 'Sine.easeOut',
    });

    // ── Loading bar ──────────────────────────────────────────────────
    const barY = height * 0.62;
    this.drawLoadingBar(width, barY);

    // ── Version / footer ─────────────────────────────────────────────
    const footer = this.add.text(width / 2, height - 80, 'v0.1.0', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '16px',
      color: '#334455',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: footer,
      alpha: 1,
      duration: 600,
      delay: 1200,
    });

    // ── Start actual loading ─────────────────────────────────────────
    generateTextures(this);

    const repo = Services.saveRepo;
    if (!repo) {
      this.time.delayedCall(1200, () => this.transition({ ...this.fallbackSave() }));
      return;
    }

    repo.load().then(
      (data) => this.time.delayedCall(1200, () => this.transition(data)),
      (err) => {
        console.error('Failed to load save, using defaults', err);
        this.time.delayedCall(1200, () => this.transition({ ...this.fallbackSave() }));
      },
    );
  }

  // ── Background ─────────────────────────────────────────────────────

  private drawBackground(width: number, height: number): void {
    // Subtle radial glow behind logo area
    const glow = this.add.graphics();
    glow.fillStyle(0x4cc9f0, 0.03);
    glow.fillCircle(width / 2, height * 0.35, width * 0.45);
    glow.fillStyle(0x4cc9f0, 0.015);
    glow.fillCircle(width / 2, height * 0.35, width * 0.7);

    // Slow-rotating geometry particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 280 + Math.random() * 120;
      const px = width / 2 + Math.cos(angle) * radius;
      const py = height * 0.35 + Math.sin(angle) * radius;
      const size = 2 + Math.random() * 3;
      const particle = this.add.circle(px, py, size, 0x4cc9f0, 0.15 + Math.random() * 0.15);

      // Orbit animation
      this.tweens.add({
        targets: particle,
        x: width / 2 + Math.cos(angle + Math.PI * 2) * radius,
        y: height * 0.35 + Math.sin(angle + Math.PI * 2) * radius,
        alpha: { from: 0.1, to: 0.3 },
        duration: 8000 + Math.random() * 4000,
        ease: 'Linear',
        repeat: -1,
      });
    }
  }

  // ── Logo ───────────────────────────────────────────────────────────

  private drawLogo(cx: number, cy: number): void {
    const g = this.add.graphics();
    const size = 80;

    // Outer octagon ring
    g.lineStyle(2, 0x4cc9f0, 0.6);
    this.drawOctagon(g, cx, cy, size);

    // Inner octagon ring (rotated)
    g.lineStyle(1.5, 0x4cc9f0, 0.3);
    this.drawOctagon(g, cx, cy, size * 0.65, Math.PI / 8);

    // Center diamond
    g.lineStyle(2, 0x4cc9f0, 0.8);
    const ds = size * 0.35;
    g.beginPath();
    g.moveTo(cx, cy - ds);
    g.lineTo(cx + ds, cy);
    g.lineTo(cx, cy + ds);
    g.lineTo(cx - ds, cy);
    g.closePath();
    g.strokePath();

    // Center dot
    g.fillStyle(0x4cc9f0, 0.9);
    g.fillCircle(cx, cy, 6);

    // Cross-hair lines
    g.lineStyle(1, 0x4cc9f0, 0.2);
    g.lineBetween(cx - size * 1.2, cy, cx + size * 1.2, cy);
    g.lineBetween(cx, cy - size * 1.2, cx, cy + size * 1.2);

    // Slow rotation animation on the inner ring
    const innerRing = this.add.graphics();
    innerRing.lineStyle(1.5, 0x4cc9f0, 0.15);
    this.drawOctagon(innerRing, 0, 0, size * 0.65, Math.PI / 8);
    innerRing.setPosition(cx, cy);

    this.tweens.add({
      targets: innerRing,
      angle: 360,
      duration: 20000,
      ease: 'Linear',
      repeat: -1,
    });

    // Pulse animation on the logo
    this.tweens.add({
      targets: g,
      alpha: { from: 0.85, to: 1 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private drawOctagon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, offset = 0): void {
    g.beginPath();
    for (let i = 0; i <= 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + offset;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokePath();
  }

  // ── Loading bar ────────────────────────────────────────────────────

  private drawLoadingBar(width: number, barY: number): void {
    const barW = 400;
    const barH = 4;
    const barX = (width - barW) / 2;

    // Track
    this.add.rectangle(width / 2, barY, barW, barH, 0x1b2740, 0.8).setOrigin(0.5);

    // Animated fill segment
    const fill = this.add.rectangle(barX, barY, 100, barH, 0x4cc9f0, 0.9).setOrigin(0, 0.5);
    this.tweens.add({
      targets: fill,
      x: barX + barW - 100,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // "Loading..." text
    const loadingText = this.add.text(width / 2, barY + 28, 'Loading', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '16px',
      color: '#445566',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: loadingText,
      alpha: 1,
      duration: 600,
      delay: 400,
    });

    // Pulsing dots
    const dotBaseX = width / 2 + 44;
    for (let i = 0; i < 3; i++) {
      const dot = this.add.circle(dotBaseX + i * 14, barY + 28, 3, 0x4cc9f0, 0.3);
      this.tweens.add({
        targets: dot,
        alpha: { from: 0.2, to: 0.8 },
        duration: 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 180,
      });
    }
  }

  // ── Transition ─────────────────────────────────────────────────────

  private transition(save: SaveData): void {
    this.registry.set(RegistryKeys.Save, save);

    const repo = Services.saveRepo;
    if (repo) {
      this.registry.set(RegistryKeys.SaveRepo, repo);
    }

    // Fade out then go to MainMenu
    const cam = this.cameras.main;
    cam.fadeOut(500, 5, 7, 11);
    cam.once('camerafadeoutcomplete', () => {
      if (repo) {
        Promise.all([
          repo.loadProfile?.() ?? Promise.resolve(null),
          repo.loadWorldState?.() ?? Promise.resolve(null),
        ]).then(
          ([sig, world]) => {
            if (sig) this.registry.set(RegistryKeys.Significator, sig);
            if (world) this.registry.set(RegistryKeys.WorldState, world);
            this.scene.start(SceneKeys.MainMenu);
          },
          () => this.scene.start(SceneKeys.MainMenu),
        );
      } else {
        this.scene.start(SceneKeys.MainMenu);
      }
    });
  }

  private fallbackSave(): SaveData {
    return {
      version: 1,
      playerName: 'Hero',
      cognitive: {
        nBackAccuracy: 0,
        nBackLevel: 1,
        stroopAccuracy: 0,
        stroopReactionMs: 0,
        totalTrials: 0,
      },
      xp: 0,
      level: 1,
      encountersCompleted: 0,
      updatedAt: 0,
    };
  }
}
