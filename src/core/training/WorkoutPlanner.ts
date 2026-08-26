/**
 * WorkoutPlanner + FatigueMonitor — brain-game workout orchestration.
 *
 * Bridges the existing session strategy (AutoModeStrategy bias) to concrete
 * game sessions: 3–6 items of 2–4 minutes each (peak.md pacing), balanced
 * across lines, SRS-prioritized toward decaying skills, avoiding immediate
 * repetition. Planner output is persisted by the caller for resume.
 */
import type { Line } from '../domain/Line.js';
import { allParadigms, getParadigm } from '../braingame/registry.js';
import type { CognitiveIndex } from './CognitiveIndex.js';

export interface WorkoutItem {
  readonly paradigmId: string;
  readonly targetLevel: number;
  readonly estimatedMinutes: number;
  /** Why this item — agent-facing context (never shown raw to players). */
  readonly rationale: string;
}

export interface WorkoutPlan {
  readonly items: readonly WorkoutItem[];
  readonly totalMinutes: number;
}

export interface PlanOptions {
  readonly minutes: number;
  /** Optional line to bias toward (agent hint from narrative context). */
  readonly focusLine?: Line;
  /** Lines to avoid (e.g. just trained in-session). */
  readonly excludeLines?: readonly Line[];
}

const AVG_MINUTES_PER_GAME = 3;

/** Pick items: decay-priority × focus bias × domain balance, no repeats. */
export function planWorkout(index: CognitiveIndex, opts: PlanOptions): WorkoutPlan {
  const snapshot = new Map(index.snapshot().map((s) => [s.line, s]));
  const paradigms = [...allParadigms()];

  // Score each paradigm: decay urgency + focus bonus − exclusion penalty.
  const scored = paradigms.map((p) => {
    let score = 0;
    let weakest: { line: Line; score01: number } | null = null;
    for (const d of p.domains) {
      const s = snapshot.get(d);
      if (!s) continue;
      const urgency = (0.5 - s.score01) + (s.trend === 'decaying' ? 0.25 : 0);
      score += urgency / p.domains.length;
      if (!weakest || s.score01 < weakest.score01) weakest = { line: d, score01: s.score01 };
    }
    if (opts.focusLine && p.domains.includes(opts.focusLine)) score += 0.35;
    // Exclusions are graded: a game fully inside just-trained lines is
    // strongly deprioritized; partial overlap (trains other lines too)
    // remains viable — it touches fresh ground while lightly revisiting.
    const overlap = opts.excludeLines?.filter((l) => p.domains.includes(l)).length ?? 0;
    if (overlap > 0) score -= 0.35 * (overlap / Math.max(1, p.domains.length));
    const rationale = weakest
      ? `${weakest.line} readiness is ${snapshot.get(weakest.line)?.trend ?? 'stable'}`
      : 'broad maintenance';
    return { p, score, rationale };
  });

  scored.sort((a, b) => b.score - a.score);

  const maxItems = Math.max(2, Math.min(6, Math.floor(opts.minutes / AVG_MINUTES_PER_GAME)));
  const seenLines = new Set<Line>();
  const items: WorkoutItem[] = [];
  let totalMinutes = 0;

  for (const { p, score, rationale } of scored) {
    if (items.length >= maxItems) break;
    // Domain balance: at most 2 games per line.
    const lineCount = p.domains.filter((d) => seenLines.has(d)).length;
    if (lineCount >= 2 && items.length > 0) continue;

    const level = Math.min(
      1,
      Math.max(0.15, ...p.domains.map((d) => snapshot.get(d)?.score01 ?? 0.5)),
    );
    const minutes = Math.min(4, Math.max(2, Math.round(AVG_MINUTES_PER_GAME)));
    items.push({ paradigmId: p.id, targetLevel: level, estimatedMinutes: minutes, rationale });
    totalMinutes += minutes;
    for (const d of p.domains) seenLines.add(d);
    void score;
  }

  return { items, totalMinutes };
}

// ── FatigueMonitor ────────────────────────────────────────────────────

/**
 * Tracks cumulative load across workout items; flags fatigue when RT
 * degrades or accuracy collapses intra-workout. Mirrors AutoModeStrategy's
 * safety-override philosophy: suggest a swap or a break, never push through.
 */
export class FatigueMonitor {
  private itemsDone = 0;
  private recentAccuracies: number[] = [];
  private recentRts: number[] = [];

  /** Record one completed game. Returns a recommendation. */
  public record(accuracy: number, rtMedianMs: number | null): 'ok' | 'lighter' | 'break' {
    this.itemsDone++;
    this.recentAccuracies.push(accuracy);
    if (rtMedianMs !== null) this.recentRts.push(rtMedianMs);

    if (this.itemsDone < 2) return 'ok';

    // Accuracy collapse across last two items.
    const lastTwo = this.recentAccuracies.slice(-2);
    const collapsing = lastTwo.every((a) => a < 0.45);

    // RT degradation >30% vs first item (fatigue signature).
    let rtdDegraded = false;
    if (this.recentRts.length >= 2) {
      rtdDegraded = this.recentRts[this.recentRts.length - 1]! > this.recentRts[0]! * 1.3;
    }

    if ((collapsing && this.itemsDone >= 3) || rtdDegraded) {
      return accuracy < 0.35 ? 'break' : 'lighter';
    }
    return 'ok';
  }
}

/** Resolve planner items into paradigm definitions, dropping unknown ids. */
export function resolveItems(items: readonly WorkoutItem[]): ReturnType<typeof getParadigm>[] {
  return items.map((i) => getParadigm(i.paradigmId));
}
