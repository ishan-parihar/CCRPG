<script lang="ts">
  /**
   * CCIDisplay — Veil-compliant CCI visualization.
   * Parity with CLI renderCCIDisplay. Shows composite + 5 dimensions.
   * ponytail: uses qualitative bands (not raw percentages) to respect the Veil.
   */
  import { describeCCI } from '$core/presentation/veilDescriptors.js';

  interface Props {
    composite: number;
    dimensions: {
      altitude: number;
      driveHealth: number;
      polarity: number;
      shadowTopology: number;
      transformationReadiness: number;
    };
  }

  let { composite, dimensions }: Props = $props();

  const descriptor = $derived(describeCCI(composite));

  const DIM_LABELS: Record<string, string> = {
    altitude: 'Altitude',
    driveHealth: 'Drive',
    polarity: 'Polar',
    shadowTopology: 'Shadow',
    transformationReadiness: 'Xform',
  };

  function band(value: number): { label: string; color: string } {
    if (value > 0.7) return { label: 'strong', color: 'var(--ccrpg-success)' };
    if (value > 0.4) return { label: 'developing', color: 'var(--ccrpg-warning)' };
    return { label: 'emerging', color: 'var(--ccrpg-danger)' };
  }
</script>

<div class="cci-display">
  <div class="cci-header">
    <span class="cci-label">CCI</span>
    <span class="cci-descriptor">{descriptor}</span>
  </div>
  <div class="cci-bar" role="progressbar" aria-valuenow={Math.round(composite * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Cumulative Consciousness Index">
    <div class="cci-bar-fill" style="width: {composite * 100}%"></div>
  </div>
  <div class="cci-dimensions">
    {#each Object.entries(dimensions) as [key, value] (key)}
      {@const b = band(value)}
      <div class="dim">
        <span class="dim-label">{DIM_LABELS[key] ?? key}</span>
        <span class="dim-bar" aria-hidden="true">
          <span class="dim-bar-fill" style="width: {value * 100}%; background: {b.color}"></span>
        </span>
        <span class="dim-band" style="color: {b.color}">{b.label}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .cci-display {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-3);
  }

  .cci-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .cci-label {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-md);
    font-weight: 700;
    color: var(--ccrpg-accent);
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .cci-descriptor {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    font-style: italic;
  }

  .cci-bar {
    width: 100%;
    height: 8px;
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius-full);
    overflow: hidden;
  }

  .cci-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--ccrpg-accent-soft), var(--ccrpg-accent));
    border-radius: var(--ccrpg-radius-full);
    transition: width var(--ccrpg-duration-slow) var(--ccrpg-ease-out);
  }

  .cci-dimensions {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .dim {
    display: grid;
    grid-template-columns: 4rem 1fr 5rem;
    align-items: center;
    gap: var(--ccrpg-space-2);
  }

  .dim-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .dim-bar {
    height: 4px;
    background: var(--ccrpg-surface);
    border-radius: var(--ccrpg-radius-full);
    overflow: hidden;
  }

  .dim-bar-fill {
    height: 100%;
    border-radius: var(--ccrpg-radius-full);
    transition: width var(--ccrpg-duration-slow) var(--ccrpg-ease-out);
  }

  .dim-band {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    text-align: right;
    font-style: italic;
  }
</style>
