import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { AssessmentResult } from '@core/assessments/types.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { AssessmentSceneData } from '../assessments/AssessmentScene.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';
import type { Significator } from '@core/domain/Significator.js';
import { narrateConsequence } from '../systems/ConsequenceNarrator.js';
import { detectThreshold } from '@core/engines/TransformationDetector.js';

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
      modality: this.encounter.modality,
      encounter: this.encounter,
      onComplete: (result: AssessmentResult, narrativeSummary: string) => this.onAssessmentComplete(result, narrativeSummary),
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

  private onAssessmentComplete(result: AssessmentResult, narrativeSummary: string): void {
    const sig = this.registry.get(RegistryKeys.Significator) as Significator;
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;

    // Detect transformation threshold
    const transformation = detectThreshold(sig);
    if (transformation && eventBus) {
      eventBus.emit('transformation_triggered', { signal: transformation });
    }

    const narration = narrateConsequence(this.encounter.modality, result.passed);
    this.scene.start(SceneKeys.World, { consequenceText: narrativeSummary || narration.text });
  }
}
