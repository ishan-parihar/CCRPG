import type { KeyValueStore } from './KeyValueStore.js';
import type { ICryptoStore } from '../crypto/CryptoStore.js';
import type { WorldState } from '../../core/engines/CandidateGeneration.js';

const WORLD_KEY = 'ccrpg:world-state';

export class WorldStateStore {
  constructor(private readonly kv: KeyValueStore, private readonly crypto: ICryptoStore) {}

  async save(world: WorldState): Promise<void> {
    const json = JSON.stringify(world);
    const encrypted = await this.crypto.encrypt(json);
    await this.kv.set(WORLD_KEY, encrypted);
  }

  async load(): Promise<WorldState | null> {
    const encrypted = await this.kv.get(WORLD_KEY);
    if (!encrypted) return null;
    const json = await this.crypto.decrypt(encrypted);
    return JSON.parse(json) as WorldState;
  }

  async clear(): Promise<void> {
    await this.kv.remove(WORLD_KEY);
  }
}
