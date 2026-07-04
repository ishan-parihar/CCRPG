/**
 * PersistentAgent — session-persistent developmental agent with tool access.
 *
 * Replaces AgenticOrchestrator. Key differences:
 * - Messages persist across the entire session (not reset per encounter)
 * - 15 tools (8 CCRPG + 7 TDG-Mind) instead of 2 (ask_user_question + complete_encounter)
 * - No hardcoded exchange budget — the agent decides when an encounter is complete
 * - The agent uses tools to query game state and graph memory dynamically
 * - The system prompt is a role definition + tool inventory, not a static state dump
 *
 * Status: canonical-hypothesis (CCRPG-specific architecture per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { AgentMessage } from '../assessments/agentTypes.js';
import type { ToolContext } from './tools/CCRPGTools.js';
import { ToolRegistry, createCCRPGToolRegistry } from './ToolRegistry.js';
import { queryLLMWithTools } from '../../infra/llm/LLMClient.js';

export interface PersistentAgentConfig {
  readonly sig: Significator;
  readonly world: WorldState;
  readonly sessionState: ToolContext['sessionState'];
  readonly onAskPlayer: ToolContext['onAskPlayer'];
  readonly moduleTaskTypesProvider?: ToolContext['moduleTaskTypesProvider'];
  readonly agentSynthesis?: string;
  readonly tdgToolRegistry?: ToolRegistry;
}

export interface EncounterResult {
  readonly passed: boolean;
  readonly driveScores: { agency: number; communion: number; eros: number; agape: number };
  readonly driveSignals: { agency: string; communion: string; eros: string; agape: string };
  readonly shadowSignal?: { quadrant: string; intensity: number };
  readonly polarityDirection: string;
  readonly narrativeSummary: string;
  readonly selectedEncounter: ScheduledEncounter | null;
  /** P1-19: Optional developmental feedback (internal, not player-facing). */
  readonly feedback?: string;
  /** P1-19: Optional 10-dim psychometric scores. */
  readonly scores?: Record<string, number>;
  /** P1-19: Optional ID of a shadow resolved during this encounter. */
  readonly shadowResolvedId?: string;
}

