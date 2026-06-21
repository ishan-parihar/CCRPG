/**
 * SaveRepository — persistence layer for game state.
 *
 * Two persistence mechanisms:
 * 1. SaveRepository class — async KeyValueStore-based (for Phaser game scenes)
 * 2. CLI file-based functions — synchronous JSON file (for CLI runner)
 */
import {
  DEFAULT_COGNITIVE_PROFILE,
  type CognitiveProfile,
} from '@core/domain/Stats.js';
import type { Significator } from '@core/domain/Significator.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import type { KeyValueStore } from './KeyValueStore.js';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

// ═══════════════════════════════════════════════════════════════════════
// CLI File-Based Persistence (synchronous, for cli-game.ts)
// Saves to ~/.ccrpg/save.json so player progress persists across CLI runs.
// ═══════════════════════════════════════════════════════════════════════

const CLI_SAVE_DIR = path.join(os.homedir(), '.ccrpg');
const CLI_SAVE_FILE = path.join(CLI_SAVE_DIR, 'save.json');

/**
 * Load a previously saved Significator from disk.
 * Returns null if no save file exists or if parsing fails.
 */
export function loadSave(): Significator | null {
  try {
    if (fs.existsSync(CLI_SAVE_FILE)) {
      const raw = fs.readFileSync(CLI_SAVE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Basic validation: must have required fields
      if (parsed && typeof parsed.id === 'string' && typeof parsed.currentStage === 'string' && parsed.altitudes) {
        return parsed as Significator;
      }
    }
  } catch { /* ignore corrupt saves */ }
  return null;
}

/**
 * Save the current Significator state to disk.
 */
export function saveGame(sig: Significator): void {
  try {
    fs.mkdirSync(CLI_SAVE_DIR, { recursive: true });
    fs.writeFileSync(CLI_SAVE_FILE, JSON.stringify(sig, null, 2));
  } catch { /* ignore write errors in headless mode */ }
}

/**
 * Check if a save file exists.
 */
export function hasSave(): boolean {
  try {
    return fs.existsSync(CLI_SAVE_FILE);
  } catch {
    return false;
  }
}

/**
 * Delete the save file (for new game).
 */
export function deleteSave(): void {
  try {
    if (fs.existsSync(CLI_SAVE_FILE)) {
      fs.unlinkSync(CLI_SAVE_FILE);
    }
  } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════════════
// WorldState Persistence (CLI file-based, synchronous)
// Saves to ~/.ccrpg/world.json so world state persists across CLI runs.
// ═══════════════════════════════════════════════════════════════════════

const CLI_WORLD_FILE = path.join(CLI_SAVE_DIR, 'world.json');

/**
 * Load a previously saved WorldState from disk.
 * Returns null if no save file exists or if parsing fails.
 */
export function loadWorldState(): WorldState | null {
  try {
    if (fs.existsSync(CLI_WORLD_FILE)) {
      const raw = fs.readFileSync(CLI_WORLD_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.holons) {
        return parsed as WorldState;
      }
    }
  } catch { /* ignore corrupt saves */ }
  return null;
}

/**
 * Save the current WorldState to disk.
 */
export function saveWorldState(world: WorldState): void {
  try {
    fs.mkdirSync(CLI_SAVE_DIR, { recursive: true });
    fs.writeFileSync(CLI_WORLD_FILE, JSON.stringify(world, null, 2));
  } catch { /* ignore write errors in headless mode */ }
}

/**
 * Delete the world save file (for new game).
 */
export function deleteWorldSave(): void {
  try {
    if (fs.existsSync(CLI_WORLD_FILE)) {
      fs.unlinkSync(CLI_WORLD_FILE);
    }
  } catch { /* ignore */ }
}
