/**
 * Unified Profile Tools — educational orchestrator for the core-loop-agent.
 * Spec: brain-games upgrade Stage 1-3 follow-up — agent must orchestrate
 * psychological (8×8), cognitive (brain-games), and educational (subjects/topics)
 * development via a single profile that is measured, mapped, stored, and
 * continuously developed, feeding the recommended trajectory.
 *
 * Design: read-only snapshot tools + holistic trajectory recommender.
 * Veil rule: all player-facing values are felt-sense; raw numbers stay behind --dev/--json.
 * Timing rule: these tools never run a trial loop — they read stores only.
 */
import type { Significator } from '../domain/Significator.js';
import type { CognitiveIndex } from '../training/CognitiveIndex.js';
import type { TrialRecordStore } from '../braingame/TrialRecordStore.js';
import type { CalibrationStore } from '../adaptive/CalibrationStore.js';
import { computeCCI } from '../engines/CCIEngine.js';
import { toSnapshot } from '../domain/SignificatorSnapshot.js';
import { planWorkout } from '../training/WorkoutPlanner.js';
import { computeReviewCandidates } from '../curriculum/ForgettingCurve.js';
import { getCurriculumRegistry } from '../curriculum/CurriculumRegistry.js';
import type { Line } from '../domain/Line.js';

// ── Service context ──────────────────────────────────────────────────
export interface UnifiedProfileServices {
  readonly getSignificator: () => Promise<Significator | null> | Significator | null;
  readonly cognitiveIndex: CognitiveIndex;
  readonly trials: TrialRecordStore;
  readonly calibration: CalibrationStore;
  readonly now: () => number;
}

// ── Tool schemas ─────────────────────────────────────────────────────
export const GET_DEVELOPMENTAL_SNAPSHOT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'get_developmental_snapshot',
    description: 'Read the player\'s psychological developmental snapshot: per-line stage altitudes (8 lines × 8 stages), shadow ledger, drive fixation, CCI and ray profile. Use to understand where the player is and what wants to emerge. Translate into felt-sense for the player; never expose stage names or raw scores directly.',
    parameters: { type: 'object', properties: {}, required: [] as string[] },
  },
};

export const GET_KNOWLEDGE_SNAPSHOT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'get_knowledge_snapshot',
    description: 'Read the player\'s educational knowledge state: concept coverage, depth distribution, retention health, review candidates, and recent study events. Use to decide what to study next. Felt-sense only for player.',
    parameters: { type: 'object', properties: {}, required: [] as string[] },
  },
};

export const GET_UNIFIED_PROFILE_TOOL = {
  type: 'function' as const,
  function: {
    name: 'get_unified_profile',
    description: 'Composite profile across psychological, cognitive, and educational development. Use as the single source of truth for trajectory planning. Returns felt-sense summaries for each domain plus staleness and confidence.',
    parameters: { type: 'object', properties: {}, required: [] as string[] },
  },
};

export const RECOMMEND_TRAJECTORY_TOOL = {
  type: 'function' as const,
  function: {
    name: 'recommend_trajectory',
    description: 'Recommend the optimal next 3-5 steps across developmental encounters, brain-game workouts, and curriculum study, balanced by time budget and decay. Present via ask_user_question before executing any step.',
    parameters: {
      type: 'object',
      properties: {
        minutes: { type: 'integer', minimum: 5, maximum: 45, description: 'Time budget for the next arc.' },
        focusLine: { type: 'string', enum: ['Cognitive','Emotional','Moral','Intrapersonal','Spiritual','Somatic','Willpower','Interpersonal'], description: 'Optional line to bias toward.' },
      },
      required: ['minutes'] as string[],
    },
  },
};

export const UNIFIED_PROFILE_TOOLS = [
  GET_DEVELOPMENTAL_SNAPSHOT_TOOL,
  GET_KNOWLEDGE_SNAPSHOT_TOOL,
  GET_UNIFIED_PROFILE_TOOL,
  RECOMMEND_TRAJECTORY_TOOL,
] as const;

export const UNIFIED_TOOL_NAMES: ReadonlySet<string> = new Set(UNIFIED_PROFILE_TOOLS.map(t => t.function.name));

