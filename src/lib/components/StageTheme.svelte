<script lang="ts">
  /**
   * <StageTheme> — sets the data-stage attribute on <html> based on the
   * current game stage from gameStore. This re-skins the entire shell
   * (colors, fonts, motion) via the CSS tokens in tokens.css.
   *
   * Usage: place <StageTheme /> once in the root +layout.svelte.
   * It renders nothing — it's a side-effect-only component.
   *
   * Phase 2: reads from gameStore.currentStage.
   * Phase 2.5: respects prefers-reduced-motion (disables motion tokens).
   */

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { gameStore } from '$lib/stores/gameStore.js';

  let unsubscribe: (() => void) | null = null;

  function applyStage(stage: string): void {
    if (!browser) return;
    const html = document.documentElement;
    html.setAttribute('data-stage', stage.toLowerCase());
  }

  onMount(() => {
    if (!browser) return;
    // Apply the current stage immediately.
    unsubscribe = gameStore.subscribe((state) => {
      applyStage(state.currentStage);
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<!-- This component renders nothing — it's a side-effect-only component. -->
