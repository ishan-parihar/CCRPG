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
import { detectThreshold, advanceTransformation, recordKnotResolution, commitTransformation, type TransformationState } from '@core/engines/TransformationDetector.js';
import type { SessionState } from '@core/GameLoop.js';
import type { RecentEncounter } from '@core/engines/AutoModeStrategy.js';
import { fadeToScene } from '../ui/SceneTransitions.js';

export { routeModality } from '../logic/encounterRouting.js';

export class EncounterScene extends Phaser.Scene {
  private encounter!: ScheduledEncounter;

  constructor() {
    super({ key: SceneKeys.Encounter });
  }

  create(data: { encounter: ScheduledEncounter }): void {
    this.encounter = data.encounter;

    if (!this.encounter) {
      fadeToScene(this, SceneKeys.World);
      return;
    }

    // Parse moduleRef (e.g. 'Cognitive:Red') into Line and Stage
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];

    // Look up the assessment module from registry
    const registry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    const module = registry?.get(line, stage);

    if (!module) {
      fadeToScene(this, SceneKeys.World);
      return;
    }

    // Launch AssessmentScene with the module and execution mode
    const sceneData: AssessmentSceneData = {
      module,
      mode: this.encounter.executionMode,
      modality: this.encounter.modality,
      encounter: this.encounter,
      onComplete: (result: AssessmentResult, narrativeSummary: string) => {
        // Stop AssessmentScene and clean up
        this.scene.stop(SceneKeys.Assessment);
        // Handle the result
        this.onAssessmentComplete(result, narrativeSummary);
      },
    };

    this.scene.launch(SceneKeys.Assessment, sceneData);
    this.scene.pause();
  }

  private onAssessmentComplete(result: AssessmentResult, narrativeSummary: string): void {
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    if (!sig) {
      fadeToScene(this, SceneKeys.World);
      return;
    }
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;

    // Detect transformation threshold
    const transformation = detectThreshold(sig);
    if (transformation && eventBus) {
      eventBus.emit('transformation_triggered', { signal: transformation });
    }

    // Advance transformation state machine
    const ts = sig.transformationPhase ?? 'idle';
    let transformationState: TransformationState = { phase: ts as TransformationState['phase'], targetStage: null, sessionsInPhase: 0, knotsResolved: 0, totalKnots: 0 };
    transformationState = advanceTransformation(transformationState, sig);

    // If shadow encounter was passed, record as knot resolution
    if (result.passed && this.encounter.executionMode === 'shadow') {
      transformationState = recordKnotResolution(transformationState);
    }

    // If transformation is complete, commit it
    if (transformationState.phase === 'complete') {
      const commit = commitTransformation(transformationState);
      if (commit.targetStage) {
        const updatedSig = { ...sig, currentStage: commit.targetStage, transformationPhase: 'idle' as const };
        this.registry.set(RegistryKeys.Significator, updatedSig);
        if (eventBus) {
          eventBus.emit('transformation_triggered', { signal: { targetStage: commit.targetStage, readiness: 1, convergentLines: [], blockers: [] } });
        }
      }
    } else if (transformationState.phase !== ts) {
      // Phase changed — persist it
      this.registry.set(RegistryKeys.Significator, { ...sig, transformationPhase: transformationState.phase });
    }

    // Update session state for next WorldScene visit
    const sessionState = this.registry.get(RegistryKeys.SessionState) as SessionState | undefined;
    if (sessionState) {
      const newOutcome: RecentEncounter = {
        outcome: 'completed',
        quality: result.passed ? 0.7 : 0.3,
        mode: this.encounter.executionMode === 'shadow' ? 'shadow' : 'capacity',
        shadowIntegrated: result.passed && this.encounter.executionMode === 'shadow',
      };
      this.registry.set(RegistryKeys.SessionState, {
        ...sessionState,
        encountersSinceRefresh: sessionState.encountersSinceRefresh + 1,
        recentOutcomes: [newOutcome, ...sessionState.recentOutcomes].slice(0, 20),
      });
    }

    const narration = narrateConsequence(this.encounter.modality, result.passed);
    fadeToScene(this, SceneKeys.World, { consequenceText: narrativeSummary || narration.text });
  }
}
