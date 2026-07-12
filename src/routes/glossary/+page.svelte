<script lang="ts">
  /**
   * /glossary route — definitions for CCRPG terminology.
   * Parity with CLI `ccrpg glossary` command.
   * ponytail: consumes shared GLOSSARY_TERMS from src/core/data/glossary.ts.
   */
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import { GLOSSARY_TERMS } from '$core/data/glossary.js';

  let search = $state('');
  const filtered = $derived(
    search.trim() === ''
      ? GLOSSARY_TERMS
      : GLOSSARY_TERMS.filter((t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.def.toLowerCase().includes(search.toLowerCase())
        )
  );
</script>

<Seo
  title="Glossary"
  description="Definitions for CCRPG terminology — Holon, Significator, Line, Stage, Module, Modality, CCI, and more."
/>

<RouteShell title="Glossary" back="/">
  <Stack gap="space-4">
    <input
      class="search-input"
      type="text"
      placeholder="Search terms..."
      value={search}
      oninput={(e) => (search = e.currentTarget.value)}
      aria-label="Search glossary"
    />

    {#if filtered.length === 0}
      <Card padding="space-5">
        <p class="empty">No terms match "{search}".</p>
      </Card>
    {:else}
      <Stack gap="space-2">
        {#each filtered as entry (entry.term)}
          <Card padding="space-4" variant="default">
            <div class="term-entry">
              <h3 class="term-name">{entry.term}</h3>
              <p class="term-def">{entry.def}</p>
            </div>
          </Card>
        {/each}
      </Stack>
    {/if}

    <p class="footer-note">
      For the full theoretical foundation, see the docs/foundations/ directory.
    </p>
  </Stack>
</RouteShell>

<style>
  .search-input {
    width: 100%;
    padding: var(--ccrpg-space-3) var(--ccrpg-space-4);
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius);
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    transition: border-color var(--ccrpg-duration-fast) var(--ccrpg-ease),
                box-shadow var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--ccrpg-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ccrpg-accent) 20%, transparent);
  }

  .search-input::placeholder {
    color: var(--ccrpg-fg-muted);
  }

  .term-entry {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .term-name {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-md);
    font-weight: 600;
    color: var(--ccrpg-accent);
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .term-def {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    line-height: var(--ccrpg-leading-relaxed);
    color: var(--ccrpg-fg);
    margin: 0;
  }

  .empty {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    font-style: italic;
    text-align: center;
    margin: 0;
  }

  .footer-note {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    font-style: italic;
    margin: 0;
  }
</style>
