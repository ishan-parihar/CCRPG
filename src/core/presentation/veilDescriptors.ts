/**
 * veilDescriptors — Veil-compliant qualitative descriptors for raw game state.
 *
 * CRITICAL CANON COMPLIANCE (AGENTS.md §5.4, foundations/20):
 * The player must NEVER see raw stage labels, drive percentages, the
 * 8×8 matrix, or assessment scores. Everything is qualitative felt-sense.
 *
 * This module is the SINGLE SOURCE OF TRUTH for Veil-compliant rendering.
 * Both the Svelte DOM shell and the Phaser canvas call these functions.
 * No raw number is ever shown to the player, anywhere, period.
 *
 * Extracted from MainMenuScene.drawProfileSummary() so the Svelte shell
 * can use the same descriptors without duplicating the logic.
 */

import type { Stage } from '../domain/Stage.js';
import type { Significator } from '../domain/Significator.js';

/** Qualitative aesthetic descriptor per stage. Never shows the stage name. */
export function describeStage(stage: Stage): string {
  const stageAesthetics: Record<Stage, string> = {
    Infrared: 'cave-dark, primal',
    Magenta: 'spirit-haunted, symbolic',
    Red: 'fortress-sharp, weapon-walls',
    Amber: 'cathedral-ordered, gold-stone',
    Orange: 'mechanism-precise, steel-glass',
    Green: 'garden-lush, earth-toned',
    Turquoise: 'crystalline, translucent',
    White: 'luminous silence, spacious',
  };
  return stageAesthetics[stage] ?? 'shifting, becoming';
}

/** Qualitative descriptor for drive weight spread. Never shows percentages. */
export function describeDriveSpread(weights: { readonly [k: string]: number }): string {
  const values = Object.values(weights);
  if (values.length === 0) return 'Your tendencies are yet unknown.';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  if (spread < 0.1) {
    return 'Your tendencies move in balance.';
  } else if (spread < 0.25) {
    return 'One tendency pulls stronger than the others.';
  } else {
    return 'A dominant pattern shapes how you meet the world.';
  }
}

/** Qualitative descriptor for encounter count. Never shows the raw number. */
export function describeEncounterCount(n: number): string {
  if (n === 0) return 'Your path is yet to begin.';
  if (n < 10) return 'You have tasted the first edges.';
  if (n < 30) return 'Your path deepens with each step.';
  return 'The shape of your journey grows clear.';
}

/** Qualitative descriptor for CCI (Cumulative Consciousness Index). */
export function describeCCI(cci: number): string {
  if (cci < 0.15) return 'The seed of integration rests in darkness.';
  if (cci < 0.35) return 'First shoots of integration break the surface.';
  if (cci < 0.55) return 'Integration takes root across many capacities.';
  if (cci < 0.75) return 'A mature integration bears fruit.';
  if (cci < 0.9) return 'Integration ripens toward harvest.';
  return 'The harvest approaches — integration nears wholeness.';
}

/** Qualitative descriptor for session count. */
export function describeSessionCount(n: number): string {
  if (n === 0) return 'You have not yet entered the world.';
  if (n < 5) return 'You are finding your footing.';
  if (n < 20) return 'Your presence in the world has deepened.';
  if (n < 50) return 'You walk this world with familiarity.';
  return 'You are a seasoned traveler here.';
}

/**
 * Full Veil-compliant profile summary for a Significator.
 * Returns an object with qualitative descriptors only — never raw numbers.
 */
export function describeSignificator(sig: Significator): {
  readonly stageAesthetic: string;
  readonly driveDescriptor: string;
  readonly encounterDescriptor: string;
  readonly sessionDescriptor: string;
} {
  return {
    stageAesthetic: `The world feels ${describeStage(sig.currentStage)}.`,
    driveDescriptor: describeDriveSpread(sig.drives.weights),
    encounterDescriptor: describeEncounterCount(sig.totalEncounters),
    sessionDescriptor: describeSessionCount(sig.totalSessions),
  };
}
