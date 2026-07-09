<script lang="ts">
  /**
   * Badge — small status indicator.
   * For fulfilled-vow badges, status indicators, etc.
   */
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

  interface Props {
    variant?: Variant;
    class?: string;
    children: Snippet;
  }

  let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<span class="badge badge-{variant} {className}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--ccrpg-space-1);
    padding: var(--ccrpg-space-1) var(--ccrpg-space-2);
    border-radius: var(--ccrpg-radius-full);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    font-weight: 600;
    letter-spacing: var(--ccrpg-tracking-wide);
    text-transform: uppercase;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .badge-default {
    background: var(--ccrpg-surface);
    color: var(--ccrpg-fg-muted);
    border-color: var(--ccrpg-border);
  }

  .badge-success {
    background: var(--ccrpg-success-soft);
    color: var(--ccrpg-success-fg);
    border-color: var(--ccrpg-success);
  }

  .badge-warning {
    background: var(--ccrpg-warning-soft);
    color: var(--ccrpg-warning-fg);
    border-color: var(--ccrpg-warning);
  }

  .badge-danger {
    background: var(--ccrpg-danger-soft);
    color: var(--ccrpg-danger-fg);
    border-color: var(--ccrpg-danger);
  }

  .badge-info {
    background: var(--ccrpg-info-soft);
    color: var(--ccrpg-info-fg);
    border-color: var(--ccrpg-info);
  }

  .badge-accent {
    background: var(--ccrpg-accent-soft);
    color: var(--ccrpg-accent-fg);
    border-color: var(--ccrpg-accent);
  }
</style>
