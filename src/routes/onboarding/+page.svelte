<script lang="ts">
  /**
   * /onboarding — the entry point for new players.
   *
   * Replaces Phaser's OnboardingScene + CompositeOnboarding.
   *
   * Flow:
   *   1. Welcome screen — explains the game
   *   2. Quick calibration — a single reflective question per line
   *   3. Create Significator at the detected stage
   *   4. Redirect to /play
   *
   * For now, we use a simplified flow: ask the player what draws them,
   * create a Significator at Red stage (the default first vertical slice),
   * and let the encounter system refine from there.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import Cluster from '$lib/components/Cluster.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import { stageFade, stageFly } from '$lib/transitions/stageMotion.js';
  import { createSignificator } from '$core/domain/Significator.js';
  import type { Line, Stage } from '$core/domain/Stage.js';
  import { ALL_LINES } from '$core/domain/Line.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { showToast } from '$lib/stores/toastStore.js';

  type Phase = 'welcome' | 'intent' | 'creating' | 'done';
  let phase: Phase = $state('welcome');
  let intent: string = $state('');
  let selectedDraw: string | null = $state(null);

  const draws = [
    { id: 'growth', label: 'To grow', desc: 'I want to develop across all dimensions' },
    { id: 'healing', label: 'To heal', desc: 'I want to work through what blocks me' },
    { id: 'curiosity', label: 'To explore', desc: 'I want to see what this is' },
    { id: 'mastery', label: 'To master', desc: 'I want to test myself' },
  ];

  onMount(() => {
    if (!browser) return;
    // If a save already exists, skip onboarding
    const raw = localStorage.getItem('profile:v1');
    if (raw) {
      goto('/play');
    }
  });

  function selectDraw(id: string) {
    selectedDraw = id;
  }

  async function beginOnboarding() {
    phase = 'intent';
  }

  async function completeOnboarding() {
    phase = 'creating';

    // Create a fresh Significator at Red stage with all lines at Infrared
    const id = `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const altitudes: Record<Line, Stage> = {
      Cognitive: 'Infrared',
      Emotional: 'Infrared',
      Moral: 'Infrared',
      Intrapersonal: 'Infrared',
      Spiritual: 'Infrared',
      Somatic: 'Infrared',
      Willpower: 'Infrared',
      Interpersonal: 'Infrared',
    };
    const sig = createSignificator(id, altitudes, 'Red');

    // Persist to localStorage
    try {
      localStorage.setItem('profile:v1', JSON.stringify(sig));
    } catch (err) {
      console.error('[onboarding] failed to persist Significator:', err);
      showToast('Failed to save progress', 'danger');
      phase = 'intent';
      return;
    }

    // Update the game store
    setSignificator(sig);
    showToast('Your journey begins', 'success', 3000);

    phase = 'done';
    setTimeout(() => goto('/play'), 1000);
  }
</script>

<Seo
  title="Begin"
  description="A new beginning — your developmental journey starts here."
  indexable={false}
/>

<div class="onboarding-route" in:stageFade={{ duration: 600 }}>
  <div class="onboarding-content">
    {#if phase === 'welcome'}
      <div in:stageFly={{ y: 20, duration: 500 }}>
        <Stack gap="space-6" align="center">
          <div class="welcome-mark" aria-hidden="true">CCRPG</div>
          <h1 class="welcome-title">A journey of healing and evolution</h1>
          <p class="welcome-text">
            Every encounter here is a developmental practice — a way to see yourself
            more clearly and grow across eight dimensions of intelligence. The game
            learns from how you engage, and the world shifts to meet you.
          </p>
          <Button variant="primary" size="lg" onclick={beginOnboarding}>
            Begin
          </Button>
        </Stack>
      </div>
    {:else if phase === 'intent'}
      <div in:stageFly={{ y: 20, duration: 400 }}>
        <Stack gap="space-5">
          <h2 class="intent-title">What draws you here?</h2>
          <p class="intent-text">Choose what resonates. There is no wrong answer.</p>

          <Stack gap="space-3" class="draws-list">
            {#each draws as draw, i (draw.id)}
              <Card
                variant="default"
                padding="space-5"
                interactive
                onclick={() => selectDraw(draw.id)}
                class="draw-card"
                style="animation-delay: {i * 80}ms"
              >
                <div class="draw-inner" class:selected={selectedDraw === draw.id}>
                  <div class="draw-info">
                    <div class="draw-label">{draw.label}</div>
                    <div class="draw-desc">{draw.desc}</div>
                  </div>
                  <div class="draw-marker" aria-hidden="true">
                    {#if selectedDraw === draw.id}●{:else}○{/if}
                  </div>
                </div>
              </Card>
            {/each}
          </Stack>

          {#if selectedDraw}
            <div in:stageFade={{ duration: 300 }}>
              <Stack gap="space-3">
                <Input
                  type="textarea"
                  value={intent}
                  oninput={(v) => intent = v}
                  placeholder="Say more, if you wish (optional)..."
                  maxlength={500}
                  ariaLabel="Optional reflection on what draws you"
                />
                <Cluster gap="space-3" justify="between">
                  <Button variant="ghost" onclick={() => selectedDraw = null}>Back</Button>
                  <Button variant="primary" onclick={completeOnboarding}>Enter the world</Button>
                </Cluster>
              </Stack>
            </div>
          {/if}
        </Stack>
      </div>
    {:else if phase === 'creating'}
      <div in:stageFade={{ duration: 400 }}>
        <Stack gap="space-4" align="center">
          <Spinner size="lg" />
          <p class="creating-text">The world takes shape...</p>
        </Stack>
      </div>
    {:else if phase === 'done'}
      <div in:stageFade={{ duration: 500 }}>
        <Stack gap="space-4" align="center">
          <div class="done-mark" aria-hidden="true">✦</div>
          <p class="done-text">Your journey begins</p>
        </Stack>
      </div>
    {/if}
  </div>
</div>

<style>
  .onboarding-route {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--ccrpg-bg);
    color: var(--ccrpg-fg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ccrpg-space-5) var(--ccrpg-space-4);
    padding-top: calc(var(--ccrpg-space-5) + env(safe-area-inset-top, 0px));
    padding-bottom: calc(var(--ccrpg-space-5) + env(safe-area-inset-bottom, 0px) + var(--ccrpg-nav-height));
    overflow-y: auto;
  }

  .onboarding-content {
    width: 100%;
    max-width: var(--ccrpg-content-max-width-narrow);
  }

  .welcome-mark {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-3xl);
    font-weight: 700;
    color: var(--ccrpg-accent);
    letter-spacing: var(--ccrpg-tracking-wider);
    line-height: 1;
  }

  .welcome-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-2xl);
    font-weight: 700;
    color: var(--ccrpg-fg);
    text-align: center;
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .welcome-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    line-height: var(--ccrpg-leading-relaxed);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    max-width: 32rem;
  }

  .intent-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    font-weight: 700;
    color: var(--ccrpg-fg);
    margin: 0;
    text-align: center;
  }

  .intent-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    margin: 0;
  }

  .draw-card {
    animation: draw-enter var(--ccrpg-duration-base) var(--ccrpg-ease-out) backwards;
  }

  @keyframes draw-enter {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .draw-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ccrpg-space-3);
  }

  .draw-inner.selected .draw-label {
    color: var(--ccrpg-accent);
  }

  .draw-info {
    flex: 1;
  }

  .draw-label {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-md);
    font-weight: 600;
    color: var(--ccrpg-fg);
  }

  .draw-desc {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    margin-top: var(--ccrpg-space-1);
  }

  .draw-marker {
    font-size: var(--ccrpg-text-lg);
    color: var(--ccrpg-accent);
    flex-shrink: 0;
  }

  .creating-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    font-style: italic;
  }

  .done-mark {
    font-size: var(--ccrpg-text-3xl);
    color: var(--ccrpg-accent);
    animation: done-pulse 1.5s var(--ccrpg-ease) infinite;
  }

  @keyframes done-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.15); }
  }

  .done-text {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-lg);
    color: var(--ccrpg-fg);
  }
</style>
