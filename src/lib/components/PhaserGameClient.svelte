<script lang="ts">
  /**
   * PhaserGameClient — Svelte component that mounts a Phaser game into a div.
   *
   * Usage:
   *   <PhaserGameClient scene="World" />
   *
   * The Phaser bundle (~1MB) is dynamically imported on mount, so it stays
   * out of the initial page bundle. The game is destroyed on component
   * destroy (Svelte handles cleanup).
   *
   * The phaserEventAdapter is attached after mount so Svelte components
   * can react to Phaser events via the gameStore.
   *
   * Phase 1: minimal — just boots the game and attaches the bridge.
   * Phase 2: reads design tokens from getComputedStyle and passes to Phaser config.
   * Phase 2.5: reads CapabilityProbe results and degrades Phaser config accordingly.
   */

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { attachPhaserBridge, detachPhaserBridge } from '$lib/bridge/phaserEventAdapter.js';
  import { markLoaded } from '$lib/stores/gameStore.js';

  type Props = {
    /** Optional: boot directly into a specific scene (e.g. "World", "Encounter"). */
    scene?: string;
    /** CSS class for the container div. */
    class?: string;
  };

  let { scene, class: className = '' }: Props = $props();

  let container: HTMLDivElement;
  let game: any = null;
  let loadError: string | null = $state(null);

  onMount(async () => {
    if (!browser) return;
    try {
      // Dynamic import with computed specifier prevents SvelteKit's SSR
      // bundler from following the import graph at build time (Phaser deps
      // use Node built-ins that can't be SSR'd).
      const gamePath = '$game/main.js';
      const mod = await import(/* @vite-ignore */ gamePath);
      game = await mod.startGame(container);

      // If a specific scene was requested, switch to it.
      // (The game boots into its default scene chain; this is a hint for
      // future Phase 1 work when routes like /play/world vs /play/encounter
      // need to boot into different scenes.)
      if (scene && game) {
        // game.scene.start(scene) — to be implemented when routes are split
      }

      // Attach the Svelte ↔ Phaser bridge.
      attachPhaserBridge(game);
      markLoaded();
    } catch (err) {
      console.error('PhaserGameClient: failed to mount Phaser game:', err);
      loadError = err instanceof Error ? err.message : String(err);
    }
  });

  onDestroy(() => {
    if (game) {
      detachPhaserBridge();
      try {
        game.destroy(true);
      } catch (err) {
        console.warn('PhaserGameClient: error destroying game:', err);
      }
      game = null;
    }
  });
</script>

<div
  bind:this={container}
  class="phaser-container {className}"
  aria-label="CCRPG gameplay canvas"
  role="application"
></div>

{#if loadError}
  <div class="phaser-error" role="alert">
    <p>Game failed to load.</p>
    <pre>{loadError}</pre>
  </div>
{/if}

<style>
  .phaser-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: #05070b;
  }

  .phaser-error {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #e7eaf2;
    font-family: system-ui, sans-serif;
    text-align: center;
    padding: 2rem;
    background: #05070b;
    z-index: 1000;
  }

  .phaser-error pre {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 77, 109, 0.1);
    border: 1px solid rgba(255, 77, 109, 0.3);
    border-radius: 6px;
    font-size: 0.875rem;
    max-width: 90vw;
    overflow-x: auto;
    color: #ff8c9d;
  }
</style>
