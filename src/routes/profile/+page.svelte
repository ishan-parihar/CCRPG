<script lang="ts">
  /**
   * /profile route — developmental radial chart.
   *
   * Replaces Phaser RadialChartScene. Pure SVG radar chart (no D3
   * dependency). 8 spokes (one per Line of Intelligence) × 8 concentric
   * rings (one per Stage). Veil-compliant: no raw stage labels on the
   * chart — only qualitative descriptions below.
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import VeiledStat from '$lib/components/VeiledStat.svelte';
  import { gameStore, setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { describeStage, describeDriveSpread, describeCCI } from '$core/presentation/veilDescriptors.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import { ALL_LINES } from '$core/domain/Line.js';
  import { ALL_STAGES, stageOrdinal } from '$core/domain/Stage.js';
  import type { Line } from '$core/domain/Line.js';
  import type { Stage } from '$core/domain/Stage.js';
  import type { Significator } from '$core/domain/Significator.js';

  const sig = $derived($gameStore.significator);

  onMount(() => {
    if (!browser) return;
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) setSignificator(loaded);
    }
  });

  // Chart geometry
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  const ringCount = ALL_STAGES.length; // 8

  /** Compute SVG point for a line + stage. */
  function point(lineIndex: number, stageIdx: number): { x: number; y: number } {
    const angle = (lineIndex / ALL_LINES.length) * Math.PI * 2 - Math.PI / 2;
    const r = (stageIdx / (ringCount - 1)) * maxRadius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  /** Build the polygon path for the player's altitude profile. */
  const profilePath = $derived.by(() => {
    if (!sig) return '';
    const pts = ALL_LINES.map((line, i) => {
      const stage = sig.altitudes[line as Line] ?? 'Infrared';
      const ord = stageOrdinal(stage as Stage);
      const p = point(i, ord);
      return `${p.x},${p.y}`;
    });
    return `M ${pts.join(' L ')} Z`;
  });

  /** Veil-compliant qualitative label per line (no raw stage name). */
  function lineDescriptor(line: Line): string {
    if (!sig) return '';
    const stage = sig.altitudes[line] ?? 'Infrared';
    return describeStage(stage as Stage);
  }

  // CCI score for the descriptor (if available)
  const cciDescriptor = $derived(sig ? describeCCI(0.5) : ''); // placeholder — CCI computed elsewhere
</script>

<Seo
  title="Developmental Profile"
  description="View your 8-line developmental shape — a radar chart of your current capacities."
  indexable={false}
/>

<div class="profile-route" in:stageFade>
  <header class="route-header">
    <BackButton href="/" label="Menu" />
    <h1>Developmental Profile</h1>
  </header>

  <main class="route-content">
    {#if !sig}
      <p class="empty-state">No save found. Enter the world to begin your developmental journey.</p>
    {:else}
      <!-- SVG Radar Chart -->
      <div class="chart-container">
        <svg viewBox="0 0 {size} {size}" class="radar-chart" role="img" aria-label="Developmental radar chart showing 8 lines of intelligence">
          <!-- Concentric rings -->
          {#each Array(ringCount) as _, ringIdx}
            <polygon
              points={ALL_LINES.map((_, lineIdx) => {
                const p = point(lineIdx, ringIdx);
                return `${p.x},${p.y}`;
              }).join(' ')}
              class="ring"
              fill="none"
              stroke="var(--ccrpg-border)"
              stroke-width={ringIdx === ringCount - 1 ? 1.5 : 0.75}
              opacity={0.3 + ringIdx * 0.05}
            />
          {/each}

          <!-- Spokes -->
          {#each ALL_LINES as _, lineIdx}
            <line
              x1={cx}
              y1={cy}
              x2={point(lineIdx, ringCount - 1).x}
              y2={point(lineIdx, ringCount - 1).y}
              class="spoke"
              stroke="var(--ccrpg-border)"
              stroke-width="0.5"
              opacity="0.3"
            />
          {/each}

          <!-- Player profile polygon -->
          <path d={profilePath} class="profile-shape" fill="var(--ccrpg-accent)" fill-opacity="0.15" stroke="var(--ccrpg-accent)" stroke-width="2" />

          <!-- Profile vertices -->
          {#each ALL_LINES as line, lineIdx}
            {@const stage = sig.altitudes[line as Line] ?? 'Infrared'}
            {@const ord = stageOrdinal(stage as Stage)}
            {@const p = point(lineIdx, ord)}
            <circle cx={p.x} cy={p.y} r="4" fill="var(--ccrpg-accent)" stroke="var(--ccrpg-bg)" stroke-width="1.5" />
          {/each}

          <!-- Line labels (abbreviated, Veil-compliant) -->
          {#each ALL_LINES as line, lineIdx}
            {@const p = point(lineIdx, ringCount - 1)}
            {@const angle = (lineIdx / ALL_LINES.length) * 360 - 90}
            {@const labelR = maxRadius + 20}
            {@const lp = {
              x: cx + labelR * Math.cos((angle * Math.PI) / 180),
              y: cy + labelR * Math.sin((angle * Math.PI) / 180),
            }}
            <text
              x={lp.x}
              y={lp.y}
              text-anchor="middle"
              dominant-baseline="middle"
              class="line-label"
              fill="var(--ccrpg-fg-muted)"
              font-size="9"
              font-family="var(--ccrpg-font-body)"
            >
              {line.slice(0, 4)}
            </text>
          {/each}
        </svg>
      </div>

      <!-- Qualitative descriptors (Veil-compliant) -->
      <section class="descriptors">
        <VeiledStat descriptor={`The world feels ${describeStage(sig.currentStage)}.`} label="World" variant="accent" />
        <VeiledStat descriptor={describeDriveSpread(sig.drives.weights)} label="Tendencies" variant="muted" />
      </section>

      <!-- Per-line qualitative descriptors -->
      <section class="line-descriptors">
        <h2>Capacities</h2>
        <ul>
          {#each ALL_LINES as line}
            <li class="line-row">
              <span class="line-name">{line}</span>
              <span class="line-desc">{lineDescriptor(line)}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </main>
</div>

<style>
  .profile-route {
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
    margin-bottom: 1.5rem;
  }

  .route-header h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .route-content {
    max-width: 500px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .empty-state {
    color: var(--ccrpg-fg-muted, #a89080);
    font-style: italic;
    text-align: center;
    padding: 3rem 1rem;
  }

  .chart-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .radar-chart {
    width: 100%;
    max-width: 360px;
    height: auto;
  }

  .descriptors {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    margin-bottom: 2rem;
  }

  .line-descriptors h2 {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 1rem 0;
  }

  .line-descriptors ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .line-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.625rem 0.875rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.2));
    border-radius: var(--ccrpg-radius, 6px);
  }

  .line-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ccrpg-fg, #e7eaf2);
    flex-shrink: 0;
  }

  .line-desc {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    font-style: italic;
    text-align: right;
  }
</style>
