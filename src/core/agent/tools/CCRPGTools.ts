/**
 * CCRPG Tools — 8 tool definitions for the Persistent Developmental Agent.
 *
 * These tools let the agent interact with CCRPG's game state: query the
 * player's developmental state, get available encounters, select one,
 * present questions to the player, evaluate encounters, check transformation
 * readiness, and fetch fallback content.
 *
 * Each tool is a JSON schema (for the LLM) + a handler function (for the
 * runtime). The PersistentAgent registers all tools and dispatches calls.
 */
import type { Significator } from '../../domain/Significator.js';
import type { WorldState } from '../../engines/CandidateGeneration.js';
import type { ScheduledEncounter } from '../../domain/EncounterSpecNew.js';
import type { Modality, ShadowQuadrant } from '../../domain/enums.js';
import type { Drive } from '../../domain/Drive.js';
// P1-16: Wire ShadowDetector into the agent's player-state query so the agent
// can access behavioral shadow detection (repression, fixation, regression).
import { detectShadows, diagnoseShadows, assessAtmanProject } from '../../usecases/ShadowDetector.js';
import type { Line } from '../../domain/Line.js';
import type { Stage } from '../../domain/Stage.js';
import { stageOrdinal } from '../../domain/Stage.js';
import { scheduleNext } from '../../engines/EncounterScheduler.js';

import { detectThreshold, type TransformationSignal } from '../../engines/TransformationDetector.js';
import { getFallback } from '../../../infra/llm/FallbackProvider.js';
import { DEFAULT_WEIGHTS } from '../../engines/PriorityComputation.js';
import { applyWeightBias, type PriorityWeightBias } from '../../engines/AutoModeStrategy.js';
import { detectBleedThrough } from '../../engines/ThetaDecay.js';
import type { UserMatrixModel } from '../../engines/UserMatrixModel.js';

// ---------------------------------------------------------------------------
// Tool definitions (JSON schemas for the LLM)
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: Record<string, unknown>;
  };
}

export const CCRPG_ASK_PLAYER_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_ask_player',
    description: 'Present a question, scenario, or stimulus to the player. Supports MCQ options + write-in. No exchange budget — call as many times as developmentally appropriate. Always include a narrative scene-setting before the question.',
    parameters: {
      type: 'object',
      properties: {
        narrative: { type: 'string', description: 'Atmospheric narrative setting the scene (2-4 sentences). Must be Veil-compliant: no stage labels, drive names, scores, or clinical language.' },
        question: { type: 'string', description: 'The question or prompt for the player.' },
        header: { type: 'string', description: 'Short label (max 12 chars) shown as the tab title.' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Concise option text (1-5 words).' },
              description: { type: 'string', description: 'Developmental or choice description.' },
            },
            required: ['label', 'description'],
          },
          description: '3-4 MCQ options mapped to drives. Leave empty for write-in only (self-reflection mode).',
        },
        allowWriteIn: { type: 'boolean', default: true, description: 'True to present a text box for write-in.' },
      },
      required: ['narrative', 'question', 'header'],
    },
  },
};

export const CCRPG_GET_PLAYER_STATE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_get_player_state',
    description: 'Query the player\'s current developmental state. Returns Veil-filtered qualitative descriptions (never raw scores). Includes: current resonance (stage aesthetic), drive balance description, polarity mode, shadow patterns (qualitative), transformation phase, rayProfile summary, UserMatrixModel phase.',
    parameters: { type: 'object', properties: {} },
  },
};

export const CCRPG_GET_WORLD_STATE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_get_world_state',
    description: 'Query the world: active holons (NPCs), NPC relationships (qualitative), PESTLE tensions (qualitative), active macro-events, narrative beats. Returns Veil-filtered descriptions.',
    parameters: { type: 'object', properties: {} },
  },
};

export const CCRPG_GET_ENCOUNTER_POOL_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_get_encounter_pool',
    description: 'Get available encounters for the player\'s current stage + altitude. Returns ranked candidates with: moduleRef, line, stage, modality, holonSource, executionMode, priority score. The agent can override the ranking.',
    parameters: {
      type: 'object',
      properties: {
        count: { type: 'number', default: 5, description: 'Number of candidates to return.' },
      },
    },
  },
};

