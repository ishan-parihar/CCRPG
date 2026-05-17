/**
 * State — the five states of consciousness (orthogonal to stage).
 * Canonical string literal union per docs/02-glossary.md.
 */
export type State = 'Gross' | 'Subtle' | 'Causal' | 'Witness' | 'NonDual';

export const ALL_STATES: readonly State[] = ['Gross', 'Subtle', 'Causal', 'Witness', 'NonDual'];
