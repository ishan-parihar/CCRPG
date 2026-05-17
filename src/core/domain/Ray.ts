/**
 * Ray — the seven Law-of-One energy rays.
 * Canonical string literal union per docs/02-glossary.md.
 */
import type { Stage } from './Stage.js';

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

/** Canonical stage → ray correspondence (sub-octave map). */
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
