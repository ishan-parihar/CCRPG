<script lang="ts">
  /**
   * /codex route — browse unlocked codex entries.
   *
   * Replaces Phaser CodexScene. Read-only view of Significator.codexEntries.
   * Veil-compliant.
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { gameStore, setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import type { CodexEntry } from '$core/domain/SharedTypes.js';

  const sig = $derived($gameStore.significator);
  const entries = $derived((sig?.codexEntries ?? []) as readonly CodexEntry[]);
  let selectedId = $state<string | null>(null);
  const selected = $derived(entries.find((e) => e.id === selectedId) ?? null);

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
</script>

<Seo
  title="Codex"
  description="Browse unlocked codex entries — knowledge discovered during your journey."
  indexable={false}
/>

<div class="codex-route" in:stageFade>
  <header class="route-header">
    <BackButton href="/" label="Menu" />
    <h1>Codex</h1>
  </header>

  <main class="route-content">
    {#if !sig}
      <p class="empty-state">No save found. Enter the world to discover knowledge.</p>
    {:else if entries.length === 0}
      <p class="empty-state">
        No entries unlocked yet.<br />
        Explore the world to discover knowledge.
      </p>
    {:else}
      <ul class="entry-list">
        {#each entries as entry}
          <li>
            <button
              class="entry-card"
              class:selected={selectedId === entry.id}
              onclick={() => (selectedId = selectedId === entry.id ? null : entry.id)}
              aria-expanded={selectedId === entry.id}
            >
              <h3 class="entry-title">{entry.title}</h3>
              {#if selectedId === entry.id}
                <p class="entry-body">{entry.body}</p>
                <span class="entry-date">Discovered {formatDate(entry.unlockedAtMs)}</span>
              {:else}
                <span class="entry-preview">{entry.body.slice(0, 80)}…</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>

<style>
  .codex-route {
    min-height: 100vh;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 1rem;
    padding-top: calc(1rem + env(safe-area-inset-top, 0px));
    overflow-y: auto;
    touch-action: pan-y;
  }

  .route-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .route-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .route-content {
    max-width: 600px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .empty-state {
    color: var(--ccrpg-fg-muted, #a89080);
    font-style: italic;
    text-align: center;
    padding: 3rem 1rem;
    line-height: 1.6;
  }

  .entry-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .entry-card {
    width: 100%;
    text-align: left;
    padding: 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius, 6px);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    cursor: pointer;
    transition: border-color var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease),
                background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .entry-card:hover {
    border-color: var(--ccrpg-accent, #b8252a);
    background: var(--ccrpg-surface-elevated, #261818);
  }

  .entry-card.selected {
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .entry-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 0.5rem 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .entry-preview {
    font-size: 0.875rem;
    color: var(--ccrpg-fg-muted, #a89080);
    line-height: 1.5;
  }

  .entry-body {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--ccrpg-fg, #e7eaf2);
    margin: 0 0 0.75rem 0;
  }

  .entry-date {
    font-size: 0.75rem;
    color: var(--ccrpg-fg-muted, #a89080);
  }
</style>
