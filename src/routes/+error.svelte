<script lang="ts">
  /**
   * +error.svelte — custom error page.
   *
   * Replaces SvelteKit's default white error page with a stage-themed,
   * branded error page. Shows the error message in dev, a friendly
   * message in prod, and a link back to safety.
   *
   * Audit fix U1: No custom error page existed — SvelteKit's default
   * (white bg, generic) broke the game's aesthetic and brand.
   */

  import { page } from '$app/state';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { fade } from 'svelte/transition';

  const status = $derived(page.status);
  const message = $derived(page.error?.message ?? 'Something went wrong');
  const is404 = $derived(status === 404);

  // Dev-only: show the actual error message. Prod shows friendly text.
  const showDetail = $derived(import.meta.env.DEV);
</script>

<Seo
  title={is404 ? 'Not Found' : 'Error'}
  description={is404 ? 'This page does not exist.' : 'An unexpected error occurred.'}
  indexable={false}
/>

<div class="error-page" in:fade={{ duration: 400 }}>
  <div class="error-content">
    <div class="error-code" aria-hidden="true">{status}</div>
    <h1 class="error-title">
      {#if is404}
        This path is uncharted
      {:else}
        Something broke
      {/if}
    </h1>
    <p class="error-message">
      {#if is404}
        The page you sought doesn't exist in this world. Perhaps it hasn't
        been discovered yet.
      {:else if showDetail}
        {message}
      {:else}
        An unexpected error occurred. Try again, or return to safety.
      {/if}
    </p>
    <div class="error-actions">
      <BackButton href="/" label="Return to start" />
    </div>
  </div>
</div>

<style>
  .error-page {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 2rem;
    overflow-y: auto;
  }

  .error-content {
    text-align: center;
    max-width: 480px;
  }

  .error-code {
    font-family: var(--ccrpg-font-display, serif);
    font-size: clamp(4rem, 15vw, 8rem);
    font-weight: bold;
    color: var(--ccrpg-accent, #b8252a);
    line-height: 1;
    margin-bottom: 1rem;
    opacity: 0.8;
  }

  .error-title {
    font-family: var(--ccrpg-font-display, system-ui);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ccrpg-fg, #e7eaf2);
    margin: 0 0 1rem 0;
  }

  .error-message {
    font-size: 0.9375rem;
    color: var(--ccrpg-fg-muted, #a89080);
    line-height: 1.6;
    margin: 0 0 2rem 0;
  }

  .error-actions {
    display: flex;
    justify-content: center;
  }
</style>
