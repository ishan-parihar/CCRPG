<script lang="ts">
  /**
   * ShadowsDisplay — active shadow patterns, grouped by quadrant.
   * Parity with CLI renderShadows. Veil-compliant: no clinical labels,
   * shows quadrant + count + severity band.
   */
  import Badge from '$lib/components/Badge.svelte';
  import type { ShadowLedger } from '$core/domain/ShadowLedger.js';

  interface Props {
    shadows: ShadowLedger;
  }

  let { shadows }: Props = $props();

  const active = $derived(shadows.entries.filter((e) => e.resolvedAt === null));

  const QUADRANT_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
    DarkAddiction: 'danger',
    DarkAllergy: 'warning',
    GoldenAddiction: 'info',
    GoldenAllergy: 'default',
  };

  const QUADRANT_LABEL: Record<string, string> = {
    DarkAddiction: 'Clinging',
    DarkAllergy: 'Resisting',
    GoldenAddiction: 'Bypassing',
    GoldenAllergy: 'Refusing',
  };

  function severityBand(severity: number): string {
    if (severity > 0.7) return 'intense';
    if (severity > 0.4) return 'present';
    return 'faint';
  }

  const grouped = $derived.by(() => {
    const groups: Record<string, typeof active> = {};
    for (const s of active) {
      const key = s.quadrant ?? 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return groups;
  });
</script>

<div class="shadows-display">
  {#if active.length === 0}
    <p class="none-active">No active patterns. The field is clear.</p>
  {:else}
    <div class="shadows-summary">
      <span class="count">{active.length} active</span>
    </div>
    <div class="shadows-groups">
      {#each Object.entries(grouped) as [quadrant, entries] (quadrant)}
        <div class="shadow-group">
          <Badge variant={QUADRANT_VARIANT[quadrant] ?? 'default'}>
            {QUADRANT_LABEL[quadrant] ?? quadrant}
            {#if entries.length > 1}×{entries.length}{/if}
          </Badge>
          <span class="severity">{severityBand(Math.max(...entries.map((e) => e.severity)))}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .shadows-display {
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
  }

  .none-active {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
    font-style: italic;
    margin: 0;
  }

  .shadows-summary {
    display: flex;
    align-items: center;
    gap: var(--mysterium-space-2);
  }

  .count {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-warning);
    font-weight: 500;
  }

  .shadows-groups {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mysterium-space-2);
  }

  .shadow-group {
    display: flex;
    align-items: center;
    gap: var(--mysterium-space-2);
  }

  .severity {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-fg-muted);
    font-style: italic;
  }
</style>
