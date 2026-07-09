<script lang="ts">
  /**
   * Accordion — accessible expandable list.
   * Replaces /codex hand-rolled expandable cards.
   *
   * Each item has a button (aria-expanded) that toggles a panel (aria-controls).
   */
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  interface AccordionItem {
    id: string;
    title: string;
    subtitle?: string;
  }

  interface Props {
    items: readonly AccordionItem[];
    multiple?: boolean;
    class?: string;
    children: Snippet[]; // one snippet per item, renders the panel content
  }

  let { items, multiple = false, class: className = '', children }: Props = $props();

  let openItems: Set<string> = $state(new Set());

  function toggle(id: string) {
    const next = new Set(multiple ? openItems : []);
    if (openItems.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    openItems = next;
  }
</script>

<div class="accordion {className}">
  {#each items as item, i (item.id)}
    <div class="accordion-item" class:open={openItems.has(item.id)}>
      <button
        class="accordion-trigger"
        aria-expanded={openItems.has(item.id)}
        aria-controls={`panel-${item.id}`}
        onclick={() => toggle(item.id)}
      >
        <span class="accordion-title">{item.title}</span>
        {#if item.subtitle}<span class="accordion-subtitle">{item.subtitle}</span>{/if}
        <span class="accordion-icon" aria-hidden="true">▾</span>
      </button>
      {#if openItems.has(item.id)}
        <div
          class="accordion-panel"
          id={`panel-${item.id}`}
          role="region"
          transition:fade={{ duration: 180 }}
        >
          {@render children[i]?.()}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .accordion {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .accordion-item {
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius-lg);
    overflow: hidden;
    transition: border-color var(--ccrpg-duration-fast) var(--ccrpg-ease);
  }

  .accordion-item.open {
    border-color: var(--ccrpg-accent);
  }

  .accordion-trigger {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-3);
    width: 100%;
    padding: var(--ccrpg-space-4) var(--ccrpg-space-5);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    font-weight: 500;
    -webkit-tap-highlight-color: transparent;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease);
  }

  .accordion-trigger:hover {
    background: var(--ccrpg-surface-elevated);
  }

  .accordion-trigger:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: -2px;
  }

  .accordion-title {
    flex: 1;
  }

  .accordion-subtitle {
    color: var(--ccrpg-fg-muted);
    font-size: var(--ccrpg-text-sm);
  }

  .accordion-icon {
    transition: transform var(--ccrpg-duration-base) var(--ccrpg-ease);
    color: var(--ccrpg-fg-muted);
  }

  .accordion-item.open .accordion-icon {
    transform: rotate(180deg);
    color: var(--ccrpg-accent);
  }

  .accordion-panel {
    padding: 0 var(--ccrpg-space-5) var(--ccrpg-space-5);
    color: var(--ccrpg-fg);
    line-height: var(--ccrpg-leading-relaxed);
  }
</style>
