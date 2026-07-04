import { describe, it, expect } from 'vitest';
import { TelemetryService } from '../../src/infra/telemetry/TelemetryService.js';
import { TelemetryStore } from '../../src/infra/telemetry/TelemetryStore.js';
import { TelemetryCollector } from '../../src/core/telemetry/TelemetryCollector.js';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import { CryptoStore } from '../../src/infra/crypto/CryptoStore.js';

function createService(optIn: boolean) {
  const collector = new TelemetryCollector();
  const kv = new InMemoryStore();
  const crypto = new CryptoStore('test-key');
  const store = new TelemetryStore(kv, crypto);
  const service = new TelemetryService(collector, store, () => optIn);
  return { service, collector, store, kv };
}

describe('TelemetryService', () => {
  it('isEnabled returns false when opt-in is false', () => {
    const { service } = createService(false);
    expect(service.isEnabled()).toBe(false);
  });

  it('isEnabled returns true when opt-in is true', () => {
    const { service } = createService(true);
    expect(service.isEnabled()).toBe(true);
  });

  it('recordEvent is a no-op when disabled', () => {
    const { service, collector } = createService(false);
    service.recordEvent('encounter_completed', { record: 'test' });
    expect(collector.getEvents()).toHaveLength(0);
  });

  it('recordEvent records when enabled', () => {
    const { service, collector } = createService(true);
    service.recordEvent('encounter_completed', { record: 'test' });
    expect(collector.getEvents()).toHaveLength(1);
    expect(collector.getEvents()[0].type).toBe('encounter_completed');
    expect(collector.getEvents()[0].data).toEqual({ record: 'test' });
  });

  it('recordEvent generates unique IDs', () => {
    const { service, collector } = createService(true);
    service.recordEvent('session_started', {});
    service.recordEvent('session_ended', {});
    const ids = collector.getEvents().map(e => e.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('flush persists collector events to store', async () => {
    const { service, store } = createService(true);
    service.recordEvent('encounter_completed', { record: 'a' });
    service.recordEvent('shadow_surfaced', { shadowId: 's1' });

    await service.flush();

    const stored = await store.load();
    expect(stored).toHaveLength(2);
    expect(stored[0].type).toBe('encounter_completed');
    expect(stored[1].type).toBe('shadow_surfaced');
  });

  it('flush clears collector after persisting', async () => {
    const { service, collector } = createService(true);
    service.recordEvent('session_started', {});
    await service.flush();
    expect(collector.getEvents()).toHaveLength(0);
  });

  it('flush is a no-op when disabled', async () => {
    const { service, collector, store } = createService(false);
    // Force a record directly into collector to test flush guard
    collector.record({ id: 'manual', type: 'session_started', timestamp: 0, data: {} });
    await service.flush();
    // Events remain in collector (flush did not execute)
    expect(collector.getEvents()).toHaveLength(1);
    const stored = await store.load();
    expect(stored).toHaveLength(0);
  });

  it('flush appends to existing stored events', async () => {
    const { service, store } = createService(true);
    service.recordEvent('session_started', {});
    await service.flush();

    service.recordEvent('encounter_completed', { record: 'b' });
    await service.flush();

    const stored = await store.load();
    expect(stored).toHaveLength(2);
  });

  it('getCollector returns the internal collector', () => {
    const { service, collector } = createService(true);
    expect(service.getCollector()).toBe(collector);
  });
});
