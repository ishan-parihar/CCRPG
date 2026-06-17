import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type {
  StageAssessment,
  AssessmentResult,
  ModuleExecutionMode,
} from '@core/assessments/types.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { Significator } from '@core/domain/Significator.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { SaveRepository } from '@infra/persistence/SaveRepository.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { Modality } from '@core/domain/enums.js';
import type { Stage } from '@core/domain/Stage.js';
import type { Line } from '@core/domain/Line.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '@core/assessments/AgenticOrchestrator.js';
import type { AskUserQuestionResult } from '@core/assessments/agentTypes.js';
import { LLMDialogueRenderer } from './renderers/LLMDialogueRenderer.js';
import { createSignificator } from '@core/domain/Significator.js';
import { createInitialWorldState } from '@core/engines/CandidateGeneration.js';
import holonsJson from '@core/data/red-layer-holons.json';
import type { Holon } from '@core/domain/Holon.js';
import { createLoadingIndicator } from '../ui/SceneTransitions.js';

export interface AssessmentSceneData {
  readonly module: StageAssessment;
  readonly mode: ModuleExecutionMode;
  readonly modality?: Modality;
  readonly encounter?: ScheduledEncounter;
  readonly onComplete?: (result: AssessmentResult, narrativeSummary: string) => void;
}

/**
 * Create a stub Significator for onboarding — all lines at the module's stage.
 * Used when AssessmentScene is launched during onboarding before a real Significator exists.
 */
