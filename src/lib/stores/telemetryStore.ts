/**
 * telemetryStore — WebUI telemetry service.
 * Parity with CLI emitEvent() + TelemetryService.
 *
 * Collects events in memory, flushes to /api/telemetry on a 5s debounce
 * and on beforeunload. Respects the telemetryOptIn accessibility setting.
 *
 * ponytail: the CLI uses a TelemetryService class + TelemetryStore (localStorage).
 * The WebUI uses this simpler store — same contract, fewer layers. The /api/telemetry
 * endpoint accepts the same batch format.
 */
import { writable } from 'svelte/store';
import { accessibilityStore } from './accessibilityStore.js';

export interface TelemetryEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly data: Record<string, unknown>;
}

export const telemetryEvents = writable<TelemetryEvent[]>([]);

let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DEBOUNCE_MS = 5000;
const MAX_BATCH = 100;

const isBrowser = typeof window !== 'undefined';

function getDeviceId(): string {
  if (!isBrowser) return 'unknown';
  let id = localStorage.getItem('ccrpg:device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('ccrpg:device-id', id);
  }
  return id;
}

/**
 * Record a telemetry event. No-ops if telemetry opt-in is off.
 */
export function recordEvent(type: string, data: Record<string, unknown> = {}): void {
  if (!isBrowser) return;
  // Read the current opt-in state without subscribing (avoids reactivity in a pure function).
  let optIn = false;
  const unsub = accessibilityStore.subscribe((s) => { optIn = s.telemetryOptIn; });
  unsub();
  if (!optIn) return;

  const event: TelemetryEvent = {
    id: `tel-${crypto.randomUUID()}`,
    type,
    timestamp: Date.now(),
    data,
  };
  telemetryEvents.update((events) => [...events, event]);

  // Debounce flush
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => { void flushTelemetry(); }, FLUSH_DEBOUNCE_MS);
}

/**
 * Flush pending events to /api/telemetry. Safe to call multiple times.
 * If the POST fails, events stay in memory for the next flush.
 */
export async function flushTelemetry(): Promise<void> {
  if (!isBrowser) return;
  let events: TelemetryEvent[] = [];
  const unsub = telemetryEvents.subscribe((e) => { events = e; });
  unsub();
  if (events.length === 0) return;

  // Take up to MAX_BATCH events
  const batch = events.slice(0, MAX_BATCH);
  const remaining = events.slice(MAX_BATCH);

  try {
    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        events: batch.map((e) => ({ type: e.type, timestamp: e.timestamp, payload: e.data })),
      }),
    });
    if (res.ok) {
      // Clear the flushed batch; keep remaining
      telemetryEvents.set(remaining);
    }
    // If POST failed, keep all events for next flush
  } catch {
    // Network error — keep events for next flush
  }
}

// Flush on beforeunload
if (isBrowser) {
  window.addEventListener('beforeunload', () => {
    void flushTelemetry();
  });
}
