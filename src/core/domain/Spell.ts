/**
 * Spell — pure domain definition. Each spell binds a mana cost and an
 * N-back load factor (n) that drives the offensive cognitive task.
 */
export interface Spell {
  readonly id: string;
  readonly name: string;
  /** Mana cost. */
  readonly cost: number;
  /** Working-memory load. 1 = 1-back, 2 = 2-back, etc. */
  readonly nBack: number;
  /** Number of trials presented in the N-back sequence. */
  readonly trials: number;
  /** Base damage scalar before cognitive accuracy multiplier. */
  readonly baseDamage: number;
  /** Display tint as 0xRRGGBB. */
  readonly tint: number;
}

export const SPELLBOOK: readonly Spell[] = [
  {
    id: 'spark',
    name: 'Spark',
    cost: 6,
    nBack: 1,
    trials: 6,
    baseDamage: 24,
    tint: 0xffd166,
  },
  {
    id: 'frost-lance',
    name: 'Frost Lance',
    cost: 14,
    nBack: 2,
    trials: 8,
    baseDamage: 42,
    tint: 0x4cc9f0,
  },
  {
    id: 'voidcall',
    name: 'Voidcall',
    cost: 24,
    nBack: 3,
    trials: 10,
    baseDamage: 70,
    tint: 0xb14aff,
  },
];
