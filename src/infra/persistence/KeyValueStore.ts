/**
 * Persistence boundary for the RPG. The core layer depends only on this
 * interface, never on Capacitor itself, so tests can use an in-memory
 * implementation and the web/native split lives behind one switch.
 */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** In-memory KV store, useful for tests and SSR-like environments. */
export class InMemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  async set(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }
  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }
  async clear(): Promise<void> {
    this.map.clear();
  }
}
