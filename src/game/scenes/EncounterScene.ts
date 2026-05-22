/**
 * EncounterScene — receives a ScheduledEncounter and dispatches to AssessmentScene.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { AssessmentResult } from '@core/assessments/types.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { AssessmentSceneData } from '../assessments/AssessmentScene.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';

export { routeModality } from '../logic/encounterRouting.js';

export class EncounterScene extends Phaser.Scene {
  private encounter!: ScheduledEncounter;

  constructor() {
    super({ key: SceneKeys.Encounter });
  }

  create(data: { encounter: ScheduledEncounter }): void {
    this.encounter = data.encounter;

    if (!this.encounter) {
      this.scene.start(SceneKeys.World);
      return;
    }

    // Parse moduleRef (e.g. 'Cognitive:Red') into Line and Stage
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];

    // Look up the assessment module from registry
    const registry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    const module = registry?.get(line, stage);

    if (!module) {
      this.scene.start(SceneKeys.World);
      return;
    }

    // Launch AssessmentScene with the module and execution mode
    const sceneData: AssessmentSceneData = {
      module,
      mode: this.encounter.executionMode,
      onComplete: (result: AssessmentResult) => this.onAssessmentComplete(result),
    };

    this.scene.launch(SceneKeys.Assessment, sceneData);
    this.scene.pause();

    // Listen for completion
    const assessmentScene = this.scene.get(SceneKeys.Assessment);
    assessmentScene.events.once('assessment_done', () => {
      this.scene.stop(SceneKeys.Assessment);
      this.scene.resume();
    });
  }

  private onAssessmentComplete(result: AssessmentResult): void {
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;
    if (eventBus) {
      // Emit module_lifecycle_scored for the assessment pipeline
      const [line, stage] = this.encounter.moduleRef.split(':');
      eventBus.emit('module_lifecycle_scored', {
        module: { line, stage },
        result,
      });
    }
    this.scene.start(SceneKeys.World);
  }
}
