import type { Drive } from './Drive.js';
import type { Line } from './Line.js';
import type { Stage } from './Stage.js';
import type { ShadowQuadrant } from './enums.js';
import type { PolarityTrace } from './PolarityTrace.js';

export interface HolonDelta {
  readonly holonId: string;
  readonly field: string;
  readonly oldValue: unknown;
  readonly newValue: unknown;
}

export interface ConsequenceRecord {
  readonly encounterId: string;
  readonly timestamp: number;
  readonly polarityTrace: PolarityTrace;
  readonly shadowSurfaced: ShadowQuadrant | null;
  readonly shadowResolved: string | null;
  readonly holonDeltas: readonly HolonDelta[];
  readonly altitudeShift: { readonly line: Line; readonly from: Stage; readonly to: Stage } | null;
  readonly driveShift: { readonly drive: Drive; readonly delta: number } | null;
  readonly narrativeSummary: string;
  /** P2-High: Optional developmental feedback (internal, not player-facing). */
  readonly feedback?: string;
  /** P2-High: Optional 10-dim psychometric scores from the agent's evaluation. */
  readonly scores?: Record<string, number>;
}
