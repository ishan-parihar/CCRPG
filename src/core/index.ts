/**
 * Public surface of the cognitive RPG core. The Phaser layer should only
 * import from this barrel — never from individual files — so the domain
 * boundary stays explicit.
 */

// --- Domain ---
export * from './domain/Stats.js';
export * from './domain/SharedTypes.js';
export * from './domain/Stage.js';
export * from './domain/Line.js';
export * from './domain/Ray.js';
export * from './domain/Drive.js';
export * from './domain/State.js';
export * from './domain/PlayerProfile.js';
export * from './domain/Significator.js';
export * from './domain/Encounter.js';

// --- Use-cases ---
export * from './usecases/NBackTask.js';
export * from './usecases/StroopTask.js';
export * from './usecases/RandomSource.js';
export * from './usecases/RegistryEngine.js';
export * from './usecases/Staircase.js';
export * from './usecases/StageSynthesizer.js';
export * from './usecases/ShadowDetector.js';
export * from './usecases/OnboardingCalibrator.js';
export * from './usecases/LineCeilings.js';
export * from './usecases/RayProfileComputer.js';
export * from './usecases/ProfileUpdater.js';
export * from './usecases/ThresholdMaps.js';
export * from './usecases/FastStaircase.js';
export * from './usecases/SimonTask.js';
export * from './usecases/GoNoGoTask.js';
export * from './usecases/AffectRecognitionTask.js';
export * from './usecases/DilemmaTask.js';
export * from './usecases/ReactionTimeTask.js';
export * from './usecases/HeldInputTask.js';
export * from './usecases/BreathRhythmTask.js';

// --- Registries ---
export * from './registries/index.js';
export { bootRegistries } from './registries/boot.js';

// --- Assessments ---
export * from './assessments/types.js';
export * from './assessments/engine.js';
export * from './assessments/registry.js';
export * from './assessments/lifecycle.js';
export * from './assessments/scoring.js';

// --- Domain (Snapshot) ---
export * from './domain/SignificatorSnapshot.js';

// --- Game Loop ---
export * from './GameLoop.js';

// --- Engines (CCI + Auto-Mode) ---
export * from './engines/CCIEngine.js';
export * from './engines/AutoModeStrategy.js';
