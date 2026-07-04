/**
 * TDGHooks — bidirectional hook bridge between CCRPG engines and TDG-Rust graph.
 *
 * CCRPG→TDG hooks (6): export CCRPG state into the TDG graph after each event.
 * TDG→CCRPG hooks (4): import TDG graph insights back into CCRPG engines.
 *
 * The hooks are event-driven: CCRPG engines emit events, the hooks listen
 * and call the appropriate TDG operations. TDG operations emit results,
 * the hooks translate them back into CCRPG state updates.
 *
 * ── Parameter schemas (verified against tdg-rust v0.6.0 MCP tools/list) ──
 * Earlier versions of this file used invented parameter names (`kind`,
 * `properties`, `source`, `target`, `edgeType`, `nodeId`) that the actual
 * TDG-Rust binary rejects. The real schemas are:
 *   - tdg_create:    { node_type, text, name, description?, meta?, stage?, quadrant?, parent_ids? }
 *   - tdg_connect:   { source_id, target_id, edge_type, weight?, meta? }
 *   - tdg_tick:      { node_id, catalyst_amount? }
 *   - tdg_health:    { node_id, force_recompute? }
 *   - tdg_reflect:   { focus_topics?, turns?, status_only? }   (NO node_id — graph-wide)
 *   - tdg_greater_cycle: { node_id, tick?, include_readiness? }
 *   - tdg_get_related:   { node_id, edge_type?, direction?, limit? }
 *   - tdg_consolidate:   { lean_mode? }
 *   - tdg_save_mind_state: { session_id?, label? }
 *   - tdg_search:         { query, limit?, node_type? }
 *   - tdg_fetch_context:  { node_id, depth?, scope?, format?, token_budget? }
 *
 * Status: canonical-hypothesis (CCRPG-specific integration per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import type { TDGClient } from './TDGClient.js';
import type { Significator } from '../../core/domain/Significator.js';
import type { ConsequenceRecord } from '../../core/domain/ConsequenceRecord.js';
import type { ScheduledEncounter } from '../../core/domain/EncounterSpecNew.js';
import type { WorldState } from '../../core/engines/CandidateGeneration.js';
import type { UserMatrixModel } from '../../core/engines/UserMatrixModel.js';

export interface HookContext {
  readonly sig: Significator;
  readonly world: WorldState;
  readonly userMatrixModel?: UserMatrixModel;
}

export class TDGHooks {
  private tdg: TDGClient | null = null;
  private enabled = false;

  /** Set the TDG client (called when TDG-Rust is available). */
  setClient(client: TDGClient): void {
    this.tdg = client;
    this.enabled = client.isRunning();
  }

  /** Check if hooks are active (TDG-Rust running). */
  isActive(): boolean {
    return this.enabled && this.tdg?.isRunning() === true;
  }

  // ─── CCRPG → TDG hooks (6) ──────────────────────────────────────

  /**
   * Hook 1: onEncounterComplete — store the encounter as a holon node.
   * Called after applyConsequences() finishes.
   *
   * tdg_create requires: node_type, text, name (string). Optional: meta (JSON),
   * stage (int), quadrant, parent_ids. We pack all encounter metadata into `meta`
   * since the schema doesn't have a free-form `properties` field.
   */
  async onEncounterComplete(
    encounter: ScheduledEncounter,
    record: ConsequenceRecord,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      const encounterNodeId = `encounter:${encounter.moduleRef}:${record.timestamp}`;
      const playerNodeId = `player:${sig.id}`;

      // Ensure the player holon exists first (idempotent — if it already exists,
      // tdg_create will return its existing node_id, which is fine).
      await this.ensurePlayerNode(sig);

      // Create the encounter node. `text` is the human-readable payload,
      // `meta` carries the structured fields TDG can index on.
      await this.tdg!.callTool('tdg_create', {
        node_type: 'encounter',
        name: encounterNodeId,
        text: record.narrativeSummary || `Encounter at ${encounter.moduleRef}`,
        description: `Line=${encounter.targetLines[0]}, Stage=${encounter.stage}, Modality=${encounter.modality}`,
        meta: {
          line: encounter.targetLines[0],
          stage: encounter.stage,
          modality: encounter.modality,
          executionMode: encounter.executionMode,
          polarityDirection: record.polarityTrace.energeticDirection,
          driveDirectionality: record.polarityTrace.driveDirectionality,
          shadowSurfaced: record.shadowSurfaced ?? null,
          playerStage: sig.currentStage,
          timestamp: record.timestamp,
        },
        parent_ids: playerNodeId,
      });

      // Connect the encounter to the player holon (tdg_create's parent_ids already
      // wires a PARENT_OF edge, but we also add an explicit EXPERIENCED_BY edge
      // so graph traversals can find encounters by edge type).
      await this.tdg!.callTool('tdg_connect', {
        source_id: encounterNodeId,
        target_id: playerNodeId,
        edge_type: 'EXPERIENCED_BY',
        weight: 1.0,
      });
    } catch (err) {
      void err; // Silently fail — hooks are best-effort
    }
  }

  /**
   * Hook 2: onShadowSurfaced — store the shadow as a holon node.
   * Called when a new shadow entry is created in the ShadowLedger.
   */
  async onShadowSurfaced(
    shadowId: string,
    quadrant: string,
    line: string,
    stage: string,
    severity: number,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      const shadowNodeId = `shadow:${shadowId}`;
      const playerNodeId = `player:${sig.id}`;

      await this.ensurePlayerNode(sig);

      await this.tdg!.callTool('tdg_create', {
        node_type: 'shadow',
        name: shadowNodeId,
        text: `${quadrant} shadow on ${line}/${stage}`,
        description: `severity=${severity.toFixed(2)}, quadrant=${quadrant}`,
        meta: {
          quadrant,
          line,
          stage,
          severity,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
        parent_ids: playerNodeId,
      });

      await this.tdg!.callTool('tdg_connect', {
        source_id: shadowNodeId,
        target_id: playerNodeId,
        edge_type: 'CARRIED_BY',
        weight: severity,
      });
    } catch (err) {
      void err;
    }
  }

  /**
   * Hook 3: onTransformation — store the transformation as a holon + run greater cycle.
   * Called when commitTransformation() fires.
   */
  async onTransformation(
    fromStage: string,
    toStage: string,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      const transformNodeId = `transformation:${sig.id}:${Date.now()}`;
      const playerNodeId = `player:${sig.id}`;

      await this.ensurePlayerNode(sig);

      await this.tdg!.callTool('tdg_create', {
        node_type: 'transformation',
        name: transformNodeId,
        text: `Transformation from ${fromStage} to ${toStage}`,
        description: `catalystCount=${sig.totalEncounters}, session=${sig.totalSessions}`,
        meta: {
          fromStage,
          toStage,
          playerStage: toStage,
          totalEncounters: sig.totalEncounters,
          totalSessions: sig.totalSessions,
          timestamp: Date.now(),
        },
        parent_ids: playerNodeId,
      });

      // Run the greater cycle on the player's graph node.
      // tick=false = query only (don't advance the cycle — we just want to read
      // the player's current S·T·G·Ch phase + readiness assessment). If we
      // omitted tick, the binary might default to advancing the cycle, which
      // would double-advance on every transformation event.
      await this.tdg!.callTool('tdg_greater_cycle', {
        node_id: playerNodeId,
        tick: false,
        include_readiness: true,
      });
    } catch (err) {
      void err;
    }
  }

  /**
   * Hook 4: onSessionEnd — run sleep replay + consolidation.
   * Called after endSession().
   */
  async onSessionEnd(sig: Significator): Promise<void> {
    if (!this.isActive()) return;
    try {
      // tdg_consolidate runs the consolidation pass on the whole graph.
      await this.tdg!.callTool('tdg_consolidate', { lean_mode: false });
      // Save mind state for cross-session persistence.
      await this.tdg!.callTool('tdg_save_mind_state', {
        session_id: `session:${sig.totalSessions}`,
        label: `end-of-session-${sig.totalSessions}`,
      });
    } catch (err) {
      void err;
    }
  }

  /**
   * Hook 5: onNPCRelationshipChange — store NPC interaction as a holon.
   */
  async onNPCRelationshipChange(
    holonId: string,
    strength: number,
    encounterCount: number,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      const interactionNodeId = `npc_interaction:${holonId}:${Date.now()}`;
      const playerNodeId = `player:${sig.id}`;

      await this.ensurePlayerNode(sig);

      await this.tdg!.callTool('tdg_create', {
        node_type: 'npc_interaction',
        name: interactionNodeId,
        text: `NPC interaction with ${holonId}`,
        description: `strength=${strength.toFixed(2)}, encounters=${encounterCount}`,
        meta: {
          holonId,
          strength,
          encounterCount,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
        parent_ids: playerNodeId,
      });

      await this.tdg!.callTool('tdg_connect', {
        source_id: interactionNodeId,
        target_id: `npc:${holonId}`,
        edge_type: 'INTERACTS_WITH',
        weight: strength,
      });
    } catch (err) {
      void err;
    }
  }

  /**
   * Hook 6: onPolarityCrystallized — store polarity event + run metabolic tick.
   */
  async onPolarityCrystallized(
    mode: string,
    direction: string | null,
    crystallizationProgress: number,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      const polarityNodeId = `polarity_event:${sig.id}:${Date.now()}`;
      const playerNodeId = `player:${sig.id}`;

      await this.ensurePlayerNode(sig);

      await this.tdg!.callTool('tdg_create', {
        node_type: 'polarity_event',
        name: polarityNodeId,
        text: `Polarity crystallized: mode=${mode}, direction=${direction ?? 'none'}`,
        description: `crystallizationProgress=${crystallizationProgress.toFixed(2)}`,
        meta: {
          mode,
          direction,
          crystallizationProgress,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
        parent_ids: playerNodeId,
      });

      // Run metabolic tick on the player holon — this advances the lesser cycle
      // (M·P·C·E metabolism) and updates G_z health.
      await this.tdg!.callTool('tdg_tick', {
        node_id: playerNodeId,
      });
    } catch (err) {
      void err;
    }
  }

  // ─── TDG → CCRPG hooks (4) ──────────────────────────────────────

  /**
   * Hook 7: onReflectComplete — import TDG diagnosis into CCRPG.
   * Returns: { pathology, catalystSuggestion, developmentalFocus }
   *
   * NOTE: tdg_reflect is graph-wide (no node_id parameter). It runs LLM
   * synthesis over the whole graph context and returns patterns/insights.
   * The reflection requires an LLM backend (Ollama or OpenAI) configured in
   * the TDG-Rust environment; if no LLM is configured, this returns null
   * (callers should fall back to CCRPG's own detectThreshold + SessionAgent).
   *
   * `focus_topics` is a comma-separated string per the TDG schema. We pass
   * the player's current stage + transformation phase as the focus so the
   * reflection targets the player's developmental edge.
   */
  async runReflection(sig: Significator): Promise<{
    pathology: string | null;
    catalystSuggestion: string | null;
    developmentalFocus: string | null;
  } | null> {
    if (!this.isActive()) return null;
    try {
      // First check if an LLM backend is available — if not, return null
      // (tdg_reflect without an LLM returns an error or empty result).
      const statusResult = await this.tdg!.callTool('tdg_reflect', { status_only: true });
      const status = this.parseContent(statusResult) as {
        status?: string;
        providers?: Array<{ available?: boolean; name?: string }>;
      };
      const anyAvailable = status.providers?.some(p => p.available) ?? false;
      if (!anyAvailable) {
        return null; // No LLM backend — reflection unavailable
      }

      // Run the reflection with the player's stage + phase as focus topics
      const focusTopics = `stage:${sig.currentStage},phase:${sig.transformationPhase ?? 'idle'}`;
      const result = await this.tdg!.callTool('tdg_reflect', {
        focus_topics: focusTopics,
      });
      const parsed = this.parseContent(result) as {
        pathology?: string;
        catalystSuggestion?: string;
        developmentalFocus?: string;
        patterns?: string[];
        summary?: string;
        insights?: string[];
      };

      // tdg_reflect's actual output schema varies — it may return patterns/summary
      // rather than the {pathology, catalystSuggestion, developmentalFocus} shape
      // we assumed. Map conservatively: if the explicit fields are present use them,
      // otherwise fall back to summary as catalystSuggestion.
      return {
        pathology: parsed.pathology ?? null,
        catalystSuggestion: parsed.catalystSuggestion ?? parsed.summary ?? null,
        developmentalFocus: parsed.developmentalFocus ?? (parsed.patterns?.[0] ?? parsed.insights?.[0] ?? null),
      };
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 8: onHealthComputed — get G_z/P_z from TDG for a specific holon.
   *
   * tdg_health returns {computed, dirty, message, node_id, gz?, pz?, total?}
   * when health is computed. On first call, health may not yet be computed —
   * the binary enqueues a recompute job and returns
   * {computed: false, message: "Health not yet computed. A recompute job has been enqueued."}.
   * We trigger a tick to force computation, then re-query. If still not ready,
   * we return null (callers should treat null as "TDG health unavailable").
   */
  async getHealth(nodeId: string): Promise<{ gz: number; pz: number; total: number; computed: boolean } | null> {
    if (!this.isActive()) return null;
    try {
      // First attempt — may return computed=false if never ticked.
      let result = await this.tdg!.callTool('tdg_health', { node_id: nodeId }) as { content?: string };
      let parsed = this.parseContent(result);

      if (!parsed.computed) {
        // Force computation by ticking the lesser cycle, then re-query.
        await this.tdg!.callTool('tdg_tick', { node_id: nodeId }).catch(() => {});
        result = await this.tdg!.callTool('tdg_health', { node_id: nodeId, force_recompute: true }) as { content?: string };
        parsed = this.parseContent(result);
      }

      if (!parsed.computed) {
        // Still not ready — return null so callers know TDG health isn't available.
        return null;
      }

      return {
        gz: typeof parsed.gz === 'number' ? parsed.gz : 0,
        pz: typeof parsed.pz === 'number' ? parsed.pz : 0,
        total: typeof parsed.total === 'number' ? parsed.total : 0,
        computed: true,
      };
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 9: onSynaptogenesis — get new edges from TDG (after consolidation).
   * Returns edges that can update CCRPG's PolarityCellVector connections.
   *
   * Uses tdg_get_related to fetch RESONATES_WITH edges. The response shape is
   * { nodes: [{ id, name, node_type, ... }] } — we map each related node back
   * into the {source, target, type, weight} shape callers expect.
   */
  async getNewEdges(nodeId: string): Promise<readonly { source: string; target: string; type: string; weight: number }[] | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_get_related', {
        node_id: nodeId,
        edge_type: 'RESONATES_WITH',
        direction: 'both',
      });
      const parsed = this.parseContent(result) as {
        nodes?: Array<{ id?: string; name?: string; node_type?: string; weight?: number }>;
        edges?: Array<{ source_id?: string; target_id?: string; edge_type?: string; weight?: number }>;
      };

      // tdg_get_related returns { nodes: [...] } (related nodes), not edges directly.
      // Map each related node into a synthetic edge record so callers can iterate.
      if (Array.isArray(parsed.nodes)) {
        return parsed.nodes.map(n => ({
          source: nodeId,
          target: n.id ?? n.name ?? '',
          type: 'RESONATES_WITH',
          weight: typeof n.weight === 'number' ? n.weight : 1.0,
        }));
      }
      // Some TDG versions may return edges directly
      if (Array.isArray(parsed.edges)) {
        return parsed.edges.map(e => ({
          source: e.source_id ?? '',
          target: e.target_id ?? '',
          type: e.edge_type ?? 'RESONATES_WITH',
          weight: typeof e.weight === 'number' ? e.weight : 1.0,
        }));
      }
      return [];
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 10: onGreaterCycle — check transformation pressure from TDG.
   *
   * tdg_greater_cycle returns {transformation_pressure, readiness: {total, ...}, ...}.
   * We return transformation_pressure (0.0–1.0) — the player's readiness to
   * advance to the next stage. Callers can use this to supplement CCRPG's
   * own detectThreshold() signal.
   */
  async getTransformationPressure(sig: Significator): Promise<number | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_greater_cycle', {
        node_id: `player:${sig.id}`,
        include_readiness: true,
      }) as { content?: string };
      const parsed = this.parseContent(result) as {
        transformation_pressure?: number;
        readiness?: { total?: number };
      };
      // Prefer transformation_pressure (explicit field); fall back to readiness.total
      if (typeof parsed.transformation_pressure === 'number') {
        return parsed.transformation_pressure;
      }
      if (parsed.readiness && typeof parsed.readiness.total === 'number') {
        return parsed.readiness.total;
      }
      return null;
    } catch (err) {
      void err;
      return null;
    }
  }

  // ─── Internal helpers ──────────────────────────────────────────

  /**
   * Parse the MCP content envelope.
   *
   * tdg-rust v0.6.0 returns tool results in the standard MCP shape:
   *   { content: [{ type: "text", text: "<json-string>" }], isError: false }
   * Earlier versions of this file assumed `result.content` was the JSON string
   * directly — that was wrong. This helper extracts the inner text and parses
   * it as JSON, returning {} on any parse failure.
   */
  private parseContent(result: unknown): Record<string, any> {
    try {
      if (result && typeof result === 'object') {
        const r = result as { content?: unknown };
        // Standard MCP envelope: { content: [{ type: "text", text: "..." }] }
        if (Array.isArray(r.content)) {
          for (const block of r.content) {
            if (block && typeof block === 'object') {
              const b = block as { type?: string; text?: string };
              if (b.type === 'text' && typeof b.text === 'string') {
                try {
                  return JSON.parse(b.text);
                } catch {
                  // text wasn't JSON — continue
                }
              }
            }
          }
        }
        // Fallback: result itself is the parsed object
        if (!Array.isArray(r.content) && typeof r.content === 'object' && r.content !== null) {
          return r.content as Record<string, any>;
        }
        // Fallback: result.content is a JSON string
        if (typeof r.content === 'string') {
          try { return JSON.parse(r.content); } catch { return {}; }
        }
      }
    } catch {
      // fallthrough
    }
    return {};
  }

  /**
   * Ensure the player holon exists in the TDG graph.
   * Idempotent — if the node already exists, tdg_create returns its node_id.
   * Called before any hook that connects other nodes to the player.
   */
  private async ensurePlayerNode(sig: Significator): Promise<void> {
    try {
      await this.tdg!.callTool('tdg_create', {
        node_type: 'player',
        name: `player:${sig.id}`,
        text: `Player at stage ${sig.currentStage}`,
        description: `totalEncounters=${sig.totalEncounters}, totalSessions=${sig.totalSessions}`,
        meta: {
          currentStage: sig.currentStage,
          totalEncounters: sig.totalEncounters,
          totalSessions: sig.totalSessions,
          transformationPhase: sig.transformationPhase ?? 'idle',
        },
      });
    } catch (err) {
      void err; // Idempotent — failure usually means the node already exists
    }
  }
}
