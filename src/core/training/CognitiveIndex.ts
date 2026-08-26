/**
 * CognitiveIndex — per-line normalized skill scores with decay.
 *
 * Canon constraints (docs/brain-game-upgrade/02 §non-adoptions):
 * - Self-referenced z-style normalization only: scores are relative to the
 *   player's OWN trailing baseline. No population norms, no percentiles
 *   exposed (Veil principle — internal context only).
 * - Decay reuses the forgetting-curve idiom from curriculum/ForgettingCurve:
 *   unplayed lines fade toward their baseline, creating SRS pressure the
 *   WorkoutPlanner exploits.
 */
import type { Line } from '../domain/Line.js';
import { ALL_LINES } from '../domain/Line.js';

export interface LineSkill {
  /** Current score 0..1 (decayed). */
  readonly score: number;
  /** Personal baseline this score regresses toward. */
  readonly baseline: number;
  readonly lastPlayedAt: number;
  readonly sessionsPlayed: number;
}

export interface CognitiveIndexState {
  readonly skills: Readonly<Record<Line, LineSkill>>;
}

export const DEFAULT_DECAY_HALF_LIFE_DAYS = 7;

/** Exponential decay toward baseline with configurable half-life. */
export function decayScore(score: number, baseline: number, daysSince: number, halfLifeDays = DEFAULT_DECAY_HALF_LIFE_DAYS): number {
  if (daysSince <= 0) return score;
  const lambda = Math.LN2 / halfLifeDays;
  return baseline + (score - baseline) * Math.exp(-lambda * daysSince);
}

export function emptyIndex(now = Date.now()): CognitiveIndexState {
  const skills = {} as Record<Line, LineSkill>;
  for (const line of ALL_LINES) {
    skills[line] = { score: 0.5, baseline: 0.5, lastPlayedAt: now, sessionsPlayed: 0 };
  }
  return { skills };
}

export class CognitiveIndex {
  constructor(private state: CognitiveIndexState = emptyIndex()) {}

  public getState(): CognitiveIndexState {
    return this.state;
  }

  public load(state: CognitiveIndexState): void {
    // Validate-on-load with shims for missing lines (mirrors validateSignificator).
    const skills: Record<Line, LineSkill> = {} as Record<Line, LineSkill>;
    for (const line of ALL_LINES) {
      const s = state.skills?.[line];
      if (s && typeof s.score === 'number' && typeof s.baseline === 'number') {
        skills[line] = {
          ...s,
          score: clamp01(s.score),
          baseline: clamp01(s.baseline),
        };
      } else {
        skills[line] = emptyIndex().skills[line]!;
      }
    }
    this.state = { skills };
  }

  /**
   * Fold one game summary into its domain lines. Score moves toward the
   * observed performance with a learning rate that shrinks as sessions
   * accumulate; the baseline tracks a slow moving average of scores.
   */
  public recordGame(lines: readonly Line[], performance: number, now = Date.now()): void {
    const p = clamp01(performance);
    const updated: Record<Line, LineSkill> = { ...this.state.skills };
    for (const line of lines) {
      const cur = updated[line]!;
      const daysSince = Math.max(0, (now - cur.lastPlayedAt) / 86_400_000);
      const decayed = decayScore(cur.score, cur.baseline, daysSince);
      const lr = Math.max(0.15, 0.5 / Math.sqrt(Math.max(1, cur.sessionsPlayed + 1)));
      const score = clamp01(decayed + (p - decayed) * lr);
      const sessions = cur.sessionsPlayed + 1;
      // Baseline tracks a slow EMA of scores — deliberately lagging so the
      // snapshot's trend signal (score vs baseline) reflects recent form.
      const baseline = clamp01(cur.baseline + (score - cur.baseline) * 0.15);
      updated[line] = { score, baseline, lastPlayedAt: now, sessionsPlayed: sessions };
    }
    this.state = { skills: updated };
  }

  /**
   * Apply session-start decay across all lines (call once per CLI invocation).
   */
  public applyDecay(now = Date.now()): CognitiveIndexState {
    const updated: Record<Line, LineSkill> = { ...this.state.skills };
    for (const line of ALL_LINES) {
      const cur = updated[line]!;
      const daysSince = Math.max(0, (now - cur.lastPlayedAt) / 86_400_000);
      if (daysSince > 0) {
        updated[line] = { ...cur, score: decayScore(cur.score, cur.baseline, daysSince) };
      }
    }
    this.state = { skills: updated };
    return this.state;
  }

  /** Veil-safe snapshot for the agent's framing decisions. */
  public snapshot(now = Date.now()): readonly { line: Line; score01: number; trend: 'rising' | 'stable' | 'decaying'; lastPlayedDaysAgo: number }[] {
    return ALL_LINES.map((line) => {
      const cur = this.state.skills[line]!;
      const daysAgo = (now - cur.lastPlayedAt) / 86_400_000;
      const decayed = decayScore(cur.score, cur.baseline, Math.max(0, daysAgo));
      const delta = decayed - cur.baseline;
      return {
        line,
        score01: decayed,
        trend: delta > 0.03 ? 'rising' : delta < -0.03 ? 'decaying' : 'stable',
        lastPlayedDaysAgo: Math.round(daysAgo * 10) / 10,
      };
    });
  }

  /** Felt-sense phrase per line — the ONLY index text shown to players. */
  public feltSenseFor(line: Line): string {
    const entry = this.snapshot().find((s) => s.line === line)!;
    if (entry.trend === 'rising' && entry.score01 > 0.65) return `your ${line.toLowerCase()} sense feels sharp lately`;
    if (entry.trend === 'rising') return `${line.toLowerCase()} attention is quietly strengthening`;
    if (entry.trend === 'decaying') return `${line.toLowerCase()} awareness feels a little distant these days`;
    if (entry.score01 < 0.4) return `${line.toLowerCase()} perception resting fallow`;
    return `${line.toLowerCase()} presence steady`;
  }
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
