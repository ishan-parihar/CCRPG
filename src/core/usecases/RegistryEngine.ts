/**
 * RegistryEngine — generic typed registry per MVP-BLUEPRINT Part II §4.
 */
export interface Registry<K extends string, V> {
  register(key: K, value: V): void;
  get(key: K): V | undefined;
  all(): ReadonlyArray<readonly [K, V]>;
  keysFor(filter: Partial<V>): ReadonlyArray<K>;
}

export function createRegistry<K extends string, V>(): Registry<K, V> {
  const map = new Map<K, V>();

  return {
    register(key: K, value: V): void {
      map.set(key, value);
    },
    get(key: K): V | undefined {
      return map.get(key);
    },
    all(): ReadonlyArray<readonly [K, V]> {
      return [...map.entries()];
    },
    keysFor(filter: Partial<V>): ReadonlyArray<K> {
      const entries = [...map.entries()];
      return entries
        .filter(([, v]) => {
          for (const fk of Object.keys(filter) as Array<keyof V>) {
            if (v[fk] !== filter[fk]) return false;
          }
          return true;
        })
        .map(([k]) => k);
    },
  };
}
