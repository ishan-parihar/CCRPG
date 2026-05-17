import Phaser from 'phaser';
import { TextureKeys } from '../keys.js';

/**
 * ProjectilePool — fixed-size pre-allocated pool of sprites used for
 * spell projectiles, damage flashes, and short-lived FX. Per the
 * blueprint, this eliminates GC pauses caused by churn-y
 * `add.sprite()`/`destroy()` cycles during combat.
 */
export class ProjectilePool {
  private readonly sprites: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, size: number = 24) {
    for (let i = 0; i < size; i++) {
      const s = scene.add.image(-100, -100, TextureKeys.Projectile);
      s.setVisible(false).setActive(false);
      this.sprites.push(s);
    }
  }

  /** Pull an inactive sprite. Returns null if the pool is exhausted. */
  acquire(): Phaser.GameObjects.Image | null {
    for (const s of this.sprites) {
      if (!s.active) {
        s.setActive(true).setVisible(true);
        return s;
      }
    }
    return null;
  }

  /** Return a sprite to the pool. */
  release(sprite: Phaser.GameObjects.Image): void {
    sprite.setActive(false).setVisible(false);
    sprite.setPosition(-100, -100);
    sprite.setScale(1);
    sprite.setAlpha(1);
    sprite.setTint(0xffffff);
    sprite.setRotation(0);
  }
}
