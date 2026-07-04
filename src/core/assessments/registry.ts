/**
 * ModuleRegistry - stores and queries assessment modules.
 * Uses a Map keyed by 'Line:Stage' for O(1) lookup.
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { StageAssessment } from './types.js';

function makeKey(line: Line, stage: Stage): string {
  return `${line}:${stage}`;
}

export class ModuleRegistry {
  private readonly modules: Map<string, StageAssessment> = new Map();
  private readonly cooldowns: Map<string, number> = new Map();

  register(module: StageAssessment): void {
    const key = makeKey(module.line, module.stage);
    this.modules.set(key, module);
  }

  get(line: Line, stage: Stage): StageAssessment | undefined {
    return this.modules.get(makeKey(line, stage));
  }

  getAll(): StageAssessment[] {
    return Array.from(this.modules.values());
  }

  filter(opts: { line?: Line; stage?: Stage }): StageAssessment[] {
    const all = this.getAll();
    return all.filter(m => {
      if (opts.line !== undefined && m.line !== opts.line) return false;
      if (opts.stage !== undefined && m.stage !== opts.stage) return false;
      return true;
    });
  }

  getCooldown(line: Line, stage: Stage): number {
    return this.cooldowns.get(makeKey(line, stage)) ?? 0;
  }

  setCooldown(line: Line, stage: Stage, until: number): void {
    this.cooldowns.set(makeKey(line, stage), until);
  }

  count(): number {
    return this.modules.size;
  }
}
