/**
 * AgentRuntime — EventBus → DirectorAgent bridge.
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 3, 14.
 *
 * One AgentRuntime per server boot. It subscribes to all 14 typed engine
 * events and forwards them to the singleton DirectorAgent. Disposing the
 * runtime detaches every listener — needed on graceful shutdown and in
 * tests.
 *
 * Implementation note: the engine EventBus lives in
 * `src/core/events/EventBus.ts` and the typed event map in
 * `src/core/events/GameEvents.ts`. Both are pure data — no DOM coupling,
 * no SvelteKit coupling — so the runtime lives in `core/agent/` without
 * any framework dep.
 */

import { EventBus } from '../events/EventBus.js';
import type { GameEventMap, GameEventType } from '../events/GameEvents.js';
import type { DirectorAgent } from './DirectorAgent.js';

export const AGENT_RUNTIME_EVENTS: readonly GameEventType[] = [
  'encounter_scheduled',
  'encounter_completed',
  'shadow_surfaced',
  'shadow_resolved',
  'transformation_triggered',
  'bleed_through',
  'session_started',
  'session_ended',
  'accessibility_changed',
  'module_lifecycle_active',
  'module_lifecycle_scored',
  'module_lifecycle_mutated',
  'module_lifecycle_pool',
  'cci_computed',
  'strategy_generated',
  'strategy_adjusted',
  'encounter_declined',
] as const;

export class AgentRuntime {
  private unsubscribers: Array<() => void> = [];

  constructor(
    private readonly bus: EventBus,
    private readonly director: DirectorAgent,
  ) {}

  /** Start listening. Idempotent — re-subscribing would create duplicate deliveries. */
  start(): void {
    if (this.unsubscribers.length > 0) return;
    for (const event of AGENT_RUNTIME_EVENTS) {
      this.unsubscribers.push(
        this.bus.on(event, ((payload: GameEventMap[typeof event]) => {
          this.director.observeGameEvent(event, payload);
        }) as Parameters<EventBus['on']>[1]),
      );
    }
  }

  /** Detach every listener. Use on graceful shutdown or in tests. */
  dispose(): void {
    for (const u of this.unsubscribers) u();
    this.unsubscribers = [];
  }

  isRunning(): boolean {
    return this.unsubscribers.length > 0;
  }
}
