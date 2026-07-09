<script lang="ts">
  /**
   * Root page (/) — the main menu hub.
   *
   * Replaces the old Phaser MainMenuScene. This is now the Svelte-designed
   * entry point that links to all routes:
   *   /play        → Phaser gameplay (World, Encounter, etc.)
   *   /profile     → RadialChartScene (developmental profile)
   *   /journal     → JournalScene (codex entries + vows)
   *   /codex       → CodexScene (unlocked codex entries)
   *   /settings    → SettingsScene (a11y, privacy, reset)
   *   /recover     → Save recovery via 12-word mnemonic
   *   /telemetry   → Telemetry transparency
   *
   * If no Significator exists, the player is redirected to /play which
   * boots Phaser and routes to OnboardingScene.
   *
   * Veil compliance: all stats use veilDescriptors (no raw numbers/labels).
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import VeiledStat from '$lib/components/VeiledStat.svelte';
  import { gameStore } from '$lib/stores/gameStore.js';
  import { loadSignificatorFromStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { describeSignificator } from '$core/presentation/veilDescriptors.js';
  import { stageFade, stageFly } from '$lib/transitions/stageMotion.js';
  import type { Significator } from '$core/domain/Significator.js';

  const sig = $derived($gameStore.significator);
  const descriptors = $derived(sig ? describeSignificator(sig) : null);

  onMount(() => {
    if (!browser) return;
    // Hydrate from localStorage if not already loaded.
    if (!$gameStore.significator) {
      const loaded = loadSignificatorFromStorage();
      if (loaded) {
        setSignificator(loaded);
      } else {
        // No save → boot Phaser which routes to onboarding.
        goto('/play');
      }
    }
  });

  interface NavItem {
    readonly href: string;
    readonly label: string;
    readonly desc: string;
    readonly variant: 'primary' | 'default' | 'muted';
  }

  const navItems: NavItem[] = [
    { href: '/play', label: 'Continue', desc: 'Enter the world', variant: 'primary' },
    { href: '/profile', label: 'Developmental Profile', desc: 'View your 8-line developmental shape', variant: 'default' },
    { href: '/journal', label: 'Journal', desc: 'Codex entries and vows', variant: 'default' },
    { href: '/codex', label: 'Codex', desc: 'Unlocked knowledge', variant: 'default' },
    { href: '/settings', label: 'Settings', desc: 'Accessibility, privacy, data', variant: 'muted' },
  ];

  const secondaryItems: NavItem[] = [
    { href: '/recover', label: 'Recover Save', desc: 'Restore on a new device', variant: 'muted' },
    { href: '/telemetry', label: 'Telemetry', desc: 'What data is collected', variant: 'muted' },
  ];
</script>

<Seo
  title="Cognitive Combat"
  description="A Cognitive-Capacity-Driven RPG where every gameplay verb is a gamified developmental assessment across 8 lines of intelligence × 8 stages of consciousness."
/>

<div class="menu-route">
  <!-- Header -->
  <header class="menu-header" in:stageFade={{ duration: 500 }}>
    <h1 class="menu-title">CCRPG</h1>
    <p class="menu-subtitle">Cognitive Combat RPG</p>
  </header>

  {#if descriptors}
    <!-- Profile summary (Veil-compliant) -->
    <section class="profile-card" in:stageFly={{ y: 20, delay: 150, duration: 500 }}>
      <VeiledStat descriptor={descriptors.stageAesthetic} label="The World" variant="accent" />
      <VeiledStat descriptor={descriptors.driveDescriptor} label="Tendencies" variant="muted" />
      <VeiledStat descriptor={descriptors.encounterDescriptor} label="Path" variant="muted" />
      <VeiledStat descriptor={descriptors.sessionDescriptor} label="Presence" variant="muted" />
    </section>
  {:else}
    <section class="profile-card" in:stageFly={{ y: 20, delay: 150, duration: 500 }}>
      <p class="no-save">No save found. Enter the world to begin.</p>
    </section>
  {/if}

  <!-- Primary navigation -->
  <nav class="nav-list" aria-label="Main navigation">
    {#each navItems as item, i}
      <a
        class="nav-item nav-{item.variant}"
        href={item.href}
        in:stageFly={{ y: 24, delay: 300 + i * 80, duration: 400 }}
      >
        <span class="nav-label">{item.label}</span>
        <span class="nav-desc">{item.desc}</span>
        <span class="nav-arrow" aria-hidden="true">→</span>
      </a>
    {/each}
  </nav>

  <!-- Secondary navigation -->
  <nav class="nav-list secondary" aria-label="Secondary navigation">
    {#each secondaryItems as item, i}
      <a
        class="nav-item nav-{item.variant}"
        href={item.href}
        in:stageFly={{ y: 16, delay: 700 + i * 60, duration: 350 }}
      >
        <span class="nav-label">{item.label}</span>
        <span class="nav-arrow" aria-hidden="true">→</span>
      </a>
    {/each}
  </nav>
</div>

<style>
  .menu-route {
    min-height: 100vh;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 1.5rem 1rem;
    padding-top: calc(1.5rem + env(safe-area-inset-top, 0px));
    overflow-y: auto;
    touch-action: pan-y;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .menu-header {
    text-align: center;
  }

  .menu-title {
    font-family: var(--ccrpg-font-display, serif);
    font-size: clamp(2.5rem, 10vw, 4rem);
    font-weight: 700;
    color: var(--ccrpg-fg, #e7eaf2);
    letter-spacing: 0.1em;
    margin: 0;
    line-height: 1;
  }

  .menu-subtitle {
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: 0.875rem;
    color: var(--ccrpg-accent, #b8252a);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0.5rem 0 0 0;
  }

  .profile-card {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.5rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    border-top: 2px solid var(--ccrpg-accent, #b8252a);
  }

  .no-save {
    color: var(--ccrpg-fg-muted, #a89080);
    font-style: italic;
    margin: 0;
    text-align: center;
  }

  .nav-list {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .nav-list.secondary {
    max-width: 400px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    text-decoration: none;
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease),
                border-color var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease),
                transform var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:hover {
    background: var(--ccrpg-surface-elevated, #261818);
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .nav-item:active {
    transform: scale(0.98);
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--ccrpg-accent, #b8252a);
    outline-offset: 2px;
  }

  .nav-primary {
    background: var(--ccrpg-accent, #b8252a);
    border-color: var(--ccrpg-accent, #b8252a);
    color: var(--ccrpg-accent-fg, #ffffff);
  }

  .nav-primary:hover {
    background: var(--ccrpg-accent-soft, #5a1318);
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .nav-muted {
    background: transparent;
    border-color: transparent;
    padding: 0.625rem 1.25rem;
  }

  .nav-muted:hover {
    background: var(--ccrpg-surface, #1a0f0f);
    border-color: var(--ccrpg-border, rgba(184, 37, 42, 0.2));
  }

  .nav-label {
    font-size: 1rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .nav-desc {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    flex: 1;
    text-align: right;
  }

  .nav-muted .nav-desc {
    display: none;
  }

  .nav-arrow {
    font-size: 1.125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    flex-shrink: 0;
  }

  .nav-primary .nav-arrow {
    color: var(--ccrpg-accent-fg, #ffffff);
  }

  @media (max-width: 480px) {
    .nav-desc {
      display: none;
    }
  }
</style>
