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
import type { Modality } from '../../domain/enums.js';
import type { Line } from '../../domain/Line.js';
import type { Stage } from '../../domain/Stage.js';
import { scheduleNext } from '../../engines/EncounterScheduler.js';

import { detectThreshold, type TransformationSignal } from '../../engines/TransformationDetector.js';
import { getFallback } from '../../../infra/llm/FallbackProvider.js';
import { DEFAULT_WEIGHTS } from '../../engines/PriorityComputation.js';
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
    description: 'Commit to an encounter from the pool. Initializes the encounter: fetches content, sets up modality, binds holon.',
    parameters: {
      type: 'object',
      properties: {
        moduleRef: { type: 'string', description: 'The moduleRef from the encounter pool (e.g., "Cognitive:Red").' },
        modality: { type: 'string', description: 'The modality to use (optional — defaults to the encounter\'s modality).' },
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
        narrativeSummary: { type: 'string', description: 'Immersive, third-person narrative summary (Veil-compliant — no technical terms).' },
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
        line: { type: 'string', description: 'The developmental line (Cognitive, Emotional, etc.)' },
        stage: { type: 'string', description: 'The stage (Red, Amber, Orange, etc.)' },
      },
      required: ['modality', 'line', 'stage'],
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
  }) => void;
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
      });
    }

    case 'ccrpg_get_world_state': {
      const npcCount = ctx.world.holons.filter(h => h.kind === 'NPC').length;
      const activeMacroEvents = ctx.world.activeMacroEvents.length;
      const npcRelationships = ctx.world.npcRelationships.filter(r => r.strength > 0.3);
      const pestleTensions = Object.entries(ctx.world.pestleTension)
        .filter(([, v]) => v > 0.2)
        .map(([k, v]) => `${k}: ${v > 0.7 ? 'critical' : v > 0.5 ? 'high' : 'elevated'}`);
      return JSON.stringify({
        holonCount: ctx.world.holons.length,
        npcCount,
        activeRelationships: npcRelationships.length,
        activeMacroEvents,
        pestleTensions: pestleTensions.length > 0 ? pestleTensions : 'all stable',
        narrativeBeats: ctx.world.narrativeBeats.filter(b => !b.completed).length,
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
      const scheduled = scheduleNext(
        ctx.sig,
        ctx.world,
        session,
        now,
        count,
        DEFAULT_WEIGHTS,
        bleedThrough,
        ctx.moduleTaskTypesProvider,
        ctx.sessionState.userMatrixModel,
      );
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
      const [line, stage] = moduleRef.split(':') as [Line, Stage];
      const modality = (args.modality as Modality) ?? 'Deterministic';
      const holon = ctx.world.holons.find(h => h.line === line && h.stage === stage);
      const encounter: ScheduledEncounter = {
        id: `${moduleRef}:${Date.now()}`,
        moduleRef,
        modality,
        targetLines: [line],
        stage,
        holonSource: holon?.id ?? moduleRef,
        shadowTarget: null,
        polarityMode: ctx.sig.polarity.master.mode === 'Crystallized' ? 'Crystallized' as const
          : ctx.sig.polarity.master.mode === 'Crystallizing' ? 'Crystallizing' as const
          : 'Exploring' as const,
        difficulty: 0.5,
        sessionPosition: 'peak',
        priority: 0.5,
        driveTarget: null,
        executionMode: 'capacity',
      };
      ctx.onEncounterSelected(encounter);
      return JSON.stringify({ status: 'selected', moduleRef, modality });
    }

    case 'ccrpg_complete_encounter': {
      const result = {
        passed: args.passed as boolean,
        driveScores: args.driveScores as { agency: number; communion: number; eros: number; agape: number },
        driveSignals: args.driveSignals as { agency: string; communion: string; eros: string; agape: string },
        shadowSignal: args.shadowSignal as { quadrant: string; intensity: number } | undefined,
        polarityDirection: (args.polarityDirection as string) ?? 'neutral',
        narrativeSummary: args.narrativeSummary as string,
      };
      ctx.onEncounterComplete(result);
      return JSON.stringify({ status: 'completed' });
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
      return JSON.stringify({
        prompt: content.prompt ?? null,
        scenario: content.scenario ?? null,
        framing: content.framing ?? null,
        options: content.options ?? null,
        followUps: content.followUps ?? null,
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