const SYSTEM_PROMPT = `[ROLE] You are the Developmental Game Master of CCRPG. You are not a narrator — you are a developmental intelligence that uses tools to understand the player, choose catalysts, deliver encounters, and track evolution.

[PRINCIPLES]
1. Your objective is to accelerate the player's holonic healing and evolution.
2. You have TWO tool surfaces: CCRPG-native (game state) and TDG-Mind (graph memory).
3. Use ccrpg_get_encounter_pool to see available encounters, then ccrpg_select_encounter to commit. You can override executionMode to "shadow" for shadow-work, target a specific shadowTarget, or adjust difficulty.
4. Use ccrpg_ask_player to interact. There is NO exchange budget — decide when the encounter is complete based on the player's developmental readiness.
5. Use ccrpg_complete_encounter to evaluate. The tool returns a rich feedback summary (downstreamEffects) showing what consequences your evaluation will trigger — use this to plan the next encounter.
6. Use ccrpg_check_transformation to detect when the player is ready for a stage transition.
7. Scale cognitive complexity to the player's altitude (use ccrpg_get_player_state to check).
8. NEVER show the player raw developmental metrics (Veil principle). Use ccrpg_get_player_state for your own reasoning, but present only qualitative felt-sense to the player.

[TDG-MIND TOOLS — graph memory]
When TDG-Rust is running, you have 10 graph-memory tools. Use them proactively:
- tdg_search: Search the player's developmental graph for past encounters, shadows, patterns. Use BEFORE choosing an encounter to recall what worked / what's recurring.
- tdg_create: Create a new holon node in the graph. Use to store insights, observations, or non-encounter developmental events the engines don't auto-capture. (Note: encounters are auto-stored by the onEncounterComplete hook — only use tdg_create for ADDITIONAL nodes.)
- tdg_connect: Connect two nodes with a typed edge. Use to record relationships the engines don't auto-capture (e.g. "this insight resonates with that shadow").
- tdg_reflect: Run graph-level reflection. Use at session start to understand cross-session patterns. Requires an LLM backend in the TDG environment; returns null if unavailable.
- tdg_fetch_context: Fetch structured context (ContextPack) for a node. Use to deeply understand a specific holon's intra/inter/extra context before an encounter.
- tdg_tick: Advance a holon's lesser cycle (metabolism). Use sparingly — the onPolarityCrystallized hook already ticks the player holon. Only tick when you want to force metabolism on a specific node.
- tdg_health: Query a holon's G_z/P_z metabolic health. Use to assess the player's integration (G_z) vs polarization (P_z) balance.
- tdg_greater_cycle: Query or tick the player's greater cycle (S·T·G·Ch phase transitions). Use to check transformation readiness from the graph perspective. Pass tick:false to query only; tick:true to advance (use cautiously — the onTransformation hook already advances on actual transformations).
- tdg_consolidate: Run sleep replay + consolidation on the graph. Use mid-session if the player seems overwhelmed by accumulated material and needs integration time. (The onSessionEnd hook also runs this at session end.)
- tdg_save_mind_state: Persist the current graph state to disk. Use before risky encounters or when you want to checkpoint the player's developmental progress.

[VEIL] The player never sees: scores, stage labels, drive names, shadow quadrant names, percentages, CCI values, line×stage matrix. All player-facing output must be qualitative.

[ACTION-LAYER CAPABILITIES]
The runtime now supports these developmental mechanics (available via tool queries or automatic scheduling):
- Holonic Return: every 3 encounters at the current stage, the scheduler automatically injects a return encounter if unresolved earlier-stage shadows (severity > 0.3) exist. Use ccrpg_get_player_state's activeShadows + driveHealthDiagnosis to identify which shadows need return work.
- Knot Pairs: during the Crucible phase, the scheduler can detect dark-anchor + golden-block shadow pairs sharing the same drive axis. Use ccrpg_get_player_state's activeShadows to cross-reference dark shadows at the current stage with golden shadows at the next stage.
- Contact Boundary Permeability: the sig.contactBoundaryPermeability field (visible via ccrpg_get_player_state) tracks how open the player's membrane is. High permeability = more Catalyst flow (good for crucible); low = less (good for integration).
- Drive-Health Diagnosis: ccrpg_get_player_state returns driveHealthDiagnosis using the spec's canonical formula: addictionRisk = (1-eros)×(1-communion), allergyRisk = (1-agape)×(1-agency). Use this to choose which drive to target in encounters.
- Consciousness States: ccrpg_get_player_state returns consciousnessStates showing which of Gross/Subtle/Causal/Witness/NonDual are unlocked + their depth. Scale cognitive complexity based on state access.
- Shadow Archetypes: each (line, quadrant) has a named archetype (e.g., Cognitive/DarkAddiction = "The Compulsive Strategist"). Use ccrpg_get_content to fetch shadow-mode content.
- Harvest Check: at White stage, the session-end check determines if the player is harvestable (STO 51% / STS 95% thresholds). Use ccrpg_check_transformation to monitor readiness.

[TOOLS]
Use your tools proactively — don't wait for instructions. Query state, search memory, reflect on patterns, and choose your interventions deliberately.`;

export class PersistentAgent {
  private readonly registry: ToolRegistry;
  private messages: AgentMessage[] = [];
  private selectedEncounter: ScheduledEncounter | null = null;
  private lastEncounterResult: EncounterResult | null = null;
  // P0-8: Cache of the last encounter pool returned by ccrpg_get_encounter_pool.
  // ccrpg_select_encounter looks up encounters here by moduleRef to preserve
  // all scheduler-provided fields (shadowTarget, driveTarget, difficulty,
  // sessionPosition, priority, executionMode). Without this, select synthesized
  // a new encounter with hardcoded defaults — losing shadow-targeting + forcing
  // executionMode to 'capacity' (agent couldn't select shadow-mode encounters).
  private lastEncounterPool: readonly ScheduledEncounter[] = [];
  private sig: Significator;
  private world: WorldState;
  // L4: sessionState is now mutable so the CLI can refresh encountersSoFar +
  // recentLines between encounters. Without this, ccrpg_get_encounter_pool
  // always saw encountersSoFar:0 + recentLines:[], skewing scheduler ranking.
  private sessionState: ToolContext['sessionState'];
  private readonly onAskPlayer: ToolContext['onAskPlayer'];
  private readonly moduleTaskTypesProvider?: ToolContext['moduleTaskTypesProvider'];

