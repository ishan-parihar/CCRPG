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

  // 6. Update NPC Relationships and recentEncounterIds
  const npcRelationships = [...world.npcRelationships];

  // Update or initialize relationship for the primary holonSource if present
  if (encounter.holonSource) {
    const holonId = encounter.holonSource;
    const existingIdx = npcRelationships.findIndex(r => r.holonId === holonId);
    if (existingIdx !== -1) {
      const existing = npcRelationships[existingIdx];
      npcRelationships[existingIdx] = {
        ...existing,
        encounters: existing.encounters + 1,
        lastEncounterAt: record.timestamp,
      };
    } else {
      npcRelationships.push({
        holonId,
        strength: 0.5,
        encounters: 1,
        lastEncounterAt: record.timestamp,
      });
    }
  }

  // Process holonDeltas for relationship updates
  for (const delta of record.holonDeltas) {
    if (delta.field === 'relationship' || delta.field === 'relationshipStrength' || delta.field === 'strength') {
      const holonId = delta.holonId;
      const existingIdx = npcRelationships.findIndex(r => r.holonId === holonId);
      
      let deltaValue = 0;
      if (typeof delta.newValue === 'number') {
        if (typeof delta.oldValue === 'number') {
          deltaValue = delta.newValue - delta.oldValue;
        } else {
          deltaValue = delta.newValue;
        }
      }

      if (existingIdx !== -1) {
        const existing = npcRelationships[existingIdx];
        let newStrength: number;
        if (typeof delta.oldValue === 'number' && typeof delta.newValue === 'number') {
          newStrength = Math.max(0, Math.min(1, delta.newValue));
        } else {
          newStrength = Math.max(0, Math.min(1, existing.strength + deltaValue));
        }
        
        const alreadyUpdated = encounter.holonSource === holonId;
        npcRelationships[existingIdx] = {
          ...existing,
          strength: newStrength,
          encounters: alreadyUpdated ? existing.encounters : existing.encounters + 1,
          lastEncounterAt: record.timestamp,
        };
      } else {
        let newStrength: number;
        if (typeof delta.oldValue === 'number' && typeof delta.newValue === 'number') {
          newStrength = Math.max(0, Math.min(1, delta.newValue));
        } else {
          newStrength = Math.max(0, Math.min(1, 0.5 + deltaValue));
        }

        npcRelationships.push({
          holonId,
          strength: newStrength,
          encounters: 1,
          lastEncounterAt: record.timestamp,
        });
      }
    }
  }

  const recentEncounterIds = [...world.recentEncounterIds, encounter.id];

  const newWorld: WorldState = {
    ...world,
    recentEncounterIds,
    npcRelationships,
  };

  return { sig: newSig, world: newWorld };
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
