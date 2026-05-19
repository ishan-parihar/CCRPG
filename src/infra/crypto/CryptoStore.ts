/**
 * CryptoStore - XOR + base64 obfuscation for at-rest data.
 *
 * **Important:** This is obfuscation only, not real encryption. XOR with a
 * static key is trivially reversible by anyone with access to the stored
 * data and the source code. It prevents casual inspection of localStorage
 * values but does NOT provide confidentiality against a determined actor.
 *
 * The {@link ICryptoStore} interface is the upgrade path: swap this
 * implementation for a Web Crypto AES-GCM adapter (with a user-derived key)
 * when stronger privacy guarantees are required.
 */

const DEFAULT_KEY = 'ccrpg-telemetry-key';

export interface ICryptoStore {
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
}

export class CryptoStore implements ICryptoStore {
  private readonly key: string;

  constructor(key: string = DEFAULT_KEY) {
    this.key = key;
  }

  encrypt(plaintext: string): string {
    const xored = this.xor(plaintext);
    return btoa(xored);
  }

  decrypt(ciphertext: string): string {
    const decoded = atob(ciphertext);
    return this.xor(decoded);
  }

  private xor(input: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      result += String.fromCharCode(
        input.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length),
      );
    }
    return result;
  }
}
