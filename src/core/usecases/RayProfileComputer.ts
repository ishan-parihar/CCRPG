/**
 * RayProfileComputer — computes ray activation from line altitudes.
 * Per foundations/06 §7.5: each ray's activation reflects how developed
 * the corresponding stage is. Violet = integration quality (low variance).
 */
import type { Line } from '../domain/Line.js';
import type { Ray } from '../domain/Ray.js';
import type { Stage } from '../domain/Stage.js';
import { ALL_LINES } from '../domain/Line.js';
import { ALL_RAYS, STAGE_RAY_MAP } from '../domain/Ray.js';
import { ALL_STAGES, stageOrdinal } from '../domain/Stage.js';

/**
 * Compute the ray profile from current line altitudes.
 * Each ray's activation = average normalized altitude of lines whose stage maps to that ray.
 * Violet = 1 - normalized_variance(Red..Indigo) — integration quality.
 */
export function computeRayProfile(altitudes: Record<Line, Stage>): Record<Ray, number> {
  // Compute per-ray activation: for each ray, average the ordinals of lines at stages that map to it
  const rayScores: Record<Ray, number[]> = {
    Red: [], Orange: [], Yellow: [], Green: [], Blue: [], Indigo: [], Violet: [],
  };

  for (const line of ALL_LINES) {
    const ord = stageOrdinal(altitudes[line]);
    // Each line contributes to the ray of its current altitude
    const ray = STAGE_RAY_MAP[altitudes[line]];
    rayScores[ray].push(ord);
  }

  // Compute activation: for each ray, how many lines have reached or passed the stage(s) that map to it
  const profile: Record<Ray, number> = { Red: 0, Orange: 0, Yellow: 0, Green: 0, Blue: 0, Indigo: 0, Violet: 0 };

  // Stage ordinals that map to each ray
  const rayStageOrdinals: Record<Ray, number[]> = { Red: [], Orange: [], Yellow: [], Green: [], Blue: [], Indigo: [], Violet: [] };
  for (const stage of ALL_STAGES) {
    const ray = STAGE_RAY_MAP[stage];
    rayStageOrdinals[ray].push(stageOrdinal(stage));
  }

  for (const ray of ALL_RAYS) {
    if (ray === 'Violet') continue;
    const minOrdForRay = Math.min(...rayStageOrdinals[ray]);
    // Activation = fraction of lines that have reached at least this ray's stage
    let count = 0;
    for (const line of ALL_LINES) {
      if (stageOrdinal(altitudes[line]) >= minOrdForRay) count++;
    }
    profile[ray] = count / ALL_LINES.length;
  }

  // Violet = integration quality: 1 - normalized variance of the other 6 rays
  const nonViolet = ALL_RAYS.filter(r => r !== 'Violet').map(r => profile[r]);
  const mean = nonViolet.reduce((a, b) => a + b, 0) / nonViolet.length;
  const variance = nonViolet.reduce((a, v) => a + (v - mean) ** 2, 0) / nonViolet.length;
  // Max possible variance is 0.25 (half at 0, half at 1), normalize to 0-1
  profile.Violet = Math.max(0, 1 - variance / 0.25);

  return profile;
}
