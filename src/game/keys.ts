/** Centralised string keys: scenes, textures, events, registry slots. */

export const SceneKeys = {
  Boot: 'BootScene',
  Preloader: 'PreloaderScene',
  MainMenu: 'MainMenuScene',
  Battle: 'BattleScene',
  UIOverlay: 'UIOverlayScene',
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
  Save: 'state:save',
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
  /** Any → all: pause the battle. */
  Pause: 'app:pause',
  /** Any → all: resume the battle. */
  Resume: 'app:resume',
} as const;
