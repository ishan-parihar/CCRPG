/**
 * CryptoStore — simple XOR + base64 wrapper for at-rest obfuscation of
 * telemetry data. NOT production cryptography — just the interface and
 * a minimal implementation to demonstrate the pattern.
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
