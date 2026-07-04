import { describe, it, expect } from 'vitest';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import { AccessibilityStore } from '../../src/infra/persistence/AccessibilityStore.js';
import { createDefaultSettings } from '../../src/core/accessibility/AccessibilitySettings.js';

describe('AccessibilityStore', () => {
  it('load returns null when no settings saved', async () => {
    const store = new AccessibilityStore(new InMemoryStore());
    const result = await store.load();
    expect(result).toBeNull();
  });

  it('save/load round-trip preserves settings', async () => {
    const kv = new InMemoryStore();
    const store = new AccessibilityStore(kv);
    const settings = {
      ...createDefaultSettings(),
      reducedMotion: true,
      fontSize: 'large' as const,
    };
    await store.save(settings);
    const loaded = await store.load();
    expect(loaded).toEqual(settings);
  });

  it('clear removes saved settings', async () => {
    const kv = new InMemoryStore();
    const store = new AccessibilityStore(kv);
    await store.save(createDefaultSettings());
    await store.clear();
    const result = await store.load();
    expect(result).toBeNull();
  });
});
