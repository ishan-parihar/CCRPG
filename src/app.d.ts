// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}

    /**
     * Platform-specific bindings.
     *
     * On Cloudflare: platform.env contains Workers KV namespaces
     * (SAVE_KV, RECOVERY_KV) and Analytics Engine (ANALYTICS) bound
     * via wrangler.toml. On other adapters, platform.env is undefined
     * and the BFF falls back to in-memory dev stores.
     */
    interface Platform {
      readonly env?: {
        readonly SAVE_KV?: KVNamespace;
        readonly RECOVERY_KV?: KVNamespace;
        readonly ANALYTICS?: {
          readonly writeDataPoint: (data: {
            readonly blobs?: readonly string[];
            readonly doubles?: readonly number[];
            readonly data?: string;
          }) => void;
        };
      };
    }
  }
}

// Preserve the existing __DEV__ global define from the Vite config.
declare const __DEV__: boolean;

// Minimal KVNamespace type for environments without @cloudflare/workers-types.
// This matches the Cloudflare Workers KV interface surface we use.
interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<string | null | unknown>;
  put(key: string, value: string, options?: { readonly expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export {};
