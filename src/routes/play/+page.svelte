<script lang="ts">
  /**
   * /play route — the gameplay surface.
   *
   * Mounts the Phaser game via PhaserGameClient. The game boots into its
   * default scene chain (Boot → Preloader → MainMenu → ...).
   *
   * Phase 1: minimal HUD overlay (top bar with stage descriptor + back button).
   * Phase 2: HUD reads stage tokens and re-skins.
   * Phase 2.5: HUD reads CapabilityProbe results for adaptive UI.
   */

  import PhaserGameClient from '$lib/components/PhaserGameClient.svelte';
  import { goto } from '$app/navigation';
  import { gameStore } from '$lib/stores/gameStore.js';

  // Subscribe to the game store for the HUD overlay.
  const stage = $derived($gameStore.currentStage);

  function backToMenu() {
    goto('/');
  }
</script>

<svelte:head>
  <title>CCRPG — Play</title>
</svelte:head>

<div class="play-route">
  <!-- Minimal HUD overlay (Phase 1) -->
  <header class="play-hud" aria-label="Game HUD">
    <button class="hud-back" onclick={backToMenu} aria-label="Back to menu">
      ← Menu
    </button>
    <span class="hud-stage" data-stage={stage.toLowerCase()}>
      {stage}
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
    background: #05070b;
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
    background: linear-gradient(to bottom, rgba(5, 7, 11, 0.9), rgba(5, 7, 11, 0));
    pointer-events: none;
  }

  .hud-back,
  .hud-stage {
    pointer-events: auto;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    color: #e7eaf2;
  }

  .hud-back {
    background: rgba(20, 13, 34, 0.8);
    border: 1px solid rgba(76, 201, 240, 0.4);
    color: #e7eaf2;
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 180ms ease;
  }

  .hud-back:hover {
    background: rgba(40, 26, 68, 0.9);
  }

  .hud-stage {
    text-transform: capitalize;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }
</style>
