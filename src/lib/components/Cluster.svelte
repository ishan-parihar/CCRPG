<script lang="ts">
  /**
   * Cluster — horizontal flex layout with wrap. For grouping inline elements.
   * Replaces ad-hoc `display:flex; flex-wrap:wrap; gap:0.5rem` blocks.
   */
  import type { Snippet } from 'svelte';

  type Gap = 'space-0' | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'space-5' | 'space-6';
  type Align = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  interface Props {
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    wrap?: boolean;
    as?: keyof HTMLElementTagNameMap;
    class?: string;
    children: Snippet;
  }

  let {
    gap = 'space-2',
    align = 'center',
    justify = 'start',
    wrap = true,
    as = 'div',
    class: className = '',
    children,
  }: Props = $props();

  const style = $derived(
    `gap: var(--mysterium-${gap}); align-items: ${align}; justify-content: ${justify}; flex-wrap: ${wrap ? 'wrap' : 'nowrap'};`
  );
</script>

<svelte:element this={as} class="cluster {className}" {style}>
  {@render children()}
</svelte:element>

<style>
  .cluster {
    display: flex;
    flex-direction: row;
  }
</style>
