/**
 * ponytail: FallbackNarratives was a 200-LOC bank of fallback narrative
 * strings for the removed PersistentAgent path. Replaced with a single
 * generic fallback. The CLI's `pickFallbackNarrative` call site (L1745)
 * handles empty LLM responses.
 */

export function pickFallbackNarrative(_context?: unknown): string {
  return 'The moment passes, leaving a subtle shift in the air.';
}