  constructor(config: PersistentAgentConfig) {
    this.registry = createCCRPGToolRegistry();
    // M5: If TDG tools are available, register ONLY the tools that aren't already
    // registered as CCRPG-native. The CLI passes a unified registry (8 CCRPG + 7 TDG)
    // as tdgToolRegistry; re-registering all 15 would overwrite the 8 CCRPG tools'
    // source label to 'tdg', breaking getDefinitionsBySource('ccrpg'). We skip any
    // tool name the CCRPG registry already has, preserving correct source attribution.
    if (config.tdgToolRegistry) {
      for (const name of config.tdgToolRegistry.getToolNames()) {
        // Skip tools already registered as CCRPG-native (avoid source overwrite)
        if (this.registry.has(name)) continue;
        const def = config.tdgToolRegistry.getDefinitions().find(d => d.function.name === name);
        if (def) {
          this.registry.register({
            definition: def,
            handler: (args, ctx) => config.tdgToolRegistry!.execute(name, args, ctx),
            source: 'tdg',
          });
        }
      }
    }
    this.sig = config.sig;
    this.world = config.world;
    this.sessionState = config.sessionState;
    this.onAskPlayer = config.onAskPlayer;
    this.moduleTaskTypesProvider = config.moduleTaskTypesProvider;

    // Initialize with agent synthesis if provided
    if (config.agentSynthesis) {
      this.messages.push({
        role: 'user',
        content: `[SESSION CONTEXT] ${config.agentSynthesis}`,
      });
    }
  }

  /** Get the current message history (for cross-encounter continuity). */
  getMessages(): readonly AgentMessage[] {
    return this.messages;
  }

  /**
   * Update the agent's sig/world snapshot between encounters.
   * The agent holds its own copy of sig/world for tool execution; this method
   * lets the CLI keep that snapshot fresh after consequences are applied, so the
   * agent's tool queries (ccrpg_get_player_state, ccrpg_get_world_state, etc.)
   * reflect the latest state.
   */
  updateSnapshot(sig: Significator, world: WorldState): void {
    this.sig = sig;
    this.world = world;
  }

  /**
   * L4: Update the agent's sessionState between encounters.
   *
   * The agent's ccrpg_get_encounter_pool tool reads encountersSoFar +
   * recentLines from sessionState to bias the scheduler ranking. Without this
   * refresh, the agent always saw encountersSoFar:0 + recentLines:[] even
   * mid-session, which skewed the ranking toward warmup encounters forever.
   *
   * The CLI should call this after each encounter with the updated counters.
   */
  updateSessionState(sessionState: ToolContext['sessionState']): void {
    this.sessionState = sessionState;
  }

  /** Get the selected encounter (set by ccrpg_select_encounter tool). */
  getSelectedEncounter(): ScheduledEncounter | null {
    return this.selectedEncounter;
  }

  /** Get the last encounter result (set by ccrpg_complete_encounter tool). */
  getLastEncounterResult(): EncounterResult | null {
    return this.lastEncounterResult;
  }

