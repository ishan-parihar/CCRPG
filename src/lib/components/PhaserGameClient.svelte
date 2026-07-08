<script lang="ts">
  /**
   * PhaserGameClient — Svelte component that mounts a Phaser game into a div.
   *
   * Audit fixes:
   *   F2: Hardcoded #05070b → var(--ccrpg-bg). Hardcoded #e7eaf2 → var(--ccrpg-fg).
   *   F5: This is now the SINGLE source of truth for Phaser mounting.
   *       The root / route uses this component (no duplicate logic).
   *   G4: Removed the dead `scene` prop — it was accepted but never implemented.
   *       YAGNI: re-add when /play/world vs /play/encounter routes are needed.
   *   G5: Error recovery — shows a retry button + back-to-menu link on failure.
   *   A2: Loading state is handled by the parent (root page shows branded spinner;
   *       /play shows its own). This component just shows error state.
   */

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';
  import { attachPhaserBridge, detachPhaserBridge } from '$lib/bridge/phaserEventAdapter.js';
  import { markLoaded, gameStore } from '$lib/stores/gameStore.js';
  import { goto } from '$app/navigation';

  type Props = {
    /** CSS class for the container div. */
    class?: string;
  };

  let { class: className = '' }: Props = $props();

  let container: HTMLDivElement;
  let game: any = null;
  let loadError: string | null = $state(null);

  async function bootGame() {
    if (!browser) return;
    loadError = null;
    try {
      // Dynamic import with computed specifier prevents SvelteKit's SSR
      // bundler from following the import graph at build time (Phaser deps
      // use Node built-ins that can't be SSR'd).
      const gamePath = '$game/main.js';
      const mod = await import(/* @vite-ignore */ gamePath);
      // Destroy any existing game before booting a new one (retry case).
      if (game) {
        try {
          detachPhaserBridge();
          game.destroy(true);
        } catch {
          // best-effort
        }
        game = null;
      }
      game = await mod.startGame(container);
      attachPhaserBridge(game);
      markLoaded();
    } catch (err) {
      console.error('PhaserGameClient: failed to mount Phaser game:', err);
      loadError = err instanceof Error ? err.message : String(err);
    }
  }

  onMount(() => {
    void bootGame();
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
    // G2 fix: reset isLoaded so the root page shows the loading spinner
    // when PhaserGameClient is re-mounted (e.g. navigating away and back).
    gameStore.update((s) => ({ ...s, isLoaded: false }));
  });

  function retry() {
    void bootGame();
  }

  function backToMenu() {
    goto('/');
  }
</script>

<div
  bind:this={container}
  class="phaser-container {className}"
  aria-label="CCRPG gameplay canvas"
  role="application"
></div>

{#if loadError}
  <div class="phaser-error" role="alert" transition:fade={{ duration: 300 }}>
    <p class="error-title">Game failed to load</p>
    <pre class="error-detail">{loadError}</pre>
    <div class="error-actions">
      <button class="error-retry" onclick={retry}>Retry</button>
      <button class="error-back" onclick={backToMenu}>Back to menu</button>
    </div>
  </div>
{/if}

<style>
  .phaser-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ccrpg-bg, #05070b);
  }

  .phaser-error {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    text-align: center;
    padding: 2rem;
    background: var(--ccrpg-bg, #05070b);
    z-index: 1000;
  }

  .error-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ff8c9d;
  }

  .error-detail {
    padding: 1rem;
    background: rgba(255, 77, 109, 0.1);
    border: 1px solid rgba(255, 77, 109, 0.3);
    border-radius: var(--ccrpg-radius, 6px);
    font-size: 0.8125rem;
    max-width: 90vw;
    overflow-x: auto;
    color: #ff8c9d;
    text-align: left;
  }

  .error-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .error-retry,
  .error-back {
    padding: 0.5rem 1rem;
    border-radius: var(--ccrpg-radius, 6px);
    cursor: pointer;
    font-size: 0.875rem;
    font-family: var(--ccrpg-font-body, system-ui);
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .error-retry {
    background: var(--ccrpg-accent, #b8252a);
    border: 1px solid var(--ccrpg-accent, #b8252a);
    color: var(--ccrpg-accent-fg, #ffffff);
  }

  .error-retry:hover {
    background: var(--ccrpg-accent-soft, #5a1318);
  }

  .error-back {
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    color: var(--ccrpg-fg, #e7eaf2);
  }

  .error-back:hover {
    background: var(--ccrpg-surface-elevated, #261818);
  }
</style>
