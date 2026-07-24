<script lang="ts">
  /**
   * <AgentRunner /> — visible presence of the Background-Agentic runtime.
   *
   * BACKGROUND-AGENTIC-ARCHITECTURE Decision 9 (Persistent affordance).
   *
   * A small, non-blocking status pill in the bottom-right. Phases:
   *   online + idle   : faint dot
   *   online + thinking: loom-pulse animation (CSS keyframes)
   *   offline         : dimmed with "—" icon, no pulse
   *
   * The component is purely cosmetic — it never blocks clicks, never
   * grows beyond ~32x32 px, never opens modal dialogs. It exists so the
   * player can see "the loom is / is not moving" without lowering the
   * game's information density.
   *
   * The "thinking" state is implicit: it is set when the most recent
   * `/api/agent/*` request is in flight, and cleared on completion.
   * We track that via a writable in-flight counter maintained by the
   * `setAgentBusy`/`clearAgentBusy` exports from this module.
   */

  import { onDestroy } from 'svelte';
  import { derived } from 'svelte/store';
  import { llmStatus } from '$lib/stores/llmStatus.js';
  import { writable } from 'svelte/store';

  /** Counter — 0 = idle, >0 = at least one request in flight. */
  export const agentBusy = writable<number>(0);

  /** Mark a BFF agent request as in flight. */
  export function setAgentBusy(): void {
    agentBusy.update((n) => n + 1);
  }

  /** Mark a BFF agent request as complete. */
  export function clearAgentBusy(): void {
    agentBusy.update((n) => Math.max(0, n - 1));
  }

  const state = derived(
    [llmStatus, agentBusy],
    ([$status, $busy]) =>
      $status.offline
        ? 'offline'
        : $busy > 0
          ? 'thinking'
          : 'online',
  );

  // Auto-clear busy after 5s of no clearAgentBusy() — defensive cleanup
  // for the dropped-fetch path. We attach a single timer.
  let timer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    if ($state === 'thinking') {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        agentBusy.set(0);
      }, 5_000);
    } else if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });
  void llmStatus;

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<div
  class="agent-runner"
  data-state={$state}
  aria-hidden="true"
  title={$state === 'thinking' ? 'Director is composing…' : $state === 'offline' ? 'Director unavailable' : 'Director online'}
>
  {#if $state === 'thinking'}
    <span class="pulse-dot"></span>
  {:else if $state === 'offline'}
    <span class="dim-line"></span>
  {:else}
    <span class="dot"></span>
  {/if}
</div>

<style>
  .agent-runner {
    position: fixed;
    right: var(--mysterium-space-4);
    bottom: calc(var(--mysterium-nav-height) + var(--mysterium-space-4));
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--mysterium-surface-elevated);
    border: 1px solid var(--mysterium-border);
    pointer-events: none;
    opacity: 0.85;
    z-index: 1;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mysterium-accent);
    opacity: 0.6;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mysterium-accent);
    animation: agent-pulse 1.2s var(--mysterium-ease, ease-in-out) infinite;
  }
  .dim-line {
    width: 12px;
    height: 1px;
    background: var(--mysterium-fg-muted);
    opacity: 0.5;
  }
  @keyframes agent-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
      box-shadow: 0 0 0 0 var(--mysterium-accent);
    }
    50% {
      transform: scale(1.6);
      opacity: 1;
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
    }
  }
</style>
