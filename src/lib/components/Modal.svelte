<script lang="ts">
  /**
   * Modal — accessible dialog with focus trap, Escape handler, restore-focus.
   * Replaces the hand-rolled /settings reset-confirm modal.
   */
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { fade, scale } from 'svelte/transition';
  import Portal from './Portal.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    title?: string;
    ariaLabelledby?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    children: Snippet;
  }

  let {
    open,
    onclose,
    title,
    ariaLabelledby,
    size = 'md',
    class: className = '',
    children,
  }: Props = $props();

  let lastFocused: HTMLElement | null = $state(null);
  let modalEl: HTMLDivElement | null = $state(null);
  const titleId = $derived(ariaLabelledby ?? 'modal-title');

  // Focus trap + Escape handler
  $effect(() => {
    if (!browser || !open) return;

    // Store currently-focused element to restore later
    lastFocused = document.activeElement as HTMLElement;

    // Focus the modal container
    setTimeout(() => modalEl?.focus(), 0);

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onclose();
        return;
      }
      if (e.key === 'Tab' && modalEl) {
        // Focus trap
        const focusable = modalEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      // Restore focus
      lastFocused?.focus();
    };
  });
</script>

{#if open}
  <Portal>
    <div
      class="modal-backdrop"
      transition:fade={{ duration: 180 }}
      onclick={onclose}
      onkeydown={(e) => e.key === 'Enter' && onclose()}
      role="presentation"
    ></div>
    <div
      class="modal modal-{size}"
      bind:this={modalEl}
      transition:scale={{ duration: 220, start: 0.95, opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabindex="-1"
    >
      {#if title}
        <h2 class="modal-title" id={titleId}>{title}</h2>
      {/if}
      <div class="modal-body {className}">
        {@render children()}
      </div>
    </div>
  </Portal>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: var(--mysterium-z-modal);
    backdrop-filter: blur(2px);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: calc(var(--mysterium-z-modal) + 1);
    background: var(--mysterium-surface-elevated);
    border: 1px solid var(--mysterium-border);
    border-top: 2px solid var(--mysterium-accent);
    border-radius: var(--mysterium-radius-lg);
    box-shadow: var(--mysterium-shadow-lg);
    padding: var(--mysterium-space-6);
    max-width: 90vw;
    max-height: 85vh;
    overflow-y: auto;
    outline: none;
  }

  .modal-sm { width: min(400px, 90vw); }
  .modal-md { width: min(560px, 90vw); }
  .modal-lg { width: min(800px, 90vw); }

  .modal-title {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-lg);
    font-weight: 700;
    color: var(--mysterium-fg);
    margin: 0 0 var(--mysterium-space-4) 0;
    letter-spacing: var(--mysterium-tracking-wide);
  }

  .modal-body {
    color: var(--mysterium-fg);
  }
</style>
