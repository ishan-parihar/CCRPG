import Phaser from 'phaser';
import { createPhaserConfig } from './config.js';
import { RegistryKeys, SceneKeys } from './keys.js';
import { SaveRepository } from '@infra/persistence/SaveRepository.js';
import { createKeyValueStore } from '@infra/persistence/createKeyValueStore.js';
import { NativeBridge } from '@infra/native/NativeBridge.js';
import { bootRegistries } from '@core/registries/boot.js';
import { initI18n } from '@infra/i18n/I18n.js';
import { AccessibilityStore } from '@infra/persistence/AccessibilityStore.js';
import { AccessibilityManager } from './accessibility/AccessibilityManager.js';
import { createDefaultSettings } from '@core/accessibility/AccessibilitySettings.js';
import { createScreenReaderOverlay } from './accessibility/ScreenReaderOverlay.js';
import { TelemetryCollector } from '@core/telemetry/TelemetryCollector.js';
import { TelemetryStore } from '@infra/telemetry/TelemetryStore.js';
import { TelemetryService } from '@infra/telemetry/TelemetryService.js';
import { CryptoStore } from '@infra/crypto/CryptoStore.js';
import { EventBus } from '@core/events/EventBus.js';
import { bootModuleRegistry } from '@core/assessments/bootModules.js';

/**
 * Global services object — populated BEFORE Phaser game is created.
 * Scenes read from here instead of the registry to avoid timing issues.
 * Phaser's constructor starts scenes synchronously, so the registry isn't
 * available until after `new Phaser.Game()` returns.
 */
export const Services = {} as {
  saveRepo: SaveRepository;
  native: NativeBridge;
  a11yManager: AccessibilityManager;
  telemetryService: TelemetryService;
  eventBus: EventBus;
  moduleRegistry: ReturnType<typeof bootModuleRegistry>;
};

/**
 * Boot the Phaser game and attach it to the given parent. Wires up
 * shared services (save repo, native bridge) into the registry so any
 * scene can read them without import-time coupling, and registers the
 * Android hardware back-button intercept per the blueprint.
 */
export async function startGame(parent: HTMLElement): Promise<Phaser.Game> {
  // ── Initialize ALL services BEFORE creating Phaser game ──
  // Phaser starts scenes immediately in the constructor, so the registry
  // MUST be fully populated BEFORE `new Phaser.Game()`.

  bootRegistries();
  initI18n();

  const saveRepo = new SaveRepository(createKeyValueStore());
  const native = new NativeBridge();

  const a11yStore = new AccessibilityStore(createKeyValueStore());
  const savedSettings = await a11yStore.load();
  const a11yManager = new AccessibilityManager(savedSettings ?? createDefaultSettings());

  const telemetryCollector = new TelemetryCollector();
  const telemetryCrypto = new CryptoStore();
  const telemetryStore = new TelemetryStore(createKeyValueStore(), telemetryCrypto);
  const telemetryService = new TelemetryService(
    telemetryCollector,
    telemetryStore,
    () => a11yManager.getSettings().telemetryOptIn,
  );

  const eventBus = new EventBus();
  const moduleRegistry = bootModuleRegistry();

  // Populate global Services object — scenes read from this immediately
  Services.saveRepo = saveRepo;
  Services.native = native;
  Services.a11yManager = a11yManager;
  Services.telemetryService = telemetryService;
  Services.eventBus = eventBus;
  Services.moduleRegistry = moduleRegistry;

  // Wire telemetry events
  eventBus.on('encounter_completed', (payload) => {
    telemetryService.recordEvent('encounter_completed', { record: payload.record });
  });
  eventBus.on('shadow_surfaced', (payload) => {
    telemetryService.recordEvent('shadow_surfaced', { shadowId: payload.shadowId, line: payload.line, quadrant: payload.quadrant });
  });
  eventBus.on('shadow_resolved', (payload) => {
    telemetryService.recordEvent('shadow_resolved', { shadowId: payload.shadowId });
  });
  eventBus.on('transformation_triggered', (payload) => {
    telemetryService.recordEvent('transformation_triggered', { signal: payload.signal });
  });
  eventBus.on('session_started', (payload) => {
    telemetryService.recordEvent('session_started', { timestamp: payload.timestamp });
  });
  eventBus.on('session_ended', (payload) => {
    telemetryService.recordEvent('session_ended', { timestamp: payload.timestamp, encounterCount: payload.encounterCount });
    void telemetryService.flush();
  });
  eventBus.on('encounter_declined', (payload) => {
    telemetryService.recordEvent('encounter_declined', payload);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Persist Significator and WorldState before the page unloads
      try {
        const sig = game.registry.get(RegistryKeys.Significator);
        const world = game.registry.get(RegistryKeys.WorldState);
        if (sig) void saveRepo.saveProfile(sig);
        if (world) void saveRepo.saveWorldState(world);
      } catch { /* best-effort: don't block unload */ }
      void telemetryService.flush();
    });
  }

  // ── Create Phaser game — registry is ready, scenes can read it ──
  const game = new Phaser.Game(createPhaserConfig(parent));

  // Set shared services into Phaser's registry (scenes read via this.registry.get)
  game.registry.set(RegistryKeys.SaveRepo, saveRepo);
  game.registry.set(RegistryKeys.Native, native);
  game.registry.set(RegistryKeys.Accessibility, a11yManager);
  game.registry.set(RegistryKeys.Telemetry, telemetryService);
  game.registry.set(RegistryKeys.EventBus, eventBus);
  game.registry.set(RegistryKeys.ModuleRegistry, moduleRegistry);

  if (a11yManager.isScreenReaderEnabled() && typeof document !== 'undefined') {
    game.registry.set(RegistryKeys.ScreenReader, createScreenReaderOverlay());
  }

  // ── Android hardware back button ─────────────────────────────────
  await native.registerBackHandler(() => {
    const encounter = game.scene.getScene(SceneKeys.Encounter);
    if (encounter && game.scene.isActive(SceneKeys.Encounter)) {
      game.scene.stop(SceneKeys.UIOverlay);
      game.scene.start(SceneKeys.MainMenu);
      return true;
    }
    const world = game.scene.getScene(SceneKeys.World);
    if (world && game.scene.isActive(SceneKeys.World)) {
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

  if (typeof window !== 'undefined') {
    (window as unknown as { __ccrpg?: unknown }).__ccrpg = { game, saveRepo, native };
    const onResize = () => game.scale.refresh();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
  }

  return game;
}
