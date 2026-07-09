<script lang="ts">
  /**
   * Root layout — wraps every route.
   *
   * Pure-Svelte frontend: no Phaser mount. Provides:
   *   - Stage theme (data-stage attribute)
   *   - Accessibility applier (data-motion, data-contrast)
   *   - Capability probe (data-input, data-capability, etc.)
   *   - Desktop sidebar + mobile bottom nav
   *   - Toaster for notifications
   *   - Cloud sync on beforeunload
   */

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import '../styles/tokens.css';
  import '../styles/base.css';
  import '../styles/fonts.css';
  import '../styles/capabilities.css';
  import StageTheme from '$lib/components/StageTheme.svelte';
  import A11yApplier from '$lib/components/A11yApplier.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import Toaster from '$lib/components/Toaster.svelte';
  import { applyCapabilities, watchCapabilities } from '$lib/capabilities/CapabilityProbe.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { flushSync } from '$lib/stores/cloudSyncStore.js';
  import { get } from 'svelte/store';
  import { gameStore } from '$lib/stores/gameStore.js';

  let { children } = $props();

  let unwatch: (() => void) | null = null;
  let beforeUnloadHandler: (() => void) | null = null;

  onMount(() => {
    if (!browser) return;

    // 1. Run capability probe immediately on boot.
    applyCapabilities();
    // 2. Watch for changes (orientation flip, gamepad connect, motion toggle).
    unwatch = watchCapabilities();

    // 3. Hydrate gameStore from localStorage (lightweight — no engine import).
    const sig = loadSignificatorFromStorage();
    if (sig) setSignificator(sig);

    // 4. Flush cloud sync on beforeunload (tab close / navigate away).
    beforeUnloadHandler = () => {
      const state = get(gameStore);
      if (state.significator) void flushSync(state.significator);
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });

  onDestroy(() => {
    if (unwatch) unwatch();
    if (browser && beforeUnloadHandler) {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
  });
</script>

<StageTheme />
<A11yApplier />
<Sidebar />
{@render children()}
<BottomNav />
<Toaster />
