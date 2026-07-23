/**
 * BFF-wide agent runtime registry.
 *
 * Single process-global DirectorAgent + AgentRuntime. Imported by
 * /api/agent/* endpoints lazily so cold start cost is paid only when
 * the agent surface is hit.
 *
 * Phase 1 scaffolding: the director and runtime are constructed when
 * `getOrCreate()` is first called. Future phases may hoist this into a
 * proper DI container; for now, a module-private singleton suffices.
 */

import { EventBus } from '../../core/events/EventBus.js';
import { DirectorAgent } from '../../core/agent/DirectorAgent.js';
import { AgentRuntime } from '../../core/agent/AgentRuntime.js';

interface RuntimeHandle {
  readonly bus: EventBus;
  readonly director: DirectorAgent;
  readonly runtime: AgentRuntime;
}

let handle: RuntimeHandle | null = null;

export function getOrCreateAgentRuntime(): RuntimeHandle {
  if (handle) return handle;
  const bus = new EventBus();
  const director = new DirectorAgent();
  const runtime = new AgentRuntime(bus, director);
  runtime.start();
  handle = { bus, director, runtime };
  return handle;
}

export function isAgentRuntimeStarted(): boolean {
  return handle !== null && handle.runtime.isRunning();
}

export function disposeAgentRuntime(): void {
  if (!handle) return;
  handle.runtime.dispose();
  handle = null;
}
