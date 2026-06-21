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
import { getMacroEncounterModifications } from './MacroCatalystEngine.js';

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

/** Ponytail: task-type sets per modality — modalities whose preferred chain has no match in the module won't be assigned. */
const MODALITY_TASK_TYPES: Record<Modality, readonly string[]> = {
  Deterministic: ['n_back', 'stroop', 'go_no_go', 'reaction_time'],
  Strategic: ['pattern_prediction'],
  Embodied: ['hold', 'reaction_time'],
  ScenarioChoice: ['dilemma', 'scenario'],
  LanguageReflective: ['self_report', 'llm_dialogue'],
  SocialCooperative: ['cooperation', 'imitation'],
  ImmersiveRPG: ['dilemma', 'scenario', 'emotion_identification', 'self_report', 'cooperation'],
};

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

  // Compute macro-event modifications from active events
  const macroModifications = computeMacroModifications(world);

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

      // Filter 6: Macro-event blocking — if candidate matches blocked tags, skip
      const candidateTags = [`macro:${modality}`, `event:${holon.id}`];
      const isBlocked = candidateTags.some(tag => macroModifications.blockedTags.has(tag));
      if (isBlocked) continue;

      // Filter 7: Narrative beat gating — if encounter is gated by incomplete beat, skip
      const gatedByBeat = world.narrativeBeats.some(
        beat => !beat.completed && beat.gatedEncounterIds.includes(moduleRef),
      );
      if (gatedByBeat) continue;

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

function getAllTaskTypes(): Set<string> {
  const allTypes = new Set<string>();
  for (const types of Object.values(MODALITY_TASK_TYPES)) {
    for (const t of types) allTypes.add(t);
  }
  return allTypes;
}

function getEligibleModalities(
  holon: Holon,
  blocked: Set<Modality>,
  moduleTaskTypes?: Set<string>,
): Modality[] {
  const primary = holon.modality ?? 'ImmersiveRPG';
  
  // Filter modalities to only those whose preferred chain has ≥1 match in the module
  const taskTypes = moduleTaskTypes ?? getAllTaskTypes();
  const eligible = ALL_MODALITIES.filter(m => {
    if (blocked.has(m)) return false;
    const chain = MODALITY_TASK_TYPES[m];
    return chain.some(t => taskTypes.has(t));
  });
  
  if (eligible.length === 0) return !blocked.has(primary) ? [primary] : ['ImmersiveRPG'];
  
  const selected: Modality[] = [];
  if (eligible.includes(primary)) selected.push(primary);
  
  const alternatives = eligible.filter(m => m !== primary);
  while (selected.length < 3 && alternatives.length > 0) {
    const idx = Math.floor(Math.random() * alternatives.length);
    selected.push(alternatives.splice(idx, 1)[0]);
  }
  
  return selected;
}

function computeMacroModifications(world: WorldState): {
  blockedTags: Set<string>;
  boostedTags: Set<string>;
} {
  const blockedTags = new Set<string>();
  const boostedTags = new Set<string>();

  for (const event of world.activeMacroEvents) {
    const eventState = {
      event,
      phase: 'active' as const,
      sessionsInPhase: 0,
      encountersSinceStart: 0,
      playerChoices: [],
    };
    const mods = getMacroEncounterModifications(eventState);
    for (const tag of mods.blockedEncounterTags) blockedTags.add(tag);
    for (const tag of mods.additionalEncounterTags) boostedTags.add(tag);
  }

  return { blockedTags, boostedTags };
}


