/**
 * POST /api/telemetry — accept batched telemetry events.
 *
 * Validates event schema, writes to platform-specific sink:
 *   - Cloudflare: platform.env.ANALYTICS (Analytics Engine)
 *   - Vercel/Netlify: console.log (dev) or external sink (prod)
 *   - Local dev: console.log
 *
 * Telemetry is opt-in per the canon (AGENTS.md §5.7 — game is never
 * diagnostic; telemetry respects player consent).
 *
 * Request body (JSON):
 *   {
 *     "deviceId": "uuid-v4",
 *     "events": [
 *       { "type": "encounter_completed", "timestamp": 1234567890, "payload": {...} },
 *       ...
 *     ]
 *   }
 *
 * Response: 202 Accepted (events queued for ingestion).
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TelemetryEvent {
  readonly type: string;
  readonly timestamp: number;
  readonly payload?: unknown;
}

interface TelemetryBatch {
  readonly deviceId: string;
  readonly events: readonly TelemetryEvent[];
}

const MAX_BATCH_SIZE = 100;
const MAX_DEVICE_ID_LENGTH = 64;

export const POST: RequestHandler = async ({ request, platform }) => {
  let body: TelemetryBatch;

  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  // Validate deviceId
  if (
    typeof body.deviceId !== 'string' ||
    body.deviceId.length === 0 ||
    body.deviceId.length > MAX_DEVICE_ID_LENGTH
  ) {
    throw error(400, `deviceId must be a string (1-${MAX_DEVICE_ID_LENGTH} chars)`);
  }

  // Validate events array
  if (!Array.isArray(body.events) || body.events.length === 0) {
    throw error(400, 'events must be a non-empty array');
  }

  if (body.events.length > MAX_BATCH_SIZE) {
    throw error(413, `Batch too large: max ${MAX_BATCH_SIZE} events, got ${body.events.length}`);
  }

  // Validate each event
  for (const evt of body.events) {
    if (typeof evt.type !== 'string' || evt.type.length === 0) {
      throw error(400, 'Each event must have a non-empty string `type`');
    }
    if (typeof evt.timestamp !== 'number' || evt.timestamp < 0) {
      throw error(400, 'Each event must have a numeric `timestamp` >= 0');
    }
  }

  // Write to platform-specific sink.
  // Cloudflare Analytics Engine (if available via platform.env.ANALYTICS).
  if (platform?.env && platform.env!.ANALYTICS) {
    const analytics = platform.env!.ANALYTICS;
    for (const evt of body.events) {
      try {
        analytics.writeDataPoint({
          blobs: [body.deviceId, evt.type],
          doubles: [evt.timestamp],
          data: JSON.stringify(evt.payload ?? {}),
        });
      } catch (err) {
        console.warn('[telemetry] Analytics Engine write failed:', err);
      }
    }
  } else {
    // Dev fallback: log to console.
    console.log(`[telemetry] deviceId=${body.deviceId} events=${body.events.length}`);
    for (const evt of body.events) {
      console.log(`  [telemetry] ${evt.type} @ ${evt.timestamp}`, evt.payload ?? '');
    }
  }

  return json({ accepted: body.events.length, deviceId: body.deviceId });
};
