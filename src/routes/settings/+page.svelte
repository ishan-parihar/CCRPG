<script lang="ts">
  /**
   * /settings route — Svelte-native settings.
   *
   * Uses the new component library: RouteShell, Card, Toggle, Modal, Button.
   * Toggles wire to accessibilityStore + A11yApplier → data-* on <html>.
   * Reset modal uses the accessible Modal (focus trap, Escape, restore-focus).
   */

  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Toggle from '$lib/components/Toggle.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Button from '$lib/components/Button.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import Cluster from '$lib/components/Cluster.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { accessibilityStore, updateAccessibility, resetAccessibility } from '$lib/stores/accessibilityStore.js';
  import { resetSavesInStorage } from '$lib/stores/saveHydration.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { showToast } from '$lib/stores/toastStore.js';
  import { stageFade } from '$lib/transitions/stageMotion.js';

  const settings = $derived($accessibilityStore);

  let showResetConfirm = $state(false);
  let isResetting = $state(false);

  function toggleHighContrast() {
    updateAccessibility({ highContrast: !settings.highContrast });
    showToast(settings.highContrast ? 'High contrast off' : 'High contrast on', 'info', 2000);
  }

  function toggleReducedMotion() {
    updateAccessibility({ reducedMotion: !settings.reducedMotion });
    showToast(settings.reducedMotion ? 'Motion restored' : 'Motion reduced', 'info', 2000);
  }

  function toggleTelemetry() {
    updateAccessibility({ telemetryOptIn: !settings.telemetryOptIn });
    showToast(settings.telemetryOptIn ? 'Telemetry disabled' : 'Telemetry enabled', 'info', 2000);
  }

  function confirmReset() {
    if (!browser) return;
    isResetting = true;
    try {
      resetSavesInStorage();
      resetAccessibility();
      setSignificator(null);
      showResetConfirm = false;
      isResetting = false;
      showToast('All data reset', 'success', 2000);
      goto('/');
    } catch (err) {
      console.error('Reset failed:', err);
      isResetting = false;
      showToast('Reset failed', 'danger', 3000);
    }
  }
</script>

<Seo
  title="Settings"
  description="Adjust accessibility (high contrast, reduced motion), privacy (telemetry opt-in), and manage your save data."
/>

<RouteShell title="Settings" back="/">
  <Stack gap="space-5">
    <!-- Accessibility -->
    <section in:stageFade={{ delay: 60 }}>
      <Stack gap="space-3">
        <h2 class="section-title">Accessibility</h2>
        <Card padding="space-0">
          <Stack gap="space-0">
            <div class="setting-row">
              <div class="setting-label">
                <span class="setting-name">High Contrast</span>
                <span class="setting-desc">Increase visual contrast for readability</span>
              </div>
              <Toggle
                checked={settings.highContrast}
                onchange={toggleHighContrast}
                ariaLabel="Toggle high contrast"
              />
            </div>
            <div class="setting-divider" role="presentation"></div>
            <div class="setting-row">
              <div class="setting-label">
                <span class="setting-name">Reduced Motion</span>
                <span class="setting-desc">Disable animations and transitions</span>
              </div>
              <Toggle
                checked={settings.reducedMotion}
                onchange={toggleReducedMotion}
                ariaLabel="Toggle reduced motion"
              />
            </div>
          </Stack>
        </Card>
      </Stack>
    </section>

    <!-- Privacy -->
    <section in:stageFade={{ delay: 120 }}>
      <Stack gap="space-3">
        <h2 class="section-title">Privacy</h2>
        <Card padding="space-0">
          <Stack gap="space-0">
            <div class="setting-row">
              <div class="setting-label">
                <span class="setting-name">Telemetry</span>
                <span class="setting-desc">Share anonymous usage data to help improve the game</span>
              </div>
              <Toggle
                checked={settings.telemetryOptIn}
                onchange={toggleTelemetry}
                ariaLabel="Toggle telemetry"
              />
            </div>
            <div class="setting-divider" role="presentation"></div>
            <a class="setting-row setting-link" href="/telemetry">
              <div class="setting-label">
                <span class="setting-name">What data is collected?</span>
                <span class="setting-desc">View every event type and sample payload</span>
              </div>
              <span class="link-arrow" aria-hidden="true"><Icon name="arrow-right" size={18} /></span>
            </a>
          </Stack>
        </Card>
      </Stack>
    </section>

    <!-- Account -->
    <section in:stageFade={{ delay: 150 }}>
      <Stack gap="space-3">
        <h2 class="section-title">Account</h2>
        <Card padding="space-0">
          <a class="setting-row setting-link" href="/recover">
            <div class="setting-label">
              <span class="setting-name">Recover Save</span>
              <span class="setting-desc">Restore your progress on a new device</span>
            </div>
            <span class="link-arrow" aria-hidden="true"><Icon name="arrow-right" size={18} /></span>
          </a>
        </Card>
      </Stack>
    </section>

    <!-- Data -->
    <section in:stageFade={{ delay: 180 }}>
      <Stack gap="space-3">
        <h2 class="section-title danger">Data</h2>
        <Card variant="default" padding="space-5">
          <Stack gap="space-3">
            <div class="setting-label">
              <span class="setting-name">Reset all data</span>
              <span class="setting-desc">Permanently delete your Significator, WorldState, and all telemetry data. This cannot be undone.</span>
            </div>
            <Button variant="danger" onclick={() => (showResetConfirm = true)}>
              Reset all data
            </Button>
          </Stack>
        </Card>
      </Stack>
    </section>
  </Stack>
</RouteShell>

<Modal open={showResetConfirm} onclose={() => (showResetConfirm = false)} title="Reset all data?" size="sm">
  <Stack gap="space-4">
    <p class="modal-warning">
      This will permanently delete your Significator, WorldState, and all telemetry data.
      Your journey will begin anew.
    </p>
    <Cluster gap="space-3" justify="end">
      <Button variant="ghost" onclick={() => (showResetConfirm = false)} disabled={isResetting}>
        Cancel
      </Button>
      <Button variant="danger" onclick={confirmReset} loading={isResetting}>
        Yes, reset everything
      </Button>
    </Cluster>
  </Stack>
</Modal>

<style>
  .section-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-md);
    font-weight: 600;
    color: var(--ccrpg-fg);
    margin: 0;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .section-title.danger {
    color: var(--ccrpg-danger);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ccrpg-space-4);
    padding: var(--ccrpg-space-4) var(--ccrpg-space-5);
  }

  .setting-link {
    text-decoration: none;
    color: inherit;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .setting-link:hover {
    background: var(--ccrpg-surface-elevated);
  }

  .setting-link:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: -2px;
  }

  .setting-divider {
    height: 1px;
    background: var(--ccrpg-border);
    margin: 0 var(--ccrpg-space-5);
  }

  .setting-label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .setting-name {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    font-weight: 500;
    color: var(--ccrpg-fg);
  }

  .setting-desc {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
    line-height: var(--ccrpg-leading-normal);
  }

  .link-arrow {
    color: var(--ccrpg-fg-muted);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .modal-warning {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg);
    line-height: var(--ccrpg-leading-relaxed);
    margin: 0;
  }

  /* Desktop: 2-column layout */
  @media (min-width: 1024px) {
    :global(.route-shell) {
      max-width: var(--ccrpg-content-max-width-wide);
    }
  }
</style>
