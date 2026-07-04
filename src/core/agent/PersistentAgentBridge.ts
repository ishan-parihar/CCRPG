/**
 * PersistentAgentBridge — adapts the PersistentAgent's EncounterResult into
 * the same OrchestratorResult shape that the CLI's runAgenticEncounter produces.
 *
 * This lets the CLI route through EITHER AgenticOrchestrator (default, 2-tool,
 * 4-exchange budget) OR PersistentAgent (15-tool, no budget, session-persistent)
 * with a single uniform downstream pipeline (applyResponseOnly + history + display).
 *
 * The bridge:
 * 1. Converts the agent's EncounterResult (driveScores/signals/polarity/shadow)
 *    into a PlayerResponse (the shape ConsequenceEngine.processOutcome expects).
 * 2. Calls processOutcome + applyConsequences to produce a ConsequenceRecord
 *    and updated sig/world — exactly what the AgenticOrchestrator path does.
 * 3. Wraps the result in an OrchestratorResult-compatible object.
 *
 * Status: canonical-hypothesis (CCRPG-specific per AGENTIC-ARCHITECTURE-PLAN.md Phase 3).
 */
import type { PersistentAgent, EncounterResult } from './PersistentAgent.js';
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Drive } from '../domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection, StageOrientation, SourceOfNourishment } from '../domain/enums.js';
import type { PlayerResponse } from '../engines/ConsequenceEngine.js';
import { processOutcome, applyConsequences } from '../engines/ConsequenceEngine.js';

/**
 * The shape that cli-game.ts's session loop expects from runAgenticEncounter.
 * Mirrors AgenticOrchestrator's OrchestratorResult.
 */
export interface BridgedAgentResult {
  readonly outcome: {
    readonly updatedSig: Significator;
    readonly updatedWorld: WorldState;
    readonly consequenceRecord: ConsequenceRecord;
    readonly finalResult: { readonly passed: boolean };
    readonly feedback: string;
    readonly narrativeSummary: string;
  };
  readonly response: PlayerResponse;
  readonly narrativeSummary: string;
  /**
   * The encounter actually used for this run — either the agent's selection
   * (if it called ccrpg_select_encounter) or the scheduler's pick passed in.
   * Callers should use THIS encounter for any downstream processing
   * (e.g. applyResponseOnly) rather than the original scheduler pick, so that
   * UserMatrixModel updates + shadow knot resolution fire on the right cell.
   */
  readonly effectiveEncounter: ScheduledEncounter;
}

/**
 * Map the agent's polarityDirection (sto/sts/neutral) to an EnergeticDirection.
 * sto (service-to-others) → Radiative (outward/giving)
 * sts (service-to-self)   → Absorptive (inward/receiving)
 * neutral                  → Sovereign (balanced/autonomous)
 */
function mapEnergeticDirection(polarityDirection: string): EnergeticDirection {
  switch (polarityDirection) {
    case 'sto': return 'Radiative';
    case 'sts': return 'Absorptive';
    default: return 'Sovereign';
  }
}

/**
 * Run a single encounter through the PersistentAgent and bridge the result
 * into the OrchestratorResult shape.
 *
 * The `agent` is a long-lived PersistentAgent instance (reused across encounters
 * in a session — its message history persists). The `encounter` is the scheduled
 * encounter from tickWithStrategy (used as a fallback if the agent doesn't call
 * ccrpg_select_encounter itself).
 */
export async function runPersistentAgentEncounter(
  agent: PersistentAgent,
  encounter: ScheduledEncounter,
  sig: Significator,
  world: WorldState,
): Promise<BridgedAgentResult> {
  // Run the agent loop. The agent will (via tools) select an encounter, ask
  // the player, and call ccrpg_complete_encounter with its evaluation.
  const result: EncounterResult = await agent.runEncounter();

  // The agent may have selected a different encounter than the scheduler's pick.
  // Use the agent's selected encounter if available, else fall back to the scheduler's.
  const effectiveEncounter = result.selectedEncounter ?? encounter;

  // Convert the agent's EncounterResult into a PlayerResponse.
  // The agent uses lowercase drive keys (agency/communion/eros/agape); Drive type
  // uses capitalized (Agency/Communion/Eros/Agape) — remap here.
  const driveDirectionality: Readonly<Record<Drive, DriveDirectionality>> = {
    Agency: result.driveSignals.agency as DriveDirectionality,
    Communion: result.driveSignals.communion as DriveDirectionality,
    Eros: result.driveSignals.eros as DriveDirectionality,
    Agape: result.driveSignals.agape as DriveDirectionality,
  };
  const playerResponse: PlayerResponse = {
    encounterId: effectiveEncounter.id,
    energeticDirection: mapEnergeticDirection(result.polarityDirection),
    driveDirectionality,
    // The agent doesn't assess stageOrientation/sourceOfNourishment directly;
    // default to neutral/homeostatic values. These feed PolarityEngine.recordTrace
    // but are not player-visible (Veil).
    stageOrientation: 'Homeostatic' as StageOrientation,
    sourceOfNourishment: 'Ambivalent' as SourceOfNourishment,
    shadowSurfaced: (result.shadowSignal?.quadrant ?? null) as ShadowQuadrant | null,
    shadowResolvedId: null,
    narrativeSummary: result.narrativeSummary,
  };

  // Process the outcome + apply consequences — same pipeline as AgenticOrchestrator.
  const now = Date.now();
  const record = processOutcome(effectiveEncounter, playerResponse, now);
  const applied = applyConsequences(sig, world, record, effectiveEncounter);

  // The CLI only reads .passed from finalResult — keep it minimal.
  const finalResult = { passed: result.passed };

  return {
    outcome: {
      updatedSig: applied.sig,
      updatedWorld: applied.world,
      consequenceRecord: record,
      finalResult,
      feedback: result.narrativeSummary,
      narrativeSummary: result.narrativeSummary,
    },
    response: playerResponse,
    narrativeSummary: result.narrativeSummary,
    effectiveEncounter,
  };
}
