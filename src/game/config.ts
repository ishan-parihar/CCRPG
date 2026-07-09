import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { OnboardingScene } from './scenes/OnboardingScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { EncounterScene } from './scenes/EncounterScene.js';
import { ReflectionScene } from './scenes/ReflectionScene.js';
import { DilemmaScene } from './scenes/DilemmaScene.js';
import { AssessmentScene } from './assessments/AssessmentScene.js';
import { EncounterSelectionScene } from './scenes/EncounterSelectionScene.js';
import { UIOverlayScene } from './scenes/UIOverlayScene.js';

/**
 * Phaser scene configuration — gameplay scenes only.
 *
 * Menu scenes (MainMenu, RadialChart, Codex, Journal, Settings) have been
 * migrated to Svelte routes (/ , /profile, /codex, /journal, /settings).
 * The Phaser game boots directly into World (if save exists) or Onboarding
 * (if no save) — the Svelte / route is the main menu hub.
 *
 * Scenes kept in Phaser are the gameplay surface: they need Phaser's input
 * manager, tween engine, and timing precision.
 */
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
      zoom: 1 / (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
    },
    render: {
      antialias: true,
      pixelArt: false,
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
      OnboardingScene,
      WorldScene,
      EncounterScene,
      ReflectionScene,
      DilemmaScene,
      AssessmentScene,
      EncounterSelectionScene,
      UIOverlayScene,
    ],
  };
}

/** Logical resolution — designed for portrait mobile (9:16). */
export const VIEWPORT = { width: 1080, height: 1920 } as const;
