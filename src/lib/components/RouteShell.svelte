<script lang="ts">
  /**
   * RouteShell — the standard route wrapper. Replaces ~28 lines of duplicated
   * `.X-route { min-height:100vh; background:var(--mysterium-bg); padding:...; }`
   * CSS in every route.
   *
   * Provides: full-height scrollable container, safe-area padding, stage-aware
   * background, optional BackButton + title header.
   */
  import type { Snippet } from 'svelte';
  import BackButton from './BackButton.svelte';
  import { stageFade } from '$lib/transitions/stageMotion.js';

  interface Props {
    title?: string;
    back?: string | (() => void);
    backLabel?: string;
    noHeader?: boolean;
    centered?: boolean;
    class?: string;
    children: Snippet;
  }

  let {
    title,
    back,
    backLabel = 'Menu',
    noHeader = false,
    centered = false,
    class: className = '',
    children,
  }: Props = $props();
</script>

<div class="route-shell {className}" class:centered in:stageFade={{ duration: 400 }}>
  {#if !noHeader}
    <header class="route-header">
      {#if back !== undefined}
        <BackButton {back} label={backLabel} />
      {/if}
      {#if title}
        <h1 class="route-title">{title}</h1>
      {/if}
    </header>
  {/if}
  <main class="route-main">
    {@render children()}
  </main>
</div>

<style>
  .route-shell {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--mysterium-bg);
    color: var(--mysterium-fg);
    font-family: var(--mysterium-font-body);
    padding: var(--mysterium-route-padding);
    padding-top: var(--mysterium-route-padding-top);
    padding-bottom: var(--mysterium-route-padding-bottom);
    overflow-y: auto;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-5);
  }

  .route-shell.centered {
    align-items: center;
    justify-content: center;
  }

  .route-header {
    display: flex;
    align-items: center;
    gap: var(--mysterium-space-3);
    flex-shrink: 0;
  }

  .route-title {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-xl);
    font-weight: 700;
    color: var(--mysterium-fg);
    margin: 0;
    letter-spacing: var(--mysterium-tracking-wide);
    line-height: var(--mysterium-leading-tight);
  }

  .route-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-5);
  }

  /* Desktop: constrain content width and center */
  @media (min-width: 1024px) {
    .route-shell {
      max-width: var(--mysterium-content-max-width-wide);
      margin-inline: auto;
    }
  }
</style>
