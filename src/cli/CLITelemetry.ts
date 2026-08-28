/**
 * CLITelemetry — opt-in telemetry for the CLI path. The WebUI already has
 * its own telemetryStore; this module gives the CLI the same observability
 * without requiring a build step or browser.
 *
 * Architecture (Architecture Audit Phase A Quick Win 3):
 * - On startup, check `~/.mysterium/config.json.telemetry` (default: false).
 * - When enabled, TelemetryService records events to a JSONL file in
 *   the active profile's directory.
 * - `flush()` is called at session end; an opt-in user can run
 *   `mysterium events --tail N` to inspect recent events.
 */
import { FileKeyValueStore } from '../infra/persistence/FileKeyValueStore.js';
import { TelemetryService } from '../infra/telemetry/TelemetryService.js';
import { TelemetryStore } from '../infra/telemetry/TelemetryStore.js';
import { TelemetryCollector } from '../core/telemetry/TelemetryCollector.js';
import type { TelemetryEventType, TelemetryEvent } from '../core/telemetry/TelemetryEvent.js';
import * as os from 'os';
import * as path from 'path';

const TELEMETRY_OPT_IN_KEY = 'mysterium:cli-telemetry-opt-in';

let cached: TelemetryService | null = null;

async function readOptIn(kv: FileKeyValueStore): Promise<boolean> {
  // Check KV first (programmatic opt-in via kv.set)
  try {
    const raw = await kv.get(TELEMETRY_OPT_IN_KEY);
    if (raw === 'true') return true;
  } catch { /* fall through to file check */ }
  // FIX-A3 (Audit): Also check ~/.mysterium/config.json { telemetry: true }
  // so the documented opt-in path actually works. KV is per-profile dir,
  // config.json is at ~/.mysterium/ legacy dir — check both.
  try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    const home = typeof (os as any).homedir === 'function' ? (os as any).homedir() : '/tmp/.mysterium';
    const configPath = path.join(home, '.mysterium', 'config.json');
    const raw = await fs.promises.readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.telemetry === true) return true;
  } catch { /* no config or invalid */ }
  return false;
}

function legacyKV(): FileKeyValueStore {
  // Telemetry is global, not per-profile — always use ~/.mysterium legacy dir
  // so events from all profiles and sessions are visible together.
  // This fixes the bug where defaultDir flips between legacy and profile
  // depending on whether _active symlink exists at call time.
  const home = typeof (os as unknown as { homedir?: () => string }).homedir === 'function' ? (os as unknown as { homedir: () => string }).homedir!() : '/tmp/.mysterium';
  return new FileKeyValueStore(path.join(home, '.mysterium'));
}

export async function buildCLITelemetry(): Promise<TelemetryService | null> {
  if (cached) return cached;
  const kv = legacyKV();
  const optIn = await readOptIn(kv);
  if (!optIn) return null;
  // Crypto store: use a no-op stub if not provided. TelemetryStore requires
  // an ICryptoStore; in the CLI we use a simple XOR stub so events persist
  // as readable JSONL. This is a deliberate trade-off: opt-in telemetry
  // should be inspectable by the user who opted in.
  const cryptoStub: import('../infra/crypto/CryptoStore.js').ICryptoStore = {
    async encrypt(plaintext: string) { return Buffer.from(plaintext, 'utf-8').toString('base64'); },
    async decrypt(ciphertext: string) { return Buffer.from(ciphertext, 'base64').toString('utf-8'); },
  };
  const collector = new TelemetryCollector();
  const store = new TelemetryStore(kv as any, cryptoStub);
  cached = new TelemetryService(collector, store, () => true);
  return cached;
}

export function recordCLITelemetry(svc: TelemetryService | null, type: TelemetryEventType, data: Record<string, unknown>): void {
  if (!svc) return;
  svc.recordEvent(type, data);
}

export async function flushCLITelemetry(svc: TelemetryService | null): Promise<void> {
  if (!svc) return;
  await svc.flush();
}

export async function loadPersistedTelemetry(): Promise<TelemetryEvent[]> {
  const kv = legacyKV();
  const cryptoStub: import('../infra/crypto/CryptoStore.js').ICryptoStore = {
    async encrypt(p: string) { return Buffer.from(p, 'utf-8').toString('base64'); },
    async decrypt(c: string) { return Buffer.from(c, 'base64').toString('utf-8'); },
  };
  const store = new TelemetryStore(kv as any, cryptoStub);
  try { return await store.load(); } catch { return []; }
}

export function resetCLITelemetryForTest(): void {
  cached = null;
}
