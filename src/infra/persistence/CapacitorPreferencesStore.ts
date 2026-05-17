import { Preferences } from '@capacitor/preferences';
import type { KeyValueStore } from './KeyValueStore.js';

/**
 * Capacitor Preferences-backed KV store. Bridges to native SharedPreferences
 * on Android and equivalent platforms. Async-only as required by the API.
 */
export class CapacitorPreferencesStore implements KeyValueStore {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  }
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
