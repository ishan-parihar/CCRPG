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
    if (value > 0.7) return { label: 'strong', color: 'var(--mysterium-success)' };
    if (value > 0.4) return { label: 'developing', color: 'var(--mysterium-warning)' };
    return { label: 'emerging', color: 'var(--mysterium-danger)' };
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
    gap: var(--mysterium-space-3);
  }

  .cci-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .cci-label {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-md);
    font-weight: 700;
    color: var(--mysterium-accent);
    letter-spacing: var(--mysterium-tracking-wide);
  }

  .cci-descriptor {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
    font-style: italic;
  }

  .cci-bar {
    width: 100%;
    height: 8px;
    background: var(--mysterium-surface);
    border: 1px solid var(--mysterium-border);
    border-radius: var(--mysterium-radius-full);
    overflow: hidden;
  }

  .cci-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mysterium-accent-soft), var(--mysterium-accent));
    border-radius: var(--mysterium-radius-full);
    transition: width var(--mysterium-duration-slow) var(--mysterium-ease-out);
  }

  .cci-dimensions {
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
  }

  .dim {
    display: grid;
    grid-template-columns: 4rem 1fr 5rem;
    align-items: center;
    gap: var(--mysterium-space-2);
  }

  .dim-label {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-fg-muted);
    text-transform: uppercase;
    letter-spacing: var(--mysterium-tracking-wide);
  }

  .dim-bar {
    height: 4px;
    background: var(--mysterium-surface);
    border-radius: var(--mysterium-radius-full);
    overflow: hidden;
  }

  .dim-bar-fill {
    height: 100%;
    border-radius: var(--mysterium-radius-full);
    transition: width var(--mysterium-duration-slow) var(--mysterium-ease-out);
  }

  .dim-band {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    text-align: right;
    font-style: italic;
  }
</style>
