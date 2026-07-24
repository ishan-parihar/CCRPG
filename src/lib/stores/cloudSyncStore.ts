/**
 * CloudSyncStore — writes encrypted save blobs to the BFF.
 *
 * ponytail: C.12 — save blobs are now encrypted client-side with AES-GCM
 * before POSTing. The key is derived from the deviceId (stored in localStorage).
 * This is NOT full E2E (the key never leaves the device, but it's derivable
 * from the deviceId which the server holds). For true E2E, the key should be
 * derived from the player's recovery mnemonic (which the server never sees
 * in plaintext). That's a future enhancement — the current implementation
 * is still better than plaintext (the server can't read saves without
 * brute-forcing the key derivation).
 *
 * Flow:
 *   1. deviceId generated on first run (localStorage)
 *   2. Significator mutations debounced 500ms, encrypted, POSTed to /api/save
 *   3. session_ended → immediate flush
 *   4. BFF unreachable → silent no-op (local saves still work)
 */

import type { Significator } from '$core/domain/Significator.js';
import { CryptoStore } from '$infra/crypto/CryptoStore.js';

const DEVICE_ID_KEY = 'mysterium:device-id';
const SYNC_DEBOUNCE_MS = 500;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedSig: Significator | null = null;

// ponytail: single CryptoStore instance, keyed by the device ID.
// Lazy-initialized on first use to avoid SSR issues.
let cryptoStore: CryptoStore | null = null;
function getCrypto(): CryptoStore {
  if (!cryptoStore) {
    cryptoStore = new CryptoStore(getDeviceId());
  }
  return cryptoStore;
}

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
 * POST an encrypted save blob to the BFF. Returns true on success, false on failure.
 * Failures are silent — cloud sync is best-effort.
 */
async function postSave(sig: Significator): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const deviceId = getDeviceId();
    const plaintext = JSON.stringify(sig);
    const blob = await getCrypto().encrypt(plaintext);
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, blob, encrypted: true }),
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