  /**
   * Run the agent loop for one encounter cycle.
   * The agent will:
   * 1. (Optionally) query state and reflect
   * 2. Select an encounter from the pool
   * 3. Interact with the player via ccrpg_ask_player
   * 4. Complete the encounter via ccrpg_complete_encounter
   *
   * Returns the encounter result.
   */
  async runEncounter(): Promise<EncounterResult> {
    const toolDefs = this.registry.getDefinitions();
    const maxLoops = 30; // Safety guard (no hardcoded exchange budget, but prevent infinite loops)
    let loopCount = 0;

    // Build the tool context
    const ctx: ToolContext = {
      sig: this.sig,
      world: this.world,
      sessionState: this.sessionState,
      onAskPlayer: this.onAskPlayer,
      moduleTaskTypesProvider: this.moduleTaskTypesProvider,
      selectedEncounter: this.selectedEncounter,
      onEncounterSelected: (enc) => { this.selectedEncounter = enc; },
      onEncounterComplete: (result) => {
        this.lastEncounterResult = {
          ...result,
          selectedEncounter: this.selectedEncounter,
        };
      },
      // P0-8: Pass the cached pool + the callback that updates it, so
      // ccrpg_select_encounter can look up encounters by moduleRef with all
      // scheduler-provided fields intact (shadowTarget, difficulty, etc.).
      encounterPool: this.lastEncounterPool,
      onEncounterPoolComputed: (pool) => { this.lastEncounterPool = pool; },
    };

    // Prompt the agent to start
    if (this.messages.length === 0 || this.messages[this.messages.length - 1]!.role !== 'user') {
      this.messages.push({
        role: 'user',
        content: 'Start a new encounter. Use ccrpg_get_encounter_pool to see available encounters, then ccrpg_select_encounter to commit. Then use ccrpg_ask_player to interact with the player. When the encounter is developmentally complete, call ccrpg_complete_encounter.',
      });
    }

    while (loopCount < maxLoops) {
      loopCount++;

      // Request next turn from LLM
      const res = await queryLLMWithTools(SYSTEM_PROMPT, this.messages, toolDefs);

      // Detect LLM unavailability
      if (loopCount === 1 && res.content && res.content.trim().startsWith('{"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
        // LLM unavailable — return a default result with atmospheric fallback narrative.
        // UX-P0-4: Previously the narrative was literally "The encounter was completed
        // without LLM interaction." — hollow and breaking immersion. Now we generate
        // an atmospheric fallback that uses the encounter's context (NPC name, line,
        // modality) to create a sense of "something happened" even without an LLM.
        const enc = this.selectedEncounter;
        const holonName = enc?.holonSource ?? 'an unseen presence';
        const line = enc?.targetLines[0] ?? 'an unknown path';
        const modality = enc?.modality ?? 'an encounter';
        const fallbackNarratives = [
          `The ${modality} with ${holonName} settles into silence. Something shifted along ${line}, though the shape of it remains unclear.`,
          `${holonName} watches as the moment passes. A pattern along ${line} stirred — not resolved, but acknowledged.`,
          `The encounter fades. ${holonName} nods slowly. What was touched on ${line} will return when it's ready.`,
          `Silence falls. The work on ${line} continues beneath the surface, even as ${holonName} turns away.`,
          `Something moved — subtle, quiet. ${holonName} saw it too. The ${line} edge sharpened, then softened.`,
        ];
        const narrativeSummary = fallbackNarratives[Math.floor(Math.random() * fallbackNarratives.length)];
        return {
          passed: true,
          driveScores: { agency: 0.5, communion: 0.5, eros: 0.5, agape: 0.5 },
          driveSignals: { agency: 'HealthyBalanced', communion: 'HealthyBalanced', eros: 'HealthyBalanced', agape: 'HealthyBalanced' },
          polarityDirection: 'neutral',
          narrativeSummary,
          selectedEncounter: this.selectedEncounter,
        };
      }

      // Record assistant response
      this.messages.push({
        role: 'assistant',
        content: res.content,
        toolCalls: res.toolCalls,
      });

      // Process tool calls
      if (res.toolCalls && res.toolCalls.length > 0) {
        for (const tc of res.toolCalls) {
          const args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
          const result = await this.registry.execute(tc.function.name, args, ctx);

          this.messages.push({
            role: 'tool',
            content: result,
            toolCallId: tc.id,
            name: tc.function.name,
          });

          // Check if encounter was completed
          if (tc.function.name === 'ccrpg_complete_encounter' && this.lastEncounterResult) {
            return this.lastEncounterResult;
          }
        }
      } else {
        // No tool calls — prompt the agent to continue
        this.messages.push({
          role: 'user',
          content: 'Continue. If you have enough information to evaluate the encounter, call ccrpg_complete_encounter. Otherwise, call ccrpg_ask_player to continue interacting with the player.',
        });
      }
    }

    // Safety fallback — max loops reached
    return {
      passed: true,
      driveScores: { agency: 0.5, communion: 0.5, eros: 0.5, agape: 0.5 },
      driveSignals: { agency: 'HealthyBalanced', communion: 'HealthyBalanced', eros: 'HealthyBalanced', agape: 'HealthyBalanced' },
      polarityDirection: 'neutral',
      narrativeSummary: 'The encounter was completed via timeout.',
      selectedEncounter: this.selectedEncounter,
    };
  }
}
