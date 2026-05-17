import type { CombatStats } from './Stats.js';

/**
 * Battler — a combat participant (player or enemy).
 *
 * Pure domain entity. Owns its current HP/mana/ATB state. Knows nothing
 * about Phaser, the renderer, or any IO. Mutations happen via well-named
 * methods so use cases (ATBEngine, DamageCalculator) can drive it.
 */
export type BattlerSide = 'player' | 'enemy';

export interface BattlerInit {
  readonly id: string;
  readonly name: string;
  readonly side: BattlerSide;
  readonly stats: CombatStats;
}

export class Battler {
  readonly id: string;
  readonly name: string;
  readonly side: BattlerSide;
  readonly stats: CombatStats;

  /** Current HP. Clamped to [0, stats.maxHp]. */
  private _hp: number;
  /** Current mana. Clamped to [0, stats.maxMana]. */
  private _mana: number;
  /** Current ATB charge in [0, ATB_MAX]. */
  private _atb: number;

  constructor(init: BattlerInit) {
    this.id = init.id;
    this.name = init.name;
    this.side = init.side;
    this.stats = init.stats;
    this._hp = init.stats.maxHp;
    this._mana = init.stats.maxMana;
    this._atb = 0;
  }

  get hp(): number {
    return this._hp;
  }
  get mana(): number {
    return this._mana;
  }
  get atb(): number {
    return this._atb;
  }
  get isAlive(): boolean {
    return this._hp > 0;
  }
  get hpRatio(): number {
    return this._hp / this.stats.maxHp;
  }
  get manaRatio(): number {
    return this._mana / this.stats.maxMana;
  }

  setAtb(value: number): void {
    this._atb = clamp(value, 0, ATB_MAX);
  }

  /** Reset ATB to 0 — called after the battler takes its turn. */
  clearAtb(): void {
    this._atb = 0;
  }

  /** Apply unmitigated damage. Returns the actual damage applied. */
  takeDamage(amount: number): number {
    const dmg = Math.max(0, Math.floor(amount));
    const before = this._hp;
    this._hp = clamp(this._hp - dmg, 0, this.stats.maxHp);
    return before - this._hp;
  }

  /** Heal HP by amount. Returns the actual healing applied. */
  heal(amount: number): number {
    const h = Math.max(0, Math.floor(amount));
    const before = this._hp;
    this._hp = clamp(this._hp + h, 0, this.stats.maxHp);
    return this._hp - before;
  }

  /** Spend mana. Returns false if insufficient. */
  spendMana(cost: number): boolean {
    const c = Math.max(0, Math.floor(cost));
    if (this._mana < c) return false;
    this._mana -= c;
    return true;
  }

  restoreMana(amount: number): number {
    const a = Math.max(0, Math.floor(amount));
    const before = this._mana;
    this._mana = clamp(this._mana + a, 0, this.stats.maxMana);
    return this._mana - before;
  }
}

/** Maximum ATB charge value. Acting threshold = ATB_MAX. */
export const ATB_MAX = 1000;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
