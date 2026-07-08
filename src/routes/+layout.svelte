<script lang="ts">
  // Root layout — wraps every route.
  //
  // Phase 2: imports design tokens (tokens.css) + font registration (fonts.css),
  // and mounts <StageTheme> to set data-stage on <html> for stage theming.

  import '../styles/tokens.css';
  import '../styles/fonts.css';
  import StageTheme from '$lib/components/StageTheme.svelte';

  let { children } = $props();
</script>

<StageTheme />

{@render children()}
