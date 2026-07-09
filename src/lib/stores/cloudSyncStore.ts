/**
 * CloudSyncStore — writes encrypted save blobs to the BFF.
 *
 * Closes the implementation gap where /recover could read saves from the
 * BFF but nothing was writing them. This module:
 *
 *   1. Generates a deviceId on first run (stored in localStorage)
 *   2. Debounces Significator mutations (500ms) and POSTs to /api/save
 *   3. On session_ended (via phaserEventAdapter), flushes immediately
 *   4. If the BFF is unreachable (BUILD_TARGET=static / offline), silently
 *      no-ops — local saves still work, recovery just isn't available
 *
 * The save blob is the raw Significator JSON. Phase 3 (future) will add
 * client-side E2E encryption via CryptoStore before POSTing.
 *
 * Security: the deviceId is generated client-side and stored in localStorage.
 * It's not a secret — it's just an identifier. The 12-word recovery mnemonic
 * (bound to deviceId via /api/recovery/generate) is the secret.
 */

import type { Significator } from '$core/domain/Significator.js';

const DEVICE_ID_KEY = 'ccrpg:device-id';
const SYNC_DEBOUNCE_MS = 500;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedSig: Significator | null = null;

/** Get or create the device ID. Generated once, stored in localStorage. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * POST a save blob to the BFF. Returns true on success, false on failure.
 * Failures are silent — cloud sync is best-effort.
 */
async function postSave(sig: Significator): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const deviceId = getDeviceId();
    const blob = JSON.stringify(sig);
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, blob }),
    });
    return res.ok;
  } catch {
    // Network error / BFF unreachable — silent fail.
    return false;
  }
}

/**
 * Debounced sync — called on every Significator mutation.
 * Waits 500ms after the last mutation before POSTing.
 */
export function debouncedSync(sig: Significator): void {
  if (typeof window === 'undefined') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void postSave(sig);
    lastSyncedSig = sig;
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Immediate flush — called on session_ended and beforeunload.
 * Skips if nothing changed since the last sync.
 */
export async function flushSync(sig: Significator | null): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!sig) return;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  // Skip if unchanged (deep compare via JSON — Significator is serializable)
  const sigJson = JSON.stringify(sig);
  const lastJson = lastSyncedSig ? JSON.stringify(lastSyncedSig) : '';
  if (sigJson === lastJson) return;
  await postSave(sig);
  lastSyncedSig = sig;
}

/**
 * Generate a 12-word recovery mnemonic bound to this device.
 * Called once on first cloud sync (or on user request from /settings).
 * Returns the mnemonic — the server stores only its hash.
 */
export async function generateRecoveryMnemonic(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const deviceId = getDeviceId();
    const res = await fetch('/api/recovery/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.mnemonic as string;
  } catch {
    return null;
  }
}
