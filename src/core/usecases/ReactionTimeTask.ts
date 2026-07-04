/**
 * ReactionTimeTask — simple reaction time measurement.
 * Calibrated to the player's baseline for somatic line.
 */

export interface ReactionTimeTrial {
  /** Delay before stimulus appears (ms). */
  readonly foreperiodMs: number;
}

export interface ReactionTimeResponse {
  readonly reactionMs: number;
  /** True if player responded before stimulus (anticipation error). */
  readonly anticipated: boolean;
}

export interface ReactionTimeResult {
  readonly valid: boolean;
  readonly reactionMs: number;
  readonly quality: 'fast' | 'normal' | 'slow';
}

export function generateReactionTimeTrial(
  rng: () => number = Math.random,
  minForeperiod: number = 500,
  maxForeperiod: number = 2000,
): ReactionTimeTrial {
  const foreperiodMs = minForeperiod + rng() * (maxForeperiod - minForeperiod);
  return { foreperiodMs: Math.round(foreperiodMs) };
}

export function scoreReactionTime(
  response: ReactionTimeResponse,
  baselineMs: number = 300,
): ReactionTimeResult {
  if (response.anticipated) {
    return { valid: false, reactionMs: response.reactionMs, quality: 'fast' };
  }
  let quality: ReactionTimeResult['quality'];
  if (response.reactionMs <= baselineMs) quality = 'fast';
  else if (response.reactionMs <= baselineMs * 2) quality = 'normal';
  else quality = 'slow';

  return { valid: true, reactionMs: response.reactionMs, quality };
}