export const CCRPG_SELECT_ENCOUNTER_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_select_encounter',
    description: 'Commit to an encounter from the pool. Preserves all scheduler-provided fields by default. The agent can override specific fields to customize the encounter — e.g. executionMode:"shadow" to select shadow-work, shadowTarget to target a specific shadow quadrant, difficulty to scaffold or challenge.',
    parameters: {
      type: 'object',
      properties: {
        moduleRef: { type: 'string', description: 'The moduleRef from the encounter pool (e.g., "Cognitive:Red"). Should match a moduleRef returned by ccrpg_get_encounter_pool.' },
        modality: { type: 'string', description: 'Optional modality override. Defaults to the encounter\'s scheduler-assigned modality.' },
        executionMode: { type: 'string', enum: ['capacity', 'shadow'], description: 'Optional execution mode override. Use "shadow" to select a shadow-work encounter (targets unresolved shadow patterns). Defaults to the encounter\'s scheduler-assigned mode (usually "capacity").' },
        shadowTarget: { type: 'string', enum: ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'], description: 'Optional shadow quadrant to target. Use when executionMode is "shadow" to focus on a specific shadow pattern.' },
        driveTarget: { type: 'string', enum: ['Agency', 'Communion', 'Eros', 'Agape'], description: 'Optional drive to target. The encounter will exercise this drive specifically.' },
        difficulty: { type: 'number', minimum: 0, maximum: 1, description: 'Optional difficulty override (0.0 = gentle, 1.0 = edge). Defaults to the scheduler-assigned difficulty (~0.5).' },
        sessionPosition: { type: 'string', enum: ['warmup', 'peak', 'cooldown'], description: 'Optional session-position override. Defaults to the scheduler-assigned position.' },
      },
      required: ['moduleRef'],
    },
  },
};

export const CCRPG_COMPLETE_ENCOUNTER_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_complete_encounter',
    description: 'Evaluate and complete the current encounter. Triggers consequence application (drive updates, shadow surfacing, polarity recording, rayProfile update, theta refresh). The agent MUST call this before selecting the next encounter.',
    parameters: {
      type: 'object',
      properties: {
        passed: { type: 'boolean', description: 'Whether the player successfully demonstrated or integrated the capacity.' },
        driveScores: {
          type: 'object',
          description: 'Per-drive health scores (0.0 to 1.0). 0.0 = severe pathology, 0.5 = baseline, 1.0 = exceptional integration.',
          properties: {
            agency: { type: 'number' },
            communion: { type: 'number' },
            eros: { type: 'number' },
            agape: { type: 'number' },
          },
          required: ['agency', 'communion', 'eros', 'agape'],
        },
        driveSignals: {
          type: 'object',
          description: 'Per-drive pathology signal.',
          properties: {
            agency: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            communion: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            eros: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            agape: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
          },
        },
        shadowSignal: {
          type: 'object',
          description: 'Optional shadow signal surfaced during this encounter.',
          properties: {
            quadrant: { type: 'string', enum: ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'] },
            intensity: { type: 'number', description: 'Intensity score (0.0 to 1.0).' },
          },
        },
        polarityDirection: { type: 'string', enum: ['sto', 'sts', 'neutral'], description: 'The polarity direction indicated by the player\'s choices.' },
        narrativeSummary: { type: 'string', description: 'Immersive, third-person narrative summary (Veil-compliant — no technical terms). This is the player-facing story of what happened.' },
        // P1-19: Restored psychometric depth + separate feedback field.
        feedback: { type: 'string', description: 'Optional developmental feedback explaining what the player\'s responses indicate about their drive-health. INTERNAL (not player-facing) — used for telemetry + cross-encounter synthesis. Separate from narrativeSummary.' },
        scores: {
          type: 'object',
          description: 'Optional 10-dimension psychometric scores (0.0-1.0 each). Restores the depth the old orchestrator had. Provide when assessable.',
          properties: {
            accuracy: { type: 'number' },
            responseTime: { type: 'number' },
            consistency: { type: 'number' },
            depth: { type: 'number' },
            selfCorrection: { type: 'number' },
            complexityHandled: { type: 'number' },
            transfer: { type: 'number' },
            metacognition: { type: 'number' },
            coherence: { type: 'number' },
            integration: { type: 'number' },
          },
        },
        shadowResolvedId: { type: 'string', description: 'Optional ID of a shadow resolved during this encounter. Obtain from ccrpg_get_player_state activeShadows.' },
      },
      required: ['passed', 'driveScores', 'driveSignals', 'narrativeSummary'],
    },
  },
};

export const CCRPG_CHECK_TRANSFORMATION_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_check_transformation',
    description: 'Check if the player is at a transformation threshold. Returns: readiness score, convergence (lines at edge), saturation, shadow clearance, ray readiness, target stage. Use this to decide whether to push toward transformation or consolidate.',
    parameters: { type: 'object', properties: {} },
  },
};

export const CCRPG_GET_CONTENT_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_get_content',
    description: 'Fetch fallback content for a specific (modality, line, stage). Returns altitude-reframed prompt/scenario/framing. Use when the LLM is unavailable or when you want deterministic content.',
    parameters: {
      type: 'object',
      properties: {
        modality: { type: 'string', description: 'The modality (Deterministic, LanguageReflective, ScenarioChoice, etc.)' },
      },
    },
  },
};

// ── Profile r/w tools (Profiling Infrastructure R&D) ─────────────────
// Inspired by Hermes-Agent's memory_tool.py: the agent can read and write
// profile files during a session. Files are written immediately (durable)
// but the system prompt snapshot is frozen (refreshes next session).

