/**
 * ConsequenceEngine — processes encounter outcomes into state mutations.
 * Spec: foundations/19 §8, foundations/22 §7
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { EnergeticDirection, ShadowQuadrant, DriveDirectionality, SourceOfNourishment, StageOrientation } from '../domain/enums.js';
import type { PolarityTrace } from '../domain/PolarityTrace.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Significator } from '../domain/Significator.js';
import type { ShadowEntry } from '../domain/ShadowLedger.js';
import { recordTrace } from './PolarityEngine.js';
import type { WorldState } from './CandidateGeneration.js';

export interface PlayerResponse {
  readonly encounterId: string;
  readonly energeticDirection: EnergeticDirection;
  readonly driveDirectionality: Readonly<Record<Drive, DriveDirectionality>>;
  readonly stageOrientation: StageOrientation;
  readonly sourceOfNourishment: SourceOfNourishment;
  readonly shadowSurfaced: ShadowQuadrant | null;
  readonly shadowResolvedId: string | null;
  readonly narrativeSummary: string;
}

/** Process an encounter outcome into a ConsequenceRecord. */
export function processOutcome(spec: ScheduledEncounter, response: PlayerResponse, now: number): ConsequenceRecord {
  const trace: PolarityTrace = {
    encounterId: spec.id,
    timestamp: now,
    driveDirectionality: response.driveDirectionality,
    energeticDirection: response.energeticDirection,
    stageOrientation: response.stageOrientation,
    sourceOfNourishment: response.sourceOfNourishment,
  };

  return {
    encounterId: spec.id,
    timestamp: now,
    polarityTrace: trace,
    shadowSurfaced: response.shadowSurfaced,
    shadowResolved: response.shadowResolvedId,
    holonDeltas: [],
    altitudeShift: null,
    driveShift: null,
    narrativeSummary: response.narrativeSummary,
  };
}

/** Apply consequences to significator and world state. Returns new immutable copies. */
export function applyConsequences(
  sig: Significator,
  world: WorldState,
  record: ConsequenceRecord,
): { sig: Significator; world: WorldState } {
  // 1. Record polarity trace
  const line = record.polarityTrace.encounterId.split('/')[0] as Line;
  const stage = record.polarityTrace.encounterId.split('/')[1]?.split(':')[0] as Stage;
  const newPolarity = recordTrace(sig.polarity, record.polarityTrace, line ?? sig.altitudes.Cognitive as Line, stage ?? sig.currentStage);

  // 2. Update theta timestamps
  const cellKey = `${line}:${stage}`;
  const newTheta = { lastEncounter: { ...sig.theta.lastEncounter, [cellKey]: record.timestamp } };

  // 3. Handle shadow surfacing
  let newShadowEntries = [...sig.shadows.entries];
  if (record.shadowSurfaced) {
    const entry: ShadowEntry = {
      id: `shadow-${record.timestamp}`,
      quadrant: record.shadowSurfaced,
      line: line ?? 'Cognitive',
      stage: stage ?? sig.currentStage,
      drive: 'Agency',
      surfacedAt: record.timestamp,
      resolvedAt: null,
      recurrenceCount: 0,
      compoundPartner: null,
      severity: 0.5,
    };
    newShadowEntries.push(entry);
  }

  // 4. Handle shadow resolution
  if (record.shadowResolved) {
    newShadowEntries = newShadowEntries.map(e =>
      e.id === record.shadowResolved ? { ...e, resolvedAt: record.timestamp } : e,
    );
  }

  const newSig: Significator = {
    ...sig,
    polarity: newPolarity,
    theta: newTheta,
    shadows: { entries: newShadowEntries, activeCount: newShadowEntries.filter(e => !e.resolvedAt).length },
    totalEncounters: sig.totalEncounters + 1,
  };

  return { sig: newSig, world };
}
