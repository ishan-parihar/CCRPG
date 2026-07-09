<script lang="ts">
  /**
   * Container — max-width wrapper for route content.
   * Centers content and applies horizontal padding.
   */
  import type { Snippet } from 'svelte';

  type Width = 'narrow' | 'content' | 'wide';
  interface Props {
    width?: Width;
    as?: keyof HTMLElementTagNameMap;
    class?: string;
    children: Snippet;
  }

  let { width = 'content', as = 'div', class: className = '', children }: Props = $props();

  const tag = $derived(as);
  const maxWidthClass = $derived(
    width === 'narrow' ? 'container-narrow' :
    width === 'wide' ? 'container-wide' :
    'container-content'
  );
</script>

<svelte:element
  this={tag}
  class="container {maxWidthClass} {className}"
>
  {@render children()}
</svelte:element>

<style>
  .container {
    width: 100%;
    margin-inline: auto;
    padding-inline: var(--ccrpg-route-padding);
  }
  .container-narrow { max-width: var(--ccrpg-content-max-width-narrow); }
  .container-content { max-width: var(--ccrpg-content-max-width); }
  .container-wide { max-width: var(--ccrpg-content-max-width-wide); }
</style>
