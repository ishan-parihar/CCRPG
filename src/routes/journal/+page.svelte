<script lang="ts">
  /**
   * /journal route — player journal: codex entries + vows.
   *
   * Replaces Phaser JournalScene. Read-only view of Significator data.
   * Veil-compliant: no raw numbers, no stage labels.
   */

  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { gameStore } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { describeEncounterCount, describeSessionCount } from '$core/presentation/veilDescriptors.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import type { CodexEntry, Vow } from '$core/domain/SharedTypes.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const sig = $derived($gameStore.significator);
  const entries = $derived((sig?.codexEntries ?? []) as readonly CodexEntry[]);
  const vows = $derived((sig?.vows ?? []) as readonly Vow[]);

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
  title="Journal"
  description="Your CCRPG journal — codex entries discovered and vows made."
  indexable={false}
/>

<div class="journal-route" in:stageFade>
  <header class="route-header">
    <BackButton href="/" label="Menu" />
    <h1>Journal</h1>
  </header>

  <main class="route-content">
    {#if !sig}
      <p class="empty-state">No save found. Enter the world to begin your journey.</p>
    {:else}
      <section class="summary">
        <p class="summary-line">{describeEncounterCount(sig.totalEncounters)}</p>
        <p class="summary-line muted">{describeSessionCount(sig.totalSessions)}</p>
      </section>

      <section class="vows-section">
        <h2>Vows</h2>
        {#if vows.length === 0}
          <p class="empty-section">No vows made yet.</p>
        {:else}
          <ul class="vow-list">
            {#each vows as vow}
              <li class="vow-item" class:fulfilled={vow.fulfilled}>
                <p class="vow-text">{vow.text}</p>
                <span class="vow-date">{formatDate(vow.createdAtMs)}</span>
                {#if vow.fulfilled}
                  <span class="vow-badge">fulfilled</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="entries-section">
        <h2>Codex Entries</h2>
        {#if entries.length === 0}
          <p class="empty-section">No entries yet. Explore the world.</p>
        {:else}
          <ul class="entry-list">
            {#each entries as entry}
              <li class="entry-item">
                <h3>{entry.title}</h3>
                <p class="entry-body">{entry.body}</p>
                <span class="entry-date">{formatDate(entry.unlockedAtMs)}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}
  </main>
</div>

<style>
  .journal-route {
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
  }

  .summary {
    padding: 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    margin-bottom: 2rem;
  }

  .summary-line {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
  }

  .summary-line:last-child {
    margin-bottom: 0;
  }

  .summary-line.muted {
    font-size: 0.875rem;
    color: var(--ccrpg-fg-muted, #a89080);
  }

  .vows-section,
  .entries-section {
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 1rem 0;
    font-family: var(--ccrpg-font-body, system-ui);
  }

  .empty-section {
    color: var(--ccrpg-fg-muted, #a89080);
    font-style: italic;
    padding: 1rem 0;
  }

  .vow-list,
  .entry-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .vow-item {
    padding: 1rem 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius, 6px);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .vow-item.fulfilled {
    opacity: 0.7;
  }

  .vow-text {
    flex: 1;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .vow-date {
    font-size: 0.75rem;
    color: var(--ccrpg-fg-muted, #a89080);
    white-space: nowrap;
  }

  .vow-badge {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.125rem 0.5rem;
    background: var(--ccrpg-accent-soft, #5a1318);
    color: var(--ccrpg-accent-fg, #ffffff);
    border-radius: var(--ccrpg-radius-sm, 4px);
  }

  .entry-item {
    padding: 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius, 6px);
  }

  .entry-item h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 0.5rem 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .entry-body {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--ccrpg-fg-muted, #a89080);
    margin: 0 0 0.75rem 0;
  }

  .entry-date {
    font-size: 0.75rem;
    color: var(--ccrpg-fg-muted, #a89080);
  }
</style>
