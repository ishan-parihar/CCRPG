/**
 * TDGBridge — process-wide singleton managing the TDG-Rust client + hooks.
 *
 * This is the single integration point between CCRPG's engines and TDG-Rust.
 * Engines call `TDGBridge.maybeFireHook(name, ...)` which:
 *   - No-ops immediately if TDG-Rust is not running (the common case)
 *   - Fire-and-forgets the hook asynchronously if TDG-Rust is running
 *
 * This guarantees ZERO regression when TDG-Rust is unavailable: the hooks
 * are pure additions that only activate when the binary is installed and
 * started. All existing engine behaviour is preserved.
 *
 * ── Browser-build safety ──
 * TDGClient.ts imports Node's `child_process`, `fs`, and `path` — these are
 * not available in the browser. To keep the browser (vite) build clean, this
 * module uses `import type` for TDGClient/TDGHooks (types are erased at
 * compile time) and dynamic `await import()` for the concrete classes. This
 * ensures the browser bundle never statically pulls in Node-only modules.
 * The hot path (`maybeFireHook`) remains a fast synchronous no-op.
 *
 * Status: canonical-hypothesis (CCRPG-specific integration per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import type { TDGClient } from './TDGClient.js';
import type { TDGHooks } from './TDGHooks.js';
import type { AdaptedTDGTool } from './TDGToolAdapter.js';
import type { ToolRegistry } from '../../core/agent/ToolRegistry.js';

let client: TDGClient | null = null;
let hooks: TDGHooks | null = null;
let started = false;
let startPromise: Promise<void> | null = null;

export interface TDGBridgeStatus {
  readonly available: boolean;
  readonly running: boolean;
  readonly toolCount: number;
}

/**
 * Get the current TDG bridge status.
 * `available` = binary exists on disk (only meaningful after startTDGBridge).
 * `running` = binary is spawned and MCP handshake complete.
 *
 * Note: this reads the existing `client` variable. To detect availability
 * before startTDGBridge is called, call startTDGBridge() first (it's idempotent
 * and no-ops when the binary isn't installed).
 */
export function getTDGBridgeStatus(): TDGBridgeStatus {
  return {
    available: client?.isAvailable() ?? false,
    running: hooks?.isActive() ?? false,
    toolCount: client?.getTools().length ?? 0,
  };
}

/**
 * Start the TDG-Rust MCP server (if available) and activate hooks.
 * Idempotent — safe to call multiple times. Returns immediately if already started.
 * No-ops (without throwing) when TDG-Rust binary is not installed or the runtime
 * is a browser (where child_process is unavailable).
 */
export async function startTDGBridge(): Promise<void> {
  if (started) return;
  if (startPromise) return startPromise;

  startPromise = (async () => {
    // Dynamic import — keeps child_process/fs/path out of the browser bundle.
    // In the browser, this import will fail; we catch and stay in no-op mode.
    try {
      const { TDGClient: ClientClass } = await import('./TDGClient.js');
      const { TDGHooks: HooksClass } = await import('./TDGHooks.js');
      client = new ClientClass();
      if (!client.isAvailable()) {
        // TDG-Rust not installed — stay inactive (no-op mode)
        started = true;
        return;
      }
      await client.start();
      hooks = new HooksClass();
      hooks.setClient(client);
      started = true;
    } catch {
      // Failed to start (browser env, binary missing, spawn error, etc.)
      // — stay in no-op mode. Hooks are best-effort; never break the game.
      started = true;
    }
  })();

  return startPromise;
}

/** Stop the TDG-Rust MCP server (called on process exit). */
export function stopTDGBridge(): void {
  if (client) {
    try { client.stop(); } catch { /* best-effort */ }
  }
  hooks = null;
  client = null;
  started = false;
  startPromise = null;
}

/** Get the TDGHooks instance (null if TDG not running). */
export function getTDGHooks(): TDGHooks | null {
  return hooks;
}

/** Get the TDGClient instance (null if not created). */
export function getTDGClient(): TDGClient | null {
  return client;
}

/**
 * Register TDG-Mind tools into a ToolRegistry, if TDG-Rust is running.
 * Returns the number of tools registered (0 if TDG unavailable).
 */
export async function registerTDGTools(registry: ToolRegistry): Promise<number> {
  if (!client || !client.isRunning()) return 0;
  try {
    const { adaptTDGTools } = await import('./TDGToolAdapter.js');
    const adapted: AdaptedTDGTool[] = adaptTDGTools(client);
    for (const tool of adapted) {
      registry.register({
        definition: tool.definition,
        handler: tool.handler,
        source: 'tdg',
      });
    }
    return adapted.length;
  } catch {
    return 0;
  }
}

/**
 * Fire a TDG hook by name with the given async function.
 * Safe to call from any engine — no-ops immediately if TDG is not running.
 * Errors are swallowed (best-effort: hooks must never break the game).
 *
 * The `name` parameter is kept for telemetry/debugging — it identifies which
 * hook is firing so log lines are traceable. It is not currently used in the
 * no-op path but is reserved for future telemetry hooks.
 *
 * Usage:
 *   maybeFireHook('onEncounterComplete', (h) => h.onEncounterComplete(enc, rec, sig));
 */
export function maybeFireHook(
  name: string,
  fn: (hooks: TDGHooks) => Promise<void>,
): void {
  void name; // reserved for future telemetry
  if (!hooks || !hooks.isActive()) return;
  // Fire-and-forget — never block the game loop on TDG
  fn(hooks).catch(() => {
    // Swallow — hooks are best-effort
  });
}
