import Phaser from 'phaser';
import { TextureKeys } from './keys.js';

/**
 * Generates the small set of textures we need procedurally. Keeps the
 * project self-contained (no external assets required) and demonstrates
 * the blueprint's pattern of doing all heavy texture work in the
 * Preloader scene to avoid GPU stalls during combat.
 */
export function generateTextures(scene: Phaser.Scene): void {
  generatePixel(scene);
  generateProjectile(scene);
  generateHero(scene);
  generateEnemy(scene);
}

/** A 1×1 white pixel used for HP bars, ATB bars, dimmers, etc. */
function generatePixel(scene: Phaser.Scene): void {
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 1, 1);
  g.generateTexture(TextureKeys.Pixel, 1, 1);
  g.destroy();
}

/** Soft white circle for the spell projectile pool. */
function generateProjectile(scene: Phaser.Scene): void {
  const size = 32;
  const g = scene.add.graphics();
  // Outer halo
  g.fillStyle(0xffffff, 0.15);
  g.fillCircle(size / 2, size / 2, size / 2);
  // Mid ring
  g.fillStyle(0xffffff, 0.45);
  g.fillCircle(size / 2, size / 2, size / 2 - 4);
  // Hot core
  g.fillStyle(0xffffff, 1);
  g.fillCircle(size / 2, size / 2, size / 2 - 10);
  g.generateTexture(TextureKeys.Projectile, size, size);
  g.destroy();
}

/** Stylised hero silhouette — angular, blue. */
function generateHero(scene: Phaser.Scene): void {
  const w = 140;
  const h = 220;
  const g = scene.add.graphics();
  g.fillStyle(0x1b2740, 1);
  g.fillRoundedRect(0, h * 0.15, w, h * 0.85, 14);
  g.fillStyle(0x3a8fd1, 1);
  g.fillCircle(w / 2, h * 0.18, 28);
  g.fillStyle(0x4cc9f0, 1);
  g.fillRect(w * 0.18, h * 0.4, w * 0.64, 8);
  g.fillRect(w * 0.18, h * 0.55, w * 0.64, 6);
  g.fillRect(w * 0.18, h * 0.7, w * 0.64, 4);
  g.lineStyle(2, 0x9bd9ff, 0.7);
  g.strokeRoundedRect(0, h * 0.15, w, h * 0.85, 14);
  g.generateTexture(TextureKeys.HeroIdle, w, h);
  g.destroy();
}

/** Enemy silhouette — broader, crimson, jagged. */
function generateEnemy(scene: Phaser.Scene): void {
  const w = 180;
  const h = 240;
  const g = scene.add.graphics();
  g.fillStyle(0x2a0a14, 1);
  g.fillRoundedRect(0, h * 0.2, w, h * 0.8, 18);
  g.fillStyle(0xa11f3a, 1);
  g.fillCircle(w / 2, h * 0.22, 36);
  // Glaring eyes
  g.fillStyle(0xffd166, 1);
  g.fillCircle(w / 2 - 10, h * 0.21, 4);
  g.fillCircle(w / 2 + 10, h * 0.21, 4);
  // Spikes
  g.fillStyle(0x4a1421, 1);
  for (let i = 0; i < 5; i++) {
    const x = (w / 5) * i + 10;
    g.fillTriangle(x, h * 0.2, x + 18, h * 0.2, x + 9, h * 0.08);
  }
  g.lineStyle(2, 0xff4d6d, 0.7);
  g.strokeRoundedRect(0, h * 0.2, w, h * 0.8, 18);
  g.generateTexture(TextureKeys.EnemyIdle, w, h);
  g.destroy();
}
