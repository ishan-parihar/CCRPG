<script lang="ts">
  /**
   * Spinner — stage-aware loading indicator.
   */
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { size = 'md', class: className = '' }: Props = $props();
</script>

<div class="spinner spinner-{size} {className}" role="status" aria-label="Loading">
  <span class="sr-only">Loading…</span>
</div>

<style>
  .spinner {
    border: 2px solid var(--ccrpg-border);
    border-top-color: var(--ccrpg-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .spinner-sm { width: 1rem; height: 1rem; border-width: 1.5px; }
  .spinner-md { width: 1.75rem; height: 1.75rem; border-width: 2px; }
  .spinner-lg { width: 2.5rem; height: 2.5rem; border-width: 3px; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 1.5s;
    }
  }
</style>
