/**
 * ConsequenceEngine — processes encounter outcomes into state mutations.
 * Spec: foundations/19 §8, foundations/22 §7
 */
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';
import { ALL_RAYS, STAGE_RAY_MAP } from '../domain/Ray.js';
import type { EnergeticDirection, ShadowQuadrant, DriveDirectionality, SourceOfNourishment, StageOrientation } from '../domain/enums.js';
import type { PolarityTrace } from '../domain/PolarityTrace.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Significator, EncounterRecord } from '../domain/Significator.js';
import type { ShadowEntry } from '../domain/ShadowLedger.js';
import { recordTrace } from './PolarityEngine.js';
import type { WorldState } from './CandidateGeneration.js';
import { EncounterRegistry } from '../registries/index.js';

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

  // OA-13: Track avoided encounters — when the player avoids, the shadow grows.
  // The avoidedEncounters list records the encounter ID; the scheduler's
  // shadowActivation criterion will boost priority for that (line, stage)
  // on the next encounter, creating developmental pressure.
  const isAvoided = record.narrativeSummary === '' || record.narrativeSummary.includes('avoided');

  // 1. Record polarity trace
  const newPolarity = recordTrace(sig.polarity, record.polarityTrace, line, stage);

  // 2. Update theta timestamps
  const cellKey = `${line}:${stage}`;
  const newTheta = { lastEncounter: { ...sig.theta.lastEncounter, [cellKey]: record.timestamp } };

  // 3. Update drive balance and fixation risk
  let newDrives = updateDriveBalance(sig.drives, record.polarityTrace.driveDirectionality);

  // OA-13: Encounter-avoidance consequence — when the player avoids an encounter,
  // the avoidance signal grows. Fixation risk increases slightly on the encounter's
  // target drive, creating developmental pressure that the scheduler will surface
  // as a shadow-activation priority boost on the next encounter at this cell.
  if (isAvoided) {
    const avoidanceDrive = encounter.driveTarget ?? 'Agency';
    const currentFixation = newDrives.fixationRisk[avoidanceDrive] ?? 0;
    newDrives = {
      weights: newDrives.weights,
      fixationRisk: {
        ...newDrives.fixationRisk,
        [avoidanceDrive]: Math.min(1, currentFixation + 0.03),
      },
    };
  }

  // 4. Handle shadow surfacing
  let newShadowEntries = [...sig.shadows.entries];

  // G.22: Shadow severity aging — decay severity over time (0.01 per hour)
  const now = record.timestamp;
  newShadowEntries = newShadowEntries.map(e => {
    if (e.resolvedAt !== null) return e;
    const hoursSinceSurfaced = (now - e.surfacedAt) / 3600000;
    const decay = Math.min(0.5, hoursSinceSurfaced * 0.01);
    const newSeverity = Math.max(0.1, e.severity - decay);
    return newSeverity === e.severity ? e : { ...e, severity: newSeverity };
  });

  if (record.shadowSurfaced) {
    const existing = newShadowEntries.find(
      e => e.resolvedAt === null && e.line === line && e.stage === stage,
    );
    if (existing) {
      newShadowEntries = newShadowEntries.map(e =>
        e.id === existing.id ? { ...e, recurrenceCount: e.recurrenceCount + 1 } : e,
      );
    } else {
      // Fix latent NaN bug: when driveTarget is null, fixationRisk[null] is
      // undefined, and undefined * 0.4 = NaN. Default to 0 in that case.
      const driveTarget = encounter.driveTarget ?? 'Agency';
      const fixation = newDrives.fixationRisk[driveTarget] ?? 0;
      const severity = Math.min(1, 0.3 + (Number.isFinite(fixation) ? fixation : 0) * 0.4);
      const newId = `shadow-${record.timestamp}`;

      // G.18: Compound shadow detection — same quadrant on 2+ lines
      const partner = newShadowEntries.find(
        e => e.quadrant === record.shadowSurfaced && e.line !== line && e.resolvedAt === null,
      );

      const entry: ShadowEntry = {
        id: newId,
        quadrant: record.shadowSurfaced,
        line,
        stage,
        drive: encounter.driveTarget ?? 'Agency',
        surfacedAt: record.timestamp,
        resolvedAt: null,
        recurrenceCount: 0,
        compoundPartner: partner?.id ?? null,
        severity,
      };
      newShadowEntries.push(entry);

      // Back-link the partner to this entry
      if (partner) {
        const idx = newShadowEntries.findIndex(e => e.id === partner.id);
        if (idx >= 0) {
          newShadowEntries[idx] = { ...newShadowEntries[idx], compoundPartner: newId };
        }
      }
    }
  }

  // 5. Handle shadow resolution
  // 5a. Explicit shadow resolution from the encounter record
  if (record.shadowResolved) {
    newShadowEntries = newShadowEntries.map(e =>
      e.id === record.shadowResolved ? { ...e, resolvedAt: record.timestamp } : e,
    );
  }
  // 5b. Implicit integration: when a player PASSES an encounter on a line
  // that has unresolved shadows, those shadows are considered integrated.
  // This is the core developmental principle: successful engagement with a
  // capacity naturally resolves the shadow patterns associated with it.
  const allDrivesHealthy = Object.values(record.polarityTrace.driveDirectionality)
    .every(d => d === 'HealthyBalanced');
  if (allDrivesHealthy) {
    // G.19: Scope resolution to shadows at or below the encounter's stage
    const encounterStageOrd = stageOrdinal(encounter.stage);
    const lineShadows = newShadowEntries.filter(
      e => e.resolvedAt === null && e.line === line && stageOrdinal(e.stage) <= encounterStageOrd,
    );
    if (lineShadows.length > 0) {
      newShadowEntries = newShadowEntries.map(e =>
        (e.resolvedAt === null && e.line === line && stageOrdinal(e.stage) <= encounterStageOrd)
          ? { ...e, resolvedAt: record.timestamp }
          : e,
      );
    }
  }

  // 5b. Create codex entry from encounter
  const codexText = lookupCodexEntry(encounter);
  const newCodexEntries = codexText
    ? [...sig.codexEntries, {
        id: `codex:${encounter.id}:${record.timestamp}`,
        title: `${line} — ${encounter.stage}`,
        body: codexText,
        unlockedAtMs: record.timestamp,
      }]
    : sig.codexEntries;

  // 5c. Append to sig.recentEncounters (EncounterRecord shape for ShadowDetector).
  // `passed` is proxied by allDrivesHealthy (matches the implicit-integration logic
  // in §5b above); driveChoice is the encounter's driveTarget if any.
  const newRecentEncounters: readonly EncounterRecord[] = [
    ...sig.recentEncounters,
    {
      line,
      passed: allDrivesHealthy,
      driveChoice: encounter.driveTarget ?? undefined,
      timestamp: record.timestamp,
    },
  ].slice(-50); // keep last 50 to bound memory

  // GAP-D2-1: Update the Energy-Ray-Center Profile (rayProfile).
  // Per HoloOS 08.8.22, the rayProfile is a 7-element vector of activation
  // levels (0-1) for each energy-ray-center. Each encounter activates the
  // ray-center corresponding to the encounter's stage (via STAGE_RAY_MAP).
  // All other ray-centers decay slightly (the holon's attention shifts).
  const encounterRay = STAGE_RAY_MAP[stage] ?? 'Yellow';
  const oldRayProfile = { ...sig.rayProfile } as Record<string, number>;
  const newRayProfile: Record<string, number> = {};
  for (const ray of ALL_RAYS) {
    const oldVal = oldRayProfile[ray] ?? 0;
    if (ray === encounterRay) {
      // Activate the encounter's ray-center (cap at 1.0)
      newRayProfile[ray] = Math.min(1, oldVal + 0.15);
    } else {
      // Decay all other ray-centers slightly
      newRayProfile[ray] = Math.max(0, oldVal - 0.02);
    }
  }

  const newSig: Significator = {
    ...sig,
    polarity: newPolarity,
    theta: newTheta,
    drives: newDrives,
    shadows: { entries: newShadowEntries, activeCount: newShadowEntries.filter(e => !e.resolvedAt).length },
    codexEntries: newCodexEntries,
    recentEncounters: newRecentEncounters,
    rayProfile: newRayProfile as Significator['rayProfile'],
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
  const recentEncounters = [
    ...(world.recentEncounters ?? []),
    { line: encounter.targetLines[0] ?? ('Cognitive' as Line), stage: encounter.stage, modality: encounter.modality },
  ].slice(-20);

  const newWorld: WorldState = {
    ...world,
    recentEncounterIds,
    recentEncounters,
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
        newWeights[drive] = (newWeights[drive] ?? 0) + 0.03;
        newFixation[drive] = Math.min(1, (newFixation[drive] ?? 0) + 0.05);
        break;
      case 'DarkAverted':
      case 'GoldenAverted':
        newWeights[drive] = (newWeights[drive] ?? 0) - 0.02;
        newFixation[drive] = Math.min(1, (newFixation[drive] ?? 0) + 0.03);
        break;
      case 'HealthyBalanced':
        newWeights[drive] = (newWeights[drive] ?? 0) + 0.01;
        newFixation[drive] = Math.max(0, (newFixation[drive] ?? 0) - 0.02);
        break;
    }
  }

  return { weights: newWeights, fixationRisk: newFixation };
}

/**
 * Look up a codex entry string for the given encounter.
 * Searches the EncounterRegistry for a matching encounter by line and stage,
 * then returns its narrative.codexEntry if present.
 */
function lookupCodexEntry(encounter: ScheduledEncounter): string | null {
  if (encounter.codexEntry) return encounter.codexEntry;

  const line = encounter.targetLines[0];
  if (!line) return null;

  // Search registered encounters for one matching this line and stage
  for (const [, spec] of EncounterRegistry.all()) {
    if (spec.stage === encounter.stage && spec.lines.includes(line)) {
      if (spec.narrative?.codexEntry) return spec.narrative.codexEntry;
    }
  }

  return null;
}
