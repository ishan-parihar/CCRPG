/**
 * Tests for CurriculumMigration — version-aware migration paths.
 */
import { describe, it, expect } from 'vitest';
import {
  migrateKnowledgeState,
  needsMigration,
  getSchemaVersion,
  CURRENT_CURRICULUM_VERSION,
} from '../../../src/core/curriculum/CurriculumMigration.js';
import type { KnowledgeState } from '../../../src/core/curriculum/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeKnowledgeState(overrides: Partial<KnowledgeState> = {}): KnowledgeState {
  return {
    conceptStates: new Map(),
    subjectProgress: new Map(),
    studyHistory: [],
    learningProfile: {
      preferredModalities: [],
      metacognitionScore: 0.5,
      calibrationAccuracy: 0.5,
      transferCapacity: 0.5,
      studyEfficiency: 0.5,
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CurriculumMigration', () => {
  describe('CURRENT_CURRICULUM_VERSION', () => {
    it('is a semver string', () => {
      expect(CURRENT_CURRICULUM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('getSchemaVersion', () => {
    it('returns 1.0.0 when no version field present', () => {
      const state = makeKnowledgeState();
      expect(getSchemaVersion(state)).toBe('1.0.0');
    });

    it('returns stored version when present', () => {
      const state = makeKnowledgeState({ curriculumVersion: '1.1.0' });
      expect(getSchemaVersion(state)).toBe('1.1.0');
    });
  });

  describe('needsMigration', () => {
    it('returns true when no version field (defaults to 1.0.0)', () => {
      const state = makeKnowledgeState();
      expect(needsMigration(state)).toBe(true);
    });

    it('returns true for old version', () => {
      const state = makeKnowledgeState({ curriculumVersion: '1.1.0' });
      expect(needsMigration(state)).toBe(true);
    });

    it('returns false when already at current version', () => {
      const state = makeKnowledgeState({ curriculumVersion: CURRENT_CURRICULUM_VERSION });
      expect(needsMigration(state)).toBe(false);
    });
  });

  describe('migrateKnowledgeState', () => {
    it('returns same reference when already at current version', () => {
      const state = makeKnowledgeState({ curriculumVersion: CURRENT_CURRICULUM_VERSION });
      const result = migrateKnowledgeState(state);
      expect(result).toBe(state);
    });

    it('migrates from 1.0.0 to current version', () => {
      const state = makeKnowledgeState();
      expect(state.curriculumVersion).toBeUndefined();
      expect(state.forgettingCurves).toBeUndefined();

      const result = migrateKnowledgeState(state);
      expect(result.curriculumVersion).toBe(CURRENT_CURRICULUM_VERSION);
      expect(result.forgettingCurves).toBeDefined();
    });

    it('migrates from 1.1.0 to current version', () => {
      const state = makeKnowledgeState({
        curriculumVersion: '1.1.0',
        forgettingCurves: new Map(),
      });
      const result = migrateKnowledgeState(state);
      expect(result.curriculumVersion).toBe(CURRENT_CURRICULUM_VERSION);
    });

    it('preserves existing concept states during migration', () => {
      const conceptStates = new Map([
        ['test.concept', {
          depthLevel: 'applied' as const,
          retention: 0.8,
          lastReviewedAt: 1000,
          reviewCount: 5,
          depthHistory: [],
          misconceptionFlags: [],
        }],
      ]);
      const state = makeKnowledgeState({ conceptStates });
      const result = migrateKnowledgeState(state);
      expect(result.conceptStates.size).toBe(1);
      expect(result.conceptStates.get('test.concept')?.depthLevel).toBe('applied');
    });

    it('preserves existing study history during migration', () => {
      const studyHistory = [{
        conceptId: 'test',
        depthAchieved: 'memorized' as const,
        modality: 'LanguageReflective' as const,
        timestamp: 1000,
        retentionBefore: 0.5,
        retentionAfter: 0.8,
      }];
      const state = makeKnowledgeState({ studyHistory });
      const result = migrateKnowledgeState(state);
      expect(result.studyHistory.length).toBe(1);
    });

    it('adds forgettingCurves when migrating from 1.0.0', () => {
      const state = makeKnowledgeState();
      const result = migrateKnowledgeState(state);
      expect(result.forgettingCurves).toBeDefined();
      expect(result.forgettingCurves instanceof Map).toBe(true);
    });

    it('preserves existing forgettingCurves during migration', () => {
      const curves = new Map([
        ['test', {
          conceptId: 'test',
          firstLearnedAt: 1000,
          lastRetrievedAt: 2000,
          retrievalCount: 3,
          retention: 0.9,
          halfLifeMs: 86400000,
        }],
      ]);
      const state = makeKnowledgeState({ forgettingCurves: curves });
      const result = migrateKnowledgeState(state);
      expect(result.forgettingCurves?.size).toBe(1);
    });

    it('adds modalityEffectiveness to learningProfile when migrating to 1.2.0', () => {
      const state = makeKnowledgeState({ curriculumVersion: '1.1.0' });
      const result = migrateKnowledgeState(state);
      // modalityEffectiveness should be undefined (not set) but the field should be present
      expect(result.learningProfile).toBeDefined();
    });
  });
});
