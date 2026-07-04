import { describe, it, expect } from 'vitest';
import { TelemetryStore } from '../../src/infra/telemetry/TelemetryStore.js';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import { CryptoStore } from '../../src/infra/crypto/CryptoStore.js';
import type { TelemetryEvent } from '../../src/core/telemetry/TelemetryEvent.js';

function makeSampleEvents(): TelemetryEvent[] {
  return [
    { id: 'e1', type: 'encounter_completed', timestamp: 1000, data: { record: 'test' } },
    { id: 'e2', type: 'shadow_surfaced', timestamp: 2000, data: { shadowId: 's1' } },
  ];
}

describe('TelemetryStore', () => {
  it('saves and loads events correctly (round-trip)', async () => {
    const kv = new InMemoryStore();
    const crypto = new CryptoStore('test-key');
    const store = new TelemetryStore(kv, crypto);

    const events = makeSampleEvents();
    await store.save(events);
    const loaded = await store.load();

    expect(loaded).toEqual(events);
  });

  it('returns empty array when no data stored', async () => {
    const kv = new InMemoryStore();
    const crypto = new CryptoStore('test-key');
    const store = new TelemetryStore(kv, crypto);

    const loaded = await store.load();
    expect(loaded).toEqual([]);
  });

  it('stored data is encrypted (not plaintext JSON)', async () => {
    const kv = new InMemoryStore();
    const crypto = new CryptoStore('test-key');
    const store = new TelemetryStore(kv, crypto);

    const events = makeSampleEvents();
    await store.save(events);

    // Read raw value from KV store
    const raw = await kv.get('ccrpg:telemetry');
    expect(raw).not.toBeNull();
    // Raw value should NOT be valid JSON (it is encrypted)
    expect(() => JSON.parse(raw!)).toThrow();
    // Raw value should NOT contain plaintext event data
    expect(raw!).not.toContain('encounter_completed');
    expect(raw!).not.toContain('shadow_surfaced');
    expect(raw!).not.toContain('e1');
  });

  it('clear removes stored data', async () => {
    const kv = new InMemoryStore();
    const crypto = new CryptoStore('test-key');
    const store = new TelemetryStore(kv, crypto);

    await store.save(makeSampleEvents());
    await store.clear();
    const loaded = await store.load();
    expect(loaded).toEqual([]);
  });

  it('overwrites previous data on save', async () => {
    const kv = new InMemoryStore();
    const crypto = new CryptoStore('test-key');
    const store = new TelemetryStore(kv, crypto);

    await store.save(makeSampleEvents());
    const newEvents: TelemetryEvent[] = [
      { id: 'e3', type: 'session_started', timestamp: 3000, data: {} },
    ];
    await store.save(newEvents);

    const loaded = await store.load();
    expect(loaded).toEqual(newEvents);
  });
});
