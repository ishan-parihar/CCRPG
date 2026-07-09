<script lang="ts">
  /**
   * Stack — vertical flex layout with consistent gap.
   * Replaces ad-hoc `display:flex; flex-direction:column; gap:1rem` blocks.
   */
  import type { Snippet } from 'svelte';

  type Gap = 'space-0' | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'space-5' | 'space-6' | 'space-7' | 'space-8';
  type Align = 'start' | 'center' | 'end' | 'stretch';
  type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  interface Props {
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    as?: keyof HTMLElementTagNameMap;
    class?: string;
    children: Snippet;
  }

  let {
    gap = 'space-4',
    align = 'stretch',
    justify = 'start',
    as = 'div',
    class: className = '',
    children,
  }: Props = $props();

  const style = $derived(
    `gap: var(--ccrpg-${gap}); align-items: ${align}; justify-content: ${justify};`
  );
</script>

<svelte:element this={as} class="stack {className}" {style}>
  {@render children()}
</svelte:element>

<style>
  .stack {
    display: flex;
    flex-direction: column;
  }
</style>
