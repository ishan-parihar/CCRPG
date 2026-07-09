<script lang="ts">
  /**
   * Button — shared button component with variants and sizes.
   * Replaces ~12 hand-rolled button classes across routes.
   *
   * Variants: primary | default | muted | danger | ghost
   * Sizes: sm | md | lg
   */
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'default' | 'muted' | 'danger' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    onclick?: (e: MouseEvent) => void;
    href?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    size = 'md',
    onclick,
    href,
    disabled = false,
    loading = false,
    type = 'button',
    ariaLabel,
    class: className = '',
    children,
  }: Props = $props();

  function handleClick(e: MouseEvent) {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onclick?.(e);
  }
</script>

{#if href && !disabled}
  <a
    class="btn btn-{variant} btn-{size} {className}"
    {href}
    {aria-label}
    onclick={handleClick}
  >
    {#if loading}<span class="btn-spinner" aria-hidden="true"></span>{/if}
    <span class="btn-content" class:loading><slot />{@render children()}</span>
  </a>
{:else}
  <button
    class="btn btn-{variant} btn-{size} {className}"
    {type}
    {disabled}
    {aria-label}
    onclick={handleClick}
  >
    {#if loading}<span class="btn-spinner" aria-hidden="true"></span>{/if}
    <span class="btn-content" class:loading>{@render children()}</span>
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ccrpg-space-2);
    border: 1px solid transparent;
    border-radius: var(--ccrpg-radius);
    cursor: pointer;
    font-family: var(--ccrpg-font-body);
    font-weight: 500;
    text-decoration: none;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease),
                border-color var(--ccrpg-duration-fast) var(--ccrpg-ease),
                transform var(--ccrpg-duration-instant) var(--ccrpg-ease),
                box-shadow var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn-sm { padding: var(--ccrpg-space-1) var(--ccrpg-space-3); font-size: var(--ccrpg-text-sm); }
  .btn-md { padding: var(--ccrpg-space-2) var(--ccrpg-space-4); font-size: var(--ccrpg-text-base); }
  .btn-lg { padding: var(--ccrpg-space-3) var(--ccrpg-space-5); font-size: var(--ccrpg-text-md); }

  /* Variants */
  .btn-primary {
    background: var(--ccrpg-accent);
    border-color: var(--ccrpg-accent);
    color: var(--ccrpg-accent-fg);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--ccrpg-accent-soft);
    box-shadow: var(--ccrpg-shadow-glow);
  }

  .btn-default {
    background: var(--ccrpg-surface);
    border-color: var(--ccrpg-border);
    color: var(--ccrpg-fg);
  }
  .btn-default:hover:not(:disabled) {
    background: var(--ccrpg-surface-elevated);
    border-color: var(--ccrpg-accent);
  }

  .btn-muted {
    background: transparent;
    border-color: transparent;
    color: var(--ccrpg-fg-muted);
  }
  .btn-muted:hover:not(:disabled) {
    background: var(--ccrpg-surface);
    border-color: var(--ccrpg-border);
  }

  .btn-danger {
    background: var(--ccrpg-danger);
    border-color: var(--ccrpg-danger);
    color: var(--ccrpg-danger-fg);
  }
  .btn-danger:hover:not(:disabled) {
    background: var(--ccrpg-danger-soft);
    border-color: var(--ccrpg-danger);
    box-shadow: 0 0 24px var(--ccrpg-danger-soft);
  }

  .btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--ccrpg-fg);
  }
  .btn-ghost:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ccrpg-surface) 50%, transparent);
  }

  /* Spinner */
  .btn-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: btn-spin 0.6s linear infinite;
  }
  @keyframes btn-spin {
    to { transform: rotate(360deg); }
  }

  .btn-content.loading {
    opacity: 0.7;
  }
</style>
