/**
 * @vitest-environment jsdom
 *
 * Tests for cloudSyncStore — the cloud sync write path.
 *
 * Verifies:
 * - deviceId generation + persistence
 * - debouncedSync POSTs to /api/save
 * - flushSync skips unchanged saves
 * - generateRecoveryMnemonic calls /api/recovery/generate
 * - Network failures are silent (no throw)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getDeviceId, flushSync, generateRecoveryMnemonic } from '../../src/lib/stores/cloudSyncStore.js';
import { ensureLocalStorage } from '../helpers/localStorageMock.js';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock crypto — ponytail: C.12 added AES-GCM encryption, so we mock subtle crypto too.
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
  subtle: {
    digest: async (_alg: string, data: Uint8Array) => data.buffer,
    importKey: async () => ({}),
    encrypt: async () => new ArrayBuffer(16),
    decrypt: async () => new ArrayBuffer(16),
  },
  getRandomValues: (arr: Uint8Array) => arr,
});

describe('cloudSyncStore', () => {
  beforeEach(() => {
    ensureLocalStorage();
    localStorage.clear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDeviceId', () => {
    it('generates a UUID on first call and persists it', () => {
      const id1 = getDeviceId();
      expect(id1).toBe('test-uuid-1234');
      expect(localStorage.getItem('ccrpg:device-id')).toBe('test-uuid-1234');

      // Second call returns the same ID (not a new UUID)
      const id2 = getDeviceId();
      expect(id2).toBe(id1);
    });

    it('returns existing ID from localStorage if present', () => {
      localStorage.setItem('ccrpg:device-id', 'existing-id');
      const id = getDeviceId();
      expect(id).toBe('existing-id');
    });
  });

  describe('flushSync', () => {
    it('POSTs save to /api/save with deviceId + encrypted blob', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      // Use a unique sig to avoid the "unchanged" skip
      const sig = { id: 'test-post-' + Date.now(), currentStage: 'Red' };
      await flushSync(sig as any);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0]!;
      expect(url).toBe('/api/save');
      const body = JSON.parse((opts as any).body);
      expect(body.deviceId).toBe('test-uuid-1234');
      expect(body.encrypted).toBe(true);
      expect(typeof body.blob).toBe('string');
      // blob is now opaque (encrypted) — not the raw JSON
      expect(body.blob).not.toBe(JSON.stringify(sig));
    });

    it('skips if save is unchanged since last sync', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const sig = { id: 'test-skip-' + Date.now(), currentStage: 'Red' };

      await flushSync(sig as any);
      await flushSync(sig as any); // same data

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('syncs if save changed', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const sig1 = { id: 'test-change-' + Date.now(), currentStage: 'Red' };
      const sig2 = { id: 'test-change-' + Date.now(), currentStage: 'Amber' };

      await flushSync(sig1 as any);
      await flushSync(sig2 as any);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('silently handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const sig = { id: 'test-err-' + Date.now(), currentStage: 'Red' };

      // Should not throw
      await expect(flushSync(sig as any)).resolves.toBeUndefined();
    });

    it('silently handles non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const sig = { id: 'test-err2-' + Date.now(), currentStage: 'Red' };

      await expect(flushSync(sig as any)).resolves.toBeUndefined();
    });

    it('skips if sig is null', async () => {
      await flushSync(null);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('generateRecoveryMnemonic', () => {
    it('POSTs to /api/recovery/generate and returns mnemonic', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mnemonic: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12' }),
      });

      const mnemonic = await generateRecoveryMnemonic();
      expect(mnemonic).toBe('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
      expect(mockFetch).toHaveBeenCalledWith('/api/recovery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: 'test-uuid-1234' }),
      });
    });

    it('returns null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const mnemonic = await generateRecoveryMnemonic();
      expect(mnemonic).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const mnemonic = await generateRecoveryMnemonic();
      expect(mnemonic).toBeNull();
    });
  });
});
