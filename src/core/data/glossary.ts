/**
 * CCRPG Glossary — shared data consumed by both CLI (runGlossary) and WebUI (/glossary route).
 * ponytail: extracted from scripts/cli-game.ts to avoid duplication.
 */

export interface GlossaryTerm {
  readonly term: string;
  readonly def: string;
}

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  { term: 'Holon', def: 'An autonomous whole that is itself part of a larger whole. NPCs, factions, and locations are all holons.' },
  { term: 'Significator', def: 'The persistent soul-pattern of the player — your saved state across sessions. Carries altitudes, drives, shadows, and ray profile.' },
  { term: 'Line', def: 'One of 8 lines of intelligence: Cognitive, Emotional, Moral, Intrapersonal, Spiritual, Interpersonal, Somatic, Willpower.' },
  { term: 'Stage', def: 'One of 8 developmental altitudes: Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White. You progress through them.' },
  { term: 'Module', def: 'A specific Line × Stage combination. 8 lines × 8 stages = 64 modules total, each with its own assessment content.' },
  { term: 'Modality', def: 'How an encounter is delivered. 7 types: Deterministic (timed trials), LanguageReflective (open questions), ScenarioChoice, Embodied, Strategic, SocialCooperative, ImmersiveRPG.' },
  { term: 'CCI', def: 'Cumulative Consciousness Index — a 0-1 composite of altitude, drive health, polarity, shadow topology, and transformation readiness.' },
  { term: 'rayProfile', def: 'Activation level (0-1) of each of the 7 energy rays: Red, Orange, Yellow, Green, Blue, Indigo, Violet. Maps to stages.' },
  { term: 'G_z / P_z', def: 'Metabolic-health primitives. G_z = generative z-potential (capacity to grow); P_z = pathogenic z-potential (distortion load). Higher G_z, lower P_z is healthier.' },
  { term: 'Arc', def: 'Session position: WARMUP (first 1-2 encounters), PEAK (middle), COOLDOWN (last 1-2). Maps to how contemplative practice actually works.' },
  { term: 'Saturation', def: 'How many encounters you have completed at your current stage per line. Reaching the threshold is required for stage transition.' },
  { term: 'Shadow', def: 'An unresolved developmental pattern. Surfacing shadows is part of the work; integrating them is the goal. The game never labels them clinically.' },
  { term: 'Drive', def: 'One of 4 fundamental drives: Agency, Communion, Eros, Agape. Each can be healthy-balanced or distorted (DarkAddicted, DarkAverted, GoldenAddicted, GoldenAverted).' },
  { term: 'Polarity', def: 'The energetic direction of an encounter: Absorptive (taking in), Radiative (giving out), or Homeostatic (balanced).' },
  { term: 'Transformation', def: 'A stage transition. Fires when readiness ≥ 0.8, with sufficient line convergence, shadow clearance, and AQAL quadrant coverage.' },
  { term: 'Veil', def: 'A design principle: the game never shows you clinical labels about yourself. You see qualitative felt-sense language, not diagnoses.' },
  { term: 'Resonance', def: 'A poetic 2-3 word description of your current stage\'s aesthetic (e.g. "fortress-sharp, weapon-walls" for Red).' },
  { term: 'Aesthetic Label', def: 'The bracketed word next to each developmental line in status output (e.g. [power]). It is the short form of your current stage: [primal]=Infrared, [symbolic]=Magenta, [power]=Red, [order]=Amber, [reason]=Orange, [harmony]=Green, [integral]=Turquoise, [unity]=White.' },
  { term: 'Theme', def: 'The session strategy that biases encounter selection (e.g. "balanced-development"). Shown in diagnostic. Different themes emphasize different lines or shadow work.' },
  { term: 'Encounter', def: 'A single developmental exchange. May be a question, a choice, a trial, or a narrative scene — depending on modality.' },
  { term: 'Calibration', def: 'The initial 8-question session that establishes your baseline across all 8 lines. Runs automatically on first play.' },
];
