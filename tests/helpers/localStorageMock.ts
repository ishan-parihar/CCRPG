/**
 * Shared localStorage mock for vitest tests.
 *
 * jsdom may not provide localStorage in all vitest configurations.
 * This helper creates a Map-based mock when localStorage is undefined.
 *
 * Usage:
 *   import { ensureLocalStorage } from '../helpers/localStorageMock.js';
 *   beforeEach(() => { ensureLocalStorage(); localStorage.clear(); });
 */
import { vi } from 'vitest';

/**
 * Ensure localStorage is available in the global scope.
 * Creates a Map-based mock if localStorage is undefined (jsdom env issue).
 * Safe to call multiple times — only stubs once.
 */
export function ensureLocalStorage(): void {
  if (typeof localStorage === 'undefined') {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      get length() { return store.size; },
      key: (i: number) => [...store.keys()][i] ?? null,
    });
  }
}
