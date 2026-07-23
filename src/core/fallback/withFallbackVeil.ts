/**
 * Veil seam — surfaces fallback content politely to the player.
 *
 * The WebUI's HARDCODE-AUDIT v1 identified that fallback content
 * (pre-authored prompts used when the LLM is unavailable) reads as
 * "canned" without an acknowledgement. The Veil principle forbids
 * clinical disclosure; this helper provides a register-appropriate
 * disclosure: the seam is poetic, not diagnostic.
 *
 * Usage:
 *   import { withFallbackVeil } from '../fallback/withFallbackVeil.js';
 *   const text = withFallbackVeil(fallbackContent.prompt ?? '...');
 *   // → prepends a Veil-flavoured line, then a blank, then the content
 *
 * The seam draws on the same Veil register as the rest of the system.
 * Keeping it from `presentation/veilDescriptors.ts` would be cleaner
 * but creates a circular dependency (descriptors → fallback → descriptors).
 * The constants below are a deliberately small, frozen corpus. When/if
 * the LLM-times-fail corpus grows (more Veil-flavoured ways of saying
 * "the mirror is silent"), add them here rather than authoring inline.
 */

const VEIL_SEAM_LINES: readonly string[] = [
  '*The mirror is silent; old reflections return to you.*',
  '*Loom-voice thins here. Cloth-songs remember what was once upon the loom.*',
  '*The Well is dry. What was poured before is what remains.*',
  '*Without the in-breath, your own exhales become the witness.*',
  '*No chord-add today; the chord-add of yesterday serves.*',
];

/**
 * Pick a deterministic Veil seam line. Deterministic here means
 * "doesn't change on re-read within a session" — uses timestamp
 * bucketing at the encounter level so the same encounter always
 * gets the same seam line.
 *
 * Pass `seed` as the encounter id (or ms modulo a small bucket).
 */
export function pickVeilSeam(seed: string | number): string {
  const idx =
    typeof seed === 'number'
      ? Math.abs(Math.floor(seed)) % VEIL_SEAM_LINES.length
      : simpleHash(seed) % VEIL_SEAM_LINES.length;
  return VEIL_SEAM_LINES[idx]!;
}

/** Small deterministic string hash — avoids bringing in a dep. */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Wrap content in the Veil seam. The seam line appears once, followed
 * by a single blank line, then the original content. The leading
 * asterisk makes the seam visually distinct in a TTY without breaking
 * Svelte rendering.
 *
 * If the content already starts with a Veil seam (recursive call),
 * the helper is idempotent — it won't double-wrap.
 */
export function withFallbackVeil(content: string, seed?: string | number): string {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('*') && trimmed.includes('*', 2)) {
    // Likely already wrapped; return as-is to avoid double-seam.
    return content;
  }
  const seam = pickVeilSeam(seed ?? Date.now());
  return `${seam}\n\n${content}`;
}

/** Exported for tests — the frozen corpus. */
export const VEIL_SEAM_CORPUS = VEIL_SEAM_LINES;
