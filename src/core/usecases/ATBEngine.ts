import { ATB_MAX, type Battler } from '../domain/Battler.js';

/**
 * ATBEngine — drives the Active Time Battle clock per the blueprint.
 *
 * - Each battler has a charge in [0, ATB_MAX].
 * - Per-frame fill is computed from the agility stat using a non-linear
 *   curve with diminishing returns above 100 to prevent infinite loops.
 * - When a battler's charge reaches ATB_MAX it is pushed onto a Turn Stack.
 * - The entity at index 0 acts; on action completion it is popped and its
 *   personal ATB is cleared.
 */
export class ATBEngine {
  private readonly battlers: readonly Battler[];
  /** FIFO queue of battler IDs whose ATB has filled. */
  private readonly turnStack: string[] = [];
  /** Set of IDs already in the turn stack to prevent duplicates. */
  private readonly inStack: Set<string> = new Set();
  /** Whether the engine should advance ATB charge (paused during turns). */
  private _running = true;
  /**
   * BaseTick: ATB units added per second when Agility = 0.
   * With Agility = 100 → fill rate = baseTick * 2 = 1000/s, filling
   * 1000 ATB units in ~1.0s. Matches the blueprint's calibration.
   */
  private readonly baseTick: number;

  constructor(battlers: readonly Battler[], baseTick: number = 500) {
    this.battlers = battlers;
    this.baseTick = baseTick;
  }

  get isRunning(): boolean {
    return this._running;
  }

  pause(): void {
    this._running = false;
  }

  resume(): void {
    this._running = true;
  }

  /** Advance the ATB clock by deltaMs and queue any battler that fills. */
  tick(deltaMs: number): void {
    if (!this._running) return;
    const dt = deltaMs / 1000;
    for (const b of this.battlers) {
      if (!b.isAlive) continue;
      if (this.inStack.has(b.id)) continue;
      const fill = ATBEngine.fillRate(b.stats.agility, this.baseTick) * dt;
      const next = b.atb + fill;
      if (next >= ATB_MAX) {
        b.setAtb(ATB_MAX);
        this.turnStack.push(b.id);
        this.inStack.add(b.id);
      } else {
        b.setAtb(next);
      }
    }
  }

  /** Returns the ID of the battler whose turn it is, or null. */
  peekTurn(): string | null {
    while (this.turnStack.length > 0) {
      const id = this.turnStack[0]!;
      const b = this.battlers.find((x) => x.id === id);
      if (b && b.isAlive) return id;
      // Dead while waiting → drop from stack.
      this.turnStack.shift();
      this.inStack.delete(id);
    }
    return null;
  }

  /** Pop the front turn and clear that battler's ATB. */
  consumeTurn(): string | null {
    const id = this.peekTurn();
    if (id === null) return null;
    this.turnStack.shift();
    this.inStack.delete(id);
    const b = this.battlers.find((x) => x.id === id);
    if (b) b.clearAtb();
    return id;
  }

  /**
   * Compute the per-second ATB fill rate from agility.
   *
   * For Agility ≤ 100: linear, FillRate = BaseTick * (1 + agility/100).
   * For Agility > 100: smoothly saturating curve that asymptotes to
   *   BaseTick * 4, so 255-agility characters cannot loop infinitely.
   *
   * Calibration (BaseTick=500, ATB_MAX=1000) — matches the blueprint:
   *  - Agility=0   → 500/s     → fills in ~2.0s
   *  - Agility=100 → 1000/s    → fills in ~1.0s
   *  - Agility=255 → ~1855/s   → fills in ~0.54s (~ blueprint's 0.5s)
   */
  static fillRate(agility: number, baseTick: number): number {
    const a = Math.max(0, agility);
    if (a <= 100) {
      return baseTick * (1 + a / 100);
    }
    // Above 100: smoothly saturating diminishing returns.
    // Asymptote: contribution → 2, so total fill rate → baseTick * 4.
    const extra = 2 * (1 - Math.exp(-(a - 100) / 80));
    return baseTick * (2 + extra);
  }
}
