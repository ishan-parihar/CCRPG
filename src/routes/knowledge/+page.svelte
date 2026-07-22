<script lang="ts">
  /**
   * /knowledge route — curriculum knowledge state dashboard.
   * Shows concept coverage, depth distribution, retention health,
   * and study recommendations based on the player's KnowledgeState.
   */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import KnowledgeDashboard from '$lib/components/displays/KnowledgeDashboard.svelte';
  import { gameStore, setSignificator } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';

  const sig = $derived($gameStore.significator);
  const knowledge = $derived(sig?.knowledge);

  // Count total concepts in the registry for coverage calculation
  let totalConcepts = $state(0);

  onMount(() => {
    if (!browser) return;
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) setSignificator(loaded);
    }
    // Dynamic import to avoid circular dependency
    import('$core/curriculum/CurriculumRegistry.js').then(({ getCurriculumRegistry }) => {
      const registry = getCurriculumRegistry();
      totalConcepts = registry.count();
    });
  });
</script>

<Seo
  title="Knowledge State"
  description="View your curriculum knowledge — concept coverage, depth distribution, and retention health."
  indexable={false}
/>

<RouteShell title="Knowledge State" back="/profile">
  {#if !sig}
    <p class="empty-state">No save found. Enter the world to begin your learning journey.</p>
  {:else}
    <Stack gap="space-5">
      <Card padding="space-5">
        <KnowledgeDashboard {knowledge} totalConceptsInCurriculum={totalConcepts} />
      </Card>
    </Stack>
  {/if}
</RouteShell>

<style>
  .empty-state {
    color: var(--ccrpg-fg-muted);
    font-style: italic;
    text-align: center;
    padding: var(--ccrpg-space-7) var(--ccrpg-space-4);
  }
</style>
