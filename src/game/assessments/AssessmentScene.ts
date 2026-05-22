/**
 * AssessmentScene - Generic container scene for running any StageAssessment module.
 *
 * Receives a StageAssessment + execution mode, selects tasks based on mode,
 * dispatches each to the appropriate renderer, collects TrialResult[] per task,
 * then calls the mode-aware engine to produce the correct result type.
 *
 * Mode semantics:
 *   capacity/calibration - runs full task set
 *   encounter - single-trial (first task only)
 *   shadow - runs drive probe tasks, produces ShadowAssessmentResult
 *   practice - runs full task set (same as capacity)
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type {
  StageAssessment,
  AssessmentTask,
  TrialResult,
  AssessmentResult,
  ModuleExecutionMode,
} from '@core/assessments/types.js';
import { runModeAwareAssessment } from '@core/assessments/engine.js';
import { selectSessionItems } from '@core/assessments/itemSelection.js';
import { DOMOverlay } from '../accessibility/DOMOverlay.js';
import type { AccessibilityManager } from '../accessibility/AccessibilityManager.js';
import { NBackRenderer } from './renderers/NBackRenderer.js';
import { ReactionTimeRenderer } from './renderers/ReactionTimeRenderer.js';
import { DilemmaRenderer } from './renderers/DilemmaRenderer.js';
import { ScenarioRenderer } from './renderers/ScenarioRenderer.js';
import { HoldRenderer } from './renderers/HoldRenderer.js';
import { PatternRenderer } from './renderers/PatternRenderer.js';
import { EmotionRenderer } from './renderers/EmotionRenderer.js';
import { LLMDialogueRenderer } from './renderers/LLMDialogueRenderer.js';
import { getModalityFrame, type NarrativeFrame } from './ModalityPresenter.js';
import type { Modality } from '@core/domain/enums.js';
import type { Stage } from '@core/domain/Stage.js';

export interface AssessmentSceneData {
  readonly module: StageAssessment;
  readonly mode: ModuleExecutionMode;
  readonly modality?: Modality;
  readonly onComplete?: (result: AssessmentResult) => void;
  readonly resumeFrom?: { taskIndex: number; priorTrials: readonly TrialResult[] };
}

type RendererInstance = {
  create(): void;
  destroy(): void;
};

export class AssessmentScene extends Phaser.Scene {
  private module!: StageAssessment;
  private mode!: ModuleExecutionMode;
  private onComplete?: (result: AssessmentResult) => void;
  private narrativeFrame: NarrativeFrame | null = null;

  private currentTaskIndex = 0;
  private allTrials: TrialResult[] = [];
  private currentRenderer: RendererInstance | null = null;
  private adaptiveTasks: readonly AssessmentTask[] | null = null;
  private overlay: DOMOverlay | null = null;

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
    this.adaptiveTasks = null;
    this.overlay = null;
    this.narrativeFrame = data.modality
      ? getModalityFrame(data.modality, this.module.stage as Stage)
      : null;

    // P2.3: Adaptive item selection for capacity/calibration/practice modes
    const useAdaptive = (this.mode === 'capacity' || this.mode === 'calibration' || this.mode === 'practice')
      && this.module.itemPool && this.module.itemPool.length > 0;
    if (useAdaptive) {
      const items = selectSessionItems(this.module.itemPool!, this.module.tasks.length, 0.5);
      this.adaptiveTasks = items.map(item => ({
        id: item.id,
        type: item.taskType,
        description: `Adaptive item ${item.id}`,
        parameters: item.parameters,
        measures: item.measures,
      }));
    }

    // P2.4: Accessibility overlay
    const a11y = this.registry.get(RegistryKeys.Accessibility) as AccessibilityManager | undefined;
    if (a11y?.isScreenReaderEnabled()) {
      this.overlay = new DOMOverlay();
    }

    // Resume from checkpoint if provided
    const startIndex = data.resumeFrom?.taskIndex ?? 0;
    if (data.resumeFrom) {
      this.allTrials = [...data.resumeFrom.priorTrials];
    }

    const { width } = this.scale;
    this.cameras.main.setBackgroundColor(0x05070b);

    // Leave button (session-length sovereignty)
    const leaveBtn = this.add.text(width - 20, 28, '✕ Leave', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#556677',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setDepth(100);
    leaveBtn.on('pointerover', () => leaveBtn.setColor('#aabbcc'));
    leaveBtn.on('pointerout', () => leaveBtn.setColor('#556677'));
    leaveBtn.on('pointerdown', () => this.onLeave());

    // Narrative intro or start immediately
    if (this.narrativeFrame) {
      this.showNarrativeText(this.narrativeFrame.intro, 2500, () => this.startTask(startIndex));
    } else {
      this.startTask(startIndex);
    }
  }

  private getTasksForMode(): readonly AssessmentTask[] {
    // Use adaptive items if available (capacity/calibration/practice with itemPool)
    if (this.adaptiveTasks) return this.adaptiveTasks;

    switch (this.mode) {
      case 'encounter':
        // Single-trial mode: run only the first task
        return this.module.tasks.slice(0, 1);
      case 'shadow':
        // Shadow mode: run drive probe tasks
        return [
          this.module.driveProbes.agency.task,
          this.module.driveProbes.communion.task,
          this.module.driveProbes.eros.task,
          this.module.driveProbes.agape.task,
        ];
      case 'calibration':
      case 'practice':
      default:
        // Full task set
        return this.module.tasks;
    }
  }

  private startTask(index: number): void {
    const tasks = this.getTasksForMode();
    this.currentTaskIndex = index;

    if (index >= tasks.length) {
      this.finishAssessment();
      return;
    }

    const task = tasks[index];
    this.overlay?.liveAnnounce(`Task ${index + 1}: ${task.type}`);
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

    // Emit checkpoint for persistence
    this.events.emit('checkpoint', {
      taskIndex: this.currentTaskIndex,
      trials: [...this.allTrials],
      moduleRef: `${this.module.line}/${this.module.stage}`,
    });

    // Destroy current renderer
    if (this.currentRenderer) {
      this.currentRenderer.destroy();
      this.currentRenderer = null;
    }

    const nextIndex = this.currentTaskIndex + 1;
    const tasks = this.getTasksForMode();

    if (nextIndex >= tasks.length) {
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

  private onLeave(): void {
    this.events.emit('checkpoint', {
      taskIndex: this.currentTaskIndex,
      trials: [...this.allTrials],
      moduleRef: `${this.module.line}/${this.module.stage}`,
    });
    if (this.currentRenderer) {
      this.currentRenderer.destroy();
      this.currentRenderer = null;
    }
    this.overlay?.destroy();
    this.overlay = null;
    this.scene.start(SceneKeys.World);
  }

  private finishAssessment(): void {
    const result = runModeAwareAssessment(this.module, this.allTrials, this.mode);

    this.overlay?.liveAnnounce('Assessment complete', 'assertive');
    this.overlay?.destroy();
    this.overlay = null;

    const emitDone = () => {
      if (this.onComplete) this.onComplete(result);
      this.events.emit('assessment_done', { result });
    };

    // Narrative outro or emit immediately
    if (this.narrativeFrame) {
      const isSuccess = 'passed' in result && result.passed;
      const text = isSuccess ? this.narrativeFrame.outro.success : this.narrativeFrame.outro.neutral;
      this.showNarrativeText(text, 2000, emitDone);
    } else {
      emitDone();
    }
  }

  private showNarrativeText(text: string, durationMs: number, onDone: () => void): void {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ccccee',
      wordWrap: { width: width - 80 },
      align: 'center',
    }).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: txt,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        this.time.delayedCall(durationMs - 800, () => {
          this.tweens.add({
            targets: txt,
            alpha: 0,
            duration: 400,
            onComplete: () => { txt.destroy(); onDone(); },
          });
        });
      },
    });
  }
}
