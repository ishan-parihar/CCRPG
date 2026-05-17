/**
 * Domain types: stats, attributes, and the mapping between RPG stats and
 * cognitive domains as defined in the blueprint.
 *
 * Pure TypeScript. No framework dependencies.
 */

/** RPG attributes that drive both combat math and cognitive scaling. */
export interface CombatStats {
  /** Maximum HP — Vitality / Cognitive Endurance. */
  readonly maxHp: number;
  /** Maximum Mana — Working Memory capacity. */
  readonly maxMana: number;
  /** Speed / Agility — Processing Speed. Drives ATB fill rate. 1..255. */
  readonly agility: number;
  /** Base physical attack used for non-cognitive baselines. */
  readonly attack: number;
  /** Defense — Inhibitory Control. Mitigates incoming damage on parries. */
  readonly defense: number;
  /** Precision — Sustained Attention. Hit chance modifier. 0..100. */
  readonly precision: number;
  /** Magic — Working Memory damage scalar. */
  readonly magic: number;
  /** Luck — affects critical-hit chance baseline. 0..100. */
  readonly luck: number;
}

/** A snapshot of the player's measured cognitive performance. */
export interface CognitiveProfile {
  /** Rolling N-back accuracy in [0,1]. */
  readonly nBackAccuracy: number;
  /** Highest stable N-back load achieved. */
  readonly nBackLevel: number;
  /** Rolling Stroop accuracy in [0,1]. */
  readonly stroopAccuracy: number;
  /** Average Stroop reaction latency (ms). */
  readonly stroopReactionMs: number;
  /** Total trials completed across sessions. */
  readonly totalTrials: number;
}

export const DEFAULT_STATS: CombatStats = {
  maxHp: 120,
  maxMana: 60,
  agility: 60,
  attack: 18,
  defense: 12,
  precision: 75,
  magic: 22,
  luck: 10,
};

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfile = {
  nBackAccuracy: 0,
  nBackLevel: 1,
  stroopAccuracy: 0,
  stroopReactionMs: 0,
  totalTrials: 0,
};
