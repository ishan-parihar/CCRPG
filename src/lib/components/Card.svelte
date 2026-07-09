<script lang="ts">
  /**
   * Card — surface container with stage-aware styling.
   * Replaces .profile-card, .entry-card, .event-card, .setting-row, etc.
   */
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'elevated' | 'accent' | 'ghost';
  type Padding = 'space-0' | 'space-2' | 'space-3' | 'space-4' | 'space-5' | 'space-6';

  interface Props {
    variant?: Variant;
    padding?: Padding;
    as?: keyof HTMLElementTagNameMap;
    interactive?: boolean;
    class?: string;
    onclick?: () => void;
    href?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    padding = 'space-5',
    as = 'div',
    interactive = false,
    class: className = '',
    onclick,
    href,
    children,
  }: Props = $props();

  const isInteractive = $derived(interactive || onclick !== undefined || href !== undefined);
</script>

{#if href && isInteractive}
  <a class="card card-{variant} interactive {className}" {href} style="padding: var(--ccrpg-{padding});">
    {@render children()}
  </a>
{:else if onclick && isInteractive}
  <svelte:element
    this={as}
    class="card card-{variant} interactive {className}"
    style="padding: var(--ccrpg-{padding});"
    onclick={onclick}
    role="button"
    tabindex="0"
  >
    {@render children()}
  </svelte:element>
{:else}
  <svelte:element this={as} class="card card-{variant} {className}" style="padding: var(--ccrpg-{padding});">
    {@render children()}
  </svelte:element>
{/if}

<style>
  .card {
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius-lg);
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease),
                border-color var(--ccrpg-duration-fast) var(--ccrpg-ease),
                box-shadow var(--ccrpg-duration-fast) var(--ccrpg-ease),
                transform var(--ccrpg-duration-instant) var(--ccrpg-ease);
  }

  .card-elevated {
    background: var(--ccrpg-surface-elevated);
    box-shadow: var(--ccrpg-shadow-md);
  }

  .card-accent {
    border-top: 2px solid var(--ccrpg-accent);
  }

  .card-ghost {
    background: transparent;
    border-color: transparent;
  }

  .interactive {
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .interactive:hover {
    background: var(--ccrpg-surface-elevated);
    border-color: var(--ccrpg-accent);
    box-shadow: var(--ccrpg-shadow-md);
  }
  .interactive:active {
    transform: scale(0.99);
  }
  .interactive:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: 2px;
  }
</style>
