/**
 * maybeFireHook — no-op stub.
 *
 * TDG-Rust integration was removed (speculative, never activated).
 * This stub preserves the call sites in GameLoop + ConsequenceEngine
 * so the hook contract is documented. If TDG is ever revived, replace
 * this file with a real bridge.
 *
 * ponytail: the hooks were always best-effort fire-and-forget no-ops
 * when TDG wasn't running. Removing the subsystem changes nothing at
 * runtime — the stub just makes the "do nothing" explicit.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function maybeFireHook(_name: string, _fn: (hooks: any) => Promise<void>): void {
  // intentionally no-op
}
