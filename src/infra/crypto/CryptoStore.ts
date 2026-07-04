/**
 * CryptoStore - AES-GCM 256-bit encryption for at-rest data.
 */
import { webcrypto } from 'crypto';

const DEFAULT_KEY = 'ccrpg-telemetry-key';

const crypto = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle)
  ? globalThis.crypto
  : (webcrypto as any);

export interface ICryptoStore {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}

export class CryptoStore implements ICryptoStore {
  private readonly cryptoKeyPromise: Promise<CryptoKey>;

  constructor(key: string = DEFAULT_KEY) {
    this.cryptoKeyPromise = this.deriveKey(key);
  }

  private async deriveKey(keyString: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(keyString));
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string): Promise<string> {
    const cryptoKey = await this.cryptoKeyPromise;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      plaintextBuffer
    );

    const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertextBuffer), iv.length);

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(combined).toString('base64');
    } else {
      return btoa(String.fromCharCode(...combined));
    }
  }

  async decrypt(ciphertext: string): Promise<string> {
    const cryptoKey = await this.cryptoKeyPromise;

    let combined: Uint8Array;
    if (typeof Buffer !== 'undefined') {
      combined = new Uint8Array(Buffer.from(ciphertext, 'base64'));
    } else {
      combined = new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)));
    }

    if (combined.length < 12) {
      throw new Error('Ciphertext is too short to contain IV');
    }

    const iv = combined.slice(0, 12);
    const ciphertextBuffer = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
}

