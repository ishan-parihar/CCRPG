import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { Modality } from '../domain/enums.js';

export interface ModuleEntry {
  readonly line: Line;
  readonly stage: Stage;
  readonly title: string;
  readonly modalities: readonly Modality[];
}

export interface ConceptDraftIndex {
  readonly modules: Readonly<Record<string, ModuleEntry>>;
}

export function queryByLineStage(index: ConceptDraftIndex, line: Line, stage: Stage): ModuleEntry | undefined {
  return index.modules[`${line.toLowerCase()}:${stage.toLowerCase()}`];
}

export function queryByModality(index: ConceptDraftIndex, modality: Modality): ModuleEntry[] {
  return Object.values(index.modules).filter(m => m.modalities.includes(modality));
}

export function allModuleKeys(index: ConceptDraftIndex): string[] {
  return Object.keys(index.modules);
}
