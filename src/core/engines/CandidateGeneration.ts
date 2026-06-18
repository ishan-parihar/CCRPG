/**
 * CandidateGeneration — filters eligible encounters from the world state.
 * Spec: foundations/24 §2
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { Modality } from '../domain/enums.js';
import type { Holon } from '../domain/Holon.js';
import type { Significator } from '../domain/Significator.js';
import type { SessionContext } from './PriorityComputation.js';
import type { PESTLETension, MacroEvent } from './MacroCatalystEngine.js';

export interface EncounterCandidate {
  readonly moduleRef: string;
  readonly line: Line;
  readonly stage: Stage;
  readonly modality: Modality;
  readonly holonId: string;
  readonly cooldownClear: boolean;
  /** Codex entry text unlocked upon completing this encounter. */
  readonly codexEntry?: string;
}

export interface NarrativeBeat {
  readonly id: string;
  readonly stage: Stage;
  readonly prerequisiteBeats: readonly string[];
  readonly completed: boolean;
  readonly gatedEncounterIds: readonly string[];
}

export interface FactionState {
  readonly id: string;
  readonly name: string;
  readonly stage: Stage;
  readonly disposition: number; // -1 to 1 (hostile to allied)
  readonly active: boolean;
}

export interface NPCRelationship {
  readonly holonId: string;
  readonly strength: number; // 0-1
  readonly encounters: number;
  readonly lastEncounterAt: number;
}

export interface WorldState {
  readonly holons: readonly Holon[];
  readonly recentEncounterIds: readonly string[];
  readonly cooldowns: Readonly<Record<string, number>>;
  readonly recentEncounters?: readonly { line: Line; stage: Stage; modality: Modality }[];
  readonly holon_relationships?: Readonly<Record<string, number>>;
  // Narrative system
  readonly narrativeBeats: readonly NarrativeBeat[];
  readonly activeBeatId: string | null;
  readonly completedBeatIds: readonly string[];
  // Faction system
  readonly factions: readonly FactionState[];
  // NPC relationships
  readonly npcRelationships: readonly NPCRelationship[];
  // PESTLE tension (from MacroCatalystEngine)
  readonly pestleTension: PESTLETension;
  // Active macro events
  readonly activeMacroEvents: readonly MacroEvent[];
}

export function createInitialWorldState(holons: readonly Holon[]): WorldState {
  return {
    holons,
    recentEncounterIds: [],
    cooldowns: {},
    recentEncounters: [],
    narrativeBeats: [],
    activeBeatId: null,
    completedBeatIds: [],
    factions: [],
    npcRelationships: [],
    pestleTension: { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
    activeMacroEvents: [],
  };
}

/** All 7 modalities available in the system. */
const ALL_MODALITIES: Modality[] = [
  'Deterministic', 'Strategic', 'Embodied',
  'ScenarioChoice', 'LanguageReflective', 'SocialCooperative', 'ImmersiveRPG',
];

/** Modalities that require specific session conditions. */
const ENERGY_GATED: Modality[] = ['Embodied'];
const TIME_GATED: Modality[] = ['Strategic'];

/**
 * Generate all eligible encounter candidates given current significator and world state.
 * Applies 5 filters: layer-perception, altitude, cooldown, narrative gate, modality availability.
 */
export function generateCandidates(
  sig: Significator,
  world: WorldState,
  now: number,
  session?: SessionContext,
): EncounterCandidate[] {
  const maxStageOrd = stageOrdinal(sig.currentStage) + 1;
  const candidates: EncounterCandidate[] = [];
  const recent = world.recentEncounters ?? [];

  // Filter 5: Determine blocked modalities based on session context
  const blockedModalities = new Set<Modality>();
  if (session?.inferredEnergy === 'low') {
    ENERGY_GATED.forEach(m => blockedModalities.add(m));
  }
  if (session?.estimatedTimeAvailable !== undefined && session.estimatedTimeAvailable < 900000) {
    TIME_GATED.forEach(m => blockedModalities.add(m));
  }

  for (const holon of world.holons) {
    if (!holon.active) continue;

    // If forceLine is provided, filter candidates to only matching holon.line.
    if (session?.forceLine && holon.line !== session.forceLine) continue;

    // If forceStage is provided, filter candidates to only matching holon.stage.
    if (session?.forceStage && holon.stage !== session.forceStage) continue;

    const bypassChecks = !!(session?.forceLine || session?.forceStage);

    if (!bypassChecks) {
      // Filter 1: Layer-perception (stage <= current + 1)
      if (stageOrdinal(holon.stage) > maxStageOrd) continue;

      // Filter 2: Altitude requirement (stage <= line altitude + 1)
      const lineAltOrd = stageOrdinal(sig.altitudes[holon.line]);
      if (stageOrdinal(holon.stage) > lineAltOrd + 1) continue;
    }

    const moduleRef = `${holon.line}:${holon.stage}`;

    // Generate candidates across eligible modalities (2-3 per holon)
    const eligible = session?.forceModality
      ? [session.forceModality as Modality]
      : getEligibleModalities(holon, blockedModalities);

    const anyForcing = !!(session?.forceLine || session?.forceStage || session?.forceModality);

    for (const modality of eligible) {
      if (!anyForcing) {
        // Filter 3: Cooldown — timestamp-based
        const tupleKey = `${holon.line}:${holon.stage}:${modality}`;
        const cooldownTs = world.cooldowns[tupleKey] ?? world.cooldowns[moduleRef] ?? 0;
        if (now < cooldownTs) continue;

        // Filter 3: Cooldown — recency-based
        const last3 = recent.slice(-3);
        if (last3.some(r => r.line === holon.line && r.stage === holon.stage && r.modality === modality)) continue;

        const last2 = recent.slice(-2);
        if (last2.some(r => r.line === holon.line && r.stage === holon.stage)) continue;

        // Modality rotation constraint: prevent consecutive repeats of the same modality
        if (recent.length >= 2) {
          const last2Modalities = recent.slice(-2);
          if (last2Modalities[0].modality === last2Modalities[1].modality && modality === last2Modalities[0].modality) {
            continue;
          }
        }
      }

      candidates.push({
        moduleRef,
        line: holon.line,
        stage: holon.stage,
        modality,
        holonId: holon.id,
        cooldownClear: true,
      });
    }
  }

  return candidates;
}

/** Get 2-3 eligible modalities for a holon based on its properties. */
function getEligibleModalities(holon: Holon, blocked: Set<Modality>): Modality[] {
  const primary = holon.modality ?? 'ImmersiveRPG';
  const alternatives = ALL_MODALITIES.filter(m => m !== primary && !blocked.has(m));
  const selected: Modality[] = [];
  if (!blocked.has(primary)) selected.push(primary);
  const hash = simpleHash(holon.id);
  if (alternatives.length > 0) selected.push(alternatives[hash % alternatives.length]);
  if (alternatives.length > 1) selected.push(alternatives[(hash + 3) % alternatives.length]);
  return selected;
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