function createStubSignificator(line: Line, stage: Stage): Significator {
  const altitudes: Record<Line, Stage> = {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
  return createSignificator(`onboarding-${line}`, altitudes, stage);
}

export class AssessmentScene extends Phaser.Scene {
  private module!: StageAssessment;
  private mode!: ModuleExecutionMode;
  private onComplete?: (result: AssessmentResult, narrativeSummary: string) => void;
  private encounter!: ScheduledEncounter;
  private currentRenderer: LLMDialogueRenderer | null = null;
  private loadingIndicator: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: SceneKeys.Assessment });
  }

  create(data: AssessmentSceneData): void {
    this.module = data.module;
    this.mode = data.mode;
    this.onComplete = data.onComplete;
    this.currentRenderer = null;

    this.cameras.main.setBackgroundColor(0x05070b);

    // Show animated loading indicator
    this.showLoading('Preparing encounter');

    // 1. Resolve or stub ScheduledEncounter
    if (data.encounter) {
      this.encounter = data.encounter;
    } else {
      this.encounter = {
        id: `practice-${Date.now()}`,
        moduleRef: `${this.module.line}:${this.module.stage}`,
        modality: data.modality ?? 'LanguageReflective',
        targetLines: [this.module.line],
        stage: this.module.stage as Stage,
        holonSource: '',
        shadowTarget: null,
        polarityMode: 'Exploring',
        difficulty: 0.5,
        sessionPosition: 'peak',
        priority: 1.0,
        driveTarget: null,
        executionMode: this.mode,
      };
    }

    // 2. Fetch dependencies from Phaser registry — with null guards for onboarding
    let sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    let world = this.registry.get(RegistryKeys.WorldState) as WorldState | undefined;
    const history = (this.registry.get(RegistryKeys.RecentConsequences) as ConsequenceRecord[] | undefined) ?? [];
    const moduleRegistry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;

    // During onboarding, Significator/WorldState don't exist yet — create stubs
    if (!sig) {
      sig = createStubSignificator(this.module.line, this.module.stage as Stage);
    }
    if (!world) {
      world = createInitialWorldState(holonsJson as unknown as Holon[]);
    }

    // 3. Build ConceptDraftIndex dynamically from the registry
    const conceptModules: Record<string, any> = {};
    if (moduleRegistry) {
      for (const mod of moduleRegistry.getAll()) {
        const key = `${mod.line.toLowerCase()}:${mod.stage.toLowerCase()}`;
        conceptModules[key] = {
          line: mod.line,
          stage: mod.stage,
          title: `${mod.line} ${mod.stage} Module`,
          modalities: mod.tasks.map(t => t.type === 'llm_dialogue' ? 'LanguageReflective' as const : 'Deterministic' as const),
        };
      }
    }
    const conceptIndex = { modules: conceptModules };

    // 4. Implement AgenticUIHandler to present MCQs in Phaser
    const uiHandler: AgenticUIHandler = {
      askUser: (params) => {
        // Remove loading indicator when question arrives
        this.hideLoading();
        return new Promise<AskUserQuestionResult>((resolve) => {
          if (this.currentRenderer) {
            this.currentRenderer.destroy();
          }
          const renderer = new LLMDialogueRenderer(this, params, (res) => {
            renderer.destroy();
            this.currentRenderer = null;
            // Show "Thinking..." while LLM processes the answer
            this.showLoading('Thinking');
            resolve(res);
          });
          this.currentRenderer = renderer;
          renderer.create();
        });
      }
    };

    // 5. Instantiate AgenticOrchestrator
    const orchestrator = new AgenticOrchestrator({
      encounter: this.encounter,
      significator: sig,
      world,
      history,
      conceptIndex,
      uiHandler,
    });

    // 6. Run the agentic loop asynchronously
    orchestrator.run().then((outcome) => {
      this.hideLoading();

      // Update registries with mutated states from the orchestrator
      this.registry.set(RegistryKeys.Significator, outcome.updatedSig);
      this.registry.set(RegistryKeys.WorldState, outcome.updatedWorld);
      this.registry.set(RegistryKeys.RecentConsequences, [...history, outcome.consequenceRecord]);

      // Save states (with error handling)
      saveRepo?.saveProfile(outcome.updatedSig).catch(err =>
        console.warn('Failed to save profile:', err)
      );
      saveRepo?.saveWorldState(outcome.updatedWorld).catch(err =>
        console.warn('Failed to save world state:', err)
      );

      // Emit lifecycle events
      if (eventBus) {
        eventBus.emit('module_lifecycle_scored', {
          module: { line: outcome.finalResult.line, stage: outcome.finalResult.stage },
          result: outcome.finalResult
        });
        eventBus.emit('encounter_completed', { record: outcome.consequenceRecord });
      }

      // Call onComplete first (this handles scene transitions in the caller)
      if (this.onComplete) {
        this.onComplete(outcome.finalResult, outcome.narrativeSummary);
      }

      // Then emit the event for any listeners (EncounterScene uses this)
      this.events.emit('assessment_done', { result: outcome.finalResult });
    }).catch((err) => {
      console.error('Agentic Orchestrator failed:', err);
      this.hideLoading();

      // Emit the event so EncounterScene can clean up
      this.events.emit('assessment_done', { result: null });

      // If there's an onComplete callback, call it with a fallback result
      if (this.onComplete) {
        const fallbackResult: AssessmentResult = {
          line: this.module.line,
          stage: this.module.stage as Stage,
          passed: true,
          confidence: 0.3,
          dimensions: {
            accuracy: 0.5, response_time: 0.5, consistency: 0.5, depth: 0.5,
            self_correction: 0.5, complexity_handled: 0.5, transfer: 0.5,
            metacognition: 0.5, coherence: 0.5, integration: 0.5,
          },
          rawTrials: [],
        };
        this.onComplete(fallbackResult, 'The encounter concluded without full resolution.');
      }
    });
  }

  /** Show animated loading indicator with a message */
  private showLoading(message: string): void {
    this.hideLoading();
    const { width, height } = this.scale;
    this.loadingIndicator = createLoadingIndicator(this, width / 2, height / 2, message);
  }

  /** Remove the loading indicator */
  private hideLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.destroy();
      this.loadingIndicator = null;
    }
  }

  destroy(): void {
    if (this.currentRenderer) {
      this.currentRenderer.destroy();
      this.currentRenderer = null;
    }
    this.hideLoading();
  }
}
