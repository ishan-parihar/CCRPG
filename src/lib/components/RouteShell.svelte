<script lang="ts">
  /**
   * RouteShell — the standard route wrapper. Replaces ~28 lines of duplicated
   * `.X-route { min-height:100vh; background:var(--ccrpg-bg); padding:...; }`
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
    background: var(--ccrpg-bg);
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    padding: var(--ccrpg-route-padding);
    padding-top: var(--ccrpg-route-padding-top);
    padding-bottom: var(--ccrpg-route-padding-bottom);
    overflow-y: auto;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-5);
  }

  .route-shell.centered {
    align-items: center;
    justify-content: center;
  }

  .route-header {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-3);
    flex-shrink: 0;
  }

  .route-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    font-weight: 700;
    color: var(--ccrpg-fg);
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
    line-height: var(--ccrpg-leading-tight);
  }

  .route-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-5);
  }

  /* Desktop: constrain content width and center */
  @media (min-width: 1024px) {
    .route-shell {
      max-width: var(--ccrpg-content-max-width-wide);
      margin-inline: auto;
    }
  }
</style>
