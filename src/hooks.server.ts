/**
 * Server hooks — runs on every request.
 *
 * Phase 0: lightweight rate limiting for /api/llm/* endpoints.
 * Per-IP quota: 100 LLM calls/day (free tier default).
 *
 * F5 fix: Previously looked for 'deviceId' in the request body, but LLM
 * endpoints don't include deviceId. The rate limiter was a no-op. Now
 * uses the client IP (CF-Connecting-IP on Cloudflare, X-Forwarded-For
 * fallback) as the rate-limit key.
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

/** Extract client IP from Cloudflare or standard proxy headers. */
function getClientIP(event: Parameters<Handle>[0]['event']): string {
  // Cloudflare: CF-Connecting-IP is the canonical client IP.
  const cfIP = event.request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Standard proxy header (X-Forwarded-For: client, proxy1, proxy2)
  const xff = event.request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  // Fallback: unknown (rate limit by shared key — less effective but safe)
  return 'unknown';
}

export const handle: Handle = async ({ event, resolve }) => {
  maybeCleanup();

  // Rate limit only /api/llm/* endpoints.
  if (event.url.pathname.startsWith('/api/llm/')) {
    const clientIP = getClientIP(event);
    const key = `llm:${clientIP}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || now - entry.windowStart > DAY_MS) {
      entry = { count: 0, windowStart: now };
      rateLimitStore.set(key, entry);
    }
    entry.count++;
    if (entry.count > LLM_RATE_LIMIT_PER_DAY) {
      const resetInSecs = Math.ceil((entry.windowStart + DAY_MS - now) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          detail: `Max ${LLM_RATE_LIMIT_PER_DAY} LLM calls per day. Resets in ${Math.ceil(resetInSecs / 60)} minutes.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSecs),
          },
        },
      );
    }
  }

  return resolve(event);
};
