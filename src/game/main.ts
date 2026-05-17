import Phaser from 'phaser';
import { createPhaserConfig } from './config.js';
import { RegistryKeys, SceneKeys } from './keys.js';
import { SaveRepository } from '@infra/persistence/SaveRepository.js';
import { createKeyValueStore } from '@infra/persistence/createKeyValueStore.js';
import { NativeBridge } from '@infra/native/NativeBridge.js';
import { bootRegistries } from '@core/registries/boot.js';
import { initI18n } from '@infra/i18n/I18n.js';

/**
 * Boot the Phaser game and attach it to the given parent. Wires up
 * shared services (save repo, native bridge) into the registry so any
 * scene can read them without import-time coupling, and registers the
 * Android hardware back-button intercept per the blueprint.
 */
export async function startGame(parent: HTMLElement): Promise<Phaser.Game> {
  // Boot core registries (lines, stages, rays, drives, tasks, abilities, encounters, narrative)
  bootRegistries();

  // Initialise i18n
  initI18n();

  const game = new Phaser.Game(createPhaserConfig(parent));

  const saveRepo = new SaveRepository(createKeyValueStore());
  const native = new NativeBridge();

  game.registry.set(RegistryKeys.SaveRepo, saveRepo);
  game.registry.set(RegistryKeys.Native, native);

  // ── Android hardware back button ─────────────────────────────────
  await native.registerBackHandler(() => {
    const battle = game.scene.getScene(SceneKeys.Battle);
    if (battle && game.scene.isActive(SceneKeys.Battle)) {
      game.scene.stop(SceneKeys.UIOverlay);
      game.scene.start(SceneKeys.MainMenu);
      return true;
    }
    const onboarding = game.scene.getScene(SceneKeys.Onboarding);
    if (onboarding && game.scene.isActive(SceneKeys.Onboarding)) {
      game.scene.start(SceneKeys.MainMenu);
      return true;
    }
    const menu = game.scene.getScene(SceneKeys.MainMenu);
    if (menu && game.scene.isActive(SceneKeys.MainMenu)) {
      return false;
    }
    return true;
  });

  // Expose for debugging in the browser console (dev convenience only).
  if (typeof window !== 'undefined') {
    (window as unknown as { __ccrpg?: unknown }).__ccrpg = {
      game,
      saveRepo,
      native,
    };
  }

  // Keep the canvas in step with viewport changes.
  if (typeof window !== 'undefined') {
    const onResize = () => game.scale.refresh();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
  }

  return game;
}
