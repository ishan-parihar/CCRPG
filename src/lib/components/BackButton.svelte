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
    /** Click handler (takes priority over href). */
    onclick?: () => void;
    /** If provided and no onclick, navigates to this URL. */
    href?: string;
    /** Button label (default: "Back"). */
    label?: string;
    /** Optional ARIA label override. */
    ariaLabel?: string;
  };

  let { onclick, href, label = 'Back', ariaLabel }: Props = $props();

  function handleClick(e: MouseEvent) {
    if (onclick) {
      e.preventDefault();
      onclick();
    } else if (href) {
      // SvelteKit navigation via <a href> — no manual goto needed
    }
  }
</script>

{#if href && !onclick}
  <a class="back-button" href={href} aria-label={ariaLabel ?? `Back to ${label}`}>
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
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    color: var(--ccrpg-fg, #e7eaf2);
    padding: 0.5rem 0.875rem;
    border-radius: var(--ccrpg-radius, 6px);
    cursor: pointer;
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: 0.875rem;
    text-decoration: none;
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease),
                border-color var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
    -webkit-tap-highlight-color: transparent;
  }

  .back-button:hover {
    background: var(--ccrpg-surface-elevated, #261818);
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .back-button:focus-visible {
    outline: 2px solid var(--ccrpg-accent, #b8252a);
    outline-offset: 2px;
  }

  .back-arrow {
    font-size: 1rem;
    line-height: 1;
  }

  .back-label {
    line-height: 1;
  }
</style>
