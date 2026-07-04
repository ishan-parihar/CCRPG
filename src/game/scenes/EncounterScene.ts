import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { AssessmentResult, ShadowAssessmentResult } from '@core/assessments/types.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { AssessmentSceneData } from '../assessments/AssessmentScene.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';
import type { Significator } from '@core/domain/Significator.js';
import type { Drive } from '@core/domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant } from '@core/domain/enums.js';
import { narrateConsequence } from '../systems/ConsequenceNarrator.js';
import { detectThreshold, advanceTransformation, recordKnotResolution, commitTransformation, type TransformationState } from '@core/engines/TransformationDetector.js';
import type { SessionState } from '@core/GameLoop.js';
import type { RecentEncounter } from '@core/engines/AutoModeStrategy.js';
import { fadeToScene } from '../ui/SceneTransitions.js';
import { toQualitativeFeedback, formatQualitativeFeedback } from '@infra/llm/QualitativeFeedback.js';

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
    // T-0.5 (HS-06 fix): read persisted counters from Significator instead
    // of constructing fresh state with all counters at 0 every encounter.
    const ts = sig.transformationPhase ?? 'idle';
    let transformationState: TransformationState = {
      phase: ts as TransformationState['phase'],
      targetStage: sig.transformationTargetStage ?? null,
      sessionsInPhase: sig.transformationSessionsInPhase ?? 0,
      knotsResolved: sig.transformationKnotsResolved ?? 0,
      totalKnots: sig.transformationTotalKnots ?? 0,
    };
    transformationState = advanceTransformation(transformationState, sig);

    // If shadow encounter was passed, record as knot resolution
    if (result.passed && this.encounter.executionMode === 'shadow') {
      transformationState = recordKnotResolution(transformationState);
    }

    // If transformation is complete, commit it
    if (transformationState.phase === 'complete') {
      const commit = commitTransformation(transformationState);
      if (commit.targetStage) {
        const updatedSig = {
          ...sig,
          currentStage: commit.targetStage,
          transformationPhase: 'idle' as const,
          transformationSessionsInPhase: 0,
          transformationKnotsResolved: 0,
          transformationTotalKnots: 0,
          transformationTargetStage: null,
        };
        this.registry.set(RegistryKeys.Significator, updatedSig);
        if (eventBus) {
          eventBus.emit('transformation_triggered', { signal: { targetStage: commit.targetStage, readiness: 1, convergentLines: [], blockers: [] } });
        }
      }
    } else {
      // Persist the full transformation state (phase + counters + target)
      const updatedSig = {
        ...sig,
        transformationPhase: transformationState.phase,
        transformationSessionsInPhase: transformationState.sessionsInPhase,
        transformationKnotsResolved: transformationState.knotsResolved,
        transformationTotalKnots: transformationState.totalKnots,
        transformationTargetStage: transformationState.targetStage,
      };
      this.registry.set(RegistryKeys.Significator, updatedSig);
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

    // UX-01: Build Veil-compliant qualitative feedback from drive-directionality
    // + shadow quadrant + pass/fail. Falls back to ConsequenceNarrator if no
    // drive signals are available (capacity encounters without shadow data).
    const qualitativeText = buildQualitativeFeedback(result, this.encounter);
    const narration = narrateConsequence(this.encounter.modality, result.passed);
    const consequenceText = qualitativeText
      || narrativeSummary
      || narration.text;
    fadeToScene(this, SceneKeys.World, { consequenceText });
  }
}

/**
 * Build Veil-compliant qualitative feedback from the AssessmentResult.
 * Returns null if the result lacks drive-health data (capacity encounters
 * without shadow signals) — caller falls back to ConsequenceNarrator.
 */
function buildQualitativeFeedback(
  result: AssessmentResult,
  encounter: ScheduledEncounter,
): string | null {
  // Only ShadowAssessmentResult carries driveHealth; cast to detect.
  const shadowResult = result as ShadowAssessmentResult;
  if (!shadowResult.driveHealth) return null;

  const drives: Drive[] = ['Agency', 'Communion', 'Eros', 'Agape'];
  const directionality: Record<Drive, DriveDirectionality> = {
    Agency: 'HealthyBalanced',
    Communion: 'HealthyBalanced',
    Eros: 'HealthyBalanced',
    Agape: 'HealthyBalanced',
  };

  // Map driveHealth {dark, golden} per drive to DriveDirectionality.
  // Threshold: > 0.5 in either domain flags that signal.
  let shadowSurfaced: ShadowQuadrant | null = null;
  for (const drive of drives) {
    const dh = shadowResult.driveHealth[drive.toLowerCase() as keyof typeof shadowResult.driveHealth];
    if (!dh) continue;
    if (dh.dark > 0.5) {
      directionality[drive] = 'DarkAddicted';
      if (!shadowSurfaced) shadowSurfaced = 'DarkAddiction';
    } else if (dh.golden > 0.5) {
      directionality[drive] = 'GoldenAddicted';
      if (!shadowSurfaced) shadowSurfaced = 'GoldenAddiction';
    }
  }

  // If encounter has an explicit shadowTarget, prefer that.
  if (encounter.shadowTarget) shadowSurfaced = encounter.shadowTarget;

  const fb = toQualitativeFeedback(directionality, shadowSurfaced, result.passed);
  return formatQualitativeFeedback(fb);
}
