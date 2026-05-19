/**
 * EncounterScene — routing layer that receives an encounter spec and
 * dispatches to the appropriate sub-scene based on modality.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { EncounterSpec } from '@core/domain/Encounter.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { routeModality } from '../logic/encounterRouting.js';

export { routeModality } from '../logic/encounterRouting.js';

export class EncounterScene extends Phaser.Scene {
  private encounter!: EncounterSpec;

  constructor() {
    super({ key: SceneKeys.Encounter });
  }

  create(data: { encounter: EncounterSpec }): void {
    this.encounter = data.encounter;

    if (!this.encounter || !this.encounter.modality) {
      // No valid encounter data - return to world
      this.scene.start(SceneKeys.World);
      return;
    }

    const targetScene = routeModality(this.encounter.modality);

    // Launch the target sub-scene and listen for its completion
    this.scene.launch(targetScene, { encounter: this.encounter });
    this.scene.pause();

    const target = this.scene.get(targetScene);
    target.events.once('encounter_done', (result: { record?: ConsequenceRecord }) => {
      this.scene.stop(targetScene);
      this.scene.resume();
      this.onSubSceneComplete(result.record);
    });
  }

  private onSubSceneComplete(record?: ConsequenceRecord): void {
    // Emit encounter_completed on the core EventBus if available
    if (record) {
      const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;
      if (eventBus) {
        eventBus.emit('encounter_completed', { record });
      }
    }

    // Return to WorldScene
    this.scene.start(SceneKeys.World);
  }
}
