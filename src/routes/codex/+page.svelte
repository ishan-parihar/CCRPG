<script lang="ts">
  /**
   * /codex route — browse unlocked codex entries.
   * Read-only view of Significator.codexEntries. Veil-compliant.
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import { fade } from 'svelte/transition';
  import Icon from '$lib/components/Icon.svelte';
  import { gameStore, setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import type { CodexEntry } from '$core/domain/SharedTypes.js';

  const sig = $derived($gameStore.significator);
  const entries = $derived((sig?.codexEntries ?? []) as readonly CodexEntry[]);

  let expandedId: string | null = $state(null);

  onMount(() => {
    if (!browser) return;
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) setSignificator(loaded);
    }
  });

  function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function toggle(id: string) {
    expandedId = expandedId === id ? null : id;
  }
</script>

<Seo
  title="Codex"
  description="Browse unlocked codex entries — knowledge discovered during your journey."
  indexable={false}
/>

<RouteShell title="Codex" back="/">
  {#if !sig}
    <p class="empty-state">No save found. Enter the world to discover knowledge.</p>
  {:else if entries.length === 0}
    <p class="empty-state">
      No entries unlocked yet.<br />
      Explore the world to discover knowledge.
    </p>
  {:else}
    <Stack gap="space-3">
      {#each entries as entry (entry.id)}
        <Card padding="space-0" variant="default">
          <button
            class="entry-trigger"
            aria-expanded={expandedId === entry.id}
            aria-controls={`panel-${entry.id}`}
            onclick={() => toggle(entry.id)}
          >
            <span class="entry-title">{entry.title}</span>
            <span class="entry-icon" class:expanded={expandedId === entry.id} aria-hidden="true">
              <Icon name="chevron-down" size={18} />
            </span>
          </button>
          {#if expandedId === entry.id}
            <div class="entry-panel" id={`panel-${entry.id}`} role="region" transition:fade={{ duration: 180 }}>
              <p class="entry-body">{entry.body}</p>
              <span class="entry-date">Discovered {formatDate(entry.unlockedAtMs)}</span>
            </div>
          {:else}
            <div class="entry-preview">
              <span class="preview-text">{entry.body.slice(0, 100)}…</span>
            </div>
          {/if}
        </Card>
      {/each}
    </Stack>
  {/if}
</RouteShell>

<style>
  .empty-state {
    color: var(--ccrpg-fg-muted);
    font-style: italic;
    text-align: center;
    padding: var(--ccrpg-space-7) var(--ccrpg-space-4);
    line-height: var(--ccrpg-leading-relaxed);
  }

  .entry-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ccrpg-space-3);
    width: 100%;
    padding: var(--ccrpg-space-4) var(--ccrpg-space-5);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    -webkit-tap-highlight-color: transparent;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease);
  }

  .entry-trigger:hover {
    background: var(--ccrpg-surface-elevated);
  }

  .entry-trigger:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: -2px;
  }

  .entry-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-base);
    font-weight: 600;
    color: var(--ccrpg-accent);
  }

  .entry-icon {
    color: var(--ccrpg-fg-muted);
    transition: transform var(--ccrpg-duration-base) var(--ccrpg-ease);
    display: flex;
    align-items: center;
  }

  .entry-icon.expanded {
    transform: rotate(180deg);
    color: var(--ccrpg-accent);
  }

  .entry-panel {
    padding: 0 var(--ccrpg-space-5) var(--ccrpg-space-4);
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .entry-body {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    line-height: var(--ccrpg-leading-relaxed);
    color: var(--ccrpg-fg);
    margin: 0;
  }

  .entry-date {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
  }

  .entry-preview {
    padding: 0 var(--ccrpg-space-5) var(--ccrpg-space-3);
  }

  .preview-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    line-height: var(--ccrpg-leading-normal);
  }
</style>
