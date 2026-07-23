/**
 * Client hooks — runs on every client-side navigation.
 *
 * Audit fix U5: No client hooks existed. This file handles:
 * - Error logging (future: send to /api/telemetry)
 * - Service worker update detection (PWA auto-update prompt)
 * - LLM offline detection: any 503 from /api/llm/* or /api/agent/*
 *   marks the global llmStatus as offline so route guards redirect
 *   to /setup.
 *
 * This is the client-side counterpart to src/hooks.server.ts.
 */

import type { HandleClientError, HandleFetch } from '@sveltejs/kit';
import { markLlmOffline } from '$lib/stores/llmStatus.js';

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

/** Watch all outbound fetches; flip llmStatus on 503 from BFF LLM endpoints. */
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  const url = new URL(request.url, event.url);
  const isAgentEndpoint = url.pathname.startsWith('/api/agent/');
  const isLlmEndpoint = url.pathname.startsWith('/api/llm/');

  const res = await fetch(request);
  if ((isLlmEndpoint || isAgentEndpoint) && res.status === 503) {
    markLlmOffline(`BFF 503 from ${url.pathname}`);
  }
  return res;
};

