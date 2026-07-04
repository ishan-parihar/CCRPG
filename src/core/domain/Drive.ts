/**
 * Drive — the four motivational polarities.
 * Canonical string literal union per docs/02-glossary.md.
 *
 * HoloOS alignment (per AUDIT-HOLOOS-ALIGNMENT.md §2.5.6):
 * The 4 drives form 2 orthogonal boundary axes:
 *   - Vertical pair: Eros (reaching toward) / Agape (receiving-holding)
 *   - Horizontal pair: Agency (active-asserting) / Communion (relating-connecting)
 * Both pairs are co-equal; HoloOS derives G_z from Agape/Love-Law (D2)
 * and P_z from Eros/Free-Will-Law (D1).
 */
import type { Line } from './Line.js';

export type Drive = 'Agency' | 'Communion' | 'Eros' | 'Agape';

export const ALL_DRIVES: readonly Drive[] = ['Agency', 'Communion', 'Eros', 'Agape'];

/**
 * Direct Line → Drive affinity. Replaces the prior QUADRANT_TO_DRIVE
 * indirection (which made Agape unreachable — no Line maps to LR quadrant).
 *
 * Per HS-12 fix: Spiritual and Interpersonal now map to Agape so the
 * Agape drive is reachable via driveForLine().
 */
export const LINE_DRIVE: Readonly<Record<Line, Drive>> = {
  Cognitive: 'Agency',
  Moral: 'Communion',
  Intrapersonal: 'Eros',
  Emotional: 'Eros',
  Spiritual: 'Agape',
  Interpersonal: 'Agape',
  Somatic: 'Agency',
  Willpower: 'Agency',
};

/** Returns the primary Drive for a given Line. */
export function driveForLine(line: Line): Drive {
  return LINE_DRIVE[line] ?? 'Agency';
}

