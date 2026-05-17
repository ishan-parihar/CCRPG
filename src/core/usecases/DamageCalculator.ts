import type { Battler } from '../domain/Battler.js';
import type { Spell } from '../domain/Spell.js';

/**
 * DamageCalculator — pure combat math.
 *
 * Splits offensive (player → enemy) and defensive (enemy → player) paths
 * so the cognitive multipliers from N-back / Stroop slot in cleanly.
 */
export interface AttackResult {
  readonly damage: number;
  readonly isCritical: boolean;
  readonly didHit: boolean;
}

const CRIT_BASELINE = 0.05; // 5% base crit chance
const CRIT_MULTIPLIER = 1.75;

/**
 * Compute spell damage from caster, target, spell, and the cognitive
 * multiplier produced by the N-back task (0..1.6).
 */
export function computeSpellDamage(
  caster: Battler,
  target: Battler,
  spell: Spell,
  nBackMultiplier: number,
  rng: () => number = Math.random,
): AttackResult {
  // Hit roll uses Precision (Sustained Attention).
  const hitChance = clamp01(caster.stats.precision / 100);
  if (rng() > hitChance) {
    return { damage: 0, isCritical: false, didHit: false };
  }

  // Critical chance scales with luck and good cognitive performance.
  const critChance = clamp01(
    CRIT_BASELINE + caster.stats.luck / 200 + (nBackMultiplier - 1) * 0.25,
  );
  const isCritical = rng() < critChance;

  const magicScalar = 1 + caster.stats.magic / 50;
  const defenseScalar = 100 / (100 + target.stats.defense);

  let raw = spell.baseDamage * magicScalar * nBackMultiplier * defenseScalar;
  if (isCritical) raw *= CRIT_MULTIPLIER;

  return {
    damage: Math.max(1, Math.round(raw)),
    isCritical,
    didHit: true,
  };
}

/**
 * Compute physical/basic-attack damage. Used for both player auto-attacks
 * and enemy strikes; the Stroop multiplier is applied externally for
 * incoming hits via {@link applyDefensiveMultiplier}.
 */
export function computeBasicAttack(
  attacker: Battler,
  target: Battler,
  rng: () => number = Math.random,
): AttackResult {
  const hitChance = clamp01(attacker.stats.precision / 100);
  if (rng() > hitChance) {
    return { damage: 0, isCritical: false, didHit: false };
  }
  const critChance = clamp01(CRIT_BASELINE + attacker.stats.luck / 200);
  const isCritical = rng() < critChance;
  const defenseScalar = 100 / (100 + target.stats.defense);
  let raw = attacker.stats.attack * defenseScalar;
  if (isCritical) raw *= CRIT_MULTIPLIER;
  return {
    damage: Math.max(1, Math.round(raw)),
    isCritical,
    didHit: true,
  };
}

/** Apply a defensive multiplier (e.g. from Stroop outcome) to incoming damage. */
export function applyDefensiveMultiplier(
  incoming: AttackResult,
  multiplier: number,
): AttackResult {
  if (!incoming.didHit) return incoming;
  return {
    ...incoming,
    damage: Math.max(0, Math.round(incoming.damage * multiplier)),
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
