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
import { AgenticOrchestrator, type AgenticUIHandler } from '@core/assessments/AgenticOrchestrator.js';
import type { AskUserQuestionResult } from '@core/assessments/agentTypes.js';
import { LLMDialogueRenderer } from './renderers/LLMDialogueRenderer.js';

export interface AssessmentSceneData {
  readonly module: StageAssessment;
  readonly mode: ModuleExecutionMode;
  readonly modality?: Modality;
  readonly encounter?: ScheduledEncounter;
  readonly onComplete?: (result: AssessmentResult, narrativeSummary: string) => void;
}

export class AssessmentScene extends Phaser.Scene {
  private module!: StageAssessment;
  private mode!: ModuleExecutionMode;
  private onComplete?: (result: AssessmentResult, narrativeSummary: string) => void;
  private encounter!: ScheduledEncounter;

  // Active UI renderer
  private currentRenderer: LLMDialogueRenderer | null = null;

  constructor() {
    super({ key: SceneKeys.Assessment });
  }

  create(data: AssessmentSceneData): void {
    this.module = data.module;
    this.mode = data.mode;
    this.onComplete = data.onComplete;
    this.currentRenderer = null;

    this.cameras.main.setBackgroundColor(0x05070b);

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

    // 2. Fetch dependencies from Phaser registry
    const sig = this.registry.get(RegistryKeys.Significator) as Significator;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState;
    const history = (this.registry.get('recent_consequences') as ConsequenceRecord[] | undefined) ?? [];
    const moduleRegistry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;

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
        return new Promise<AskUserQuestionResult>((resolve) => {
          if (this.currentRenderer) {
            this.currentRenderer.destroy();
          }
          const renderer = new LLMDialogueRenderer(this, params, (res) => {
            renderer.destroy();
            this.currentRenderer = null;
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
      // Update registries with mutated states from the orchestrator
      this.registry.set(RegistryKeys.Significator, outcome.updatedSig);
      this.registry.set(RegistryKeys.WorldState, outcome.updatedWorld);
      this.registry.set('recent_consequences', [...history, outcome.consequenceRecord]);

      // Save states
      saveRepo?.saveProfile(outcome.updatedSig);

      // Emit lifecycle events
      if (eventBus) {
        eventBus.emit('module_lifecycle_scored', {
          module: { line: outcome.finalResult.line, stage: outcome.finalResult.stage },
          result: outcome.finalResult
        });
        eventBus.emit('encounter_completed', { record: outcome.consequenceRecord });
      }

      // Finish assessment scene
      this.events.emit('assessment_done', { result: outcome.finalResult });

      if (this.onComplete) {
        this.onComplete(outcome.finalResult, outcome.narrativeSummary);
      }
    }).catch((err) => {
      console.error('Agentic Orchestrator failed:', err);
      this.scene.start(SceneKeys.World);
    });
  }

  destroy(): void {
    if (this.currentRenderer) {
      this.currentRenderer.destroy();
      this.currentRenderer = null;
    }
  }
}
