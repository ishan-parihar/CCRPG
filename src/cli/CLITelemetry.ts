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
import type { TelemetryEventType } from '../core/telemetry/TelemetryEvent.js';

const TELEMETRY_OPT_IN_KEY = 'mysterium:cli-telemetry-opt-in';

let cached: TelemetryService | null = null;

async function readOptIn(kv: FileKeyValueStore): Promise<boolean> {
  try {
    const raw = await kv.get(TELEMETRY_OPT_IN_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function buildCLITelemetry(): Promise<TelemetryService | null> {
  if (cached) return cached;
  const kv = new FileKeyValueStore();
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

export function resetCLITelemetryForTest(): void {
  cached = null;
}
