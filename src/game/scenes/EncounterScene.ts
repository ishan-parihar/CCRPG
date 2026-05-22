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
import type { Significator } from '@core/domain/Significator.js';
import type { Drive } from '@core/domain/Drive.js';
import type { DriveDirectionality } from '@core/domain/enums.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '@core/engines/ConsequenceEngine.js';
import { narrateConsequence } from '../systems/ConsequenceNarrator.js';
import { accumulateTension, type PESTLETension } from '@core/engines/MacroCatalystEngine.js';
import { detectThreshold } from '@core/engines/TransformationDetector.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import type { SaveRepository } from '@infra/persistence/SaveRepository.js';

export { routeModality } from '../logic/encounterRouting.js';

const PESTLE_DIMS: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];

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
    const now = Date.now();
    const sig = this.registry.get(RegistryKeys.Significator) as Significator;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState;
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;

    // Build minimal PlayerResponse from AssessmentResult
    const dir: DriveDirectionality = result.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection: result.passed ? 'Radiative' : 'Diffuse',
      driveDirectionality: { Agency: dir, Communion: dir, Eros: dir, Agape: dir } as Record<Drive, DriveDirectionality>,
      stageOrientation: result.passed ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: 'Ambivalent',
      shadowSurfaced: result.passed ? null : 'DarkAddiction',
      shadowResolvedId: null,
      narrativeSummary: '',
    };

    // Process outcome and apply consequences
    const record = processOutcome(this.encounter, response, now);
    const updated = applyConsequences(sig, world, record, this.encounter);

    // Accumulate PESTLE tension on a random dimension
    const dim = PESTLE_DIMS[Math.floor(Math.random() * PESTLE_DIMS.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );
    const updatedWorld = { ...updated.world, pestleTension: newTension } as WorldState;

    // Detect transformation threshold
    const transformation = detectThreshold(updated.sig);

    // Update registry
    this.registry.set(RegistryKeys.Significator, updated.sig);
    this.registry.set(RegistryKeys.WorldState, updatedWorld);

    // Persist
    saveRepo?.saveProfile(updated.sig);

    // Emit events
    if (eventBus) {
      const [line, stage] = this.encounter.moduleRef.split(':');
      eventBus.emit('module_lifecycle_scored', { module: { line, stage }, result });
      eventBus.emit('encounter_completed', { record });
      if (transformation) {
        eventBus.emit('transformation_triggered', { signal: transformation });
      }
    }

    const narration = narrateConsequence(this.encounter.modality, result.passed);
    this.scene.start(SceneKeys.World, { consequenceText: narration.text });
  }
}
