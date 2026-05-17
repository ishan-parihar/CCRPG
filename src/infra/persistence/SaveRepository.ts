import {
  DEFAULT_COGNITIVE_PROFILE,
  DEFAULT_STATS,
  type CognitiveProfile,
  type CombatStats,
} from '@core/domain/Stats.js';
import type { KeyValueStore } from './KeyValueStore.js';

const SAVE_KEY = 'save:v1';
const CURRENT_VERSION = 1;

/** The root persisted save document. */
export interface SaveData {
  readonly version: number;
  readonly playerName: string;
  readonly stats: CombatStats;
  readonly cognitive: CognitiveProfile;
  /** XP accumulated across battles. */
  readonly xp: number;
  /** Level derived from XP curve. */
  readonly level: number;
  /** Total battles completed. */
  readonly battlesWon: number;
  /** Last save timestamp (ms since epoch). */
  readonly updatedAt: number;
}

export const DEFAULT_SAVE: SaveData = {
  version: CURRENT_VERSION,
  playerName: 'Hero',
  stats: DEFAULT_STATS,
  cognitive: DEFAULT_COGNITIVE_PROFILE,
  xp: 0,
  level: 1,
  battlesWon: 0,
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
}

/** Forward-compatible migration. Currently there is only v1. */
function migrate(input: Partial<SaveData>): SaveData {
  return {
    ...DEFAULT_SAVE,
    ...input,
    stats: { ...DEFAULT_SAVE.stats, ...(input.stats ?? {}) },
    cognitive: { ...DEFAULT_SAVE.cognitive, ...(input.cognitive ?? {}) },
    version: CURRENT_VERSION,
  };
}
