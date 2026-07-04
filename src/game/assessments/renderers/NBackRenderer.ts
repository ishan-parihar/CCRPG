/**
 * NBackRenderer - Renders n-back working memory tasks.
 *
 * The n-back task measures working memory capacity: the player sees a sequence
 * of stimuli and must identify when the current stimulus matches the one shown
 * N positions back. This is the primary Cognitive line assessment at Red+ stages.
 *
 * Domain context:
 * - Infrared/Magenta: n=1 (simple recognition memory)
 * - Red: n=2 (holding two items, sovereign thinking)
 * - Amber: n=2 stable (consistency under pressure)
 * - Orange: n=3 (strategic working memory)
 * - Green+: n=3-4+ (multi-rule coordination)
 *
 * Parameters from task.parameters:
 *   n: number - how many positions back to compare
 *   trials: number - total stimulus presentations
 *   stimulusDurationMs: number - how long each stimulus is visible
 *   interStimulusMs: number - gap between stimuli
 *   hintsEnabled?: boolean - whether to show position indicators (agency probe)
 *
 * Measures collected: accuracy (hit/miss/false-alarm), response_time, consistency
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

// Stimulus pool: single letters (avoids cultural bias, easy to distinguish)
const STIMULUS_POOL = ['B', 'D', 'F', 'G', 'K', 'N', 'P', 'R', 'T', 'V'];

interface NBackTrialData {
  readonly stimulus: string;
  readonly isMatch: boolean;
  readonly responded: boolean;
  readonly responseCorrect: boolean | null;
  readonly responseTimeMs: number | null;
  readonly timestamp: number;
}

export class NBackRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Task parameters
  private n: number;
  private totalTrials: number;
  private stimulusDurationMs: number;
  private interStimulusMs: number;
  private hintsEnabled: boolean;

  // State
  private sequence: string[] = [];
  private trialData: NBackTrialData[] = [];
  private currentTrialIndex = 0;
  private stimulusShownAt = 0;
  private awaitingResponse = false;
  private responded = false;

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private stimulusText!: Phaser.GameObjects.Text;
  private matchButton!: Phaser.GameObjects.Container;
  private trialCounter!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private nIndicator!: Phaser.GameObjects.Text;
  private stimulusTimer: Phaser.Time.TimerEvent | null = null;
  private interStimulusTimer: Phaser.Time.TimerEvent | null = null;

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.n = (params.n as number) ?? 2;
    this.totalTrials = (params.trials as number) ?? 12;
    this.stimulusDurationMs = (params.stimulusDurationMs as number) ?? 1100;
    this.interStimulusMs = (params.interStimulusMs as number) ?? 350;
    this.hintsEnabled = (params.hintsEnabled as boolean) ?? true;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);

    // Generate the full stimulus sequence with controlled match ratio (~30% matches)
    this.sequence = this.generateSequence();

    // N-level indicator (helps player remember what N they're on)
    this.nIndicator = this.scene.add.text(width / 2, 90, `${this.n}-Back`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#4cc9f0',
    }).setOrigin(0.5);
    this.container.add(this.nIndicator);

    // Trial counter
    this.trialCounter = this.scene.add.text(width / 2, 120, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#667788',
    }).setOrigin(0.5);
    this.container.add(this.trialCounter);

    // Central stimulus display area (large, prominent)
    const stimulusBg = this.scene.add.rectangle(width / 2, height / 2 - 80, 160, 160, 0x0d1520)
      .setStrokeStyle(2, 0x2a3b5e, 0.8)
      .setOrigin(0.5);
    this.container.add(stimulusBg);

    this.stimulusText = this.scene.add.text(width / 2, height / 2 - 80, '', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(this.stimulusText);

    // Hint: show last N items if hints are enabled
    if (this.hintsEnabled && this.n <= 3) {
      const hintLabel = this.scene.add.text(width / 2, height / 2 + 30, 'Remember the letter from ' + this.n + ' back', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#556677',
      }).setOrigin(0.5);
      this.container.add(hintLabel);
    }

    // Feedback text (brief flash after response)
    this.feedbackText = this.scene.add.text(width / 2, height / 2 + 60, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#44bb44',
    }).setOrigin(0.5).setAlpha(0);
    this.container.add(this.feedbackText);

    // MATCH button - large tap target at bottom
    this.matchButton = this.createMatchButton(width / 2, height - 220);
    this.container.add(this.matchButton);

    // Instruction text
    const instruction = this.scene.add.text(width / 2, height - 120, 'Tap MATCH when the letter matches\nthe one from ' + this.n + ' positions ago', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#556677',
      align: 'center',
    }).setOrigin(0.5);
    this.container.add(instruction);

    // Start the sequence
    this.currentTrialIndex = 0;
    this.showNextStimulus();
  }

  destroy(): void {
    if (this.stimulusTimer) this.stimulusTimer.destroy();
    if (this.interStimulusTimer) this.interStimulusTimer.destroy();
    this.container.destroy(true);
  }

  private generateSequence(): string[] {
    const seq: string[] = [];
    const matchTarget = Math.floor(this.totalTrials * 0.3); // ~30% should be matches
    let matchCount = 0;

    for (let i = 0; i < this.totalTrials; i++) {
      if (i >= this.n && matchCount < matchTarget && Math.random() < 0.35) {
        // Create a match: repeat the stimulus from N positions back
        seq.push(seq[i - this.n]);
        matchCount++;
      } else {
        // Pick a stimulus that does NOT match N-back (avoid accidental matches)
        let candidate: string;
        let attempts = 0;
        do {
          candidate = STIMULUS_POOL[Math.floor(Math.random() * STIMULUS_POOL.length)];
          attempts++;
        } while (i >= this.n && candidate === seq[i - this.n] && attempts < 20);
        seq.push(candidate);
      }
    }
    return seq;
  }

  private showNextStimulus(): void {
    if (this.currentTrialIndex >= this.totalTrials) {
      this.completeTask();
      return;
    }

    const stimulus = this.sequence[this.currentTrialIndex];
    const isMatch = this.currentTrialIndex >= this.n &&
      stimulus === this.sequence[this.currentTrialIndex - this.n];

    // Update UI
    this.stimulusText.setText(stimulus);
    this.stimulusText.setAlpha(1);
    this.trialCounter.setText(`${this.currentTrialIndex + 1} / ${this.totalTrials}`);

    // Enable response
    this.awaitingResponse = true;
    this.responded = false;
    this.stimulusShownAt = Date.now();

    // After stimulus duration, hide stimulus
    this.stimulusTimer = this.scene.time.delayedCall(this.stimulusDurationMs, () => {
      this.stimulusText.setAlpha(0.15);

      // After inter-stimulus interval, record non-response and advance
      this.interStimulusTimer = this.scene.time.delayedCall(this.interStimulusMs, () => {
        // If player didn't respond, record miss or correct rejection
        if (!this.responded) {
          this.trialData.push({
            stimulus,
            isMatch,
            responded: false,
            responseCorrect: isMatch ? false : true, // Miss if was match, correct rejection if not
            responseTimeMs: null,
            timestamp: this.stimulusShownAt,
          });
        }

        this.awaitingResponse = false;
        this.currentTrialIndex++;
        this.showNextStimulus();
      });
    });
  }

  private onMatchPressed(): void {
    if (!this.awaitingResponse || this.responded) return;

    this.responded = true;
    const responseTimeMs = Date.now() - this.stimulusShownAt;
    const stimulus = this.sequence[this.currentTrialIndex];
    const isMatch = this.currentTrialIndex >= this.n &&
      stimulus === this.sequence[this.currentTrialIndex - this.n];

    const correct = isMatch; // Pressing MATCH when it IS a match = correct (hit)
    // Pressing MATCH when it is NOT a match = false alarm

    this.trialData.push({
      stimulus,
      isMatch,
      responded: true,
      responseCorrect: correct,
      responseTimeMs,
      timestamp: this.stimulusShownAt,
    });

    // Brief visual feedback
    this.feedbackText.setText(correct ? 'Hit!' : 'False alarm');
    this.feedbackText.setColor(correct ? '#44bb44' : '#bb4444');
    this.feedbackText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  private completeTask(): void {
    // Convert trial data to TrialResult[]
    const results: TrialResult[] = this.trialData.map((trial) => {
      // Compute per-trial dimension scores
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      // Accuracy: 1.0 for correct, 0.0 for incorrect
      dimensions.accuracy = trial.responseCorrect ? 1.0 : 0.0;

      // Response time: normalized (faster = higher score, capped at 2000ms = 0)
      if (trial.responseTimeMs !== null) {
        // Normalize: 200ms or less = 1.0, 2000ms+ = 0.0
        dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 200) / 1800));
      }

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          stimulus: trial.stimulus,
          isMatch: trial.isMatch,
          responded: trial.responded,
          correct: trial.responseCorrect,
          responseTimeMs: trial.responseTimeMs,
        },
        durationMs: trial.responseTimeMs ?? (this.stimulusDurationMs + this.interStimulusMs),
      };
    });

    // Add a consistency dimension based on variance of correct RTs
    const correctRTs = this.trialData
      .filter(t => t.responseCorrect && t.responseTimeMs !== null)
      .map(t => t.responseTimeMs!);

    if (correctRTs.length > 1) {
      const mean = correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length;
      const variance = correctRTs.reduce((sum, rt) => sum + (rt - mean) ** 2, 0) / correctRTs.length;
      const cv = Math.sqrt(variance) / mean; // coefficient of variation
      // Low CV = high consistency. CV of 0.1 = 1.0 score, CV of 0.8+ = 0.0 score
      const consistencyScore = Math.max(0, Math.min(1, 1 - (cv - 0.1) / 0.7));

      // Apply consistency to all trials
      for (const r of results) {
        (r.dimensions as Record<string, number>).consistency = consistencyScore;
      }
    }

    this.onComplete(results);
  }

  private createMatchButton(x: number, y: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 200, 64, 0x1b2740)
      .setStrokeStyle(2, 0x4cc9f0, 0.8)
      .setOrigin(0.5);
    const label = this.scene.add.text(0, 0, 'MATCH', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      color: '#e7eaf2',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(200, 64);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      bg.setScale(0.96);
      label.setScale(0.96);
      this.onMatchPressed();
    });
    btn.on('pointerup', () => {
      bg.setScale(1);
      label.setScale(1);
    });
    btn.on('pointerupoutside', () => {
      bg.setScale(1);
      label.setScale(1);
    });

    return btn;
  }
}
