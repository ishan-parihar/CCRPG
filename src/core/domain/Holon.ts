import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { HolonKind, EnergeticDirection, Modality, ShadowQuadrant } from './enums.js';

export interface HolonDriveState {
  readonly dominant: Drive;
  readonly secondary: Drive;
  readonly shadowQuadrant: ShadowQuadrant | null;
}

export interface Holon {
  readonly id: string;
  readonly name: string;
  readonly kind: HolonKind;
  readonly line: Line;
  readonly stage: Stage;
  readonly drives: HolonDriveState;
  readonly polarity: EnergeticDirection;
  readonly narrativeRole: string;
  readonly relationships: readonly string[];
  readonly modality?: Modality;
  readonly active: boolean;
}
