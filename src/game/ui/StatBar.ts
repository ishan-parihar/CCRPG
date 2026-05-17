import Phaser from 'phaser';
import { TextureKeys } from '../keys.js';

/** Three-rectangle progress bar: track, fill, optional border. */
export class StatBar {
  private readonly fill: Phaser.GameObjects.Image;
  private readonly track: Phaser.GameObjects.Image;
  private readonly width: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    trackColor: number = 0x0f1828,
  ) {
    this.width = width;
    this.track = scene.add
      .image(x, y, TextureKeys.Pixel)
      .setOrigin(0, 0.5)
      .setDisplaySize(width, height)
      .setTint(trackColor);
    this.fill = scene.add
      .image(x, y, TextureKeys.Pixel)
      .setOrigin(0, 0.5)
      .setDisplaySize(width, height - 2)
      .setTint(fillColor);
  }

  setRatio(ratio: number): void {
    const r = Math.max(0, Math.min(1, ratio));
    this.fill.displayWidth = this.width * r;
  }

  setVisible(v: boolean): void {
    this.track.setVisible(v);
    this.fill.setVisible(v);
  }

  destroy(): void {
    this.track.destroy();
    this.fill.destroy();
  }
}