export const CCRPG_READ_PROFILE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_read_profile_file',
    description: 'Read a file from the active user\'s profile directory. Use this to access the user\'s narrative memory (past insights, patterns, active work), goals, shadow ledger, session history, or encounter log. The profile contains long-term context about this user that persists across sessions.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'The filename to read. Valid: narrative-memory.md, goals.yaml, shadow-ledger.yaml, session-history.yaml, encounter-log.md, identity.yaml, preferences.yaml, developmental-state.yaml',
        },
      },
      required: ['filename'],
    },
  },
};

export const CCRPG_WRITE_PROFILE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'ccrpg_write_profile_file',
    description: 'Write or append to a file in the active user\'s profile directory. Use this to record insights that landed during this session (append to narrative-memory.md), update inferred goals (overwrite goals.yaml), or add notes to the encounter log. Changes are durable immediately but do not change the current system prompt (frozen snapshot pattern).',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'The filename to write. Valid: narrative-memory.md, goals.yaml, encounter-log.md',
        },
        content: {
          type: 'string',
          description: 'The content to write.',
        },
        mode: {
          type: 'string',
          enum: ['append', 'overwrite'],
          description: 'Write mode: append (add to end) or overwrite (replace entire file). Default: append.',
        },
      },
      required: ['filename', 'content'],
    },
  },
};

export const ALL_CCRPG_TOOLS: readonly ToolDefinition[] = [
  CCRPG_ASK_PLAYER_TOOL,
  CCRPG_GET_PLAYER_STATE_TOOL,
  CCRPG_GET_WORLD_STATE_TOOL,
  CCRPG_GET_ENCOUNTER_POOL_TOOL,
  CCRPG_SELECT_ENCOUNTER_TOOL,
  CCRPG_COMPLETE_ENCOUNTER_TOOL,
  CCRPG_CHECK_TRANSFORMATION_TOOL,
  CCRPG_GET_CONTENT_TOOL,
  CCRPG_READ_PROFILE_TOOL,
  CCRPG_WRITE_PROFILE_TOOL,
];

// ---------------------------------------------------------------------------
// Tool handlers (runtime execution)
// ---------------------------------------------------------------------------

export interface ToolContext {
  readonly sig: Significator;
  readonly world: WorldState;
  readonly sessionState: {
    readonly encountersSoFar: number;
    readonly targetSessionLength: number;
    readonly recentLines: readonly string[];
    readonly userMatrixModel?: UserMatrixModel;
    /**
     * L5: Optional session-strategy weight bias. When provided, ccrpg_get_encounter_pool
     * applies this to DEFAULT_WEIGHTS via applyWeightBias() so the agent sees the same
     * biased ranking the scheduler uses. When absent, DEFAULT_WEIGHTS is used (legacy behaviour).
     */
    readonly weightBias?: PriorityWeightBias;
  };
  readonly onAskPlayer: (params: {
    narrative: string;
    question: string;
    header: string;
    options?: readonly { label: string; description: string }[];
    allowWriteIn?: boolean;
  }) => Promise<{ selectedLabel?: string; writeInValue?: string }>;
  readonly moduleTaskTypesProvider?: (moduleRef: string) => Set<string> | undefined;
  readonly selectedEncounter: ScheduledEncounter | null;
  readonly onEncounterSelected: (encounter: ScheduledEncounter) => void;
  readonly onEncounterComplete: (result: {
    passed: boolean;
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    shadowSignal?: { quadrant: string; intensity: number };
    polarityDirection: string;
    narrativeSummary: string;
    /** P1-19: Optional developmental feedback (internal, not player-facing). */
    feedback?: string;
    /** P1-19: Optional 10-dim psychometric scores. */
    scores?: Record<string, number>;
    /** P1-19: Optional ID of a shadow resolved during this encounter. */
    shadowResolvedId?: string;
  }) => void;
  /**
   * P0-8: Cached encounter pool from the last ccrpg_get_encounter_pool call.
   * ccrpg_select_encounter looks up encounters here by moduleRef to preserve
   * all scheduler-provided fields (shadowTarget, driveTarget, difficulty,
   * sessionPosition, priority, executionMode). Without this cache, select
   * synthesized a new encounter with hardcoded defaults — losing the scheduler's
   * shadow-targeting + difficulty + session-position, and forcing executionMode
   * to 'capacity' (the agent could NOT select shadow-mode encounters).
   *
   * The PersistentAgent populates this field when it calls ccrpg_get_encounter_pool.
   */
  readonly encounterPool?: readonly ScheduledEncounter[];
  /**
   * P0-8: Callback invoked when ccrpg_get_encounter_pool computes a new pool.
   * The PersistentAgent uses this to cache the pool so ccrpg_select_encounter
   * can look up encounters by moduleRef with all scheduler-provided fields intact.
   */
  readonly onEncounterPoolComputed?: (pool: readonly ScheduledEncounter[]) => void;
}

// Stage aesthetic mapping for Veil-compliant state descriptions
const STAGE_AESTHETICS: Record<string, string> = {
  Infrared: 'cave-dark, primal',
  Magenta: 'spirit-saturated, symbolic',
  Red: 'fortress-sharp, weapon-walls',
  Amber: 'cathedral-ordered, gold-stone',
  Orange: 'mechanism-precise, steel-glass',
  Green: 'garden-lush, earth-toned',
  Turquoise: 'crystalline, translucent',
  White: 'luminous silence, spacious',
};

