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

  let { children } = $props();

  let unwatch: (() => void) | null = null;

  onMount(async () => {
    if (!browser) return;

    // 1. Run capability probe immediately on boot.
    applyCapabilities();
    // 2. Watch for changes (orientation flip, gamepad connect, motion toggle).
    unwatch = watchCapabilities();

    // 3. Hydrate gameStore from SaveRepository so non-Phaser routes have data.
    //    Uses a runtime dynamic import to avoid pulling Node-deps into SSR.
    try {
      const gamePath = '$game/main.js';
      const mod = await import(/* @vite-ignore */ gamePath);
      if (mod.Services?.saveRepo) {
        const sig = await mod.Services.saveRepo.loadProfile();
        if (sig) setSignificator(sig);
      }
    } catch {
      // SaveRepository not available yet (e.g. during SSR or first boot).
      // The Phaser game will populate the store when it mounts.
    }
  });

  onDestroy(() => {
    if (unwatch) unwatch();
  });
</script>

<StageTheme />

{@render children()}
