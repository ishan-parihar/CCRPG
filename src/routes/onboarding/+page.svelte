<script lang="ts">
  /**
   * /onboarding — the entry point for new players.
   *
   * Parity with CLI runQuickCalibration + createDefaultSignificator.
   * Flow:
   *   1. Welcome screen — explains the game
   *   2. Quick calibration — 8-line probe (MCQ for 6 lines + hold probe for Somatic/Willpower)
   *   3. Create Significator with calibrated altitudes
   *   4. Redirect to /play
   *
   * ponytail: consumes shared CALIBRATION_PROMPTS + CHOICE_THRESHOLDS + HOLD_TARGETS.
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
  import Badge from '$lib/components/Badge.svelte';
  import HoldProbe from '$lib/components/gameplay/HoldProbe.svelte';
  import { stageFade, stageFly } from '$lib/transitions/stageMotion.js';
  import { createSignificator } from '$core/domain/Significator.js';
  import type { Line, Stage } from '$core/domain/Stage.js';
  import { ALL_LINES } from '$core/domain/Line.js';
  import { thresholdToStage } from '$core/usecases/ThresholdMaps.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { showToast } from '$lib/stores/toastStore.js';
  import { CALIBRATION_PROMPTS, CHOICE_THRESHOLDS, HOLD_TARGETS } from '$core/data/calibrationPrompts.js';
  import { describeStage } from '$core/presentation/veilDescriptors.js';

  type Phase = 'welcome' | 'calibrating' | 'creating' | 'done';
  let phase: Phase = $state('welcome');

  // Calibration state
  const lines: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
  // Fisher-Yates shuffle (parity with CLI)
  let calibrationOrder: Line[] = $state([]);
  let currentLineIdx = $state(0);
  let altitudes: Partial<Record<Line, Stage>> = {};
  let selectedChoice = $state<number | null>(null);

  const currentLine = $derived(calibrationOrder[currentLineIdx]);
  const currentPrompt = $derived(currentLine ? CALIBRATION_PROMPTS[currentLine] : null);
  const isHoldProbe = $derived(currentLine === 'Somatic' || currentLine === 'Willpower');

  onMount(() => {
    if (!browser) return;
    const raw = localStorage.getItem('profile:v1');
    if (raw) {
      goto('/play');
      return;
    }
    // Shuffle lines for calibration
    calibrationOrder = [...lines];
    for (let i = calibrationOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [calibrationOrder[i]!, calibrationOrder[j]!] = [calibrationOrder[j]!, calibrationOrder[i]!];
    }
  });

  function beginCalibration() {
    phase = 'calibrating';
    currentLineIdx = 0;
  }

  function selectChoice(idx: number) {
    selectedChoice = idx;
  }

  function submitChoice() {
    if (!currentLine || selectedChoice === null) return;
    const thresholds = CHOICE_THRESHOLDS[currentLine];
    if (!thresholds) return;
    const threshold = thresholds[Math.min(selectedChoice, 2)]!;
    const stage = thresholdToStage(currentLine, threshold);
    altitudes[currentLine] = stage;
    nextLine();
  }

  function onHoldComplete(accuracy: number) {
    if (!currentLine) return;
    // Somatic: inverted (lower RT = higher stage, range 200-900)
    // Willpower: standard (higher = better, range 1-12)
    const threshold = currentLine === 'Somatic'
      ? 900 - accuracy * 700
      : 1 + accuracy * 11;
    const stage = thresholdToStage(currentLine, threshold);
    altitudes[currentLine] = stage;
    nextLine();
  }

  function nextLine() {
    selectedChoice = null;
    if (currentLineIdx < calibrationOrder.length - 1) {
      currentLineIdx++;
    } else {
      completeCalibration();
    }
  }

  async function completeCalibration() {
    phase = 'creating';

    // Fill any missing altitudes with Red (fallback)
    for (const line of ALL_LINES) {
      if (!altitudes[line]) altitudes[line] = 'Red';
    }

    // Synthesize the current stage from the highest altitude
    const stageOrder = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'] as const;
    const currentStage = (Object.values(altitudes) as Stage[]).reduce<Stage>((max, s) =>
      stageOrder.indexOf(s) > stageOrder.indexOf(max) ? s : max
    , 'Red');

    const id = `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const sig = createSignificator(id, altitudes as Record<Line, Stage>, currentStage);

    try {
      localStorage.setItem('profile:v1', JSON.stringify(sig));
    } catch (err) {
      console.error('[onboarding] failed to persist Significator:', err);
      showToast('Failed to save progress', 'danger');
      phase = 'calibrating';
      return;
    }

    setSignificator(sig);
    showToast('Calibration complete — your journey begins', 'success', 3000);
    phase = 'done';
    setTimeout(() => goto('/play'), 1200);
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
          <p class="welcome-sub">
            First, a brief calibration: 8 short questions to set your starting altitudes.
            There are no wrong answers.
          </p>
          <Button variant="primary" size="lg" onclick={beginCalibration}>
            Begin Calibration
          </Button>
        </Stack>
      </div>
    {:else if phase === 'calibrating' && currentPrompt}
      <div in:stageFade={{ duration: 400 }}>
        <Stack gap="space-5">
          <Cluster gap="space-2" justify="between" wrap={false}>
            <h2 class="calibration-title">{currentLine}</h2>
            <Badge variant="default">{currentLineIdx + 1} / {calibrationOrder.length}</Badge>
          </Cluster>

          {#if isHoldProbe}
            <HoldProbe
              line={currentLine as 'Somatic' | 'Willpower'}
              targetMs={HOLD_TARGETS[currentLine as 'Somatic' | 'Willpower']!}
              oncomplete={onHoldComplete}
            />
          {:else}
            <Card variant="elevated" padding="space-6">
              <Stack gap="space-4">
                <p class="prompt-text">{currentPrompt.prompt}</p>
                <Stack gap="space-2">
                  {#each currentPrompt.options as option, i (option)}
                    <button
                      class="option"
                      class:selected={selectedChoice === i}
                      onclick={() => selectChoice(i)}
                      aria-pressed={selectedChoice === i}
                    >
                      <span class="option-marker" aria-hidden="true">
                        {#if selectedChoice === i}●{:else}○{/if}
                      </span>
                      <span class="option-label">{option}</span>
                    </button>
                  {/each}
                </Stack>
              </Stack>
            </Card>
            <Cluster gap="space-3" justify="end">
              <Button variant="primary" onclick={submitChoice} disabled={selectedChoice === null}>
                {currentLineIdx < calibrationOrder.length - 1 ? 'Next' : 'Complete Calibration'}
              </Button>
            </Cluster>
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
    margin: 0;
  }

  .welcome-sub {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    text-align: center;
    font-style: italic;
    margin: 0;
  }

  .calibration-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xl);
    font-weight: 700;
    color: var(--ccrpg-accent);
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .prompt-text {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-md);
    line-height: var(--ccrpg-leading-relaxed);
    color: var(--ccrpg-fg);
    margin: 0;
  }

  .option {
    display: flex;
    align-items: flex-start;
    gap: var(--ccrpg-space-3);
    width: 100%;
    padding: var(--ccrpg-space-3) var(--ccrpg-space-4);
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius);
    cursor: pointer;
    text-align: left;
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    -webkit-tap-highlight-color: transparent;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease),
                border-color var(--ccrpg-duration-fast) var(--ccrpg-ease);
  }

  .option:hover {
    background: var(--ccrpg-surface-elevated);
    border-color: var(--ccrpg-accent);
  }

  .option.selected {
    background: var(--ccrpg-accent-soft);
    border-color: var(--ccrpg-accent);
    color: var(--ccrpg-accent-fg);
  }

  .option-marker {
    flex-shrink: 0;
    color: var(--ccrpg-accent);
  }

  .option.selected .option-marker {
    color: var(--ccrpg-accent-fg);
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
