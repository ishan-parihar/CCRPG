<script lang="ts">
  /**
   * /play route — the gameplay surface.
   *
   * Phase 0 (purge): Phaser has been removed. This route is a placeholder
   * until the Svelte-native gameplay engine is built in Phase 1. It shows
   * a branded loading state and redirects to onboarding if no save exists.
   *
   * Veil compliance: stage descriptor uses describeStage() (no raw labels).
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { gameStore } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { describeStage } from '$core/presentation/veilDescriptors.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import type { Stage } from '$core/domain/Stage.js';

  const stage = $derived($gameStore.currentStage as Stage);
  const stageAesthetic = $derived(describeStage(stage));
  const hasSave = $derived($gameStore.significator !== null);

  function backToMenu() {
    goto('/');
  }

  onMount(() => {
    if (!browser) return;
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) {
        setSignificator(loaded);
      } else {
        // No save → onboarding (Phase 1 will build this route).
        goto('/onboarding');
      }
    }
  });
</script>

<Seo
  title="Play"
  description="Enter the CCRPG gameplay surface — encounter developmental assessments disguised as gameplay."
  indexable={false}
/>

<div class="play-route">
  <header class="play-hud" aria-label="Game HUD" in:stageFade={{ duration: 400 }}>
    <BackButton onclick={backToMenu} label="Menu" />
    <span class="hud-stage" title={stageAesthetic}>
      {stageAesthetic}
    </span>
  </header>

  <main class="play-surface" in:stageFade={{ duration: 600, delay: 200 }}>
    {#if hasSave}
      <div class="play-placeholder">
        <p class="placeholder-title">The world stirs...</p>
        <p class="placeholder-desc">
          The Svelte-native gameplay engine is being forged.
          Your journey continues here.
        </p>
      </div>
    {:else}
      <div class="play-placeholder">
        <p class="placeholder-title">A new beginning awaits</p>
        <p class="placeholder-desc">
          No save found. Redirecting to onboarding...
        </p>
      </div>
    {/if}
  </main>
</div>

<style>
  .play-route {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ccrpg-bg, #0d0a0a);
    display: flex;
    flex-direction: column;
  }

  .play-hud {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--ccrpg-z-hud, 100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ccrpg-space-3, 0.75rem) var(--ccrpg-space-4, 1rem);
    padding-top: calc(var(--ccrpg-space-3, 0.75rem) + env(safe-area-inset-top, 0px));
    background: linear-gradient(
      to bottom,
      var(--ccrpg-bg, #0d0a0a) 0%,
      color-mix(in srgb, var(--ccrpg-bg, #0d0a0a) 60%, transparent) 70%,
      transparent 100%
    );
    pointer-events: none;
  }

  .play-hud > * {
    pointer-events: auto;
  }

  .hud-stage {
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: var(--ccrpg-text-sm, 0.875rem);
    color: var(--ccrpg-fg-muted, #a89080);
    letter-spacing: var(--ccrpg-tracking-wide, 0.05em);
    font-style: italic;
    max-width: 50vw;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .play-surface {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ccrpg-space-6, 2rem);
    padding-top: calc(var(--ccrpg-space-6, 2rem) + env(safe-area-inset-top, 0px) + 60px);
  }

  .play-placeholder {
    text-align: center;
    max-width: 32rem;
    color: var(--ccrpg-fg, #e8d4cc);
  }

  .placeholder-title {
    font-family: var(--ccrpg-font-display, serif);
    font-size: var(--ccrpg-text-xl, 1.5rem);
    font-weight: 700;
    margin: 0 0 var(--ccrpg-space-3, 0.75rem) 0;
    color: var(--ccrpg-accent, #b8252a);
    letter-spacing: var(--ccrpg-tracking-wide, 0.05em);
  }

  .placeholder-desc {
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: var(--ccrpg-text-base, 1rem);
    line-height: var(--ccrpg-leading-relaxed, 1.7);
    color: var(--ccrpg-fg-muted, #a89080);
    margin: 0;
  }
</style>