/** Execute a CCRPG tool call and return the result as a JSON string. */
export async function executeCCRPGTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  switch (toolName) {
    case 'ccrpg_ask_player': {
      const result = await ctx.onAskPlayer({
        narrative: args.narrative as string,
        question: args.question as string,
        header: args.header as string,
        options: args.options as { label: string; description: string }[] | undefined,
        allowWriteIn: args.allowWriteIn as boolean | undefined,
      });
      return JSON.stringify({
        selectedLabel: result.selectedLabel ?? null,
        writeInValue: result.writeInValue ?? null,
      });
    }

    case 'ccrpg_get_player_state': {
      const sig = ctx.sig;
      const aesthetic = STAGE_AESTHETICS[sig.currentStage] ?? 'shifting, becoming';
      const driveWeights = Object.values(sig.drives.weights);
      const maxDrive = Math.max(...driveWeights);
      const minDrive = Math.min(...driveWeights);
      const spread = maxDrive - minDrive;
      const driveDescriptor = spread < 0.1
        ? 'Your tendencies move in balance.'
        : spread < 0.25
          ? 'One tendency pulls stronger than the others.'
          : 'A dominant pattern shapes how you meet the world.';
      const polarityMode = sig.polarity.master.mode;
      const shadowCount = sig.shadows.entries.filter(e => e.resolvedAt === null).length;
      const shadowDescriptor = shadowCount === 0
        ? 'No active undercurrents.'
        : shadowCount <= 2
          ? 'A few undercurrents stir beneath the surface.'
          : 'Multiple undercurrents press for attention.';
      const transformationPhase = sig.transformationPhase ?? 'idle';
      const rayValues = Object.values(sig.rayProfile);
      const dominantRay = Math.max(...rayValues);
      const rayDescriptor = dominantRay > 0.5
        ? 'An energy-center is strongly activated.'
        : 'Energy-centers are dormant or lightly engaged.';
      return JSON.stringify({
        resonance: `The world feels ${aesthetic}.`,
        driveBalance: driveDescriptor,
        polarityMode: polarityMode === 'Exploring' ? 'exploring' : polarityMode === 'Crystallizing' ? 'crystallizing' : 'crystallized',
        shadowPatterns: shadowDescriptor,
        transformationPhase: transformationPhase === 'idle' ? 'stable' : transformationPhase,
        rayProfile: rayDescriptor,
        userMatrixPhase: ctx.sessionState.userMatrixModel?.profilePhase ?? 'unmapped',
        totalEncounters: sig.totalEncounters,
        totalSessions: sig.totalSessions,
        // P1-18 + P2-High: Deep per-line + per-drive + per-shadow detail.
        // P2-High fix: raw numeric fields (driveWeights, driveFixationRisk,
        // rayProfileValues, perLineAltitudes) are re-veiled as qualitative
        // descriptors to prevent Veil leaks. The agent gets the STRUCTURAL
        // information (which line is highest/lowest, which drive dominates)
        // without the raw numbers that could leak into player-facing narratives.
        perLineAltitudes: Object.fromEntries(
          Object.entries(sig.altitudes).map(([line, stage]) => [
            line,
            stageOrdinal(stage) <= stageOrdinal(sig.currentStage) ? 'at-or-below' : 'above',
          ]),
        ),
        driveWeights: Object.fromEntries(
          Object.entries(sig.drives.weights).map(([drive, weight]) => {
            const allWeights = Object.values(sig.drives.weights);
            const max = Math.max(...allWeights);
            const min = Math.min(...allWeights);
            const range = max - min;
            if (range < 0.05) return [drive, 'balanced'];
            if (weight === max) return [drive, 'dominant'];
            if (weight === min) return [drive, 'recessive'];
            return [drive, 'moderate'];
          }),
        ),
        driveFixationRisk: Object.fromEntries(
          Object.entries(sig.drives.fixationRisk).map(([drive, risk]) => {
            if (risk < 0.2) return [drive, 'low'];
            if (risk < 0.5) return [drive, 'moderate'];
            return [drive, 'high'];
          }),
        ),
        activeShadows: sig.shadows.entries
          .filter(e => e.resolvedAt === null)
          .map(e => ({
            id: e.id,
            quadrant: e.quadrant,
            line: e.line,
            stage: e.stage,
            drive: e.drive,
            severity: e.severity,
            recurrenceCount: e.recurrenceCount,
            compoundPartner: e.compoundPartner,
          })),
        polarityDetail: {
          masterMode: sig.polarity.master.mode,
          masterDirection: sig.polarity.master.dominantDirection,
          crystallizationProgress: sig.polarity.master.crystallizationProgress,
          coherentLineCount: sig.polarity.master.coherentLineCount,
        },
        rayProfileValues: Object.fromEntries(
          Object.entries(sig.rayProfile).map(([ray, val]) => [
            ray,
            val < 0.2 ? 'dormant' : val < 0.5 ? 'lightly-engaged' : val < 0.7 ? 'active' : 'strongly-activated',
          ]),
        ),
        transformationDetail: {
          phase: sig.transformationPhase ?? 'idle',
          targetStage: sig.transformationTargetStage ?? null,
          sessionsInPhase: sig.transformationSessionsInPhase ?? 0,
          knotsResolved: sig.transformationKnotsResolved ?? 0,
          totalKnots: sig.transformationTotalKnots ?? 0,
        },
        // P1-16: Behavioral shadow detection from ShadowDetector. Previously
        // ShadowDetector.detectShadows was dead code (zero runtime callers).
        // Now the agent can see behavioral patterns (repression, fixation,
        // regression, golden-allergy) that the ConsequenceEngine's polarity-
        // trace-based shadow surfacing doesn't detect. This gives the agent
        // a second shadow-detection channel for cross-referencing.
        behavioralShadows: detectShadows(sig).map(s => ({
          type: s.type,
          line: s.line,
          description: s.description,
        })),
        // ACTION-2: Drive-health shadow diagnosis (the spec's canonical formula)
        driveHealthDiagnosis: diagnoseShadows(sig).slice(0, 5).map(d => ({
          line: d.line,
          stage: d.stage,
          dominantPathology: d.dominantPathology,
          severity: d.severity < 0.4 ? 'mild' : d.severity < 0.7 ? 'moderate' : 'severe',
        })),
        // ACTION-4: States of consciousness (foundations/04)
        // Previously sig.states was inert (never read by any engine). Now the
        // agent can see which states are unlocked + their depth, enabling it to
        // reason about the contemplative half of development.
        consciousnessStates: Object.fromEntries(
          Object.entries(sig.states).map(([state, progress]) => [
            state,
            {
              unlocked: progress.unlocked,
              depth: progress.depth < 0.3 ? 'shallow' : progress.depth < 0.7 ? 'developing' : 'deep',
              practiced: progress.minutesPracticed > 0,
            },
          ]),
        ),
        // CRITICAL-2: Atman Project + Jonah Complex assessment
        // Per foundations/13, the Atman Project is THE mechanism that stalls
        // evolution. Without detecting it, CCRPG cannot distinguish genuine
        // developmental arrest from genuine integration.
        atmanProject: (() => {
          const assessment = assessAtmanProject(sig, sig.recentEncounters ?? []);
          return {
            overallPressure: assessment.overallAtmanPressure < 0.3 ? 'low' : assessment.overallAtmanPressure < 0.6 ? 'moderate' : 'high',
            defenses: assessment.defenses.map(d => ({
              defense: d.defense,
              intensity: d.intensity < 0.4 ? 'mild' : d.intensity < 0.7 ? 'moderate' : 'strong',
              description: d.description,
            })),
            jonahComplex: {
              detected: assessment.jonahComplex.detected,
              intensity: assessment.jonahComplex.intensity < 0.4 ? 'mild' : assessment.jonahComplex.intensity < 0.7 ? 'moderate' : 'strong',
              description: assessment.jonahComplex.description,
            },
          };
        })(),
      });
    }

    case 'ccrpg_get_world_state': {
      const npcs = ctx.world.holons.filter(h => h.kind === 'NPC');
      const activeMacroEvents = ctx.world.activeMacroEvents.length;
      const npcRelationships = ctx.world.npcRelationships.filter(r => r.strength > 0.3);
      const pestleTensions = Object.entries(ctx.world.pestleTension)
        .filter(([, v]) => v > 0.2)
        .map(([k, v]) => `${k}: ${v > 0.7 ? 'critical' : v > 0.5 ? 'high' : 'elevated'}`);
      return JSON.stringify({
        holonCount: ctx.world.holons.length,
        npcCount: npcs.length,
        activeRelationships: npcRelationships.length,
        activeMacroEvents,
        pestleTensions: pestleTensions.length > 0 ? pestleTensions : 'all stable',
        narrativeBeats: ctx.world.narrativeBeats.filter(b => !b.completed).length,
        // P2-Medium: Deepened world state — NPC identities + PESTLE values + beat IDs.
        // Previously only returned counts; now the agent can see WHO the NPCs are,
        // WHAT the PESTLE values are, and WHICH beats are active.
        npcs: npcs.slice(0, 10).map(h => ({
          id: h.id,
          name: h.name,
          kind: h.kind,
          line: h.line,
          stage: h.stage,
          narrativeRole: h.narrativeRole,
        })),
        // WIRE-8: Re-veil PESTLE values as qualitative descriptors (was raw numerics).
        // Consistent with the re-veiling pattern applied to player-state in P2-High.
        pestleValues: Object.fromEntries(
          Object.entries(ctx.world.pestleTension).map(([dim, val]) => [
            dim,
            val < 0.2 ? 'stable' : val < 0.5 ? 'elevated' : val < 0.75 ? 'high' : 'critical',
          ]),
        ),
        npcRelationshipDetail: npcRelationships.slice(0, 5).map(r => ({
          holonId: r.holonId,
          strength: r.strength < 0.4 ? 'emerging' : r.strength < 0.7 ? 'established' : 'deep',
          encounters: r.encounters,
        })),
        narrativeBeatIds: ctx.world.narrativeBeats.filter(b => !b.completed).map(b => ({
          id: b.id,
          stage: b.stage,
        })),
      });
    }

    case 'ccrpg_get_encounter_pool': {
      const count = (args.count as number) ?? 5;
      const now = Date.now();
      const bleedThrough = detectBleedThrough(ctx.sig.theta.lastEncounter, now);
      const session = {
        encountersSoFar: ctx.sessionState.encountersSoFar,
        sessionDurationMs: 0,
        targetSessionLength: ctx.sessionState.targetSessionLength,
        recentLines: ctx.sessionState.recentLines as readonly Line[],
      };
      // L5: Apply the session-strategy weight bias when available, so the agent
      // sees the same biased ranking the scheduler uses (e.g. thetaUrgency boost
      // during consolidation theme). Falls back to DEFAULT_WEIGHTS otherwise.
      const weights = ctx.sessionState.weightBias
        ? applyWeightBias(DEFAULT_WEIGHTS, ctx.sessionState.weightBias)
        : DEFAULT_WEIGHTS;
      const scheduled = scheduleNext(
        ctx.sig,
        ctx.world,
        session,
        now,
        count,
        weights,
        bleedThrough,
        ctx.moduleTaskTypesProvider,
        ctx.sessionState.userMatrixModel,
      );
      // P0-8: Cache the pool so ccrpg_select_encounter can look up encounters
      // by moduleRef with all scheduler-provided fields intact.
      ctx.onEncounterPoolComputed?.(scheduled);
      return JSON.stringify(scheduled.map(e => ({
        moduleRef: e.moduleRef,
        line: e.targetLines[0],
        stage: e.stage,
        modality: e.modality,
        holonSource: e.holonSource,
        executionMode: e.executionMode,
        priority: e.priority,
        sessionPosition: e.sessionPosition,
      })));
    }

    case 'ccrpg_select_encounter': {
      const moduleRef = args.moduleRef as string;
      const requestedModality = args.modality as Modality | undefined;
      const requestedExecutionMode = (args.executionMode as 'capacity' | 'shadow' | undefined);
      // P1-9: Allow the agent to override the full ScheduledEncounter shape.
      // Previously only modality + executionMode were overridable. Now the agent
      // can target a specific shadow quadrant, drive, difficulty, and session
      // position — giving it full control over encounter customization while
      // still defaulting to the scheduler's ranked values.
      const requestedShadowTarget = args.shadowTarget as ShadowQuadrant | undefined;
      const requestedDriveTarget = args.driveTarget as Drive | undefined;
      const requestedDifficulty = typeof args.difficulty === 'number' ? args.difficulty : undefined;
      const requestedSessionPosition = args.sessionPosition as 'warmup' | 'peak' | 'cooldown' | undefined;

      // P0-8: Look up the encounter from the cached pool first. This preserves
      // all scheduler-provided fields (shadowTarget, driveTarget, difficulty,
      // sessionPosition, priority, executionMode, holonSource). Previously we
      // synthesized a new encounter with hardcoded defaults, losing the scheduler's
      // ranking metadata and forcing executionMode to 'capacity'.
      const pooledEncounter = ctx.encounterPool?.find(e => e.moduleRef === moduleRef);

      let encounter: ScheduledEncounter;
      if (pooledEncounter) {
        // Use the pooled encounter, applying any agent overrides (P0-8 + P1-9).
        // Agent overrides take precedence; everything else comes from the pool.
        encounter = {
          ...pooledEncounter,
          ...(requestedModality ? { modality: requestedModality } : {}),
          ...(requestedExecutionMode ? { executionMode: requestedExecutionMode } : {}),
          ...(requestedShadowTarget ? { shadowTarget: requestedShadowTarget } : {}),
          ...(requestedDriveTarget ? { driveTarget: requestedDriveTarget } : {}),
          ...(requestedDifficulty !== undefined ? { difficulty: requestedDifficulty } : {}),
          ...(requestedSessionPosition ? { sessionPosition: requestedSessionPosition } : {}),
        };
      } else {
        // Fallback: synthesize a minimal encounter if not in the pool.
        // This preserves backward compat for agents that call select without
        // first calling get_encounter_pool, but loses scheduler metadata.
        const [line, stage] = moduleRef.split(':') as [Line, Stage];
        const modality = requestedModality ?? 'Deterministic';
        const holon = ctx.world.holons.find(h => h.line === line && h.stage === stage);
        encounter = {
          id: `${moduleRef}:${Date.now()}`,
          moduleRef,
          modality,
          targetLines: [line],
          stage,
          holonSource: holon?.id ?? moduleRef,
          shadowTarget: requestedShadowTarget ?? null,
          polarityMode: ctx.sig.polarity.master.mode === 'Crystallized' ? 'Crystallized' as const
            : ctx.sig.polarity.master.mode === 'Crystallizing' ? 'Crystallizing' as const
            : 'Exploring' as const,
          difficulty: requestedDifficulty ?? 0.5,
          sessionPosition: requestedSessionPosition ?? 'peak',
          priority: 0.5,
          driveTarget: requestedDriveTarget ?? null,
          executionMode: requestedExecutionMode ?? 'capacity',
        };
      }
      ctx.onEncounterSelected(encounter);
      return JSON.stringify({
        status: 'selected',
        moduleRef: encounter.moduleRef,
        modality: encounter.modality,
        executionMode: encounter.executionMode,
        shadowTarget: encounter.shadowTarget,
        driveTarget: encounter.driveTarget,
        difficulty: encounter.difficulty,
        holonSource: encounter.holonSource,
        sessionPosition: encounter.sessionPosition,
        priority: encounter.priority,
        source: pooledEncounter ? 'pool' : 'synthesized',
      });
    }

    case 'ccrpg_complete_encounter': {
      const result = {
        passed: args.passed as boolean,
        driveScores: args.driveScores as { agency: number; communion: number; eros: number; agape: number },
        driveSignals: args.driveSignals as { agency: string; communion: string; eros: string; agape: string },
        shadowSignal: args.shadowSignal as { quadrant: string; intensity: number } | undefined,
        polarityDirection: (args.polarityDirection as string) ?? 'neutral',
        narrativeSummary: args.narrativeSummary as string,
        // P1-19: Pass through the restored psychometric depth fields.
        feedback: args.feedback as string | undefined,
        scores: args.scores as Record<string, number> | undefined,
        shadowResolvedId: args.shadowResolvedId as string | undefined,
      };

      // WIRE-6: Validate shadowResolvedId using isShadowResolved before accepting.
      // Previously the agent could self-certify shadow resolution with no guardrail.
      // Now we check that the shadow actually meets the spec's resolution criterion
      // (severity < 0.2 AND ≥2 healthy encounters on that line since surfacing).
      let shadowResolutionValid = true;
      let shadowResolutionReason = '';
      if (result.shadowResolvedId) {
        try {
          const { isShadowResolved } = await import('../../usecases/ShadowDetector.js');
          const shadow = ctx.sig.shadows.entries.find(e => e.id === result.shadowResolvedId);
          if (shadow) {
            const recentEncounters = ctx.sig.recentEncounters ?? [];
            shadowResolutionValid = isShadowResolved(shadow, recentEncounters, shadow.severity);
            if (!shadowResolutionValid) {
              shadowResolutionReason = 'Shadow does not meet resolution criteria (severity ≥ 0.2 or < 2 healthy encounters since surfacing). Resolution claim ignored.';
              // Don't pass through an invalid resolution — the bridge would apply it
              // to ConsequenceEngine which would mark the shadow resolved when it isn't.
              result.shadowResolvedId = undefined;
            }
          } else {
            shadowResolutionValid = false;
            shadowResolutionReason = `Shadow ID ${result.shadowResolvedId} not found in active shadows.`;
            result.shadowResolvedId = undefined;
          }
        } catch {
          // isShadowResolved unavailable — allow the resolution (best-effort)
        }
      }

      ctx.onEncounterComplete(result);
      // P1-10: Return a rich feedback summary so the agent has a feedback loop
      // on what its evaluation will cause. Previously the tool returned only
      // {status:'completed'} — the agent had no idea what consequences its
      // evaluation triggered (shadow surfacing, drive updates, polarity shifts,
      // transformation threshold). Now we return the evaluation summary + the
      // downstream signals the agent can use to plan the next encounter.
      //
      // Note: the actual ConsequenceRecord (processOutcome + applyConsequences)
      // is applied by the PersistentAgentBridge AFTER the agent loop exits,
      // because consequence application requires the selected encounter + the
      // current sig/world, which are managed by the bridge. The feedback here
      // tells the agent WHAT will happen so it can reason about the next step.
      const allDrivesHealthy = Object.values(result.driveSignals).every(
        s => s === 'HealthyBalanced',
      );
      const willSurfaceShadow = result.shadowSignal !== undefined;
      const willAffectPolarity = result.polarityDirection !== 'neutral';
      return JSON.stringify({
        status: 'completed',
        evaluation: {
          passed: result.passed,
          driveScores: result.driveScores,
          driveSignals: result.driveSignals,
          shadowSignal: result.shadowSignal ?? null,
          polarityDirection: result.polarityDirection,
        },
        downstreamEffects: {
          // What the bridge's applyConsequences will do with this evaluation:
          willUpdateDrives: true,             // drive weights + fixationRisk updated
          willRecordPolarityTrace: true,       // polarity trace added to cell vector
          willUpdateTheta: true,               // theta timestamps refreshed
          willSurfaceShadow: willSurfaceShadow, // new shadow entry created if shadowSignal present
          // P2-High: Fixed willResolveShadow heuristic. Previously required
          // executionMode === 'shadow', but ConsequenceEngine resolves shadows
          // implicitly whenever allDrivesHealthy on the encounter's line,
          // REGARDLESS of executionMode, for all shadows at-or-below the
          // encounter's stage (ConsequenceEngine.ts:166-181).
          willResolveShadow: allDrivesHealthy,
            // implicit resolution: all drives healthy in a shadow encounter resolves shadows at/below stage
          willAffectPolarity: willAffectPolarity, // polarity direction recorded in trace
          willUpdateRayProfile: true,          // rayProfile activated for encounter's stage
          willFireTDGHooks: true,              // onEncounterComplete + onShadowSurfaced (if shadow)
        },
        selectedEncounter: ctx.selectedEncounter ? {
          moduleRef: ctx.selectedEncounter.moduleRef,
          modality: ctx.selectedEncounter.modality,
          executionMode: ctx.selectedEncounter.executionMode,
          shadowTarget: ctx.selectedEncounter.shadowTarget,
          stage: ctx.selectedEncounter.stage,
          line: ctx.selectedEncounter.targetLines[0],
        } : null,
        // WIRE-6: Shadow resolution validation result
        shadowResolution: shadowResolutionValid ? 'accepted' : 'rejected',
        shadowResolutionReason: shadowResolutionReason || undefined,
      });
    }

    case 'ccrpg_check_transformation': {
      const signal: TransformationSignal | null = detectThreshold(ctx.sig);
      return JSON.stringify({
        atThreshold: signal !== null,
        readiness: signal?.readiness ?? 0,
        targetStage: signal?.targetStage ?? null,
        convergentLines: signal?.convergentLines ?? [],
        blockers: signal?.blockers ?? [],
        transformationPhase: ctx.sig.transformationPhase ?? 'idle',
      });
    }

    case 'ccrpg_get_content': {
      const modality = args.modality as Modality;
      const line = args.line as Line;
      const stage = args.stage as Stage;
      const content = getFallback(modality, line, stage, ctx.sig.currentStage);

      // WIRE-4: Wire generateShadowContent into the PersistentAgent path.
      // Previously generateShadowContent (with 32 archetype names) was only called
      // from the legacy AgenticOrchestrator — the PersistentAgent path never
      // reached it. Now, when the selected encounter is in shadow mode, we
      // also return shadow-specific content (archetype name, prompts, evaluation
      // criteria, integration/avoidance feedback).
      let shadowContent: { archetypeName: string; narrativeIntro: string; prompts: string[]; integrationFeedback: string; avoidanceFeedback: string } | null = null;
      if (ctx.selectedEncounter?.executionMode === 'shadow' && ctx.selectedEncounter.shadowTarget) {
        try {
          const { generateShadowContent, getShadowArchetypeName } = await import('../../engines/ShadowContentGenerator.js');
          const sc = generateShadowContent(line, stage, ctx.selectedEncounter.shadowTarget);
          shadowContent = {
            archetypeName: getShadowArchetypeName(line, ctx.selectedEncounter.shadowTarget),
            narrativeIntro: sc.narrativeIntro,
            prompts: [...sc.prompts],
            integrationFeedback: sc.integrationFeedback,
            avoidanceFeedback: sc.avoidanceFeedback,
          };
        } catch {
          // ShadowContentGenerator unavailable — skip
        }
      }

      return JSON.stringify({
        prompt: content.prompt ?? null,
        scenario: content.scenario ?? null,
        framing: content.framing ?? null,
        options: content.options ?? null,
        followUps: content.followUps ?? null,
        // WIRE-4: Shadow content for shadow-mode encounters (PersistentAgent path)
        shadowContent,
      });
    }

    case 'ccrpg_read_profile_file': {
      const filename = args.filename as string;
      try {
        const { agentReadProfileFile } = await import('../../../infra/profiles/ProfileManager.js');
        const content = agentReadProfileFile(filename);
        if (content === null) {
          return JSON.stringify({ error: `Cannot read "${filename}". File not found or not in whitelist. Valid: narrative-memory.md, goals.yaml, shadow-ledger.yaml, session-history.yaml, encounter-log.md, identity.yaml, preferences.yaml, developmental-state.yaml` });
        }
        return JSON.stringify({ filename, content, length: content.length });
      } catch (e: any) {
        return JSON.stringify({ error: `Failed to read profile file: ${e.message}` });
      }
    }

    case 'ccrpg_write_profile_file': {
      const filename = args.filename as string;
      const content = args.content as string;
      const mode = (args.mode as 'append' | 'overwrite') || 'append';
      try {
        const { agentWriteProfileFile } = await import('../../../infra/profiles/ProfileManager.js');
        const success = agentWriteProfileFile(filename, content, mode);
        if (!success) {
          return JSON.stringify({ error: `Cannot write "${filename}". File not in writable whitelist. Valid: narrative-memory.md, goals.yaml, encounter-log.md` });
        }
        return JSON.stringify({ success: true, filename, mode, bytesWritten: content.length });
      } catch (e: any) {
        return JSON.stringify({ error: `Failed to write profile file: ${e.message}` });
      }
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
