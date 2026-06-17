import {
  DEFAULT_COGNITIVE_PROFILE,
  type CognitiveProfile,
} from '@core/domain/Stats.js';
import type { Significator } from '@core/domain/Significator.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import type { KeyValueStore } from './KeyValueStore.js';

const SAVE_KEY = 'save:v1';
const PROFILE_KEY = 'profile:v1';
const WORLD_KEY = 'world:v1';
const CURRENT_VERSION = 1;

/** The root persisted save document. */
export interface SaveData {
  readonly version: number;
  readonly playerName: string;
  readonly cognitive: CognitiveProfile;
  /** XP accumulated across sessions. */
  readonly xp: number;
  /** Level derived from XP curve. */
  readonly level: number;
  /** Total encounters completed. */
  readonly encountersCompleted: number;
  /** Last save timestamp (ms since epoch). */
  readonly updatedAt: number;
}

export const DEFAULT_SAVE: SaveData = {
  version: CURRENT_VERSION,
  playerName: 'Hero',
  cognitive: DEFAULT_COGNITIVE_PROFILE,
  xp: 0,
  level: 1,
  encountersCompleted: 0,
  updatedAt: 0,
};

/**
 * SaveRepository — typed wrapper around KeyValueStore that handles
 * serialization, default initialization, and (future) migrations.
 */
export class SaveRepository {
  constructor(private readonly store: KeyValueStore) {}

  async load(): Promise<SaveData> {
    const raw = await this.store.get(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    try {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return migrate(parsed);
    } catch {
      // Corrupted save — start fresh rather than crash.
      return { ...DEFAULT_SAVE };
    }
  }

  async save(data: SaveData): Promise<void> {
    const out: SaveData = {
      ...data,
      version: CURRENT_VERSION,
      updatedAt: Date.now(),
    };
    await this.store.set(SAVE_KEY, JSON.stringify(out));
  }

  async reset(): Promise<void> {
    await this.store.remove(SAVE_KEY);
  }

  // --- Significator persistence ---

  async loadProfile(): Promise<Significator | null> {
    const raw = await this.store.get(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Significator;
    } catch {
      return null;
    }
  }

  async saveProfile(sig: Significator): Promise<void> {
    await this.store.set(PROFILE_KEY, JSON.stringify(sig));
  }

  async resetProfile(): Promise<void> {
    await this.store.remove(PROFILE_KEY);
  }

  // --- WorldState persistence ---

  async loadWorldState(): Promise<WorldState | null> {
    const raw = await this.store.get(WORLD_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WorldState;
    } catch {
      return null;
    }
  }

  async saveWorldState(world: WorldState): Promise<void> {
    await this.store.set(WORLD_KEY, JSON.stringify(world));
  }

  async resetWorldState(): Promise<void> {
    await this.store.remove(WORLD_KEY);
  }
}

/** Forward-compatible migration. Currently there is only v1. */
function migrate(input: Partial<SaveData>): SaveData {
  return {
    ...DEFAULT_SAVE,
    ...input,
    cognitive: { ...DEFAULT_SAVE.cognitive, ...(input.cognitive ?? {}) },
    version: CURRENT_VERSION,
  };
}
