/**
 * Line — the eight lines of intelligence.
 * Canonical string literal union per docs/02-glossary.md.
 */
import type { Quadrant } from './PlayerProfile.js';

export type Line =
  | 'Cognitive'
  | 'Emotional'
  | 'Moral'
  | 'Intrapersonal'
  | 'Spiritual'
  | 'Somatic'
  | 'Willpower'
  | 'Interpersonal';

export const ALL_LINES: readonly Line[] = [
  'Cognitive',
  'Emotional',
  'Moral',
  'Intrapersonal',
  'Spiritual',
  'Somatic',
  'Willpower',
  'Interpersonal',
];

/** Primary quadrant home for each line. */
export const LINE_QUADRANT: Readonly<Record<Line, Quadrant>> = {
  Cognitive: 'UR',
  Emotional: 'UL',
  Moral: 'LL',
  Intrapersonal: 'UL',
  Spiritual: 'UL',
  Somatic: 'UR',
  Willpower: 'UR',
  Interpersonal: 'LL',
};
