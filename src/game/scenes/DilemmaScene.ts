/**
 * DilemmaScene — Scenario-Choice encounters.
 * Shows a scenario narrative with choice buttons; maps choices to PlayerResponse.
 *
 * T-0.6 (HS-08 fix): now calls applyConsequences to update the Significator
 * (was only calling processOutcome, leaving Significator unchanged).
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { processOutcome, applyConsequences } from '@core/engines/ConsequenceEngine.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { Significator } from '@core/domain/Significator.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';
import { mapChoiceToResponse } from '../logic/dilemmaMapping.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export { mapChoiceToResponse } from '../logic/dilemmaMapping.js';

export interface DilemmaChoice {
  readonly id: string;
  readonly text: string;
}

export class DilemmaScene extends Phaser.Scene {
  private encounter!: ScheduledEncounter;

  constructor() {
    super({ key: SceneKeys.Dilemma });
  }

  create(data: { encounter: ScheduledEncounter }): void {
    this.encounter = data.encounter;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0f0a14);
    fadeIn(this, 400);

    // Get scenario content from FallbackProvider (with altitude-conditional reframe)
    const line = (this.encounter.targetLines[0] ?? 'Moral') as Line;
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const playerStage = sig?.currentStage ?? this.encounter.stage;
    const fallback = getFallback('ScenarioChoice', line, this.encounter.stage as Stage, playerStage as Stage);

    const scenario = fallback.scenario ?? 'A crossroads appears. Each path carries weight.';
    const options: DilemmaChoice[] = fallback.options
      ? fallback.options.map(o => ({ id: o.id, text: o.text }))
      : [
          { id: 'path_a', text: 'Take the direct route forward' },
          { id: 'path_b', text: 'Seek an alternative approach' },
          { id: 'path_c', text: 'Wait and observe before choosing' },
        ];

    // Title
    this.add.text(width / 2, 60, 'Dilemma', {
      fontSize: '28px', color: '#ffcc88', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Scenario text
    this.add.text(width / 2, height / 2 - 140, scenario, {
      fontSize: '18px', color: '#dddde8', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Choice buttons
    options.forEach((option, i) => {
      const y = height / 2 + 40 + i * 70;
      const btn = this.add.text(width / 2, y, `[ ${option.text} ]`, {
        fontSize: '24px', color: '#ffcc88', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 100 },
      }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.onChoice(option))
        .on('pointerover', () => btn.setColor('#ffeeaa'))
        .on('pointerout', () => btn.setColor('#ffcc88'));
    });

    // Back button
    this.add.text(60, height - 50, '← Back', {
      fontSize: '24px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setInteractive().on('pointerdown', () => fadeToScene(this, SceneKeys.World));
  }

  private onChoice(choice: DilemmaChoice): void {
    const { width, height } = this.scale;

    // Brief consequence animation
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(0x0f0a14);

    this.add.text(width / 2, height / 2 - 40, `You chose: ${choice.text}`, {
      fontSize: '18px', color: '#ffcc88', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'The consequences ripple outward...', {
      fontSize: '24px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Map choice to PlayerResponse and produce ConsequenceRecord
    const response = mapChoiceToResponse(choice.id, this.encounter.id);
    const record: ConsequenceRecord = processOutcome(this.encounter, response, Date.now());

    // T-0.6 (HS-08 fix): apply consequences to update the Significator.
    // Without this, Dilemma encounters don't update altitudes/drives/shadows/polarity.
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState | undefined;
    if (sig && world) {
      const { sig: newSig, world: newWorld } = applyConsequences(sig, world, record, this.encounter);
      this.registry.set(RegistryKeys.Significator, newSig);
      this.registry.set(RegistryKeys.WorldState, newWorld);
    }

    // P0-4: Store the PlayerResponse + encounter so WorldScene can call
    // applyResponseOnly() when the player returns. Without this, UserMatrixModel
    // + transformation state are never updated in the Phaser Dilemma flow.
    this.registry.set(RegistryKeys.LastPlayerResponse, response);
    this.registry.set(RegistryKeys.LastEncounter, this.encounter);

    this.time.delayedCall(2000, () => {
      this.events.emit('encounter_done', { record });
      fadeToScene(this, SceneKeys.World);
    });
  }
}
