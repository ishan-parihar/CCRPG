import { describe, it, expect } from 'vitest';
import { CryptoStore } from '../src/infra/crypto/CryptoStore.js';

describe('CryptoStore', () => {
  it('encrypts and decrypts to original plaintext', async () => {
    const store = new CryptoStore('test-key');
    const plaintext = 'hello world telemetry data';
    const encrypted = await store.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(await store.decrypt(encrypted)).toBe(plaintext);
  });

  it('produces different ciphertext with different keys', async () => {
    const a = new CryptoStore('key-a');
    const b = new CryptoStore('key-b');
    const plaintext = 'same input';
    expect(await a.encrypt(plaintext)).not.toBe(await b.encrypt(plaintext));
  });

  it('guarantees semantic security (different ciphertext for same input/key)', async () => {
    const store = new CryptoStore('test-key');
    const plaintext = 'semantic security input';
    const c1 = await store.encrypt(plaintext);
    const c2 = await store.encrypt(plaintext);
    expect(c1).not.toBe(c2); // Due to randomized IV
    expect(await store.decrypt(c1)).toBe(plaintext);
    expect(await store.decrypt(c2)).toBe(plaintext);
  });

  it('handles empty string', async () => {
    const store = new CryptoStore();
    expect(await store.decrypt(await store.encrypt(''))).toBe('');
  });
});

