<script lang="ts">
  /**
   * Grid — responsive CSS grid with breakpoint-aware column counts.
   */
  import type { Snippet } from 'svelte';

  type Gap = 'space-0' | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'space-5' | 'space-6';

  interface Props {
    cols?: { mobile?: number; tablet?: number; desktop?: number };
    gap?: Gap;
    as?: keyof HTMLElementTagNameMap;
    class?: string;
    children: Snippet;
  }

  let {
    cols = { mobile: 1, tablet: 2, desktop: 3 },
    gap = 'space-4',
    as = 'div',
    class: className = '',
    children,
  }: Props = $props();

  const style = $derived(
    `gap: var(--ccrpg-${gap}); grid-template-columns: repeat(${cols.mobile}, 1fr);`
  );
</script>

<svelte:element this={as} class="grid {className}" {style}>
  {@render children()}
</svelte:element>

<style>
  .grid {
    display: grid;
  }
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(var(--cols-tablet, 2), 1fr) !important;
    }
  }
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(var(--cols-desktop, 3), 1fr) !important;
    }
  }
</style>
