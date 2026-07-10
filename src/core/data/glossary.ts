/**
 * CCRPG Glossary — shared data consumed by both CLI (runGlossary) and WebUI (/glossary route).
 * ponytail: extracted from scripts/cli-game.ts to avoid duplication.
 *
 * R11-Y3 (Fresh-User UX Audit): glossary split into player-facing essentials
 * and full theoretical set. The 23-term dump was experienced by fresh users
 * as "walking into a graduate seminar 6 months late." The 5 player-facing
 * terms (Holon, Significator, Line, Stage, Shadow) cover what a player
 * actually needs to understand their first session. The full set is gated
 * behind --full for advanced users and developers.
 */

export interface GlossaryTerm {
  readonly term: string;
  readonly def: string;
  /** 'player' = shown by default; 'advanced' = only with --full */
  readonly audience?: 'player' | 'advanced';
}

/** Player-facing essentials — shown by default in `ccrpg glossary`. */
export const PLAYER_GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  { term: 'Holon', def: 'An autonomous whole that is itself part of a larger whole. NPCs, factions, and locations are all holons.', audience: 'player' },
  { term: 'Significator', def: 'The persistent soul-pattern of the player — your saved state across sessions. Carries altitudes, drives, shadows, and ray profile.', audience: 'player' },
  { term: 'Line', def: 'One of 8 lines of intelligence: Cognitive, Emotional, Moral, Intrapersonal, Spiritual, Interpersonal, Somatic, Willpower.', audience: 'player' },
  { term: 'Stage', def: 'One of 8 developmental altitudes: Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White. You progress through them.', audience: 'player' },
  { term: 'Shadow', def: 'An unresolved developmental pattern. Surfacing shadows is part of the work; integrating them is the goal. The game never labels them clinically.', audience: 'player' },
];

/** Advanced theoretical set — only shown with `ccrpg glossary --full`. */
export const ADVANCED_GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  { term: 'Module', def: 'A specific Line × Stage combination. 8 lines × 8 stages = 64 modules total, each with its own assessment content.', audience: 'advanced' },
  { term: 'Modality', def: 'How an encounter is delivered. 7 types: Deterministic (timed trials), LanguageReflective (open questions), ScenarioChoice, Embodied, Strategic, SocialCooperative, ImmersiveRPG.', audience: 'advanced' },
  // NF-6 (Fresh-User Re-Audit): Added interpretation bands so users know what
  // the number means. The re-audit found users could see CCI change but had
  // no idea if the change was good or bad.
  { term: 'CCI', def: 'Cumulative Consciousness Index — a 0-1 composite of altitude, drive health, polarity, shadow topology, and transformation readiness. Most players start around 0.50. Interpretation: below 0.40 = struggling (heavy shadow load); 0.40-0.55 = working (the common range); 0.55-0.70 = developing (integrating); above 0.70 = flourishing.', audience: 'advanced' },
  { term: 'rayProfile', def: 'Activation level (0-1) of each of the 7 energy rays: Red, Orange, Yellow, Green, Blue, Indigo, Violet. Maps to stages.', audience: 'advanced' },
  { term: 'G_z / P_z', def: 'Metabolic-health primitives. G_z = generative z-potential (capacity to grow); P_z = pathogenic z-potential (distortion load). Higher G_z, lower P_z is healthier.', audience: 'advanced' },
  { term: 'Arc', def: 'Session position: WARMUP (first 1-2 encounters), PEAK (middle), COOLDOWN (last 1-2). Maps to how contemplative practice actually works.', audience: 'advanced' },
  { term: 'Saturation', def: 'How many encounters you have completed at your current stage per line. Reaching the threshold is required for stage transition.', audience: 'advanced' },
  { term: 'Drive', def: 'One of 4 fundamental drives: Agency, Communion, Eros, Agape. Each can be healthy-balanced or distorted (DarkAddicted, DarkAverted, GoldenAddicted, GoldenAverted).', audience: 'advanced' },
  { term: 'Polarity', def: 'The energetic direction of an encounter: Absorptive (taking in), Radiative (giving out), or Homeostatic (balanced).', audience: 'advanced' },
  { term: 'Transformation', def: 'A stage transition. Fires when readiness ≥ 0.8, with sufficient line convergence, shadow clearance, and AQAL quadrant coverage.', audience: 'advanced' },
  { term: 'Veil', def: 'A design principle: the game never shows you clinical labels about yourself. You see qualitative felt-sense language, not diagnoses.', audience: 'advanced' },
  { term: 'Resonance', def: 'A poetic 2-3 word description of your current stage\'s aesthetic (e.g. "fortress-sharp, weapon-walls" for Red).', audience: 'advanced' },
  // NF-4 (Fresh-User Re-Audit): The '[h' in '[harmony]' was being consumed by
  // terminal ANSI-escape interpretation (ESC [ H = cursor home), making the
  // rendered output show 'armony]=Green' instead of '[harmony]=Green'. This
  // survived two audits because the source is byte-correct but the terminal
  // eats the '[h'. Fix: use a space-separated format instead of bracket
  // notation so no '[X' sequence can be misinterpreted as an escape.
  { term: 'Aesthetic Label', def: 'The bracketed word next to each developmental line in status output (e.g. [power]). It is the short form of your current stage: primal=Infrared, symbolic=Magenta, power=Red, order=Amber, reason=Orange, harmony=Green, integral=Turquoise, unity=White.', audience: 'advanced' },
  { term: 'Theme', def: 'The session strategy that biases encounter selection (e.g. "balanced-development"). Shown in diagnostic. Different themes emphasize different lines or shadow work.', audience: 'advanced' },
  { term: 'Encounter', def: 'A single developmental exchange. May be a question, a choice, a trial, or a narrative scene — depending on modality.', audience: 'advanced' },
  { term: 'Calibration', def: 'The initial 8-question session that establishes your baseline across all 8 lines. Runs automatically on first play.', audience: 'advanced' },
];

/** All terms (player + advanced), for backwards-compat imports. */
export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  ...PLAYER_GLOSSARY_TERMS,
  ...ADVANCED_GLOSSARY_TERMS,
];
