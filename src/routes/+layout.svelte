<script lang="ts">
  // Root layout — wraps every route.
  // Phase 0: minimal. Just passes children through.
  // Phase 2: <StageTheme> and global font/token loading land here.
  // Phase 2.5: CapabilityProbe runs here (sets data-capability / data-input on <html>).

  let { children } = $props();
</script>

{@render children()}
