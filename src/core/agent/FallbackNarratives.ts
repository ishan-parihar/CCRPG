/**
 * FallbackNarratives — P1-4 (UX-R3)
 *
 * Replaces the inline 8-template fallback narrative pool that cycled
 * repetitively across encounters. The new pool is:
 *   - Larger (32 templates vs 8)
 *   - Tagged by modality so the narrative texture matches the encounter type
 *   - Selected by a stable hash of (encounterId + counter) so the same
 *     encounter doesn't get the same narrative twice in a row, but the
 *     selection is deterministic for reproducibility
 *
 * Long-term (when LLM is reliably wired): delete this module entirely and
 * let the LLM generate per-encounter narratives. The fallback should only
 * fire when the LLM is truly unavailable.
 *
 * Veil compliance: every template is qualitative felt-sense language.
 * No drive names, no shadow quadrant labels, no clinical terminology.
 */

import type { Modality } from '../domain/enums.js';

// Universal templates — work for any modality.
const UNIVERSAL: ReadonlyArray<string> = [
  `The moment settles. Something stirred — not fully formed, but present. The work continues beneath the surface.`,
  `Silence falls. What was touched will return when it's ready. The edge sharpened, then softened.`,
  `A pattern surfaced and was acknowledged. Not resolved — but seen. The ground shifted, barely.`,
  `The encounter fades like a half-remembered dream. Something moved. You'll know it again.`,
  `Stillness. The kind that comes after a question lands. The shape of the answer is still forming.`,
  `A thread was pulled. The fabric holds, but the pattern changed. Time will show how much.`,
  `The air thins. Something that was hidden is now half-visible. You can't unsee it, even if you can't name it yet.`,
  `The work deepens. What began as a question is becoming a knowing — not yet clear, but no longer avoidable.`,
  `Something in the body remembers what the mind hasn't named yet. The seed is planted.`,
  `The ground beneath the question shifted. Not the answer — the question itself. That's where the motion is.`,
  `A door opened inward. You didn't step through, but you saw it was there. That changes things.`,
  `The reflection in the water rippled. For a moment, the face wasn't the one you expected. Then it settled.`,
  `What you reached for wasn't there. What you found instead may matter more. Time will tell.`,
  `A weight you didn't know you were carrying shifted position. Not lighter — but differently held.`,
  `The question turned in your hand. The edges caught the light differently. Something about it is more honest now.`,
  `The path forward narrowed, then widened, then narrowed again. You're somewhere real now, even if you can't see far.`,
];

// Modality-specific texture — appended to the universal pool when the
// encounter's modality matches.
const BY_MODALITY: Readonly<Record<Modality, ReadonlyArray<string>>> = {
  LanguageReflective: [
    `Words formed and dissolved. The one that almost surfaced is the one that matters. Hold the space for it.`,
    `The sentence you didn't finish is louder than the one you did. Sit with the silence where it lives.`,
    `A name rose to the edge of speech and stayed there. It will come when it's ready. Or it won't, and that will mean something else.`,
  ],
  ScenarioChoice: [
    `The path you chose closed behind you softly. The path you didn't take is still there, but it leads somewhere different now.`,
    `The crossroads resolved into a single road. You can't un-choose it, but you can walk it differently than you imagined.`,
    `A door closed. Another opened — but not the one you expected. The architecture of the choice rearranges itself.`,
  ],
  Embodied: [
    `The body holds what the mind forgets. Something in the breath or the shoulders just remembered. Let it be felt.`,
    `A tension you've been carrying shifted — not gone, but moved. The body is teaching the mind something. Listen.`,
    `Heat or coolness, tightness or release — something moved in the tissue. That's information, not noise.`,
  ],
  Strategic: [
    `The map you drew doesn't match the territory anymore. That's not failure — that's the territory teaching you.`,
    `The plan survived contact with reality, barely. The cracks are where the light gets in. Revise from there.`,
    `What looked like an obstacle from one angle is a fulcrum from another. The lever is in your hand.`,
  ],
  SocialCooperative: [
    `The space between you and the other shifted. Wider, or narrower — but different. That difference is the work.`,
    `Something passed between you — a glance, a word unspoken, a held breath. The texture of the connection changed.`,
    `The other person's edge brushed yours. Neither of you broke. The meeting itself is the resolution, for now.`,
  ],
  ImmersiveRPG: [
    `The scene ended, but the room is still there in your mind's eye. The props on the table have shifted. Something was rearranged.`,
    `The story paused at a threshold. The next chapter is already forming, even if you can't read it yet. The narrator is patient.`,
    `A character you became for a moment left something behind. A gesture, a tone, a way of standing. It's available now if you need it.`,
  ],
  Deterministic: [
    `The trial ended. The number was a number, but the felt-sense underneath it is what the body will remember.`,
    `The clock stopped. What you did in the seconds before it stopped is more telling than the score. Let that sit.`,
    `The pattern you executed revealed something about the pattern you're inside. The metric is a mirror, not a verdict.`,
  ],
};

/**
 * Build the full pool for a given modality. Universal templates + the
 * modality-specific ones. Deterministic order.
 */
function poolFor(modality: Modality | undefined): ReadonlyArray<string> {
  const universal = UNIVERSAL;
  const specific = (modality && BY_MODALITY[modality]) ? BY_MODALITY[modality] : [];
  return [...universal, ...specific];
}

/**
 * Stable hash for a string. Used so the same encounter ID doesn't get the
 * same narrative twice in a row, but the selection is reproducible.
 */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pick a fallback narrative for the given encounter. The selection uses
 * a hash of (encounterId + counter) so the same encounter never gets the
 * same narrative twice in a row (when counter increments), but the
 * selection is deterministic for reproducibility in tests.
 */
export function pickFallbackNarrative(
  encounterId: string | undefined,
  modality: Modality | undefined,
  counter: number,
): string {
  const pool = poolFor(modality);
  const seed = encounterId ?? `anon-${counter}`;
  const idx = (hash(seed) + counter) % pool.length;
  return pool[idx]!;
}

/**
 * Total pool size for a given modality. Useful for diagnostics.
 */
export function fallbackPoolSize(modality: Modality | undefined): number {
  return poolFor(modality).length;
}
