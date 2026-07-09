/**
 * LayerRenderer — renders the 8 perceptual layers in the CLI.
 * Spec: foundations/21 §2 (the layered-world incarnation).
 *
 * The 8 layers correspond to the 8 stages of consciousness.
 * Each layer shows its perceptual state: active, bleed-through,
 * horizon-impression, or dormant.
 */

import chalk from 'chalk';
import type { Significator } from '../core/domain/Significator.js';
import type { Stage } from '../core/domain/Stage.js';
import { ALL_STAGES, stageOrdinal } from '../core/domain/Stage.js';

const LAYER_AESTHETICS: Readonly<Record<Stage, string>> = {
  Infrared: 'cave-dark, primal',
  Magenta: 'dream-saturated, symbol-rich',
  Red: 'fortress-sharp, weapon-walls',
  Amber: 'cathedral-ordered, gold-stone',
  Orange: 'mechanism-precise, steel-glass',
  Green: 'garden-lush, earth-toned',
  Turquoise: 'crystalline, translucent',
  White: 'luminous silence, spacious',
};

function layerColor(stage: Stage): (text: string) => string {
  const colors: Record<Stage, (text: string) => string> = {
    Infrared: chalk.hex('#8B0000'),
    Magenta: chalk.hex('#BA55D3'),
    Red: chalk.hex('#FF0000'),
    Amber: chalk.hex('#FF8C00'),
    Orange: chalk.hex('#FFA500'),
    Green: chalk.hex('#00C853'),
    Turquoise: chalk.hex('#00CED1'),
    White: chalk.hex('#E0E0E0'),
  };
  return colors[stage];
}

function bleedThroughStages(bleedThrough: readonly string[]): Set<Stage> {
  const stages = new Set<Stage>();
  for (const key of bleedThrough) {
    const parts = key.split(':');
    const stage = parts[1] as Stage | undefined;
    if (stage && (ALL_STAGES as readonly string[]).includes(stage)) {
      stages.add(stage);
    }
  }
  return stages;
}

function bleedThroughCounts(bleedThrough: readonly string[]): Map<Stage, number> {
  const counts = new Map<Stage, number>();
  for (const key of bleedThrough) {
    const parts = key.split(':');
    const stage = parts[1] as Stage | undefined;
    if (stage && (ALL_STAGES as readonly string[]).includes(stage)) {
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }
  }
  return counts;
}

interface LayerState {
  stage: Stage;
  status: 'active' | 'bleed-through' | 'horizon' | 'dormant';
  bleedCount: number;
}

function computeLayerStates(
  sig: Significator,
  bleedThrough: readonly string[],
): LayerState[] {
  const currentIdx = stageOrdinal(sig.currentStage);
  const btStages = bleedThroughStages(bleedThrough);
  const btCounts = bleedThroughCounts(bleedThrough);

  return ALL_STAGES.map((stage: Stage) => {
    const idx = stageOrdinal(stage);
    let status: LayerState['status'];

    if (stage === sig.currentStage) {
      status = 'active';
    } else if (idx < currentIdx && btStages.has(stage)) {
      status = 'bleed-through';
    } else if (idx === currentIdx + 1) {
      status = 'horizon';
    } else {
      status = 'dormant';
    }

    return { stage, status, bleedCount: btCounts.get(stage) ?? 0 };
  });
}

/**
 * Render the 8 perceptual layers as a formatted string block.
 *
 * @param sig - Current Significator state
 * @param bleedThrough - Cell keys from detectBleedThrough() (e.g. `["Cognitive:Red"]`)
 * @returns Formatted string ready for console.log
 */
export function renderLayers(
  sig: Significator,
  bleedThrough: readonly string[],
): string {
  const layers = computeLayerStates(sig, bleedThrough);
  const lines: string[] = [];

  lines.push(chalk.bold.cyan('PERCEPTUAL LAYERS'));

  for (const layer of layers) {
    const color = layerColor(layer.stage);
    const aesthetic = LAYER_AESTHETICS[layer.stage];
    // T-3.4 (Veil compliance): show the aesthetic descriptor, not the stage name.
    const label = aesthetic.padEnd(24);

    switch (layer.status) {
      case 'active':
        lines.push(
          `  ${chalk.green('●')} ${color(label)} ${chalk.green('active')}`,
        );
        break;

      case 'bleed-through': {
        lines.push(
          `  ${chalk.yellow('⚡')} ${color(label)} ${chalk.yellow('bleed-through')}`,
        );
        break;
      }

      case 'horizon':
        lines.push(
          `  ${chalk.cyan('◌')} ${color(label)} ${chalk.dim.cyan('horizon-impression')}`,
        );
        break;

      case 'dormant':
        lines.push(
          `  ${chalk.dim('○')} ${chalk.dim(label)} ${chalk.dim('dormant')}`,
        );
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Render a compact single-line layer summary.
 * Shows the active layer and any bleed-through layers inline.
 */
export function renderLayersCompact(
  sig: Significator,
  bleedThrough: readonly string[],
): string {
  const layers = computeLayerStates(sig, bleedThrough);
  const parts: string[] = [];

  for (const layer of layers) {
    const color = layerColor(layer.stage);
    const aesthetic = LAYER_AESTHETICS[layer.stage];
    // T-3.4 (Veil compliance): use aesthetic descriptor, not stage name.
    switch (layer.status) {
      case 'active':
        parts.push(chalk.green('●') + color(aesthetic));
        break;
      case 'bleed-through':
        parts.push(chalk.yellow('⚡') + color(aesthetic));
        break;
      case 'horizon':
        parts.push(chalk.dim.cyan('◌') + chalk.dim(aesthetic));
        break;
      default:
        break;
    }
  }

  return parts.join(' ');
}
