/**
 * Public surface of the cognitive RPG core. The Phaser layer should only
 * import from this barrel — never from individual files — so the domain
 * boundary stays explicit.
 */
export * from './domain/Stats.js';
export * from './domain/Battler.js';
export * from './domain/Spell.js';
export * from './usecases/ATBEngine.js';
export * from './usecases/NBackTask.js';
export * from './usecases/StroopTask.js';
export * from './usecases/DamageCalculator.js';
export * from './usecases/RandomSource.js';
