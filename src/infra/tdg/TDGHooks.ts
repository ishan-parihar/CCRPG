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
   */
  async onEncounterComplete(
    encounter: ScheduledEncounter,
    record: ConsequenceRecord,
    sig: Significator,
  ): Promise<void> {
    if (!this.isActive()) return;
    try {
      await this.tdg!.callTool('tdg_create', {
        name: `encounter:${encounter.moduleRef}:${record.timestamp}`,
        kind: 'encounter',
        properties: {
          line: encounter.targetLines[0],
          stage: encounter.stage,
          modality: encounter.modality,
          executionMode: encounter.executionMode,
          polarityDirection: record.polarityTrace.energeticDirection,
          driveDirectionality: JSON.stringify(record.polarityTrace.driveDirectionality),
          shadowSurfaced: record.shadowSurfaced ?? null,
          narrativeSummary: record.narrativeSummary,
          playerStage: sig.currentStage,
          timestamp: record.timestamp,
        },
      });

      // Connect the encounter to the player holon
      await this.tdg!.callTool('tdg_connect', {
        source: `encounter:${encounter.moduleRef}:${record.timestamp}`,
        target: `player:${sig.id}`,
        edgeType: 'EXPERIENCED_BY',
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
      await this.tdg!.callTool('tdg_create', {
        name: `shadow:${shadowId}`,
        kind: 'shadow',
        properties: {
          quadrant,
          line,
          stage,
          severity,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
      });

      // Connect shadow to the player
      await this.tdg!.callTool('tdg_connect', {
        source: `shadow:${shadowId}`,
        target: `player:${sig.id}`,
        edgeType: 'CARRIED_BY',
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
      await this.tdg!.callTool('tdg_create', {
        name: `transformation:${sig.id}:${Date.now()}`,
        kind: 'transformation',
        properties: {
          fromStage,
          toStage,
          playerStage: toStage,
          totalEncounters: sig.totalEncounters,
          totalSessions: sig.totalSessions,
          timestamp: Date.now(),
        },
      });

      // Run the greater cycle on the player's graph
      await this.tdg!.callTool('tdg_greater_cycle', {
        nodeId: `player:${sig.id}`,
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
      await this.tdg!.callTool('tdg_consolidate', {
        nodeId: `player:${sig.id}`,
      });
      // Save mind state for cross-session persistence
      await this.tdg!.callTool('tdg_save_mind_state', {});
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
      await this.tdg!.callTool('tdg_create', {
        name: `npc_interaction:${holonId}:${Date.now()}`,
        kind: 'npc_interaction',
        properties: {
          holonId,
          strength,
          encounterCount,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
      });

      await this.tdg!.callTool('tdg_connect', {
        source: `npc_interaction:${holonId}:${Date.now()}`,
        target: `npc:${holonId}`,
        edgeType: 'INTERACTS_WITH',
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
      await this.tdg!.callTool('tdg_create', {
        name: `polarity_event:${sig.id}:${Date.now()}`,
        kind: 'polarity_event',
        properties: {
          mode,
          direction,
          crystallizationProgress,
          playerStage: sig.currentStage,
          timestamp: Date.now(),
        },
      });

      // Run metabolic tick on the player holon
      await this.tdg!.callTool('tdg_tick', {
        nodeId: `player:${sig.id}`,
      });
    } catch (err) {
      void err;
    }
  }

  // ─── TDG → CCRPG hooks (4) ──────────────────────────────────────

  /**
   * Hook 7: onReflectComplete — import TDG diagnosis into CCRPG.
   * Returns: { pathology, catalystSuggestion, developmentalFocus }
   */
  async runReflection(sig: Significator): Promise<{
    pathology: string | null;
    catalystSuggestion: string | null;
    developmentalFocus: string | null;
  } | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_reflect', {
        nodeId: `player:${sig.id}`,
      }) as { content?: string };

      // Parse the reflection result
      const content = result?.content ?? '{}';
      const parsed = JSON.parse(content) as {
        pathology?: string;
        catalystSuggestion?: string;
        developmentalFocus?: string;
      };

      return {
        pathology: parsed.pathology ?? null,
        catalystSuggestion: parsed.catalystSuggestion ?? null,
        developmentalFocus: parsed.developmentalFocus ?? null,
      };
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 8: onHealthComputed — get G_z/P_z from TDG for a specific holon.
   */
  async getHealth(nodeId: string): Promise<{ gz: number; pz: number; total: number } | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_health', { nodeId }) as { content?: string };
      const parsed = JSON.parse(result?.content ?? '{}') as { gz?: number; pz?: number; total?: number };
      return {
        gz: parsed.gz ?? 0,
        pz: parsed.pz ?? 0,
        total: parsed.total ?? 0,
      };
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 9: onSynaptogenesis — get new edges from TDG (after consolidation).
   * Returns edges that can update CCRPG's PolarityCellVector connections.
   */
  async getNewEdges(nodeId: string): Promise<readonly { source: string; target: string; type: string; weight: number }[] | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_get_related', {
        nodeId,
        edgeTypes: ['RESONATES_WITH'],
      }) as { content?: string };
      const parsed = JSON.parse(result?.content ?? '[]') as { source: string; target: string; type: string; weight: number }[];
      return parsed;
    } catch (err) {
      void err;
      return null;
    }
  }

  /**
   * Hook 10: onGreaterCycle — check transformation pressure from TDG.
   */
  async getTransformationPressure(sig: Significator): Promise<number | null> {
    if (!this.isActive()) return null;
    try {
      const result = await this.tdg!.callTool('tdg_greater_cycle', {
        nodeId: `player:${sig.id}`,
      }) as { content?: string };
      const parsed = JSON.parse(result?.content ?? '{}') as { pressure?: number };
      return parsed.pressure ?? null;
    } catch (err) {
      void err;
      return null;
    }
  }
}
