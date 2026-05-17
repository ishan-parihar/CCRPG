import { Capacitor } from '@capacitor/core';
import type { KeyValueStore } from './KeyValueStore.js';
import { CapacitorPreferencesStore } from './CapacitorPreferencesStore.js';
import { LocalStorageStore } from './LocalStorageStore.js';

/**
 * Pick the best available KV implementation for the current runtime.
 * - On native (Android/iOS) → Capacitor Preferences (SharedPreferences).
 * - On the web/dev          → localStorage with namespaced keys.
 */
export function createKeyValueStore(): KeyValueStore {
  try {
    if (Capacitor.isNativePlatform()) {
      return new CapacitorPreferencesStore();
    }
  } catch {
    // Capacitor not initialized (very early bootstrap) — fall back.
  }
  return new LocalStorageStore();
}
