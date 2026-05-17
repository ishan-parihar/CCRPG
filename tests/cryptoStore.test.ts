import { describe, it, expect } from 'vitest';
import { CryptoStore } from '../src/infra/crypto/CryptoStore.js';

describe('CryptoStore', () => {
  it('encrypts and decrypts to original plaintext', () => {
    const store = new CryptoStore('test-key');
    const plaintext = 'hello world telemetry data';
    const encrypted = store.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(store.decrypt(encrypted)).toBe(plaintext);
  });

  it('produces different ciphertext with different keys', () => {
    const a = new CryptoStore('key-a');
    const b = new CryptoStore('key-b');
    const plaintext = 'same input';
    expect(a.encrypt(plaintext)).not.toBe(b.encrypt(plaintext));
  });

  it('handles empty string', () => {
    const store = new CryptoStore();
    expect(store.decrypt(store.encrypt(''))).toBe('');
  });
});
