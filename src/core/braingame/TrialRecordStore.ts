/**
 * TrialRecordStore — event-sourced trial persistence over the KeyValueStore
 * port. Appends per-session trial records; compacts into bounded summaries
 * (rolling ring buffer) so storage stays flat as history grows.
 *
 * Reference rule (docs/brain-game-upgrade/01 §R4): every stimulus/response/
 * RT/correctness lands as an immutable record with a deterministic paramsHash.
 */
import type { TrialRecord } from './types.js';
import type { KeyValueStore } from '../../infra/persistence/KeyValueStore.js';
import { InfraConfig } from '../config/InfraConfig.js';

export interface SessionRecord {
  readonly sessionId: string;
  readonly paradigmId: string;
  readonly startedAt: number;
  readonly trialsCompleted: number;
  /** Mean accuracy across trials. */
  readonly accuracy: number;
  /** Median adjusted RT in ms (null for untimed paradigms). */
  readonly rtMedianMs: number | null;
  /** Composite performance 0..1 written by the caller (engine summary). */
  readonly performance: number;
}

const SESSIONS_KEY = 'trials:v1:sessions';
const TRIALS_KEY_PREFIX = 'trials:v1:data:';
export const MAX_TRIALS_PER_PARADIGM = InfraConfig.MAX_TRIALS_PER_PARADIGM;
export const MAX_SESSIONS = InfraConfig.MAX_SESSIONS;

export class TrialRecordStore {
  constructor(private readonly kv: KeyValueStore) {}

  /**
   * JSON cannot carry bigint — latencyNs crosses the storage boundary as a
   * decimal string and is revived on read.
   */
  private static serializeTrial(r: TrialRecord): Record<string, unknown> {
    return {
      ...r,
      latencyNs: r.latencyNs === null ? null : r.latencyNs.toString(),
    };
  }

  private static deserializeTrial(raw: Record<string, unknown>): TrialRecord | null {
    if (
      typeof raw.sessionId !== 'string' ||
      typeof raw.paradigmId !== 'string' ||
      typeof raw.correct !== 'boolean'
    ) {
      return null;
    }
    const ns = raw.latencyNs;
    return {
      ...(raw as unknown as TrialRecord),
      latencyNs: typeof ns === 'string' ? BigInt(ns) : null,
    };
  }

  /** Append one session's trials + its summary; compacts both buffers. */
  async appendSession(summaryTrials: readonly TrialRecord[], session: SessionRecord): Promise<void> {
    const key = TRIALS_KEY_PREFIX + session.paradigmId.replace(/[^a-z_]/gi, '_');
    const existing = await this.readJson<TrialRecord[]>(key, []);
    const merged = [...existing, ...summaryTrials];
    const capped = merged.slice(Math.max(0, merged.length - MAX_TRIALS_PER_PARADIGM));
    await this.kv.set(key, JSON.stringify(capped.map(TrialRecordStore.serializeTrial)));

    const sessions = await this.readJson<SessionRecord[]>(SESSIONS_KEY, []);
    const nextSessions = [session, ...sessions].slice(0, MAX_SESSIONS);
    await this.kv.set(SESSIONS_KEY, JSON.stringify(nextSessions));
  }

  async trialsByParadigm(paradigmId: string): Promise<readonly TrialRecord[]> {
    const raws = await this.readJson<Record<string, unknown>[]>(
      TRIALS_KEY_PREFIX + paradigmId.replace(/[^a-z_]/gi, '_'),
      [],
    );
    return raws
      .map(TrialRecordStore.deserializeTrial)
      .filter((r): r is TrialRecord => r !== null);
  }

  async recentSessions(limit = 10): Promise<readonly SessionRecord[]> {
    const sessions = await this.readJson<SessionRecord[]>(SESSIONS_KEY, []);
    return sessions.slice(0, limit);
  }

  /**
   * Per-line aggregate used by CognitiveIndex and insights:
   * mean accuracy + median RT + trial count per paradigm.
   */
  async domainSummaries(): Promise<ReadonlyMap<string, { accuracy: number; rtMedianMs: number | null; trials: number }>> {
    const sessions = await this.readJson<SessionRecord[]>(SESSIONS_KEY, []);
    const byParadigm = new Map<string, { accSum: number; n: number; rts: number[] }>();
    for (const s of sessions) {
      const cur = byParadigm.get(s.paradigmId) ?? { accSum: 0, n: 0, rts: [] };
      byParadigm.set(s.paradigmId, {
        accSum: cur.accSum + s.accuracy * s.trialsCompleted,
        n: cur.n + s.trialsCompleted,
        rts: s.rtMedianMs !== null ? [...cur.rts, s.rtMedianMs] : cur.rts,
      });
    }
    const out = new Map<string, { accuracy: number; rtMedianMs: number | null; trials: number }>();
    for (const [id, v] of byParadigm) {
      out.set(id, {
        accuracy: v.n > 0 ? v.accSum / v.n : 0,
        rtMedianMs: v.rts.length > 0 ? v.rts.reduce((a, b) => a + b, 0) / v.rts.length : null,
        trials: v.n,
      });
    }
    return out;
  }

  private async readJson<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await this.kv.get(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
}
