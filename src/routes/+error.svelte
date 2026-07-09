<script lang="ts">
  /**
   * +error.svelte — custom error page.
   *
   * Stage-themed branded error page. Shows the error message in dev,
   * a friendly message in prod, and a link back to safety.
   */

  import { page } from '$app/state';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { stageFade } from '$lib/transitions/stageMotion.js';

  const status = $derived(page.status);
  const message = $derived(page.error?.message ?? 'Something went wrong');
  const is404 = $derived(status === 404);
  const showDetail = $derived(import.meta.env.DEV);
</script>

<Seo
  title={is404 ? 'Not Found' : 'Error'}
  description={is404 ? 'This page does not exist.' : 'An unexpected error occurred.'}
  indexable={false}
/>

<div class="error-page" in:stageFade={{ duration: 400 }}>
  <div class="error-content">
    <div class="error-code" aria-hidden="true">{status}</div>
    <h1 class="error-title">
      {#if is404}
        This path leads nowhere
      {:else}
        Something went wrong
      {/if}
    </h1>
    {#if showDetail}
      <p class="error-message">{message}</p>
    {:else}
      <p class="error-message">
        {#if is404}
          The page you sought has drifted beyond the veil.
        {:else}
          An unexpected disturbance. Try again, or return to safety.
        {/if}
      </p>
    {/if}
    <div class="error-actions">
      <BackButton href="/" label="Return to Menu" />
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
    background: var(--ccrpg-bg);
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    padding: var(--ccrpg-space-6);
    overflow-y: auto;
  }

  .error-content {
    text-align: center;
    max-width: var(--ccrpg-content-max-width-narrow);
  }

  .error-code {
    font-family: var(--ccrpg-font-display);
    font-size: clamp(4rem, 15vw, 8rem);
    font-weight: bold;
    color: var(--ccrpg-accent);
    line-height: 1;
    margin-bottom: var(--ccrpg-space-4);
    opacity: 0.8;
  }

  .error-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    font-weight: 600;
    color: var(--ccrpg-fg);
    margin: 0 0 var(--ccrpg-space-4) 0;
  }

  .error-message {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    line-height: var(--ccrpg-leading-relaxed);
    margin: 0 0 var(--ccrpg-space-6) 0;
  }

  .error-actions {
    display: flex;
    justify-content: center;
  }
</style>
