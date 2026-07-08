<script lang="ts">
  /**
   * /settings route — Svelte replacement for SettingsScene.
   *
   * Proof-of-pattern for Phase 1 scene migration. Shows that a Phaser
   * menu scene can become a Svelte route with:
   * - Same functionality (accessibility toggles, reset, back)
   * - Better accessibility (semantic HTML, keyboard nav, ARIA)
   * - Smaller bundle (no Phaser needed for this route)
   * - Design-token ready (Phase 2 will skin via data-stage)
   *
   * Phase 2: wire to actual AccessibilityStore + SaveRepository
   * (currently uses local state as a stub — full wiring is Phase 2 work).
   */

  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let highContrast = $state(false);
  let telemetry = $state(true);
  let showResetConfirm = $state(false);

  // Phase 2: load actual settings from AccessibilityStore on mount.
  // For Phase 1 proof-of-pattern, we use local state.

  function backToMenu() {
    goto('/');
  }

  async function confirmReset() {
    if (!browser) return;
    // Phase 2: wire to SaveRepository.resetProfile() + resetWorldState()
    // For now, just close the dialog and navigate to onboarding.
    showResetConfirm = false;
    goto('/');
  }

  function toggleHighContrast() {
    highContrast = !highContrast;
    // Phase 2: AccessibilityManager.update({ highContrast })
  }

  function toggleTelemetry() {
    telemetry = !telemetry;
    // Phase 2: persist to AccessibilityStore
  }
</script>

<svelte:head>
  <title>CCRPG — Settings</title>
</svelte:head>

<div class="settings-route">
  <header class="settings-header">
    <button class="back-btn" onclick={backToMenu} aria-label="Back to menu">
      ← Back
    </button>
    <h1>Settings</h1>
  </header>

  <main class="settings-content">
    <section class="setting-group">
      <h2>Accessibility</h2>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">High Contrast</span>
          <span class="setting-desc">Increase visual contrast for readability</span>
        </div>
        <button
          class="toggle"
          class:on={highContrast}
          onclick={toggleHighContrast}
          role="switch"
          aria-checked={highContrast}
          aria-label="Toggle high contrast"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>
    </section>

    <section class="setting-group">
      <h2>Privacy</h2>

      <div class="setting-row">
        <div class="setting-label">
          <span class="setting-name">Telemetry</span>
          <span class="setting-desc">Share anonymous usage data to help improve the game</span>
        </div>
        <button
          class="toggle"
          class:on={telemetry}
          onclick={toggleTelemetry}
          role="switch"
          aria-checked={telemetry}
          aria-label="Toggle telemetry"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>
    </section>

    <section class="setting-group danger">
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
      onclick={() => (showResetConfirm = false)}
    >
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <h2 id="reset-title">Reset all progress?</h2>
        <p>This will permanently delete your Significator, WorldState, and all encounter history.</p>
        <div class="modal-actions">
          <button class="modal-cancel" onclick={() => (showResetConfirm = false)}>
            Cancel
          </button>
          <button class="modal-confirm" onclick={confirmReset}>
            Yes, reset everything
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-route {
    min-height: 100vh;
    background: #05070b;
    color: #e7eaf2;
    font-family: system-ui, sans-serif;
    padding: 1rem;
    padding-top: env(safe-area-inset-top, 1rem);
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .back-btn {
    background: rgba(20, 13, 34, 0.8);
    border: 1px solid rgba(76, 201, 240, 0.4);
    color: #e7eaf2;
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 180ms ease;
  }

  .back-btn:hover {
    background: rgba(40, 26, 68, 0.9);
  }

  .settings-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .setting-group h2 {
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #88ccff;
    margin: 0 0 1rem 0;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: rgba(12, 19, 34, 0.6);
    border: 1px solid rgba(26, 42, 74, 0.5);
    border-radius: 8px;
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .setting-name {
    font-size: 1rem;
    font-weight: 500;
  }

  .setting-desc {
    font-size: 0.8125rem;
    color: #8899aa;
  }

  .toggle {
    width: 48px;
    height: 28px;
    background: rgba(40, 50, 70, 0.8);
    border: 1px solid rgba(76, 201, 240, 0.3);
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: background 200ms ease;
    flex-shrink: 0;
  }

  .toggle.on {
    background: rgba(76, 201, 240, 0.4);
    border-color: rgba(76, 201, 240, 0.8);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: #e7eaf2;
    border-radius: 50%;
    transition: transform 200ms ease;
  }

  .toggle.on .toggle-knob {
    transform: translateX(20px);
  }

  .danger-btn {
    background: rgba(40, 10, 20, 0.8);
    border: 1px solid rgba(255, 102, 102, 0.5);
    color: #ff8888;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 180ms ease;
    flex-shrink: 0;
  }

  .danger-btn:hover {
    background: rgba(60, 20, 30, 0.9);
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
    background: #0c1322;
    border: 1px solid rgba(255, 102, 102, 0.4);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 400px;
    width: 100%;
  }

  .modal h2 {
    font-size: 1.125rem;
    margin: 0 0 0.75rem 0;
    color: #ff8888;
  }

  .modal p {
    font-size: 0.875rem;
    color: #a8b3c7;
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
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 180ms ease;
  }

  .modal-cancel {
    background: rgba(40, 50, 70, 0.8);
    border: 1px solid rgba(76, 201, 240, 0.3);
    color: #e7eaf2;
  }

  .modal-cancel:hover {
    background: rgba(60, 70, 90, 0.9);
  }

  .modal-confirm {
    background: rgba(60, 20, 30, 0.9);
    border: 1px solid rgba(255, 102, 102, 0.6);
    color: #ff8888;
  }

  .modal-confirm:hover {
    background: rgba(80, 30, 40, 1);
  }
</style>
