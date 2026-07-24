<script lang="ts">
  /**
   * StageTransitionOverlay — full-screen visual overlay when a stage transformation fires.
   * Shows the stage aesthetic transition, then auto-dismisses.
   * ponytail: D — parity with CLI's transformation notification (info('transformation', ...)).
   */
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { describeStage } from '$core/presentation/veilDescriptors.js';

  interface Props {
    signal: { fromStage: string; toStage: string; readiness: number };
    oncomplete: () => void;
  }

  let { signal, oncomplete }: Props = $props();

  const fromAesthetic = $derived(describeStage(signal.fromStage as never));
  const toAesthetic = $derived(describeStage(signal.toStage as never));

  let timer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    // Auto-dismiss after 3s
    timer = setTimeout(() => oncomplete(), 3000);
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<div
  class="stage-transition-overlay"
  in:fade={{ duration: 300 }}
  out:fade={{ duration: 600 }}
  role="alert"
  aria-live="assertive"
  aria-label="Stage transformation"
>
  <div class="transition-content" in:scale={{ duration: 800, start: 0.9, opacity: 0 }}>
    <div class="transition-icon" aria-hidden="true">✦</div>
    <p class="transition-label">The world shifts</p>
    <p class="transition-from">{fromAesthetic}</p>
    <div class="transition-arrow" aria-hidden="true">→</div>
    <p class="transition-to">{toAesthetic}</p>
  </div>
</div>

<style>
  .stage-transition-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--mysterium-z-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--mysterium-bg) 90%, transparent);
    backdrop-filter: blur(8px);
    cursor: pointer;
  }

  .transition-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--mysterium-space-3);
    text-align: center;
    padding: var(--mysterium-space-8);
  }

  .transition-icon {
    font-size: var(--mysterium-text-3xl);
    color: var(--mysterium-accent);
    animation: transition-pulse 1.5s var(--mysterium-ease) infinite;
  }

  @keyframes transition-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }

  .transition-label {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-xl);
    font-weight: 700;
    color: var(--mysterium-accent);
    letter-spacing: var(--mysterium-tracking-wider);
    text-transform: uppercase;
    margin: 0;
  }

  .transition-from {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-md);
    color: var(--mysterium-fg-muted);
    font-style: italic;
    margin: 0;
    opacity: 0.6;
  }

  .transition-arrow {
    font-size: var(--mysterium-text-xl);
    color: var(--mysterium-accent);
    animation: arrow-pulse 1s var(--mysterium-ease) infinite;
  }

  @keyframes arrow-pulse {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }

  .transition-to {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-lg);
    color: var(--mysterium-fg);
    font-style: italic;
    margin: 0;
  }
</style>
