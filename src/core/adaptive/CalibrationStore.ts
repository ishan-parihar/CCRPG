/**
 * CalibrationStore — per-player, per-paradigm difficulty calibration state,
 * persisted through the KeyValueStore port (encrypted-at-rest stores ride
 * the same port; the CLI uses FileKeyValueStore).
 */
import type { KeyValueStore } from '../../infra/persistence/KeyValueStore.js';

export interface CalibrationRecord {
  readonly paradigmId: string;
  /** Difficulty level 0..1 the player's baseline sits at. */
  readonly baselineLevel: number;
  /** Last level reached mid-session (warm-start point). */
  readonly lastLevel: number;
  readonly calibratedAt: number;
  readonly lastPlayedAt: number;
  readonly sessionsPlayed: number;
  /** Player-requested override (set_difficulty_override tool). */
  readonly override?: {
    readonly direction?: 'easier' | 'harder';
    readonly level?: number;
    readonly at: number;
  };
}

const KEY_PREFIX = 'calib:v1:';
const INDEX_KEY = 'calib:v1:index';

export class CalibrationStore {
  constructor(private readonly kv: KeyValueStore) {}

  private key(paradigmId: string): string {
    return KEY_PREFIX + paradigmId.replace(/[^a-z_]/gi, '_');
  }

  async get(paradigmId: string): Promise<CalibrationRecord | null> {
    const raw = await this.kv.get(this.key(paradigmId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as CalibrationRecord;
      if (typeof parsed.paradigmId === 'string' && typeof parsed.baselineLevel === 'number') {
        return parsed;
      }
    } catch { /* corrupt → recalibrate */ }
    return null;
  }

  async put(record: CalibrationRecord): Promise<void> {
    await this.kv.set(this.key(record.paradigmId), JSON.stringify(record));
    await this.addToIndex(record.paradigmId);
  }

  async all(): Promise<CalibrationRecord[]> {
    const raw = await this.kv.get(INDEX_KEY);
    let ids: string[] = [];
    try {
      if (raw) ids = JSON.parse(raw) as string[];
    } catch { /* empty */ }
    const records = await Promise.all(ids.map((id) => this.get(id)));
    return records.filter((r): r is CalibrationRecord => r !== null);
  }

  private async addToIndex(paradigmId: string): Promise<void> {
    const raw = await this.kv.get(INDEX_KEY);
    let ids: string[] = [];
    try {
      if (raw) ids = JSON.parse(raw) as string[];
    } catch { /* rebuild */ }
    if (!ids.includes(paradigmId)) {
      ids.push(paradigmId);
      await this.kv.set(INDEX_KEY, JSON.stringify(ids));
    }
  }
}
