/**
 * llmStatus — global LLM availability flag.
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 10 (Failure Integrity).
 *
 * When the LLM is unreachable, every agent surface must redirect the
 * player to /setup. This store is the single source of truth for that
 * state and is set from two places:
 *   - the client `hooks.client.ts` on a 503 response from /api/llm/*
 *   - the agent BFF endpoints themselves when the LLM proxy returns
 *     an error frame.
 *
 * Consumers:
 *   - <AgentRunner /> shows a loom-pulse animation only when the
 *     LLM is online.
 *   - Route guards (Phase 4) read `llmOffline` to redirect agentic
 *     surfaces to /setup.
 *   - The /onboarding page falls back to its "offline" phase UI on
 *     a per-probe basis — the route guard is the *belt-and-suspenders*
 *     defense; per-probe error handling is the primary defense.
 */

import { writable } from 'svelte/store';

export interface LlmStatus {
  /** True if the Director cannot reach the upstream LLM. */
  readonly offline: boolean;
  /** Most recent reason — used for diagnostics only. Do NOT display raw
   *  to the player: the BFF errors may carry provider-internal text. */
  readonly reason?: string;
  /** Last update ms-since-epoch. */
  readonly updatedAt: number;
}

export const llmStatus = writable<LlmStatus>({
  offline: false,
  updatedAt: Date.now(),
});

/** Mark the LLM as offline. Idempotent. */
export function markLlmOffline(reason?: string): void {
  llmStatus.set({ offline: true, reason, updatedAt: Date.now() });
}

/** Mark the LLM as online. Use after a successful round-trip. */
export function markLlmOnline(): void {
  llmStatus.set({ offline: false, updatedAt: Date.now() });
}
