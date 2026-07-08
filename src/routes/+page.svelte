<script lang="ts">
  // Root page — Phase 0 bridge.
  //
  // Mounts the existing Phaser game via startGame() so the game
  // continues to work identically during the SvelteKit migration.
  // No visual or functional regression from the pre-SvelteKit state.
  //
  // Phase 1: this route becomes the designed main menu (MainMenuScene
  // migrates here). The Phaser game moves to /play.
  // Phase 2: the main menu reads stage tokens and re-skins accordingly.
  //
  // IMPORTANT: The Phaser game + its deps (SaveRepository, etc.) use Node
  // built-ins (fs, path, crypto) for the CLI build path. These cannot be
  // SSR'd. We therefore (a) skip rendering on the server and (b) use a
  // runtime-only dynamic import so SvelteKit's SSR bundler doesn't try
  // to resolve the Phaser dependency graph.

  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let container: HTMLDivElement;
  let loadError: string | null = $state(null);
  let isLoaded = $state(false);

  onMount(async () => {
    if (!browser) return;
    try {
      // Dynamic import with a computed specifier prevents SvelteKit's
      // SSR bundler from following the import graph at build time.
      // The Phaser bundle (~1MB) is loaded only on the client.
      const gamePath = '$game/main.js';
      const mod = await import(/* @vite-ignore */ gamePath);
      await mod.startGame(container);
      isLoaded = true;
    } catch (err) {
      console.error('CCRPG failed to boot:', err);
      loadError = err instanceof Error ? err.message : String(err);
    }
  });
</script>

<svelte:head>
  <title>CCRPG — Cognitive Combat</title>
</svelte:head>

<div
  bind:this={container}
  id="game-root"
  aria-label="Cognitive RPG game canvas"
  class="game-root"
>
  {#if !isLoaded && !loadError}
    <div class="boot-loading">
      <p>Loading CCRPG…</p>
    </div>
  {/if}
  {#if loadError}
    <div class="boot-error">
      <p>CCRPG failed to boot.</p>
      <pre>{loadError}</pre>
    </div>
  {/if}
</div>

<style>
  .game-root {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: #05070b;
  }

  .boot-loading,
  .boot-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #e7eaf2;
    font-family: system-ui, sans-serif;
    text-align: center;
    padding: 2rem;
  }

  .boot-error pre {
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
