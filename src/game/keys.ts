/** Centralised string keys: scenes, textures, events, registry slots. */

export const SceneKeys = {
  Boot: 'BootScene',
  Preloader: 'PreloaderScene',
  MainMenu: 'MainMenuScene',
  Onboarding: 'OnboardingScene',
  UIOverlay: 'UIOverlayScene',
  RadialChart: 'RadialChartScene',
  Codex: 'CodexScene',
  World: 'WorldScene',
  Encounter: 'EncounterScene',
  Reflection: 'ReflectionScene',
  Dilemma: 'DilemmaScene',
  Journal: 'JournalScene',
  Assessment: 'AssessmentScene',
  EncounterSelection: 'EncounterSelectionScene',
  Settings: 'SettingsScene',
} as const;

export const TextureKeys = {
  HeroIdle: 'hero-idle',
  EnemyIdle: 'enemy-idle',
  Projectile: 'projectile',
  RuneAtlas: 'rune-atlas',
  Pixel: 'pixel',
} as const;

export const RegistryKeys = {
  SaveRepo: 'svc:save',
  Native: 'svc:native',
  Accessibility: 'svc:accessibility',
  Save: 'state:save',
  Profile: 'state:profile',
  Significator: 'state:significator',
  WorldState: 'state:world',
  EventBus: 'svc:eventbus',
  Telemetry: 'svc:telemetry',
  ScreenReader: 'svc:screen-reader',
  ModuleRegistry: 'svc:module-registry',
} as const;

export const GameEvents = {
  /** Battle → UI: open N-back overlay. */
  RequestNBack: 'task:nback:request',
  /** UI → Battle: N-back resolved with damage multiplier. */
  ResolvedNBack: 'task:nback:resolved',
  /** Battle → UI: open Stroop overlay. */
  RequestStroop: 'task:stroop:request',
  /** UI → Battle: Stroop resolved with defensive outcome. */
  ResolvedStroop: 'task:stroop:resolved',
  /** Battle → UI: open generic cognitive task overlay. */
  RequestCognitiveTask: 'task:cognitive:request',
  /** UI → Battle: generic cognitive task resolved. */
  ResolvedCognitiveTask: 'task:cognitive:resolved',
  /** Any → all: pause the battle. */
  Pause: 'app:pause',
  /** Any → all: resume the battle. */
  Resume: 'app:resume',
} as const;
