import type { KeyValueStore } from './KeyValueStore.js';
import type { AccessibilitySettings } from '../../core/accessibility/AccessibilitySettings.js';

const A11Y_KEY = 'ccrpg:accessibility';

export class AccessibilityStore {
  constructor(private readonly kv: KeyValueStore) {}

  async save(settings: AccessibilitySettings): Promise<void> {
    const json = JSON.stringify(settings);
    await this.kv.set(A11Y_KEY, json);
  }

  async load(): Promise<AccessibilitySettings | null> {
    const json = await this.kv.get(A11Y_KEY);
    if (!json) return null;
    return JSON.parse(json) as AccessibilitySettings;
  }

  async clear(): Promise<void> {
    await this.kv.remove(A11Y_KEY);
  }
}
