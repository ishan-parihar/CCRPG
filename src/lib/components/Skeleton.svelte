<script lang="ts">
  /**
   * Skeleton — loading placeholder. For future route-level loading states.
   */
  type Variant = 'text' | 'rect' | 'circle';

  interface Props {
    variant?: Variant;
    width?: string;
    height?: string;
    class?: string;
  }

  let { variant = 'text', width = '100%', height = '1em', class: className = '' }: Props = $props();
</script>

<div
  class="skeleton skeleton-{variant} {className}"
  style="width: {width}; height: {height};"
  role="status"
  aria-label="Loading"
></div>

<style>
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--ccrpg-surface) 0%,
      var(--ccrpg-surface-elevated) 50%,
      var(--ccrpg-surface) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: var(--ccrpg-radius-sm);
  }

  .skeleton-text { border-radius: var(--ccrpg-radius-sm); }
  .skeleton-rect { border-radius: var(--ccrpg-radius); }
  .skeleton-circle { border-radius: 50%; }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (prefers-reduced-motion: reduce), [data-motion="reduced"] {
    .skeleton {
      animation: none;
      background: var(--ccrpg-surface);
    }
  }
</style>
