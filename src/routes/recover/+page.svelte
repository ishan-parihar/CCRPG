<script lang="ts">
  /**
   * /recover route — restore save on a new device via 12-word mnemonic.
   *
   * Audit fix I3: The BFF has /api/recovery/generate and /api/recovery/restore
   * endpoints, but there was no UI for a player to enter their mnemonic and
   * restore their save. This route closes that gap.
   *
   * Flow:
   *   1. Player enters their 12-word mnemonic
   *   2. POST /api/recovery/restore → returns deviceId
   *   3. GET /api/save?deviceId=… → returns encrypted save blob
   *   4. Decrypt + store in localStorage → redirect to /
   *
   * If the BFF is unreachable (BUILD_TARGET=static / offline), show a
   * friendly error explaining cloud recovery requires an internet connection.
   */

  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import { setSignificator } from '$lib/stores/gameStore.js';
  import { validateSignificator } from '$infra/persistence/validateSignificator.js';

  let words = $state(Array(12).fill(''));
  let error = $state<string | null>(null);
  let isRecovering = $state(false);
  let inputs: HTMLInputElement[] = [];

  function backToMenu() {
    goto('/');
  }

  function handleInput(i: number, value: string) {
    words[i] = value.trim().toLowerCase();
    error = null;
    // Auto-focus next input on space or when current is filled
    if (value.includes(' ')) {
      // Paste handler — split on spaces and distribute
      const pasted = value.trim().toLowerCase().split(/\s+/);
      for (let j = 0; j < 12 && j < pasted.length; j++) {
        words[j] = pasted[j] ?? '';
      }
      words = [...words]; // trigger reactivity
      // Focus the last filled input
      const lastIdx = Math.min(pasted.length, 11);
      inputs[lastIdx]?.focus();
    } else if (value.length >= 4 && i < 11) {
      // Auto-advance for typical word lengths
      inputs[i + 1]?.focus();
    }
  }

  function handleKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !words[i] && i > 0) {
      inputs[i - 1]?.focus();
    } else if (e.key === 'Enter' && i < 11) {
      inputs[i + 1]?.focus();
    }
  }

  async function attemptRecovery() {
    if (!browser) return;
    const filled = words.filter((w) => w.length > 0);
    if (filled.length !== 12) {
      error = 'Please enter all 12 words.';
      return;
    }

    isRecovering = true;
    error = null;

    try {
      const mnemonic = words.join(' ');

      // Step 1: exchange mnemonic for deviceId
      const restoreRes = await fetch('/api/recovery/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic }),
      });

      if (!restoreRes.ok) {
        const detail = await restoreRes.json().catch(() => ({}));
        if (restoreRes.status === 404) {
          error = 'That recovery phrase was not recognized. Check each word and try again.';
        } else if (restoreRes.status === 429) {
          error = 'Too many recovery attempts. Please wait a few minutes and try again.';
        } else {
          error = detail?.error ?? `Recovery failed (${restoreRes.status})`;
        }
        isRecovering = false;
        return;
      }

      const { deviceId } = await restoreRes.json();

      // Step 2: fetch the encrypted save blob
      const saveRes = await fetch(`/api/save?deviceId=${encodeURIComponent(deviceId)}`);
      if (!saveRes.ok) {
        if (saveRes.status === 404) {
          error = 'No save found for that recovery phrase. It may have been deleted.';
        } else {
          error = `Failed to fetch save (${saveRes.status})`;
        }
        isRecovering = false;
        return;
      }

      const saveData = await saveRes.json();

      // Step 3: decrypt + store in localStorage
      // The save blob is currently stored as a JSON string in the blob field.
      // Phase 3 will add client-side E2E encryption; for now, the blob is
      // the raw Significator JSON (dev mode) or encrypted (prod, future).
      try {
        const sig = validateSignificator(JSON.parse(saveData.blob));
        if (!sig) throw new Error('Invalid save data');
        localStorage.setItem('profile:v1', JSON.stringify(sig));
        setSignificator(sig);
        goto('/');
      } catch {
        error = 'The recovered save data was corrupt. Contact support.';
        isRecovering = false;
      }
    } catch (err) {
      error = 'Could not reach the recovery service. Check your internet connection.';
      isRecovering = false;
    }
  }
</script>

<Seo
  title="Recover Save"
  description="Restore your CCRPG progress on a new device using your 12-word recovery phrase."
  indexable={false}
/>

<div class="recover-route" in:stageFade>
  <header class="recover-header">
    <BackButton onclick={backToMenu} label="Back" />
    <h1>Recover Save</h1>
  </header>

  <main class="recover-content">
    <p class="recover-intro">
      Enter your 12-word recovery phrase to restore your progress on this device.
      You can paste the full phrase into any word box.
    </p>

    <div class="word-grid">
      {#each words as word, i}
        <div class="word-cell">
          <label for="word-{i}" class="word-label">{i + 1}</label>
          <input
            id="word-{i}"
            bind:this={inputs[i]}
            type="text"
            value={word}
            oninput={(e) => handleInput(i, e.currentTarget.value)}
            onkeydown={(e) => handleKeydown(i, e)}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            class="word-input"
            disabled={isRecovering}
          />
        </div>
      {/each}
    </div>

    {#if error}
      <p class="recover-error" role="alert">{error}</p>
    {/if}

    <button
      class="recover-button"
      onclick={attemptRecovery}
      disabled={isRecovering || words.filter((w) => w.length > 0).length !== 12}
    >
      {isRecovering ? 'Recovering…' : 'Restore Save'}
    </button>

    <p class="recover-note">
      Lost your recovery phrase? Unfortunately, saves cannot be restored without it.
      This is by design — your data is yours alone.
    </p>
  </main>
</div>

<style>
  .recover-route {
    min-height: 100vh;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 1rem;
    padding-top: calc(1rem + env(safe-area-inset-top, 0px));
    overflow-y: auto;
    touch-action: pan-y;
  }

  .recover-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .recover-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .recover-content {
    max-width: 600px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .recover-intro {
    font-size: 0.9375rem;
    color: var(--ccrpg-fg-muted, #a89080);
    line-height: 1.6;
    margin: 0 0 2rem 0;
  }

  .word-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 640px) {
    .word-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .word-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .word-label {
    font-size: 0.75rem;
    color: var(--ccrpg-fg-muted, #a89080);
    padding-left: 0.5rem;
  }

  .word-input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius, 6px);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, monospace);
    font-size: 0.875rem;
    outline: none;
    transition: border-color var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .word-input:focus {
    border-color: var(--ccrpg-accent, #b8252a);
  }

  .recover-error {
    color: #ff8c9d;
    font-size: 0.875rem;
    margin: 0 0 1.5rem 0;
    padding: 0.75rem 1rem;
    background: rgba(255, 77, 109, 0.1);
    border: 1px solid rgba(255, 77, 109, 0.3);
    border-radius: var(--ccrpg-radius, 6px);
  }

  .recover-button {
    width: 100%;
    padding: 0.875rem;
    background: var(--ccrpg-accent, #b8252a);
    border: 1px solid var(--ccrpg-accent, #b8252a);
    color: var(--ccrpg-accent-fg, #ffffff);
    border-radius: var(--ccrpg-radius, 6px);
    font-family: var(--ccrpg-font-body, system-ui);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .recover-button:hover:not(:disabled) {
    background: var(--ccrpg-accent-soft, #5a1318);
  }

  .recover-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .recover-note {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    line-height: 1.5;
    margin: 2rem 0 0 0;
    text-align: center;
  }
</style>
