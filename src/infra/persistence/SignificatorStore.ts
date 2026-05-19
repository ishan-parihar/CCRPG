import type { KeyValueStore } from './KeyValueStore.js';
import type { ICryptoStore } from '../crypto/CryptoStore.js';
import type { Significator } from '../../core/domain/Significator.js';

const SIG_KEY = 'ccrpg:significator';

export class SignificatorStore {
  constructor(private readonly kv: KeyValueStore, private readonly crypto: ICryptoStore) {}

  async save(sig: Significator): Promise<void> {
    const json = JSON.stringify(sig);
    const encrypted = this.crypto.encrypt(json);
    await this.kv.set(SIG_KEY, encrypted);
  }

  async load(): Promise<Significator | null> {
    const encrypted = await this.kv.get(SIG_KEY);
    if (!encrypted) return null;
    const json = this.crypto.decrypt(encrypted);
    return JSON.parse(json) as Significator;
  }

  async clear(): Promise<void> {
    await this.kv.remove(SIG_KEY);
  }
}
