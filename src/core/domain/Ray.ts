/**
 * Ray — the seven Law-of-One energy rays.
 * Canonical string literal union per docs/02-glossary.md.
 *
 * HoloOS alignment (per 08.8.22 Vibrational-Frequency vs Energy-Ray-Centers):
 * CCRPG's `Ray` type serves DOUBLE DUTY:
 * 1. As the DENSITY-COORDINATE (V-axis) — the holon's POSITION in the octave's
 *    developmental arc. Single value per stage (see STAGE_RAY_MAP).
 * 2. As the ENERGY-RAY-CENTER PROFILE — 7 structural energy centers that EXIST
 *    SIMULTANEOUSLY in every holon, organized into three complexes.
 *    See Significator.rayProfile (the 7-element vector).
 *
 * These are TWO DIFFERENT AXES that share color names. The density-coordinate
 * is the holon's position; the energy-ray-center profile is the holon's
 * internal structure.
 */
import type { Stage } from './Stage.js';
import type { Complex } from './Line.js';

export type Ray = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Indigo' | 'Violet';

export type BlueFlow = 'in' | 'out';

export const ALL_RAYS: readonly Ray[] = [
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Indigo',
  'Violet',
];

/** Canonical stage → ray correspondence (density-coordinate map). */
export const STAGE_RAY_MAP: Readonly<Record<Stage, Ray>> = {
  Infrared: 'Red',
  Magenta: 'Orange',
  Red: 'Yellow',
  Amber: 'Green',
  Orange: 'Blue',
  Green: 'Blue',
  Turquoise: 'Indigo',
  White: 'Violet',
};

/** Blue-flow direction for stages that map to Blue ray. */
export const STAGE_BLUE_FLOW: Readonly<Partial<Record<Stage, BlueFlow>>> = {
  Orange: 'in',
  Green: 'out',
};

/**
 * GAP-D2-1 (per HoloOS 08.8.22): Energy-Ray-Center → Complex mapping.
 * The 7 energy-ray-centers are organized into three structural complexes
 * that map to the three realms:
 *   - Body  (Red/Orange/Yellow) ↔ Gross   (physical substrate)
 *   - Mind  (Green/Blue)        ↔ Subtle  (archetypal/cognitive)
 *   - Spirit(Indigo/Violet)     ↔ Causal  (formless/transpersonal)
 *
 * This is DISTINCT from LINE_COMPLEX (which maps Lines to Complexes).
 * Both mappings coexist: Lines are the developmental streams; Rays are the
 * structural energy-centers. A player has 8 Lines AND 7 Ray-Centers.
 */
export const RAY_COMPLEX: Readonly<Record<Ray, Complex>> = {
  Red: 'Body',
  Orange: 'Body',
  Yellow: 'Body',
  Green: 'Mind',
  Blue: 'Mind',
  Indigo: 'Spirit',
  Violet: 'Spirit',
};

/** All rays belonging to a given Complex. */
export function raysForComplex(complex: Complex): readonly Ray[] {
  return ALL_RAYS.filter(r => RAY_COMPLEX[r] === complex);
}

