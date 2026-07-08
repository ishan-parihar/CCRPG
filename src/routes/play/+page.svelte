<script lang="ts">
  /**
   * /play route — the gameplay surface.
   *
   * Audit fixes:
   *   B3: HUD stage descriptor now uses describeStage() (Veil-compliant).
   *       Previously rendered sig.currentStage directly ("Red", "Amber"...)
   *       which violates the Veil of Forgetting (canon §5.4).
   *   F2: All hardcoded colors replaced with var(--ccrpg-*) tokens.
   *   F3: Font-family now uses var(--ccrpg-font-body).
   *   F4: Uses shared <BackButton> component.
   *   A2: HUD fades in with stage-aware transition.
   */

  import PhaserGameClient from '$lib/components/PhaserGameClient.svelte';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { goto } from '$app/navigation';
  import { gameStore } from '$lib/stores/gameStore.js';
  import { describeStage } from '$core/presentation/veilDescriptors.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import type { Stage } from '$core/domain/Stage.js';

  // Subscribe to the game store for the HUD overlay.
  const stage = $derived($gameStore.currentStage as Stage);
  const stageAesthetic = $derived(describeStage(stage));

  function backToMenu() {
    goto('/');
  }
</script>

<Seo
  title="Play"
  description="Enter the CCRPG gameplay surface — encounter developmental assessments disguised as gameplay."
  indexable={false}
/>

<div class="play-route">
  <!-- Minimal HUD overlay -->
  <header class="play-hud" aria-label="Game HUD" in:stageFade={{ duration: 400 }}>
    <BackButton onclick={backToMenu} label="Menu" />
    <span class="hud-stage" title={stageAesthetic}>
      {stageAesthetic}
    </span>
  </header>

  <!-- The Phaser canvas mounts here -->
  <PhaserGameClient />
</div>

<style>
  .play-route {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ccrpg-bg, #05070b);
  }

  .play-hud {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
    background: linear-gradient(
      to bottom,
      var(--ccrpg-bg, #05070b) 0%,
      color-mix(in srgb, var(--ccrpg-bg, #05070b) 60%, transparent) 70%,
      transparent 100%
    );
    pointer-events: none;
  }

  .play-hud > * {
    pointer-events: auto;
  }

  .hud-stage {
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    letter-spacing: 0.03em;
    font-style: italic;
    max-width: 50vw;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
