<script lang="ts">
  // Root layout — wraps every route.
  //
  // Style load order matters:
  //   1. tokens.css   — defines --ccrpg-* variables per [data-stage]
  //   2. base.css     — global reset + html/body base styles using tokens
  //   3. fonts.css    — @font-face declarations
  //   4. capabilities.css — adaptive overrides based on data-input/data-capability
  //
  // Phase 2: mounts <StageTheme> to set data-stage on <html>.
  // Phase 2.5: runs CapabilityProbe on boot.
  // Audit fix G2: hydrates gameStore from SaveRepository on boot so routes
  //   that don't mount Phaser (e.g. /settings) still have Significator data.

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import '../styles/tokens.css';
  import '../styles/base.css';
  import '../styles/fonts.css';
  import '../styles/capabilities.css';
  import StageTheme from '$lib/components/StageTheme.svelte';
  import { applyCapabilities, watchCapabilities } from '$lib/capabilities/CapabilityProbe.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';

  let { children } = $props();

  let unwatch: (() => void) | null = null;

  onMount(() => {
    if (!browser) return;

    // 1. Run capability probe immediately on boot.
    applyCapabilities();
    // 2. Watch for changes (orientation flip, gamepad connect, motion toggle).
    unwatch = watchCapabilities();

    // 3. Hydrate gameStore from localStorage (lightweight — no Phaser import).
    //    This lets non-Phaser routes (/settings, /recover, /telemetry) access
    //    the player's Significator without booting the game.
    const sig = loadSignificatorFromStorage();
    if (sig) setSignificator(sig);
  });

  onDestroy(() => {
    if (unwatch) unwatch();
  });
</script>

<StageTheme />

{@render children()}
