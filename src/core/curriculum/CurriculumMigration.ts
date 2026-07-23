/**
 * CurriculumMigration — version-aware migration paths for curriculum schema evolution.
 * Spec: Phase 5B of curriculum upgrade plan.
 *
 * When the curriculum schema changes (new fields, renamed fields, structural
 * changes), this module provides deterministic migration functions that transform
 * an old KnowledgeState to the current schema version.
 *
 * Pure functions: old state in, migrated state out. No side effects.
 */
import type {
  KnowledgeState,
  LearningProfile,
} from './types.js';

// ---------------------------------------------------------------------------
// Schema version registry
// ---------------------------------------------------------------------------

/**
 * Current curriculum schema version.
 * Increment when KnowledgeState, ConceptState, or ForgettingCurve fields change.
 */
export const CURRENT_CURRICULUM_VERSION = '1.2.0';

/**
 * Supported schema versions in ascending order.
 * Each entry is [version, migration function].
 * Migrations are applied sequentially from the source version to CURRENT.
 */
const MIGRATIONS: readonly {
  readonly version: string;
  readonly migrate: (state: KnowledgeState) => KnowledgeState;
}[] = [
  {
    version: '1.0.0',
    migrate: (state) => state, // v1.0.0 is the base — no migration needed
  },
  {
    version: '1.1.0',
    migrate: (state) => {
      // v1.1.0: Added forgettingCurves and curriculumVersion to KnowledgeState.
      // No structural change to existing fields — just ensure new fields exist.
      return {
        ...state,
        forgettingCurves: state.forgettingCurves ?? new Map(),
        curriculumVersion: '1.1.0',
      };
    },
  },
  {
    version: '1.2.0',
    migrate: (state) => {
      // v1.2.0: Added completedPhases to ConceptState, modalityEffectiveness
      // and learningVelocity to LearningProfile. No structural change to
      // existing fields — just ensure new fields exist on LearningProfile.
      const updatedProfile: LearningProfile = {
        ...state.learningProfile,
        modalityEffectiveness: state.learningProfile.modalityEffectiveness ?? undefined,
        learningVelocity: state.learningProfile.learningVelocity ?? undefined,
        lastAnalyticsAt: state.learningProfile.lastAnalyticsAt ?? undefined,
      };
      return {
        ...state,
        learningProfile: updatedProfile,
        curriculumVersion: '1.2.0',
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Migration engine
// ---------------------------------------------------------------------------

/**
 * Migrate a KnowledgeState from its stored version to the current version.
 * Applies all intermediate migrations sequentially.
 *
 * @param state - The stored KnowledgeState (may have no version field)
 * @returns Migrated KnowledgeState at CURRENT_CURRICULUM_VERSION
 */
export function migrateKnowledgeState(state: KnowledgeState): KnowledgeState {
  const sourceVersion = state.curriculumVersion ?? '1.0.0';

  if (sourceVersion === CURRENT_CURRICULUM_VERSION) {
    return state; // Already current — no migration needed
  }

  // Find the starting migration index
  const startIdx = MIGRATIONS.findIndex(m => m.version === sourceVersion);
  if (startIdx < 0) {
    // Unknown version — treat as 1.0.0 (oldest known)
    console.warn(`[CurriculumMigration] Unknown version "${sourceVersion}", treating as 1.0.0`);
  }

  // Apply migrations sequentially from source to current
  const effectiveStart = Math.max(0, startIdx);
  let migrated = state;
  for (let i = effectiveStart + 1; i < MIGRATIONS.length; i++) {
    const migration = MIGRATIONS[i]!;
    migrated = migration.migrate(migrated);
  }

  // Ensure curriculumVersion is set to current
  return {
    ...migrated,
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
  };
}

/**
 * Check if a KnowledgeState needs migration.
 */
export function needsMigration(state: KnowledgeState): boolean {
  const version = state.curriculumVersion ?? '1.0.0';
  return version !== CURRENT_CURRICULUM_VERSION;
}

/**
 * Get the schema version of a stored KnowledgeState.
 */
export function getSchemaVersion(state: KnowledgeState): string {
  return state.curriculumVersion ?? '1.0.0';
}
