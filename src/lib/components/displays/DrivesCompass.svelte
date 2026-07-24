<script lang="ts">
  /**
   * DrivesCompass — 4-drive balance visualization with fixation indicator.
   * Parity with CLI renderDrives. Veil-compliant: qualitative bands, not raw numbers.
   */
  import type { Significator } from '$core/domain/Significator.js';

  interface Props {
    drives: Significator['drives'];
  }

  let { drives }: Props = $props();

  const DRIVE_NAMES = ['Agency', 'Communion', 'Eros', 'Agape'] as const;
  const DRIVE_LABELS: Record<string, string> = {
    Agency: 'Agency',
    Communion: 'Communion',
    Eros: 'Eros',
    Agape: 'Agape',
  };

  function weightBand(w: number): { label: string; color: string } {
    if (w > 0.6) return { label: 'dominant', color: 'var(--mysterium-accent)' };
    if (w > 0.35) return { label: 'active', color: 'var(--mysterium-fg)' };
    return { label: 'quiet', color: 'var(--mysterium-fg-muted)' };
  }

  function fixationLabel(fix: number): { icon: string; label: string } | null {
    if (fix > 0.7) return { icon: '⚠', label: 'fixated' };
    if (fix > 0.4) return { icon: '~', label: 'tending' };
    return null;
  }

  const maxVal = $derived(Math.max(1, ...DRIVE_NAMES.map((d) => drives.weights[d] ?? 0)));
</script>

<div class="drives-compass">
  {#each DRIVE_NAMES as drive (drive)}
    {@const w = drives.weights[drive] ?? 0}
    {@const fix = drives.fixationRisk[drive] ?? 0}
    {@const wb = weightBand(w)}
    {@const fl = fixationLabel(fix)}
    {@const filled = Math.max(0, Math.round((w / maxVal) * 8))}
    <div class="drive-row">
      <span class="drive-name">{DRIVE_LABELS[drive]}</span>
      <span class="drive-bar" aria-hidden="true">
        {#each Array(8) as _, i}
          <span class="drive-cell" class:filled={i < filled} style="background: {i < filled ? wb.color : 'var(--mysterium-surface)'}"></span>
        {/each}
      </span>
      <span class="drive-band" style="color: {wb.color}">{wb.label}</span>
      {#if fl}
        <span class="drive-fix" title="Fixation risk: {fl.label}">{fl.icon} {fl.label}</span>
      {:else}
        <span class="drive-fix placeholder"></span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .drives-compass {
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
  }

  .drive-row {
    display: grid;
    grid-template-columns: 5rem 1fr 4rem 5rem;
    align-items: center;
    gap: var(--mysterium-space-2);
  }

  .drive-name {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg);
    font-weight: 500;
  }

  .drive-bar {
    display: flex;
    gap: 2px;
    height: 12px;
  }

  .drive-cell {
    flex: 1;
    border-radius: 2px;
    transition: background var(--mysterium-duration-fast) var(--mysterium-ease);
  }

  .drive-band {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    text-align: right;
    font-style: italic;
  }

  .drive-fix {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-warning);
    text-align: right;
  }

  .drive-fix.placeholder {
    color: transparent;
  }
</style>
