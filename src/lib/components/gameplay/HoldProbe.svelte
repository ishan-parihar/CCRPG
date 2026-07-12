<script lang="ts">
  /**
   * HoldProbe — timing-accuracy probe for Somatic + Willpower lines.
   * Parity with CLI hold probe (runQuickCalibration for Somatic/Willpower).
   * ponytail: measures how accurately the player estimates a time interval.
   */
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    line: 'Somatic' | 'Willpower';
    targetMs: number;
    oncomplete: (accuracy: number) => void;
  }

  let { line, targetMs, oncomplete }: Props = $props();

  type Phase = 'ready' | 'holding' | 'done';
  let phase: Phase = $state('ready');
  let startTime = $state(0);
  let elapsed = $state(0);
  let accuracy = $state(0);

  const targetSec = $derived((targetMs / 1000).toFixed(1));

  function startHold() {
    phase = 'holding';
    startTime = Date.now();
  }

  function endHold() {
    if (phase !== 'holding') return;
    elapsed = Date.now() - startTime;
    accuracy = Math.max(0, 1 - Math.abs(elapsed - targetMs) / targetMs);
    phase = 'done';
  }

  function accept() {
    oncomplete(accuracy);
  }
</script>

<Card padding="space-5" variant="default">
  <Stack gap="space-4" align="center">
    <h3 class="probe-title">{line} — Timing Probe</h3>
    <p class="probe-desc">
      Press and hold the button below. Release when you think {targetSec} seconds have passed.
    </p>

    {#if phase === 'ready'}
      <Button variant="primary" size="lg" onclick={startHold}>
        Begin
      </Button>
    {:else if phase === 'holding'}
      <button
        class="hold-button"
        onclick={endHold}
        onkeydown={(e) => e.key === ' ' && endHold()}
        aria-label="Release to end timing"
      >
        Hold... (release to mark {targetSec}s)
      </button>
    {:else if phase === 'done'}
      <div class="result" in:fade={{ duration: 300 }}>
        <p class="result-time">You held for {(elapsed / 1000).toFixed(2)}s</p>
        <p class="result-accuracy">Accuracy: {(accuracy * 100).toFixed(0)}%</p>
      </div>
      <Button variant="primary" onclick={accept}>Continue</Button>
    {/if}
  </Stack>
</Card>

<style>
  .probe-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-md);
    font-weight: 600;
    color: var(--ccrpg-accent);
    margin: 0;
  }

  .probe-desc {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    line-height: var(--ccrpg-leading-relaxed);
    margin: 0;
  }

  .hold-button {
    padding: var(--ccrpg-space-4) var(--ccrpg-space-6);
    background: var(--ccrpg-accent);
    color: var(--ccrpg-accent-fg);
    border: none;
    border-radius: var(--ccrpg-radius);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    animation: hold-pulse 1s var(--ccrpg-ease) infinite;
  }

  @keyframes hold-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ccrpg-space-1);
  }

  .result-time {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-lg);
    font-weight: 700;
    color: var(--ccrpg-fg);
    margin: 0;
  }

  .result-accuracy {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    margin: 0;
  }
</style>