export const UNIFIED_RULES_SUFFIX = `
12. UNIFIED ORCHESTRATION: You are an educational orchestrator across three developmental streams — psychological (8 lines × 8 stages), cognitive (brain-games), and educational (subjects/topics). Before choosing the next catalyst, read get_unified_profile (or the specific snapshot) — translate decay, shadows, and retention into felt-sense framing. Never expose stage names, percentiles, or raw RT.
13. TRAJECTORY: Use recommend_trajectory to produce a balanced 3–5 step arc (developmental encounter, brain-game, curriculum study) for the minutes available. Present the arc via ask_user_question and respect the player's choice. Each stream heals/evolves the others; do not isolate them.
14. CONTINUITY: The profile is measured, mapped, stored, and continuously developed. After each game or study event the stores (TrialRecordStore, CognitiveIndex, KnowledgeState) are already persisted — your job is to read the updated snapshot and re-bias the next catalyst, not to re-ask what you already know.`;

export interface UnifiedHandlerContext {
  readonly services: UnifiedProfileServices;
}

// ── Dispatcher ────────────────────────────────────────────────────────
export async function handleUnifiedProfileTool(name: string, argsJson: string, ctx: UnifiedHandlerContext): Promise<{ ok: boolean; payload: Record<string, unknown> }> {
  try {
    const args = argsJson.trim() ? (JSON.parse(argsJson) as Record<string, unknown>) : {};
    switch (name) {
      case 'get_developmental_snapshot': return await getDevelopmentalSnapshot(ctx.services);
      case 'get_knowledge_snapshot': return await getKnowledgeSnapshot(ctx.services);
      case 'get_unified_profile': return await getUnifiedProfile(ctx.services);
      case 'recommend_trajectory': return await recommendTrajectory(args, ctx.services);
      default: return { ok: false, payload: { error: `Unknown unified tool: ${name}` } };
    }
  } catch (err) {
    return { ok: false, payload: { error: `Unified profile tool failed: ${(err as Error).message}` } };
  }
}

async function getDevelopmentalSnapshot(services: UnifiedProfileServices) {
  const sig = await services.getSignificator();
  if (!sig) return { ok: true, payload: { empty: true, feltSense: 'no profile yet — the journey is just beginning' } };
  const snap = toSnapshot(sig as any);
  const cci = computeCCI(snap, sig as any);
  const altitudes = Object.entries((sig as any).altitudes ?? {}).map(([line, stage]) => ({ line, stage, feltSense: `steadiness in ${String(line).toLowerCase()}` }));
  const shadows = (snap.shadows.entries ?? []).filter((e: any) => e.resolvedAt === null).length;
  const drives = Object.entries(snap.fixationRisk ?? {}).map(([drive, risk]) => ({ drive, risk01: Math.round((risk as number) * 100) / 100 }));
  return {
    ok: true as const,
    payload: {
      currentStage: (sig as any).currentStage ?? null,
      altitudes,
      shadowsUnresolved: shadows,
      drives,
      cci: { composite: Math.round(cci.composite * 100) / 100, dominantDimension: cci.dominantDimension, feltSense: cci.composite > 0.6 ? 'integration humming' : cci.composite > 0.4 ? 'field settling' : 'foundations gathering' },
      rayProfile: (sig as any).rayProfile ?? null,
    },
  };
}

async function getKnowledgeSnapshot(services: UnifiedProfileServices) {
  const sig = await services.getSignificator();
  const knowledge: any = (sig as any)?.knowledge;
  if (!knowledge) return { ok: true as const, payload: { empty: true, feltSense: 'no study yet — the curriculum awaits' } };
  const conceptStates: Map<string, any> = knowledge.conceptStates ?? new Map();
  const forgettingCurves: Map<string, any> = knowledge.forgettingCurves ?? new Map();
  const reviewCandidates = computeReviewCandidates(conceptStates as any, forgettingCurves as any, services.now());
  const registry = (() => { try { return getCurriculumRegistry(); } catch { return null; } })();
  const totalHolons = registry ? (registry as any).size ?? 0 : 0;
  return {
    ok: true as const,
    payload: {
      conceptCount: conceptStates.size,
      totalHolons,
      reviewCandidates: reviewCandidates.slice(0, 5).map((c: any) => ({ conceptId: c.conceptId, urgency: Math.round(c.urgency * 100) / 100 })),
      feltSense: reviewCandidates.length > 3 ? 'several threads asking to be revisited' : reviewCandidates.length > 0 ? 'a quiet thread wants attention' : 'knowledge resting easy',
    },
  };
}

