import type { EnergeticDirection, PolarityMode } from './enums.js';

export interface PolarityCellVector {
  readonly dominantPattern: EnergeticDirection | null;
  readonly exploratoryBreadth: number;
  readonly coherence: number;
  readonly crystallization: number;
  readonly traceCount: number;
  readonly textureId: string;
}

export interface LineProfile {
  readonly direction: EnergeticDirection | null;
  readonly coherence: number;
  readonly mode: PolarityMode;
}

export interface MasterPolarity {
  readonly mode: PolarityMode;
  readonly dominantDirection: EnergeticDirection | null;
  readonly coherentLineCount: number;
  readonly crystallizationProgress: number;
}

export interface PolarityState {
  readonly cells: Readonly<Record<string, PolarityCellVector>>;
  readonly lineProfiles: Readonly<Record<string, LineProfile>>;
  readonly master: MasterPolarity;
}

export function createInitialPolarityState(): PolarityState {
  return {
    cells: {},
    lineProfiles: {},
    master: {
      mode: 'Exploring' as PolarityMode,
      dominantDirection: null,
      coherentLineCount: 0,
      crystallizationProgress: 0,
    },
  };
}
