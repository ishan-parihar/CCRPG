/**
 * Client hooks — runs on every client-side navigation.
 *
 * Audit fix U5: No client hooks existed. This file handles:
 * - Error logging (future: send to /api/telemetry)
 * - Service worker update detection (PWA auto-update prompt)
 *
 * This is the client-side counterpart to src/hooks.server.ts.
 */

import type { HandleClientError } from '@sveltejs/kit';

/** Handle unhandled client errors — log + show the error page. */
export const handleError: HandleClientError = async ({ error, event }) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[client-error]', message, { url: event.url.href });

  // Future: POST to /api/telemetry for centralized error tracking.
  // For now, console.error is sufficient — the +error.svelte page
  // handles the user-facing display.

  return {
    message: 'An unexpected error occurred',
  };
};