async function getUnifiedProfile(services: UnifiedProfileServices) {
  services.cognitiveIndex.applyDecay(services.now());
  const [dev, know] = await Promise.all([getDevelopmentalSnapshot(services), getKnowledgeSnapshot(services)]);
  const cogSnap = services.cognitiveIndex.snapshot(services.now());
  const stalest = [...cogSnap].sort((a, b) => b.lastPlayedDaysAgo - a.lastPlayedDaysAgo)[0];
  const cogFelt: Record<string, string> = {};
  for (const s of cogSnap) cogFelt[s.line] = services.cognitiveIndex.feltSenseFor(s.line as Line);
  return {
    ok: true as const,
    payload: {
      developmental: dev.payload,
      knowledge: know.payload,
      cognitive: { lines: cogSnap.map(s => ({ line: s.line, trend: s.trend, lastPlayedDaysAgo: s.lastPlayedDaysAgo, feltSense: cogFelt[s.line] })), stalestLine: stalest?.line ?? null },
      continuity: 'measured, mapped, stored, and developed — next catalyst should follow the trajectory',
    },
  };
}

async function recommendTrajectory(args: Record<string, unknown>, services: UnifiedProfileServices) {
  const minutes = Math.min(45, Math.max(5, Number(args.minutes ?? 12)));
  const focusLine = typeof args.focusLine === 'string' ? (args.focusLine as Line) : undefined;
  const cogPlan = planWorkout(services.cognitiveIndex, { minutes: Math.max(5, Math.min(12, Math.round(minutes * 0.4))), focusLine });
  const sig = await services.getSignificator();
  // Note: developmental needs surfaced via get_developmental_snapshot; trajectory adds growth edge step unconditionally.
  // Future: bridgeDevelopmentalToCurriculum will wire theta/drive needs to curriculum when KnowledgeState has retention data.
  const trajectory: { kind: 'developmental' | 'cognitive' | 'educational'; id: string; rationale: string; estimatedMinutes: number }[] = [];
  // Developmental: 1 growth-edge encounter (2 min framing)
  trajectory.push({ kind: 'developmental', id: focusLine ? `growth:${focusLine}` : 'growth:edge', rationale: 'growth edge — where altitude meets horizon', estimatedMinutes: 3 });
  // Cognitive: 1-2 workout items
  for (const item of cogPlan.items.slice(0, 2)) {
    trajectory.push({ kind: 'cognitive', id: item.paradigmId, rationale: item.rationale, estimatedMinutes: item.estimatedMinutes });
  }
  // Educational: 1 review or new material if knowledge exists
  const know = await getKnowledgeSnapshot(services);
  const review = (know.payload.reviewCandidates as any[])?.[0];
  if (review) {
    trajectory.push({ kind: 'educational', id: review.conceptId, rationale: 'retention tugging — revisit before decay', estimatedMinutes: 4 });
  } else if (sig) {
    trajectory.push({ kind: 'educational', id: 'new_material', rationale: 'foundations steady — new material beckons', estimatedMinutes: 4 });
  }
  const total = trajectory.reduce((s, t) => s + t.estimatedMinutes, 0);
  // Trim to minutes budget (keep developmental + at least one cognitive)
  let trimmed = trajectory;
  if (total > minutes) {
    const keep = [trajectory[0]!, ...trajectory.filter(t => t.kind === 'cognitive').slice(0, 1)];
    const remaining = minutes - keep.reduce((s, t) => s + t.estimatedMinutes, 0);
    if (remaining >= 3 && trajectory.find(t => t.kind === 'educational')) {
      keep.push(trajectory.find(t => t.kind === 'educational')!);
    }
    trimmed = keep.slice(0, 4);
  }
  return {
    ok: true as const,
    payload: {
      minutes,
      focusLine: focusLine ?? null,
      steps: trimmed.map(s => ({ kind: s.kind, id: s.id, minutes: s.estimatedMinutes, rationale: s.rationale })),
      totalMinutes: trimmed.reduce((s, t) => s + t.estimatedMinutes, 0),
      feltSense: 'a balanced arc — psyche, mind, and study in one movement',
    },
  };
}
