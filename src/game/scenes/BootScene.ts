import Phaser from 'phaser';
import { SceneKeys } from '../keys.js';

/**
 * BootScene — minimal: registers scene-wide configuration and immediately
 * starts the Preloader. Per the blueprint this scene is intentionally
 * tiny so the rest of the asset load can show progress UI.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Boot });
  }

  create(): void {
    // Disable right-click menu inside the canvas — feels native on web.
    this.input.mouse?.disableContextMenu();
    this.scene.start(SceneKeys.Preloader);
  }
}
