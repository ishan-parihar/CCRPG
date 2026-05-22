import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { OnboardingScene } from './scenes/OnboardingScene.js';
import { RadialChartScene } from './scenes/RadialChartScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { CodexScene } from './scenes/CodexScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { EncounterScene } from './scenes/EncounterScene.js';
import { ReflectionScene } from './scenes/ReflectionScene.js';
import { DilemmaScene } from './scenes/DilemmaScene.js';
import { JournalScene } from './scenes/JournalScene.js';
import { AssessmentScene } from './assessments/AssessmentScene.js';
import { EncounterSelectionScene } from './scenes/EncounterSelectionScene.js';

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
      RadialChartScene,
      CodexScene,
      WorldScene,
      EncounterScene,
      ReflectionScene,
      DilemmaScene,
      JournalScene,
      AssessmentScene,
      EncounterSelectionScene,
      SettingsScene,
    ],
  };
}
