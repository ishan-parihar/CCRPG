export type Modality = 'Deterministic' | 'Strategic' | 'Embodied' | 'ScenarioChoice' | 'LanguageReflective' | 'SocialCooperative' | 'ImmersiveRPG';
export const ALL_MODALITIES: readonly Modality[] = ['Deterministic', 'Strategic', 'Embodied', 'ScenarioChoice', 'LanguageReflective', 'SocialCooperative', 'ImmersiveRPG'];

export type ShadowQuadrant = 'DarkAddiction' | 'DarkAllergy' | 'GoldenAddiction' | 'GoldenAllergy';
export const ALL_SHADOW_QUADRANTS: readonly ShadowQuadrant[] = ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'];

export type HolonKind = 'NPC' | 'Faction' | 'Location' | 'Event' | 'Artifact' | 'Creature';
export const ALL_HOLON_KINDS: readonly HolonKind[] = ['NPC', 'Faction', 'Location', 'Event', 'Artifact', 'Creature'];

export type PolarityMode = 'Exploring' | 'Crystallizing' | 'Crystallized';
export const ALL_POLARITY_MODES: readonly PolarityMode[] = ['Exploring', 'Crystallizing', 'Crystallized'];

export type EnergeticDirection = 'Radiative' | 'Absorptive' | 'Sovereign' | 'Diffuse';
export const ALL_ENERGETIC_DIRECTIONS: readonly EnergeticDirection[] = ['Radiative', 'Absorptive', 'Sovereign', 'Diffuse'];

export type SourceOfNourishment = 'HigherRealm' | 'LowerRealm' | 'Ambivalent';
export const ALL_SOURCES_OF_NOURISHMENT: readonly SourceOfNourishment[] = ['HigherRealm', 'LowerRealm', 'Ambivalent'];

export type DriveDirectionality = 'HealthyBalanced' | 'DarkAddicted' | 'DarkAverted' | 'GoldenAddicted' | 'GoldenAverted';
export const ALL_DRIVE_DIRECTIONALITIES: readonly DriveDirectionality[] = ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'];

export type StageOrientation = 'ReachingHigher' | 'IntegratingLower' | 'Homeostatic' | 'Regressive';
export const ALL_STAGE_ORIENTATIONS: readonly StageOrientation[] = ['ReachingHigher', 'IntegratingLower', 'Homeostatic', 'Regressive'];
