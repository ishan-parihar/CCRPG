/**
 * AssessmentScene - Generic container scene for running any StageAssessment module.
 *
 * Receives a StageAssessment, iterates through its tasks, dispatches each to the
 * appropriate renderer based on TaskType, collects TrialResult[] per task, then
 * calls the core engine to produce an AssessmentResult.
 *
 * The scene does NOT know execution mode semantics (capacity vs shadow vs calibration).
 * Mode is passed through for the orchestrator but does not alter presentation logic here.
 */
import Phaser from 'phaser';
import { SceneKeys } from '../keys.js';
import type {
  StageAssessment,
  AssessmentTask,
  TrialResult,
  AssessmentResult,
  ModuleExecutionMode,
} from '@core/assessments/types.js';
import { runAssessment } from '@core/assessments/engine.js';
import { NBackRenderer } from './renderers/NBackRenderer.js';
import { ReactionTimeRenderer } from './renderers/ReactionTimeRenderer.js';
import { DilemmaRenderer } from './renderers/DilemmaRenderer.js';
import { ScenarioRenderer } from './renderers/ScenarioRenderer.js';
import { HoldRenderer } from './renderers/HoldRenderer.js';
import { PatternRenderer } from './renderers/PatternRenderer.js';
import { EmotionRenderer } from './renderers/EmotionRenderer.js';
import { LLMDialogueRenderer } from './renderers/LLMDialogueRenderer.js';

export interface AssessmentSceneData {
  readonly module: StageAssessment;
  readonly mode: ModuleExecutionMode;
  readonly onComplete?: (result: AssessmentResult) => void;
}

type RendererInstance = {
  create(): void;
  destroy(): void;
};

export class AssessmentScene extends Phaser.Scene {
  private module!: StageAssessment;
  private mode!: ModuleExecutionMode;
  private onComplete?: (result: AssessmentResult) => void;

  private currentTaskIndex = 0;
  private allTrials: TrialResult[] = [];
  private currentRenderer: RendererInstance | null = null;

  // Progress UI elements
  private progressText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressFill!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SceneKeys.Assessment });
  }

  create(data: AssessmentSceneData): void {
    this.module = data.module;
    this.mode = data.mode;
    this.onComplete = data.onComplete;
    this.currentTaskIndex = 0;
    this.allTrials = [];
    this.currentRenderer = null;

    const { width } = this.scale;
    this.cameras.main.setBackgroundColor(0x05070b);

    // Progress indicator: "Task X of Y" + thin bar at top
    this.progressText = this.add.text(width / 2, 28, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#8899aa',
    }).setOrigin(0.5).setDepth(100);

    const barWidth = width - 80;
    this.progressBar = this.add.rectangle(width / 2, 54, barWidth, 4, 0x1a2233)
      .setOrigin(0.5)
      .setDepth(100);
    this.progressFill = this.add.rectangle(
      width / 2 - barWidth / 2, 54, 0, 4, 0x4cc9f0,
    ).setOrigin(0, 0.5).setDepth(100);

    this.updateProgress();
    this.startTask(0);
  }

  private updateProgress(): void {
    const total = this.module.tasks.length;
    const current = this.currentTaskIndex + 1;
    this.progressText.setText(`Task ${current} of ${total}`);

    const barWidth = this.scale.width - 80;
    const fillWidth = (this.currentTaskIndex / total) * barWidth;
    this.progressFill.width = fillWidth;
  }

  private startTask(index: number): void {
    this.currentTaskIndex = index;
    this.updateProgress();

    if (index >= this.module.tasks.length) {
      this.finishAssessment();
      return;
    }

    const task = this.module.tasks[index];
    const renderer = this.createRenderer(task);
    this.currentRenderer = renderer;
    renderer.create();
  }

  private createRenderer(task: AssessmentTask): RendererInstance {
    const onComplete = (trials: TrialResult[]) => this.onTaskComplete(trials);

    switch (task.type) {
      case 'n_back':
        return new NBackRenderer(this, task, onComplete);

      case 'stroop':
      case 'go_no_go':
      case 'reaction_time':
      case 'rhythm':
        return new ReactionTimeRenderer(this, task, onComplete);

      case 'dilemma':
        return new DilemmaRenderer(this, task, onComplete);

      case 'scenario':
      case 'value_ranking':
      case 'self_report':
        return new ScenarioRenderer(this, task, onComplete);

      case 'hold':
        return new HoldRenderer(this, task, onComplete);

      case 'pattern_prediction':
        return new PatternRenderer(this, task, onComplete);

      case 'emotion_identification':
        return new EmotionRenderer(this, task, onComplete);

      case 'llm_dialogue':
        return new LLMDialogueRenderer(this, task, onComplete);

      case 'cooperation':
      case 'imitation':
        return new PatternRenderer(this, task, onComplete);

      default:
        // Fallback for any unknown type: treat as scenario
        return new ScenarioRenderer(this, task, onComplete);
    }
  }

  private onTaskComplete(trials: TrialResult[]): void {
    // Collect trials
    this.allTrials.push(...trials);

    // Destroy current renderer
    if (this.currentRenderer) {
      this.currentRenderer.destroy();
      this.currentRenderer = null;
    }

    const nextIndex = this.currentTaskIndex + 1;

    if (nextIndex >= this.module.tasks.length) {
      this.finishAssessment();
      return;
    }

    // Transition animation: brief fade between tasks
    this.cameras.main.fadeOut(200, 5, 7, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.cameras.main.fadeIn(200, 5, 7, 11);
      this.startTask(nextIndex);
    });
  }

  private finishAssessment(): void {
    const result = runAssessment(this.module, this.allTrials);

    // Update progress bar to full
    const barWidth = this.scale.width - 80;
    this.progressFill.width = barWidth;
    this.progressText.setText('Complete');

    if (this.onComplete) {
      this.onComplete(result);
    }

    // Emit on scene events for any listeners (e.g., EncounterScene pattern)
    this.events.emit('assessment_done', { result });
  }
}
