import Phaser from 'phaser';
import { GameEvents } from '../keys.js';
import type { TaskSlug } from '@core/domain/SharedTypes.js';
import type {
  CognitiveTaskRequestPayload,
  CognitiveTaskResolvedPayload,
} from '../events.js';

/**
 * CognitiveOverlay — generic overlay that dispatches any cognitive task.
 *
 * EncounterScene emits RequestCognitiveTask with a taskSlug + level.
 * This overlay presents a minimal timed interaction, scores it,
 * and emits ResolvedCognitiveTask back.
 *
 * Each task type gets a simple presentation: a target to tap within
 * a time window. The accuracy and reaction time are measured and
 * converted to a damage multiplier.
 */
export class CognitiveOverlay {
  private scene: Phaser.Scene;
  private dimmer: Phaser.GameObjects.Rectangle | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private active = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.game.events.on(
      GameEvents.RequestCognitiveTask,
      this.onRequest,
      this,
    );
  }

  destroy(): void {
    this.scene.game.events.off(
      GameEvents.RequestCognitiveTask,
      this.onRequest,
      this,
    );
  }

  private onRequest = (payload: CognitiveTaskRequestPayload): void => {
    if (this.active) return;
    this.active = true;
    this.present(payload);
  };

  private present(payload: CognitiveTaskRequestPayload): void {
    const { width, height } = this.scene.scale;

    this.dimmer = this.scene.add.rectangle(
      width / 2, height / 2, width, height, 0x000000, 0.7,
    ).setDepth(100);

    this.container = this.scene.add.container(0, 0).setDepth(101);

    const label = this.scene.add.text(width / 2, height / 2 - 80, this.taskLabel(payload.taskSlug), {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const instruction = this.scene.add.text(width / 2, height / 2 - 40, 'Tap the target!', {
      fontSize: '16px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.container.add([label, instruction]);

    // Show target after brief delay
    this.scene.time.delayedCall(600, () => {
      this.showTarget(payload);
    });
  }

  private showTarget(payload: CognitiveTaskRequestPayload): void {
    const { width, height } = this.scene.scale;
    const x = Phaser.Math.Between(150, width - 150);
    const y = Phaser.Math.Between(height / 2, height / 2 + 100);
    const startMs = performance.now();

    const target = this.scene.add.circle(x, y, 35, 0x66ff88, 0.9)
      .setDepth(102)
      .setInteractive()
      .on('pointerdown', () => {
        const reactionMs = performance.now() - startMs;
        const accuracy = Math.max(0, Math.min(1, 1 - (reactionMs - 200) / 2000));
        const damageMultiplier = 0.5 + accuracy * 1.5;
        this.resolve(payload.taskSlug, accuracy, reactionMs, damageMultiplier);
        target.destroy();
      });

    this.container?.add(target);

    // Timeout after 2.5s
    this.scene.time.delayedCall(2500, () => {
      if (this.active) {
        target.destroy();
        this.resolve(payload.taskSlug, 0, 2500, 0.5);
      }
    });
  }

  private resolve(
    taskSlug: TaskSlug,
    accuracy: number,
    reactionMs: number,
    damageMultiplier: number,
  ): void {
    this.active = false;
    this.cleanup();

    const resolved: CognitiveTaskResolvedPayload = {
      taskSlug,
      accuracy,
      reactionMs,
      damageMultiplier,
    };
    this.scene.game.events.emit(GameEvents.ResolvedCognitiveTask, resolved);
  }

  private cleanup(): void {
    this.dimmer?.destroy();
    this.dimmer = null;
    this.container?.destroy(true);
    this.container = null;
  }

  private taskLabel(slug: TaskSlug): string {
    const labels: Record<TaskSlug, string> = {
      n_back: 'Working Memory',
      stroop: 'Inhibitory Control',
      simon: 'Spatial Inhibition',
      go_no_go: 'Behavioural Inhibition',
      affect_recognition: 'Affect Recognition',
      dilemma_choice: 'Moral Dilemma',
      reaction_time: 'Reaction Time',
      held_input: 'Sustained Control',
      breath_rhythm: 'Breath Rhythm',
      self_report: 'Self-Report',
      value_coherence: 'Value Coherence',
      pattern_prediction: 'Pattern Prediction',
    };
    return labels[slug] ?? slug;
  }
}
