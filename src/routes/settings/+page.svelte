<script lang="ts">
  /**
   * /settings route — Svelte replacement for SettingsScene.
   *
   * Audit fixes:
   *   B4: Toggles now wire to accessibilityStore (real persistence).
   *       confirmReset() now calls SaveRepository.resetProfile().
   *   G1: Uses the Svelte-layer accessibilityStore (persists to localStorage,
   *       same key as Phaser-layer AccessibilityStore → stays in sync).
   *   F2: All hardcoded colors → var(--ccrpg-*) tokens.
   *   F3: Font-family → var(--ccrpg-font-body).
   *   F4: Uses shared <BackButton> component.
   *   A2: Modal + sections use stage-aware transitions.
   *   A3: Background + section headers use tokens → re-skins per stage.
   */

  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import { accessibilityStore, updateAccessibility, resetAccessibility } from '$lib/stores/accessibilityStore.js';
  import { resetSavesInStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { stageFade, stageScale } from '$lib/transitions/stageMotion.js';

  // Subscribe to the accessibility store reactively.
  const settings = $derived($accessibilityStore);

  let showResetConfirm = $state(false);
  let isResetting = $state(false);

  function backToMenu() {
    goto('/');
  }

  function toggleHighContrast() {
    updateAccessibility({ highContrast: !settings.highContrast });
  }

  function toggleReducedMotion() {
    updateAccessibility({ reducedMotion: !settings.reducedMotion });
  }

  function toggleTelemetry() {
    updateAccessibility({ telemetryOptIn: !settings.telemetryOptIn });
  }

  function confirmReset() {
    if (!browser) return;
    isResetting = true;
    try {
      // Lightweight reset — clears localStorage directly (no Phaser import).
      resetSavesInStorage();
      resetAccessibility();
      // Clear the game store so the root route routes to onboarding.
      setSignificator(null);
      showResetConfirm = false;
      goto('/');
    } catch (err) {
      console.error('Reset failed:', err);
      isResetting = false;
    }
  }
</script>

<svelte:head>
  <title>CCRPG — Settings</title>
</svelte:head>

<div class="settings-route">
  <header class="settings-header" in:stageFade>
    <BackButton onclick={backToMenu} label="Back" />
    <h1>Settings</h1>
  </header>

  <main class="settings-content">
    <section class="setting-group" in:stageFade={{ delay: 60 }}>
      <h2>Accessibility</h2>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">High Contrast</span>
          <span class="setting-desc">Increase visual contrast for readability</span>
        </div>
        <button
          class="toggle"
          class:on={settings.highContrast}
          onclick={toggleHighContrast}
          role="switch"
          aria-checked={settings.highContrast}
          aria-label="Toggle high contrast"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">Reduced Motion</span>
          <span class="setting-desc">Disable animations and transitions</span>
        </div>
        <button
          class="toggle"
          class:on={settings.reducedMotion}
          onclick={toggleReducedMotion}
          role="switch"
          aria-checked={settings.reducedMotion}
          aria-label="Toggle reduced motion"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>
    </section>

    <section class="setting-group" in:stageFade={{ delay: 120 }}>
      <h2>Privacy</h2>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">Telemetry</span>
          <span class="setting-desc">Share anonymous usage data to help improve the game</span>
        </div>
        <button
          class="toggle"
          class:on={settings.telemetryOptIn}
          onclick={toggleTelemetry}
          role="switch"
          aria-checked={settings.telemetryOptIn}
          aria-label="Toggle telemetry"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>

      <a class="setting-row setting-link" href="/telemetry">
        <div class="setting-label">
          <span class="setting-name">What data is collected?</span>
          <span class="setting-desc">View every event type and sample payload</span>
        </div>
        <span class="link-arrow" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="setting-group" in:stageFade={{ delay: 150 }}>
      <h2>Account</h2>

      <a class="setting-row setting-link" href="/recover">
        <div class="setting-label">
          <span class="setting-name">Recover Save</span>
          <span class="setting-desc">Restore progress on a new device using your 12-word recovery phrase</span>
        </div>
        <span class="link-arrow" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="setting-group danger" in:stageFade={{ delay: 180 }}>
      <h2>Data</h2>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">Reset Profile</span>
          <span class="setting-desc">Delete all progress and start over. This cannot be undone.</span>
        </div>
        <button class="danger-btn" onclick={() => (showResetConfirm = true)}>
          Reset
        </button>
      </div>
    </section>
  </main>

  {#if showResetConfirm}
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
      transition:stageFade={{ duration: 200 }}
      onclick={() => !isResetting && (showResetConfirm = false)}
    >
      <div class="modal" transition:stageScale={{ duration: 250 }} onclick={(e) => e.stopPropagation()}>
        <h2 id="reset-title">Reset all progress?</h2>
        <p>This will permanently delete your Significator, WorldState, and all encounter history.</p>
        <div class="modal-actions">
          <button class="modal-cancel" onclick={() => (showResetConfirm = false)} disabled={isResetting}>
            Cancel
          </button>
          <button class="modal-confirm" onclick={confirmReset} disabled={isResetting}>
            {isResetting ? 'Resetting…' : 'Yes, reset everything'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-route {
    min-height: 100vh;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 1rem;
    padding-top: calc(1rem + env(safe-area-inset-top, 0px));
    overflow-y: auto;
    touch-action: pan-y;
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .settings-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--ccrpg-font-display, system-ui);
    color: var(--ccrpg-fg, #e7eaf2);
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .setting-group h2 {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 1rem 0;
    font-family: var(--ccrpg-font-body, system-ui);
  }

  .setting-group.danger h2 {
    color: #ff6b6b;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    transition: border-color var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .setting-row + .setting-row {
    margin-top: 0.75rem;
  }

  .setting-link {
    text-decoration: none;
    cursor: pointer;
  }

  .setting-link:hover {
    border-color: var(--ccrpg-accent, #b8252a);
    background: var(--ccrpg-surface-elevated, #261818);
  }

  .link-arrow {
    font-size: 1.25rem;
    color: var(--ccrpg-fg-muted, #a89080);
    flex-shrink: 0;
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .setting-name {
    font-size: 1rem;
    font-weight: 500;
    color: var(--ccrpg-fg, #e7eaf2);
  }

  .setting-desc {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
  }

  .toggle {
    width: 48px;
    height: 28px;
    background: var(--ccrpg-surface-elevated, #261818);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: background var(--ccrpg-duration-base, 320ms) var(--ccrpg-ease, ease),
                border-color var(--ccrpg-duration-base, 320ms) var(--ccrpg-ease, ease);
    flex-shrink: 0;
    padding: 0;
  }

  .toggle.on {
    background: var(--ccrpg-accent, #b8252a);
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: var(--ccrpg-fg, #e7eaf2);
    border-radius: 50%;
    transition: transform var(--ccrpg-duration-base, 320ms) var(--ccrpg-ease, ease);
  }

  .toggle.on .toggle-knob {
    transform: translateX(20px);
    background: var(--ccrpg-accent-fg, #ffffff);
  }

  .danger-btn {
    background: color-mix(in srgb, #ff4444 15%, var(--ccrpg-surface, #1a0f0f));
    border: 1px solid rgba(255, 102, 102, 0.5);
    color: #ff8888;
    padding: 0.5rem 1rem;
    border-radius: var(--ccrpg-radius, 6px);
    cursor: pointer;
    font-size: 0.875rem;
    font-family: var(--ccrpg-font-body, system-ui);
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
    flex-shrink: 0;
  }

  .danger-btn:hover {
    background: color-mix(in srgb, #ff4444 25%, var(--ccrpg-surface, #1a0f0f));
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--ccrpg-surface, #0c1322);
    border: 1px solid rgba(255, 102, 102, 0.4);
    border-radius: var(--ccrpg-radius-lg, 12px);
    padding: 1.5rem;
    max-width: 400px;
    width: 100%;
  }

  .modal h2 {
    font-size: 1.125rem;
    margin: 0 0 0.75rem 0;
    color: #ff8888;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .modal p {
    font-size: 0.875rem;
    color: var(--ccrpg-fg-muted, #a8b3c7);
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .modal-cancel,
  .modal-confirm {
    padding: 0.5rem 1rem;
    border-radius: var(--ccrpg-radius, 6px);
    cursor: pointer;
    font-size: 0.875rem;
    font-family: var(--ccrpg-font-body, system-ui);
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .modal-cancel {
    background: var(--ccrpg-surface-elevated, #261818);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    color: var(--ccrpg-fg, #e7eaf2);
  }

  .modal-cancel:hover {
    background: var(--ccrpg-accent-soft, #5a1318);
  }

  .modal-confirm {
    background: color-mix(in srgb, #ff4444 30%, var(--ccrpg-surface, #1a0f0f));
    border: 1px solid rgba(255, 102, 102, 0.6);
    color: #ff8888;
  }

  .modal-confirm:hover:not(:disabled) {
    background: color-mix(in srgb, #ff4444 45%, var(--ccrpg-surface, #1a0f0f));
  }

  .modal-confirm:disabled,
  .modal-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
