<script lang="ts">
  /**
   * Root page (/) — the main entry point.
   *
   * Audit fixes applied:
   *   B1: Uses <PhaserGameClient /> instead of hand-rolling startGame().
   *       Prevents dual-mount when navigating / → /play (PhaserGameClient
   *       handles destroy in onDestroy).
   *   F5: Removes duplicate Phaser mount logic (now lives only in
   *       PhaserGameClient.svelte).
   *   A1: Polished loading state with branded spinner instead of plain text.
   *   A2: Svelte transition on the loading → game handoff.
   *   B2: Removed the inline ssr=false (now handled by +page.ts).
   */

  import PhaserGameClient from '$lib/components/PhaserGameClient.svelte';
  import { fade } from 'svelte/transition';
  import { gameStore } from '$lib/stores/gameStore.js';

  // Reactive: true once PhaserGameClient calls markLoaded()
  const isLoaded = $derived($gameStore.isLoaded);
</script>

<svelte:head>
  <title>CCRPG — Cognitive Combat</title>
  <meta
    name="description"
    content="A Cognitive-Capacity-Driven RPG where every gameplay verb is a gamified developmental assessment."
  />
</svelte:head>

<div class="root-route">
  <PhaserGameClient />

  {#if !isLoaded}
    <div class="boot-loading" transition:fade={{ duration: 300 }}>
      <div class="boot-logo" aria-hidden="true">
        <div class="boot-ring"></div>
        <div class="boot-ring boot-ring-2"></div>
        <div class="boot-ring boot-ring-3"></div>
        <span class="boot-mark">C</span>
      </div>
      <p class="boot-text">Loading CCRPG…</p>
    </div>
  {/if}
</div>

<style>
  .root-route {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ccrpg-bg, #05070b);
  }

  .boot-loading {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    background: var(--ccrpg-bg, #05070b);
    z-index: 10;
    pointer-events: none;
  }

  .boot-logo {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .boot-ring {
    position: absolute;
    inset: 0;
    border: 2px solid var(--ccrpg-accent, #b8252a);
    border-radius: 50%;
    opacity: 0.6;
    animation: boot-pulse 2s var(--ccrpg-ease, ease) infinite;
  }

  .boot-ring-2 {
    animation-delay: 0.4s;
    inset: 8px;
  }

  .boot-ring-3 {
    animation-delay: 0.8s;
    inset: 16px;
  }

  .boot-mark {
    font-family: var(--ccrpg-font-display, serif);
    font-size: 2rem;
    font-weight: bold;
    color: var(--ccrpg-fg, #e7eaf2);
    z-index: 1;
  }

  .boot-text {
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: 0.875rem;
    color: var(--ccrpg-fg-muted, #8899aa);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @keyframes boot-pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.1);
      opacity: 0;
    }
  }

  /* Respect reduced-motion */
  :global([data-motion='reduced']) .boot-ring {
    animation: none;
    opacity: 0.4;
  }
</style>
