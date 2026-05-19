/**
 * CandidateGeneration — filters eligible encounters from the world state.
 * Spec: foundations/24 §2
 */
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { Modality } from '../domain/enums.js';
import type { Holon } from '../domain/Holon.js';
import type { Significator } from '../domain/Significator.js';

export interface EncounterCandidate {
  readonly moduleRef: string;
  readonly line: Line;
  readonly stage: Stage;
  readonly modality: Modality;
  readonly holonId: string;
  readonly cooldownClear: boolean;
}

export interface WorldState {
  readonly holons: readonly Holon[];
  readonly recentEncounterIds: readonly string[];
  readonly cooldowns: Readonly<Record<string, number>>; // moduleRef → timestamp when available
}

/**
 * Generate all eligible encounter candidates given current significator and world state.
 * Filters by: layer-perception (stage ≤ current+1), holon active, cooldown clear.
 */
export function generateCandidates(sig: Significator, world: WorldState, now: number): EncounterCandidate[] {
  const maxStageOrd = stageOrdinal(sig.currentStage) + 1; // can perceive one stage above
  const candidates: EncounterCandidate[] = [];

  for (const holon of world.holons) {
    if (!holon.active) continue;
    if (stageOrdinal(holon.stage) > maxStageOrd) continue;

    // Generate one candidate per eligible modality for this holon's line×stage
    const lineAltOrd = stageOrdinal(sig.altitudes[holon.line]);
    // Only offer encounters at or below player's altitude+1 for that line
    if (stageOrdinal(holon.stage) > lineAltOrd + 1) continue;

    const moduleRef = `${holon.line}/${holon.stage}`;
    const cooldownTs = world.cooldowns[moduleRef] ?? 0;
    const cooldownClear = now >= cooldownTs;

    candidates.push({
      moduleRef,
      line: holon.line,
      stage: holon.stage,
      modality: 'ImmersiveRPG', // default; scheduler diversifies
      holonId: holon.id,
      cooldownClear,
    });
  }

  return candidates.filter(c => c.cooldownClear);
}
