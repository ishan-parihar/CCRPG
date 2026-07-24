import type { KeyValueStore } from '../persistence/KeyValueStore.js';
import type { ICryptoStore } from '../crypto/CryptoStore.js';
import type { TelemetryEvent } from '../../core/telemetry/TelemetryEvent.js';

const TELEMETRY_KEY = 'mysterium:telemetry';

export class TelemetryStore {
  constructor(private readonly kv: KeyValueStore, private readonly crypto: ICryptoStore) {}

  async save(events: TelemetryEvent[]): Promise<void> {
    const json = JSON.stringify(events);
    const encrypted = await this.crypto.encrypt(json);
    await this.kv.set(TELEMETRY_KEY, encrypted);
  }

  async load(): Promise<TelemetryEvent[]> {
    const encrypted = await this.kv.get(TELEMETRY_KEY);
    if (!encrypted) return [];
    const json = await this.crypto.decrypt(encrypted);
    return JSON.parse(json) as TelemetryEvent[];
  }

  async clear(): Promise<void> {
    await this.kv.remove(TELEMETRY_KEY);
  }
}
