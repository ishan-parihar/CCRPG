import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { OnboardingScene } from './scenes/OnboardingScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { UIOverlayScene } from './scenes/UIOverlayScene.js';
import { RadialChartScene } from './scenes/RadialChartScene.js';
import { CodexScene } from './scenes/CodexScene.js';

/** Logical resolution — designed for portrait mobile (9:16). */
export const VIEWPORT = { width: 720, height: 1280 } as const;

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#05070b',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      // Multiply canvas resolution by devicePixelRatio for crisp text on HiDPI
      zoom: 1 / (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
    },
    render: {
      antialias: true,
      pixelArt: false,
      // Round pixel positions so text doesn't blur at sub-pixel coords
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [
      BootScene,
      PreloaderScene,
      MainMenuScene,
      OnboardingScene,
      BattleScene,
      UIOverlayScene,
      RadialChartScene,
      CodexScene,
    ],
  };
}
