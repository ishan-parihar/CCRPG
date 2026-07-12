<script lang="ts">
  /**
   * A11yApplier — side-effect component that syncs accessibilityStore
   * to data-* attributes on <html>. Fixes the "inert toggle" bug where
   * /settings toggles wrote to localStorage but never affected the DOM.
   *
   * Mount once in +layout.svelte alongside <StageTheme />.
   */
  import { browser } from '$app/environment';
  import { accessibilityStore } from '$lib/stores/accessibilityStore.js';

  $effect(() => {
    if (!browser) return;
    const s = $accessibilityStore;
    const html = document.documentElement;

    if (s.reducedMotion) {
      html.setAttribute('data-motion', 'reduced');
    } else {
      html.setAttribute('data-motion', 'full');
    }

    if (s.highContrast) {
      html.setAttribute('data-contrast', 'more');
      html.classList.add('a11y-high-contrast');
    } else {
      html.setAttribute('data-contrast', 'normal');
      html.classList.remove('a11y-high-contrast');
    }
  });
</script>
