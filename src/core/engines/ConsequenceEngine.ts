/**
 * ConsequenceEngine — processes encounter outcomes into state mutations.
 * Spec: foundations/19 §8, foundations/22 §7
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
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
  encounter: ScheduledEncounter,
): { sig: Significator; world: WorldState } {
  const line = encounter.targetLines[0] ?? 'Cognitive' as Line;
  const stage = encounter.stage;

  // 1. Record polarity trace
  const newPolarity = recordTrace(sig.polarity, record.polarityTrace, line, stage);

  // 2. Update theta timestamps
  const cellKey = `${line}:${stage}`;
  const newTheta = { lastEncounter: { ...sig.theta.lastEncounter, [cellKey]: record.timestamp } };

  // 3. Update drive balance and fixation risk
  const newDrives = updateDriveBalance(sig.drives, record.polarityTrace.driveDirectionality);

  // 4. Handle shadow surfacing
  let newShadowEntries = [...sig.shadows.entries];
  if (record.shadowSurfaced) {
    const existing = newShadowEntries.find(
      e => e.resolvedAt === null && e.line === line && e.stage === stage,
    );
    if (existing) {
      newShadowEntries = newShadowEntries.map(e =>
        e.id === existing.id ? { ...e, recurrenceCount: e.recurrenceCount + 1 } : e,
      );
    } else {
      const severity = Math.min(1, 0.3 + (newDrives.fixationRisk[encounter.driveTarget ?? 'Agency'] ?? 0) * 0.4);
      const entry: ShadowEntry = {
        id: `shadow-${record.timestamp}`,
        quadrant: record.shadowSurfaced,
        line,
        stage,
        drive: encounter.driveTarget ?? 'Agency',
        surfacedAt: record.timestamp,
        resolvedAt: null,
        recurrenceCount: 0,
        compoundPartner: null,
        severity,
      };
      newShadowEntries.push(entry);
    }
  }

  // 5. Handle shadow resolution
  if (record.shadowResolved) {
    newShadowEntries = newShadowEntries.map(e =>
      e.id === record.shadowResolved ? { ...e, resolvedAt: record.timestamp } : e,
    );
  }

  const newSig: Significator = {
    ...sig,
    polarity: newPolarity,
    theta: newTheta,
    drives: newDrives,
    shadows: { entries: newShadowEntries, activeCount: newShadowEntries.filter(e => !e.resolvedAt).length },
    totalEncounters: sig.totalEncounters + 1,
  };

  return { sig: newSig, world };
}

/** Update drive fixation risk based on drive directionality signals. */
function updateDriveBalance(
  current: Significator['drives'],
  directionality: Readonly<Record<Drive, DriveDirectionality>>,
): Significator['drives'] {
  const drives: Drive[] = ['Agency', 'Communion', 'Eros', 'Agape'];
  const newWeights = { ...current.weights };
  const newFixation = { ...current.fixationRisk };

  for (const drive of drives) {
    const signal = directionality[drive];
    switch (signal) {
      case 'DarkAddicted':
      case 'GoldenAddicted':
        newFixation[drive] = Math.min(1, (newFixation[drive] ?? 0) + 0.05);
        break;
      case 'DarkAverted':
      case 'GoldenAverted':
        newFixation[drive] = Math.min(1, (newFixation[drive] ?? 0) + 0.03);
        break;
      case 'HealthyBalanced':
        newFixation[drive] = Math.max(0, (newFixation[drive] ?? 0) - 0.02);
        break;
    }
  }

  return { weights: newWeights, fixationRisk: newFixation };
}
