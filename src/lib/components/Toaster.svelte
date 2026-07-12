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
    bottom: calc(var(--ccrpg-nav-height, 56px) + var(--ccrpg-space-4, 1rem));
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--ccrpg-z-toast, 1500);
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
    pointer-events: none;
    width: min(90vw, 480px);
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-3);
    padding: var(--ccrpg-space-3) var(--ccrpg-space-4);
    background: var(--ccrpg-surface-elevated);
    border: 1px solid var(--ccrpg-border);
    border-left: 3px solid var(--ccrpg-accent);
    border-radius: var(--ccrpg-radius);
    box-shadow: var(--ccrpg-shadow-md);
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    pointer-events: auto;
  }

  .toast-success { border-left-color: var(--ccrpg-success); }
  .toast-warning { border-left-color: var(--ccrpg-warning); }
  .toast-danger { border-left-color: var(--ccrpg-danger); }
  .toast-info { border-left-color: var(--ccrpg-info); }

  .toast-message {
    flex: 1;
    line-height: var(--ccrpg-leading-normal);
  }

  .toast-dismiss {
    background: transparent;
    border: none;
    color: var(--ccrpg-fg-muted);
    font-size: var(--ccrpg-text-lg);
    cursor: pointer;
    padding: 0 var(--ccrpg-space-1);
    line-height: 1;
    -webkit-tap-highlight-color: transparent;
  }

  .toast-dismiss:hover {
    color: var(--ccrpg-fg);
  }

  .toast-dismiss:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: 2px;
  }
</style>
