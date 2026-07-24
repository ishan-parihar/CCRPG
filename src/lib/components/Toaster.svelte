<script lang="ts">
  /**
   * Toaster — renders active toasts. Mount once in +layout.svelte.
   * Reads from toastStore; each toast auto-dismisses after its duration.
   */
  import { toastStore, dismissToast } from '$lib/stores/toastStore.js';
  import { fly, fade } from 'svelte/transition';
  import Portal from './Portal.svelte';
</script>

<Portal>
  <div class="toaster" role="region" aria-live="polite" aria-label="Notifications">
    {#each $toastStore as toast (toast.id)}
      <div
        class="toast toast-{toast.variant}"
        in:fly={{ y: 20, duration: 220 }}
        out:fade={{ duration: 180 }}
      >
        <span class="toast-message">{toast.message}</span>
        <button
          class="toast-dismiss"
          onclick={() => dismissToast(toast.id)}
          aria-label="Dismiss notification"
        >×</button>
      </div>
    {/each}
  </div>
</Portal>

<style>
  .toaster {
    position: fixed;
    bottom: calc(var(--mysterium-nav-height, 56px) + var(--mysterium-space-4, 1rem));
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--mysterium-z-toast, 1500);
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
    pointer-events: none;
    width: min(90vw, 480px);
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--mysterium-space-3);
    padding: var(--mysterium-space-3) var(--mysterium-space-4);
    background: var(--mysterium-surface-elevated);
    border: 1px solid var(--mysterium-border);
    border-left: 3px solid var(--mysterium-accent);
    border-radius: var(--mysterium-radius);
    box-shadow: var(--mysterium-shadow-md);
    color: var(--mysterium-fg);
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    pointer-events: auto;
  }

  .toast-success { border-left-color: var(--mysterium-success); }
  .toast-warning { border-left-color: var(--mysterium-warning); }
  .toast-danger { border-left-color: var(--mysterium-danger); }
  .toast-info { border-left-color: var(--mysterium-info); }

  .toast-message {
    flex: 1;
    line-height: var(--mysterium-leading-normal);
  }

  .toast-dismiss {
    background: transparent;
    border: none;
    color: var(--mysterium-fg-muted);
    font-size: var(--mysterium-text-lg);
    cursor: pointer;
    padding: 0 var(--mysterium-space-1);
    line-height: 1;
    -webkit-tap-highlight-color: transparent;
  }

  .toast-dismiss:hover {
    color: var(--mysterium-fg);
  }

  .toast-dismiss:focus-visible {
    outline: 2px solid var(--mysterium-accent);
    outline-offset: 2px;
  }
</style>
