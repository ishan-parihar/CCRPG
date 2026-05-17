import type { NBackResult } from '@core/usecases/NBackTask.js';
import type { StroopOutcome } from '@core/usecases/StroopTask.js';
import type { TaskSlug } from '@core/domain/PlayerProfile.js';

/**
 * Strongly-typed event payloads shared between BattleScene and
 * UIOverlayScene. Phaser's emitter is untyped, so we centralize the
 * shapes here to keep both ends honest.
 */

export interface NBackRequestPayload {
  readonly spellId: string;
  readonly spellName: string;
  readonly n: number;
  readonly trials: number;
  readonly tint: number;
  readonly stimulusDurationMs: number;
  readonly interStimulusMs: number;
}

export interface NBackResolvedPayload {
  readonly spellId: string;
  readonly score: NBackResult;
  readonly damageMultiplier: number;
}

export interface StroopRequestPayload {
  readonly windowMs: number;
}

export interface StroopResolvedPayload {
  readonly outcome: StroopOutcome;
  readonly damageMultiplier: number;
  readonly quality: StroopOutcome['quality'];
}

/** Generic cognitive task overlay request/response. */
export interface CognitiveTaskRequestPayload {
  readonly taskSlug: TaskSlug;
  readonly level: number;
  readonly params?: Record<string, unknown>;
}

export interface CognitiveTaskResolvedPayload {
  readonly taskSlug: TaskSlug;
  readonly accuracy: number;
  readonly reactionMs: number;
  readonly damageMultiplier: number;
}
