/**
 * Loom — the rolling context window for the Background-Agentic runtime.
 *
 * The DirectorAgent uses this to inject *bounded recent context* into every
 * `generateNextProbe` call. Bounded so that the prompt stays small; rolling
 * so the most recent signals dominate without ignoring the shape of the
 * recent past.
 *
 * Two windows:
 *   - gameEvents: most recent 5 entries of the typed engine event stream
 *   - freeInputs: most recent 3 player-authored free-text inputs (the +1)
 *
 * Concurrency: Loom is a single-process per-session object on the BFF.
 * Reads are O(1); writes push to the head; older entries are evicted when
 * the window is full. No locking needed — the only writer is the
 * DirectorAgent itself; readers always capture a stable snapshot.
 */

import type { GameEventType, GameEventMap } from '../events/GameEvents.js';

const MAX_GAME_EVENTS = 5;
const MAX_FREE_INPUTS = 3;

export interface LoomGameSnapshot {
  readonly event: GameEventType;
  readonly timestamp: number;
  /** A compact, JSON-safe projection of the event payload. */
  readonly projection: Record<string, unknown>;
}

export interface LoomFreeInput {
  /** ms-since-epoch when the free-input was submitted. */
  readonly timestamp: number;
  /** The +1 free text from the player. Stored verbatim (VeilFilter gated at boundaries). */
  readonly text: string;
  /** The polarity of the MCQ selected alongside this free-input. */
  readonly selectedPolarity: string;
}

export class Loom {
  private gameEvents: LoomGameSnapshot[] = [];
  private freeInputs: LoomFreeInput[] = [];

  /** Append a typed game-event. Older entries roll off beyond MAX_GAME_EVENTS. */
  observeGameEvent<E extends GameEventType>(
    event: E,
    payload: GameEventMap[E],
    timestamp = Date.now(),
  ): void {
    this.gameEvents.unshift({ event, timestamp, projection: this.project(event, payload) });
    if (this.gameEvents.length > MAX_GAME_EVENTS) this.gameEvents.length = MAX_GAME_EVENTS;
  }

  /** Append a player free-input (the +1). Older entries roll off beyond MAX_FREE_INPUTS. */
  observeFreeInput(input: LoomFreeInput): void {
    this.freeInputs.unshift(input);
    if (this.freeInputs.length > MAX_FREE_INPUTS) this.freeInputs.length = MAX_FREE_INPUTS;
  }

  gameEvents$(): readonly LoomGameSnapshot[] {
    return this.gameEvents;
  }

  freeInputs$(): readonly LoomFreeInput[] {
    return this.freeInputs;
  }

  /** Compact, JSON-stable rendering for injection into an LLM prompt. */
  render(): {
    readonly events: readonly LoomGameSnapshot[];
    readonly inputs: readonly LoomFreeInput[];
  } {
    return {
      events: this.gameEvents,
      inputs: this.freeInputs,
    };
  }

  /** Compact projection of an event payload for the Loom (no functions, no symbols). */
  private project(event: GameEventType, payload: GameEventMap[typeof event]): Record<string, unknown> {
    try {
      const seen = new WeakSet<object>();
      return JSON.parse(
        JSON.stringify(payload, (_key, value: unknown) => {
          if (typeof value === 'bigint') return value.toString();
          if (value && typeof value === 'object') {
            const obj = value as object;
            if (seen.has(obj)) return '[Circular]';
            seen.add(obj);
          }
          return value;
        }),
      ) as Record<string, unknown>;
    } catch {
      // Defensive — unreachable for our typed payloads, but never throw on Loom.
      return { event, note: 'unserializable' };
    }
  }
}
