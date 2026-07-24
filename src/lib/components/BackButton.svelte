<script lang="ts">
  /**
   * <BackButton> — shared back-navigation button.
   *
   * Fixes fragmentation issue F4: /play and /settings had two different
   * back-button implementations with different classes, colors, and padding.
   * This single component uses design tokens so it re-skins per stage.
   *
   * Usage:
   *   <BackButton onclick={() => goto('/')} label="Menu" />
   *   <BackButton href="/" label="Back" />
   */

  type Props = {
    /** Click handler (takes priority over href/back). */
    onclick?: () => void;
    /** If provided and no onclick, navigates to this URL. */
    href?: string;
    /** Convenience prop: if string, acts as href; if function, acts as onclick. */
    back?: string | (() => void);
    /** Button label (default: "Back"). */
    label?: string;
    /** Optional ARIA label override. */
    ariaLabel?: string;
  };

  let { onclick, href, back, label = 'Back', ariaLabel }: Props = $props();

  // Resolve back prop into href or onclick
  const resolvedHref = $derived(back !== undefined ? (typeof back === 'string' ? back : href) : href);
  const resolvedOnclick = $derived(back !== undefined ? (typeof back === 'function' ? back : onclick) : onclick);

  function handleClick(e: MouseEvent) {
    if (resolvedOnclick) {
      e.preventDefault();
      resolvedOnclick();
    } else if (resolvedHref) {
      // SvelteKit navigation via <a href> — no manual goto needed
    }
  }
</script>

{#if resolvedHref && !resolvedOnclick}
  <a class="back-button" href={resolvedHref} aria-label={ariaLabel ?? `Back to ${label}`}>
    <span class="back-arrow" aria-hidden="true">←</span>
    <span class="back-label">{label}</span>
  </a>
{:else}
  <button class="back-button" onclick={handleClick} aria-label={ariaLabel ?? `Back to ${label}`}>
    <span class="back-arrow" aria-hidden="true">←</span>
    <span class="back-label">{label}</span>
  </button>
{/if}

<style>
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--mysterium-surface);
    border: 1px solid var(--mysterium-border);
    color: var(--mysterium-fg);
    padding: var(--mysterium-space-2) var(--mysterium-space-3);
    border-radius: var(--mysterium-radius);
    cursor: pointer;
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    text-decoration: none;
    transition: background var(--mysterium-duration-fast) var(--mysterium-ease),
                border-color var(--mysterium-duration-fast) var(--mysterium-ease),
                transform var(--mysterium-duration-instant) var(--mysterium-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .back-button:hover {
    background: var(--mysterium-surface-elevated);
    border-color: var(--mysterium-accent);
  }

  .back-button:active {
    transform: scale(0.98);
  }

  .back-button:focus-visible {
    outline: 2px solid var(--mysterium-accent);
    outline-offset: 2px;
  }

  .back-arrow {
    font-size: var(--mysterium-text-base);
    line-height: 1;
  }

  .back-label {
    line-height: 1;
  }
</style>
