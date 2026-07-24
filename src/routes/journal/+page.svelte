<script lang="ts">
  /**
   * /journal route — player journal: codex entries + vows.
   * Read-only view of Significator data. Veil-compliant.
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import { gameStore, setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { describeEncounterCount, describeSessionCount } from '$core/presentation/veilDescriptors.js';
  import type { CodexEntry, Vow } from '$core/domain/SharedTypes.js';

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
  description="Your Mysterium journal — codex entries discovered and vows made."
  indexable={false}
/>

<RouteShell title="Journal" back="/">
  {#if !sig}
    <p class="empty-state">No save found. Enter the world to begin your journey.</p>
  {:else}
    <Stack gap="space-5">
      <Card variant="accent" padding="space-5">
        <Stack gap="space-1">
          <p class="summary-line">{describeEncounterCount(sig.totalEncounters)}</p>
          <p class="summary-line muted">{describeSessionCount(sig.totalSessions)}</p>
        </Stack>
      </Card>

      <Stack gap="space-3">
        <h2 class="section-title">Vows</h2>
        {#if vows.length === 0}
          <Card padding="space-5"><p class="empty-section">No vows made yet.</p></Card>
        {:else}
          <Card padding="space-0">
            <ul class="item-list" role="list">
              {#each vows as vow, i}
                <li class="item vow-item" class:fulfilled={vow.fulfilled} class:divider={i > 0}>
                  <p class="item-text">{vow.text}</p>
                  <div class="item-meta">
                    <span class="item-date">{formatDate(vow.createdAtMs)}</span>
                    {#if vow.fulfilled}
                      <Badge variant="success">fulfilled</Badge>
                    {/if}
                  </div>
                </li>
              {/each}
            </ul>
          </Card>
        {/if}
      </Stack>

      <Stack gap="space-3">
        <h2 class="section-title">Codex Entries</h2>
        {#if entries.length === 0}
          <Card padding="space-5"><p class="empty-section">No entries yet. Explore the world.</p></Card>
        {:else}
          <Card padding="space-0">
            <ul class="item-list" role="list">
              {#each entries as entry, i}
                <li class="item" class:divider={i > 0}>
                  <h3 class="item-title">{entry.title}</h3>
                  <p class="item-body">{entry.body}</p>
                  <span class="item-date">{formatDate(entry.unlockedAtMs)}</span>
                </li>
              {/each}
            </ul>
          </Card>
        {/if}
      </Stack>
    </Stack>
  {/if}
</RouteShell>

<style>
  .empty-state {
    color: var(--mysterium-fg-muted);
    font-style: italic;
    text-align: center;
    padding: var(--mysterium-space-7) var(--mysterium-space-4);
  }

  .summary-line {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-base);
    color: var(--mysterium-fg);
    margin: 0;
  }

  .summary-line.muted {
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
    font-style: italic;
  }

  .section-title {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--mysterium-tracking-wider);
    color: var(--mysterium-accent);
    margin: 0;
  }

  .empty-section {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
    font-style: italic;
    text-align: center;
    margin: 0;
  }

  .item-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .item {
    padding: var(--mysterium-space-4) var(--mysterium-space-5);
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
  }

  .item.divider {
    border-top: 1px solid var(--mysterium-border);
  }

  .item-text {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-base);
    color: var(--mysterium-fg);
    line-height: var(--mysterium-leading-normal);
    margin: 0;
  }

  .item-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--mysterium-space-3);
  }

  .item-date {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-fg-muted);
  }

  .vow-item.fulfilled {
    opacity: 0.7;
  }

  .item-title {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-md);
    font-weight: 600;
    color: var(--mysterium-fg);
    margin: 0;
  }

  .item-body {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
    line-height: var(--mysterium-leading-relaxed);
    margin: 0;
  }
</style>
