import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { ShadowQuadrant } from './enums.js';

export interface ShadowEntry {
  readonly id: string;
  readonly quadrant: ShadowQuadrant;
  readonly line: Line;
  readonly stage: Stage;
  readonly drive: Drive;
  readonly surfacedAt: number;
  readonly resolvedAt: number | null;
  readonly recurrenceCount: number;
  readonly compoundPartner: string | null;
  readonly severity: number;
}

export interface ShadowLedger {
  readonly entries: readonly ShadowEntry[];
  readonly activeCount: number;
}

export function createEmptyShadowLedger(): ShadowLedger {
  return { entries: [], activeCount: 0 };
}
