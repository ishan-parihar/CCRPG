import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { UIOverlayScene } from './scenes/UIOverlayScene.js';

/** Logical resolution. Phaser.Scale.FIT scales this to the device. */
export const VIEWPORT = { width: 720, height: 1280 } as const;

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO, // Try WebGL first; Phaser falls back to Canvas.
    parent,
    backgroundColor: '#05070b',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'high-performance',
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [BootScene, PreloaderScene, MainMenuScene, BattleScene, UIOverlayScene],
  };
}
