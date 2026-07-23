/**
 * Route guard for the Background-Agentic surfaces.
 *
 * BACKGROUND-AGENTIC-ARCHITECTURE Decision 10 (Failure Integrity).
 *
 * When `llmStatus.offline === true`, requests to agentic routes
 * (`/onboarding`, `/play`, `/diagnostic`) MUST redirect to /setup
 * where the user can verify their LLM connection. Deterministic
 * game-logic fallbacks are forbidden on these surfaces, so we
 * prefer to redirect than to render anything.
 *
 * Implementation strategy:
 *   - The guard runs in `(browser) ? handleError + try-catch : skip`.
 *   - We do NOT import `llmStatus` at module top-level in a
 *     `+layout.ts` because that file ships to SSR and the writable
 *     store is client-only. Instead, we wrap the redirect in a
 *     `$effect` from the consuming +page.svelte OR install a global
 *     navigation listener in `+layout.svelte`.
 *
 * This module exports `routeGuardAgentic(path)` for callers that
 * want to programmatically check before loading a page.
 */

import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { llmStatus } from '$lib/stores/llmStatus.js';

const AGENTIC_PATHS: readonly RegExp[] = [
  /^\/onboarding(\/|$)/,
  /^\/play(\/|$)/,
  /^\/diagnostic(\/|$)/,
];

export function isAgenticPath(path: string): boolean {
  return AGENTIC_PATHS.some((re) => re.test(path));
}

export function routeGuardAgentic(path: string, currentPath?: string): boolean {
  if (!browser) return false;
  if (!isAgenticPath(path)) return false;
  const status = get(llmStatus);
  if (status.offline) {
    void goto('/setup', {
      replaceState: currentPath === path,
    });
    return true;
  }
  return false;
}
