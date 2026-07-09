<script lang="ts">
  /**
   * /play route — the Svelte-native gameplay surface.
   *
   * Replaces the Phaser WorldScene + EncounterSelectionScene + EncounterScene.
   * Shows:
   *   1. The stage-aesthetic world header
   *   2. The scheduled encounter cards (player picks one)
   *   3. The active encounter (LLMDialogueRunner component)
   *   4. Post-encounter reflection + feedback
   *
   * If no save exists, redirects to /onboarding.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import Cluster from '$lib/components/Cluster.svelte';
  import { engineStore, bootEngine, startGameSession, runEncounter, declineEncounter } from '$lib/engine/gameEngine.js';
  import { gameStore } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { describeStage } from '$core/presentation/veilDescriptors.js';
  import { stageFade, stageFly } from '$lib/transitions/stageMotion.js';
  import LLMDialogueRunner from '$lib/components/gameplay/LLMDialogueRunner.svelte';
  import type { ScheduledEncounter } from '$core/domain/EncounterSpecNew.js';

  // State
  let phase: 'booting' | 'world' | 'encounter' | 'reflection' = $state('booting');
  let selectedEncounter: ScheduledEncounter | null = $state(null);
  let encounterError: string | null = $state(null);

  // Derived
  const sig = $derived($engineStore.significator);
  const world = $derived($engineStore.world);
  const encounters = $derived($engineStore.encounters);
  const activeEncounter = $derived($engineStore.activeEncounter);
  const lastResult = $derived($engineStore.lastResult);
  const engineError = $derived($engineStore.error);
  const stageAesthetic = $derived(sig ? describeStage(sig.currentStage) : '');

  onMount(async () => {
    if (!browser) return;

    // If no save in gameStore, try loading from localStorage
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) {
        setSignificator(loaded);
      } else {
        goto('/onboarding');
        return;
      }
    }

    // Boot the engine
    await bootEngine();

    const state = $engineStore;
    if (!state.significator) {
      goto('/onboarding');
      return;
    }

    // Start a session
    startGameSession();
    phase = 'world';
  });

  async function startEncounter(encounter: ScheduledEncounter) {
    selectedEncounter = encounter;
    phase = 'encounter';
    encounterError = null;
  }

  async function onEncounterComplete() {
    phase = 'reflection';
    selectedEncounter = null;
  }

  async function onEncounterError(err: string) {
    encounterError = err;
    phase = 'world';
    selectedEncounter = null;
  }

  function backToWorld() {
    phase = 'world';
  }

  async function decline(encounter: ScheduledEncounter) {
    await declineEncounter(encounter);
  }

  function backToMenu() {
    goto('/');
  }
</script>

<Seo
  title="Play"
  description="Enter the CCRPG gameplay surface — encounter developmental assessments disguised as gameplay."
  indexable={false}
/>

<div class="play-route">
  <header class="play-hud" aria-label="Game HUD">
    <BackButton onclick={backToMenu} label="Menu" />
    <span class="hud-stage" title={stageAesthetic}>{stageAesthetic}</span>
  </header>

  <main class="play-main">
    {#if phase === 'booting'}
      <div class="play-loading" in:stageFade={{ duration: 400 }}>
        <Spinner size="lg" />
        <p class="loading-text">The world stirs...</p>
      </div>
    {:else if engineError}
      <div class="play-error" in:stageFade={{ duration: 400 }}>
        <p class="error-title">The way is blocked</p>
        <p class="error-detail">{engineError}</p>
        <Button variant="primary" onclick={() => location.reload()}>Retry</Button>
      </div>
    {:else if phase === 'world' && sig}
      <div class="world-view" in:stageFade={{ duration: 500 }}>
        <Stack gap="space-5">
          <div class="world-header">
            <h1 class="world-title">{stageAesthetic}</h1>
            <p class="world-subtitle">Encounters await</p>
          </div>

          {#if encounters.length === 0}
            <Card variant="ghost" padding="space-5">
              <p class="empty-text">No encounters available right now. The world is at rest.</p>
            </Card>
          {:else}
            <Stack gap="space-3">
              {#each encounters as encounter, i (encounter.id)}
                <Card
                  variant="default"
                  padding="space-5"
                  interactive
                  onclick={() => startEncounter(encounter)}
                  class="encounter-card"
                  style="animation-delay: {i * 80}ms"
                >
                  <div class="encounter-card-inner">
                    <div class="encounter-info">
                      <Cluster gap="space-2" align="start" wrap={false}>
                        <Badge variant="accent">{encounter.modality}</Badge>
                        <Badge variant="default">{encounter.executionMode}</Badge>
                      </Cluster>
                      <p class="encounter-line">{encounter.moduleRef}</p>
                    </div>
                    <div class="encounter-actions">
                      <Button size="sm" variant="ghost" onclick={(e) => { e.stopPropagation(); decline(encounter); }}>Skip</Button>
                      <span class="encounter-arrow" aria-hidden="true">→</span>
                    </div>
                  </div>
                </Card>
              {/each}
            </Stack>
          {/if}
        </Stack>
      </div>
    {:else if phase === 'encounter' && selectedEncounter}
      <div class="encounter-view" in:stageFade={{ duration: 400 }}>
        <LLMDialogueRunner
          encounter={selectedEncounter}
          oncomplete={onEncounterComplete}
          onerror={onEncounterError}
          onexit={backToWorld}
        />
      </div>
    {:else if phase === 'reflection' && lastResult}
      <div class="reflection-view" in:stageFade={{ duration: 500 }}>
        <Stack gap="space-5" align="center">
          <div class="reflection-icon" aria-hidden="true">✦</div>
          <h2 class="reflection-title">The encounter concludes</h2>
          <Card variant="elevated" padding="space-6" class="reflection-card">
            <Stack gap="space-4">
              {#if lastResult.feedback}
                <div class="reflection-section">
                  <p class="reflection-label">Insight</p>
                  <p class="reflection-text">{lastResult.feedback}</p>
                </div>
              {/if}
              {#if lastResult.narrativeSummary}
                <div class="reflection-section">
                  <p class="reflection-label">Echo</p>
                  <p class="reflection-text">{lastResult.narrativeSummary}</p>
                </div>
              {/if}
            </Stack>
          </Card>
          <Cluster gap="space-3" justify="center">
            <Button variant="primary" onclick={backToWorld}>Continue the journey</Button>
          </Cluster>
        </Stack>
      </div>
    {/if}
  </main>
</div>

<style>
  .play-route {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ccrpg-bg);
    display: flex;
    flex-direction: column;
  }

  .play-hud {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--ccrpg-z-hud);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ccrpg-space-3) var(--ccrpg-space-4);
    padding-top: calc(var(--ccrpg-space-3) + env(safe-area-inset-top, 0px));
    background: linear-gradient(
      to bottom,
      var(--ccrpg-bg) 0%,
      color-mix(in srgb, var(--ccrpg-bg) 60%, transparent) 70%,
      transparent 100%
    );
    pointer-events: none;
  }

  .play-hud > * {
    pointer-events: auto;
  }

  .hud-stage {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    letter-spacing: var(--ccrpg-tracking-wide);
    font-style: italic;
    max-width: 50vw;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .play-main {
    flex: 1;
    overflow-y: auto;
    padding: calc(var(--ccrpg-space-5) + 60px) var(--ccrpg-space-4) var(--ccrpg-space-6);
    -webkit-overflow-scrolling: touch;
  }

  .play-loading,
  .play-error {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ccrpg-space-4);
    color: var(--ccrpg-fg);
  }

  .loading-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    font-style: italic;
  }

  .error-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-lg);
    color: var(--ccrpg-danger);
  }

  .error-detail {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    max-width: 32rem;
  }

  .world-view {
    max-width: var(--ccrpg-content-max-width);
    margin: 0 auto;
  }

  .world-header {
    text-align: center;
    margin-bottom: var(--ccrpg-space-2);
  }

  .world-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    font-weight: 700;
    color: var(--ccrpg-fg);
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .world-subtitle {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    margin: 0;
  }

  .encounter-card {
    animation: encounter-enter var(--ccrpg-duration-base) var(--ccrpg-ease-out) backwards;
  }

  @keyframes encounter-enter {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .encounter-card-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ccrpg-space-3);
  }

  .encounter-info {
    flex: 1;
    min-width: 0;
  }

  .encounter-line {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    color: var(--ccrpg-fg);
    margin-top: var(--ccrpg-space-2);
  }

  .encounter-actions {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-2);
    flex-shrink: 0;
  }

  .encounter-arrow {
    color: var(--ccrpg-fg-muted);
    font-size: var(--ccrpg-text-lg);
  }

  .empty-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    font-style: italic;
  }

  .encounter-view,
  .reflection-view {
    max-width: var(--ccrpg-content-max-width);
    margin: 0 auto;
  }

  .reflection-icon {
    font-size: var(--ccrpg-text-3xl);
    color: var(--ccrpg-accent);
    animation: reflection-pulse 2s var(--ccrpg-ease) infinite;
  }

  @keyframes reflection-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }

  .reflection-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    color: var(--ccrpg-fg);
    margin: 0;
    text-align: center;
  }

  .reflection-card {
    width: 100%;
  }

  .reflection-section {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-1);
  }

  .reflection-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-accent);
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wider);
    margin: 0;
  }

  .reflection-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    color: var(--ccrpg-fg);
    line-height: var(--ccrpg-leading-relaxed);
    margin: 0;
  }

  /* Desktop: constrain width, center */
  @media (min-width: 1024px) {
    .play-main {
      padding-top: calc(var(--ccrpg-space-6) + 60px);
    }
  }
</style>
