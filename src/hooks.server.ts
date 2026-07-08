/**
 * Server hooks — runs on every request.
 *
 * Phase 0: lightweight rate limiting for /api/llm/* endpoints.
 * Per-device-ID quota: 100 LLM calls/day (free tier default).
 *
 * The rate limiter is in-memory for dev. In production (Cloudflare),
 * it should use Workers KV or Durable Objects for cross-request state.
 */

import type { Handle } from '@sveltejs/kit';

const LLM_RATE_LIMIT_PER_DAY = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory rate limit store (dev only; production uses KV/DO).
const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup (every 5 minutes, remove entries older than 24h).
let lastCleanup = Date.now();
function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > DAY_MS) {
      rateLimitStore.delete(key);
    }
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  maybeCleanup();

  // Rate limit only /api/llm/* endpoints.
  if (event.url.pathname.startsWith('/api/llm/')) {
    // Try to extract deviceId from request body (POST).
    let deviceId = event.url.searchParams.get('deviceId');

    if (!deviceId && event.request.method === 'POST') {
      try {
        // Clone the request so the body is still readable downstream.
        const cloned = event.request.clone();
        const body = await cloned.json();
        if (body && typeof body.deviceId === 'string') {
          deviceId = body.deviceId;
        }
      } catch {
        // Body isn't JSON or doesn't have deviceId — fall through.
      }
    }

    // If we have a deviceId, enforce rate limit.
    if (deviceId) {
      const key = `llm:${deviceId}`;
      const now = Date.now();
      let entry = rateLimitStore.get(key);
      if (!entry || now - entry.windowStart > DAY_MS) {
        entry = { count: 0, windowStart: now };
        rateLimitStore.set(key, entry);
      }
      entry.count++;
      if (entry.count > LLM_RATE_LIMIT_PER_DAY) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            detail: `Max ${LLM_RATE_LIMIT_PER_DAY} LLM calls per day. Resets in ${Math.ceil((entry.windowStart + DAY_MS - now) / 1000 / 60)} minutes.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((entry.windowStart + DAY_MS - now) / 1000)),
            },
          },
        );
      }
    }
  }

  return resolve(event);
};
