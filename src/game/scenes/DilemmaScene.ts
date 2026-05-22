/**
 * DilemmaScene — Scenario-Choice encounters.
 * Shows a scenario narrative with choice buttons; maps choices to PlayerResponse.
 */
import Phaser from 'phaser';
import { SceneKeys } from '../keys.js';
import type { EncounterSpec } from '@core/domain/Encounter.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { processOutcome } from '@core/engines/ConsequenceEngine.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';
import { mapChoiceToResponse } from '../logic/dilemmaMapping.js';

export { mapChoiceToResponse } from '../logic/dilemmaMapping.js';

export interface DilemmaChoice {
  readonly id: string;
  readonly text: string;
}

export class DilemmaScene extends Phaser.Scene {
  private encounter!: EncounterSpec;

  constructor() {
    super({ key: SceneKeys.Dilemma });
  }

  create(data: { encounter: EncounterSpec }): void {
    this.encounter = data.encounter;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0f0a14);

    // Get scenario content from FallbackProvider
    const line = this.encounter.lines[0] ?? 'Moral';
    const fallback = getFallback('ScenarioChoice', line, this.encounter.stage);

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
        fontSize: '16px', color: '#ffcc88', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 100 },
      }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.onChoice(option))
        .on('pointerover', () => btn.setColor('#ffeeaa'))
        .on('pointerout', () => btn.setColor('#ffcc88'));
    });
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
      fontSize: '16px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Map choice to PlayerResponse and produce ConsequenceRecord
    const response = mapChoiceToResponse(choice.id, this.encounter.id);
    const scheduled: ScheduledEncounter = {
      id: this.encounter.id,
      moduleRef: this.encounter.id,
      modality: this.encounter.modality ?? 'ScenarioChoice',
      targetLines: [...this.encounter.lines],
      stage: this.encounter.stage,
      holonSource: this.encounter.id,
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'peak',
      priority: 1,
      driveTarget: null,
      executionMode: 'capacity',
    };
    const record: ConsequenceRecord = processOutcome(scheduled, response, Date.now());

    this.time.delayedCall(2000, () => {
      this.events.emit('encounter_done', { record });
    });
  }
}
