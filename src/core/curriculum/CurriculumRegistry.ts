/**
 * CurriculumRegistry — stores and queries curriculum holons.
 * Parallel to ModuleRegistry (src/core/assessments/registry.ts).
 *
 * Uses a Map keyed by conceptId for O(1) lookup.
 */
import type { CurriculumHolon, HolonLevel } from './types.js';

export class CurriculumRegistry {
  private readonly modules = new Map<string, CurriculumHolon>();
  private readonly bySubject = new Map<string, CurriculumHolon[]>();
  private readonly byLevel = new Map<HolonLevel, CurriculumHolon[]>();

  register(module: CurriculumHolon): void {
    this.modules.set(module.id, module);

    // Index by subject (extracted from id prefix)
    const subjectId = module.id.split('.').slice(0, 2).join('.');
    const subjectList = this.bySubject.get(subjectId) ?? [];
    subjectList.push(module);
    this.bySubject.set(subjectId, subjectList);

    // Index by level
    const levelList = this.byLevel.get(module.level) ?? [];
    levelList.push(module);
    this.byLevel.set(module.level, levelList);
  }

  get(conceptId: string): CurriculumHolon | undefined {
    return this.modules.get(conceptId);
  }

  getAll(): readonly CurriculumHolon[] {
    return [...this.modules.values()];
  }

  getBySubject(subjectId: string): readonly CurriculumHolon[] {
    return this.bySubject.get(subjectId) ?? [];
  }

  getByLevel(level: HolonLevel): readonly CurriculumHolon[] {
    return this.byLevel.get(level) ?? [];
  }

  getPrerequisites(conceptId: string): readonly CurriculumHolon[] {
    const module = this.modules.get(conceptId);
    if (!module) return [];
    return module.prerequisites
      .map(id => this.modules.get(id))
      .filter((m): m is CurriculumHolon => m !== undefined);
  }

  getDependents(conceptId: string): readonly CurriculumHolon[] {
    const result: CurriculumHolon[] = [];
    for (const module of this.modules.values()) {
      if (module.prerequisites.includes(conceptId)) {
        result.push(module);
      }
    }
    return result;
  }

  getAnalogies(conceptId: string): readonly CurriculumHolon[] {
    const module = this.modules.get(conceptId);
    if (!module) return [];
    const targetIds = new Set(module.isomorphisms.map(i => i.targetConceptId));
    return [...targetIds]
      .map(id => this.modules.get(id))
      .filter((m): m is CurriculumHolon => m !== undefined);
  }

  count(): number {
    return this.modules.size;
  }

  /** Check if a concept exists in the registry. */
  has(conceptId: string): boolean {
    return this.modules.has(conceptId);
  }

  /** Get all concept IDs. */
  conceptIds(): readonly string[] {
    return [...this.modules.keys()];
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

/**
 * Global curriculum registry instance.
 * Populated at startup from curriculum data files (JSON).
 * Parallel to the ModuleRegistry singleton for developmental assessments.
 */
let _instance: CurriculumRegistry | null = null;

/** Get or create the global CurriculumRegistry singleton. */
export function getCurriculumRegistry(): CurriculumRegistry {
  if (!_instance) {
    _instance = new CurriculumRegistry();
  }
  return _instance;
}

/** Reset the singleton (for testing). */
export function resetCurriculumRegistry(): void {
  _instance = null;
  // Also reset the seed flag so re-seeding works after registry reset.
  _seeded = false;
}

let _seeded = false;

/** Mark as seeded (called by CurriculumSeed). */
export function markSeeded(): void {
  _seeded = true;
}

/** Check if the registry has been seeded. */
export function isRegistrySeeded(): boolean {
  return _seeded;
}
