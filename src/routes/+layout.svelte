<script lang="ts">
  // Root layout — wraps every route.
  //
  // Phase 2: imports design tokens (tokens.css) + font registration (fonts.css),
  // and mounts <StageTheme> to set data-stage on <html> for stage theming.
  //
  // Phase 2.5: runs CapabilityProbe on boot to set data-input / data-capability /
  // data-motion / data-contrast / data-connection / data-orientation on <html>.
  // This is the spine of the universality layer — enables 10ft TV mode,
  // reduced-motion handling, coarse-pointer enlargement, etc.

  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import '../styles/tokens.css';
  import '../styles/fonts.css';
  import '../styles/capabilities.css';
  import StageTheme from '$lib/components/StageTheme.svelte';
  import { applyCapabilities, watchCapabilities } from '$lib/capabilities/CapabilityProbe.js';

  let { children } = $props();

  let unwatch: (() => void) | null = null;

  onMount(() => {
    if (!browser) return;
    // Run capability probe immediately on boot.
    applyCapabilities();
    // Watch for changes (orientation flip, gamepad connect, motion toggle).
    unwatch = watchCapabilities();
  });

  onDestroy(() => {
    if (unwatch) unwatch();
  });
</script>

<StageTheme />

{@render children()}
