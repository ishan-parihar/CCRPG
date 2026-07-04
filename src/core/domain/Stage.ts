/**
 * Stage — the eight macro-developmental levels of consciousness.
 * Canonical string literal union per docs/02-glossary.md.
 */
export type Stage =
  | 'Infrared'
  | 'Magenta'
  | 'Red'
  | 'Amber'
  | 'Orange'
  | 'Green'
  | 'Turquoise'
  | 'White';

export const ALL_STAGES: readonly Stage[] = [
  'Infrared',
  'Magenta',
  'Red',
  'Amber',
  'Orange',
  'Green',
  'Turquoise',
  'White',
];

/** Ordinal index of a stage (0 = Infrared, 7 = White). */
export function stageOrdinal(s: Stage): number {
  return ALL_STAGES.indexOf(s);
}
