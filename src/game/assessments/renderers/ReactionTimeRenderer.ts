/**
 * ReactionTimeRenderer - Renders somatic reaction time, rhythm, stroop, and go/no-go tasks.
 *
 * This renderer handles the Somatic and Cognitive lines' timing-based assessments.
 * It supports multiple stimulus types that share the core mechanic of precision timing:
 *
 * - 'simple': Tap when a colored target appears (Somatic Infrared+, Cognitive Infrared)
 * - 'alternation': Tap alternating left/right targets in sequence
 * - 'rhythm': Tap along with a beat pattern (Somatic Magenta+)
 * - 'anticipation': Predict when the next stimulus will appear (Somatic Turquoise)
 * - 'stroop': Respond to ink color, not word meaning (Cognitive Amber+)
 * - 'go_no_go': Respond to go stimuli, inhibit response to no-go (Cognitive Red+)
 *
 * Domain context:
 * - Somatic line measures embodied timing, proprioceptive precision, rhythm capacity
 * - Cognitive line uses RT variants to measure inhibition and interference control
 * - At higher stages, these become polyrhythmic (Orange), anticipatory (Turquoise),
 *   and free-form with naturalness scoring (White)
 *
 * Parameters from task.parameters:
 *   stimulusType: 'simple' | 'alternation' | 'rhythm' | 'anticipation' | 'stroop' | 'go_no_go'
 *   targetCount: number - total stimuli to present
 *   minGap: number - minimum ms between stimuli
 *   maxGap: number - maximum ms between stimuli
 *   goRatio?: number - for go_no_go, fraction of go trials (0.7 typical)
 *   trials?: number - alternative to targetCount
 *   stimulusDurationMs?: number - how long stimulus stays visible
 *   beatIntervalMs?: number - for rhythm tasks
 *   partnerMode?: boolean - for communion drive probes
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

// Color names and their hex values for stroop tasks
const STROOP_COLORS: readonly { name: string; hex: number; css: string }[] = [
  { name: 'RED', hex: 0xff4444, css: '#ff4444' },
  { name: 'BLUE', hex: 0x4488ff, css: '#4488ff' },
  { name: 'GREEN', hex: 0x44cc44, css: '#44cc44' },
  { name: 'YELLOW', hex: 0xffcc00, css: '#ffcc00' },
];

type StimulusType = 'simple' | 'alternation' | 'rhythm' | 'anticipation' | 'stroop' | 'go_no_go';

interface RTTrialData {
  readonly stimulusType: StimulusType;
  readonly stimulusShownAt: number;
  readonly responseAt: number | null;
  readonly responseTimeMs: number | null;
  readonly correct: boolean;
  readonly isGoTrial?: boolean; // for go_no_go
  readonly inhibited?: boolean; // for go_no_go: correctly withheld response
  readonly stroopCongruent?: boolean;
  readonly side?: 'left' | 'right'; // for alternation
}

export class ReactionTimeRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private stimulusType: StimulusType;
  private targetCount: number;
  private minGap: number;
  private maxGap: number;
  private goRatio: number;
  private stimulusDurationMs: number;
  private beatIntervalMs: number;

  // State
  private trialData: RTTrialData[] = [];
  private currentTrialIndex = 0;
  private stimulusShownAt = 0;
  private awaitingResponse = false;
  private currentIsGo = true;
  private expectedSide: 'left' | 'right' = 'left';

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private stimulus!: Phaser.GameObjects.Ellipse | Phaser.GameObjects.Text;
  private tapTargetLeft!: Phaser.GameObjects.Container;
  private tapTargetRight!: Phaser.GameObjects.Container;
  private tapTargetCenter!: Phaser.GameObjects.Container;
  private trialCounter!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private stroopButtons: Phaser.GameObjects.Container[] = [];
  private currentStroopColor = '';
  private timers: Phaser.Time.TimerEvent[] = [];

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    // Map task.type to internal stimulusType
    if (task.type === 'stroop') this.stimulusType = 'stroop';
    else if (task.type === 'go_no_go') this.stimulusType = 'go_no_go';
    else if (task.type === 'rhythm') this.stimulusType = 'rhythm';
    else this.stimulusType = (params.stimulusType as StimulusType) ?? 'simple';

    this.targetCount = (params.targetCount as number) ?? (params.trials as number) ?? 8;
    this.minGap = (params.minGap as number) ?? 800;
    this.maxGap = (params.maxGap as number) ?? 2500;
    this.goRatio = (params.goRatio as number) ?? 0.7;
    this.stimulusDurationMs = (params.stimulusDurationMs as number) ?? 500;
    this.beatIntervalMs = (params.beatIntervalMs as number) ?? 800;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentTrialIndex = 0;
    this.trialData = [];

    // Trial counter
    this.trialCounter = this.scene.add.text(width / 2, 90, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#667788',
    }).setOrigin(0.5);
    this.container.add(this.trialCounter);

    // Instruction text
    this.instructionText = this.scene.add.text(width / 2, 130, this.getInstruction(), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#8899aa',
      align: 'center',
      wordWrap: { width: width - 60 },
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // Build the appropriate UI for the stimulus type
    switch (this.stimulusType) {
      case 'simple':
        this.buildSimpleUI(width, height);
        break;
      case 'alternation':
        this.buildAlternationUI(width, height);
        break;
      case 'rhythm':
        this.buildRhythmUI(width, height);
        break;
      case 'anticipation':
        this.buildSimpleUI(width, height); // Same UI, different scoring
        break;
      case 'stroop':
        this.buildStroopUI(width, height);
        break;
      case 'go_no_go':
        this.buildGoNoGoUI(width, height);
        break;
    }

    // Start first trial after brief delay
    const startTimer = this.scene.time.delayedCall(800, () => this.presentStimulus());
    this.timers.push(startTimer);
  }

  destroy(): void {
    for (const timer of this.timers) timer.destroy();
    this.timers = [];
    this.container.destroy(true);
  }

  // --- UI Builders ---

  private buildSimpleUI(width: number, height: number): void {
    // Central colored circle that appears/disappears
    this.stimulus = this.scene.add.ellipse(width / 2, height / 2 - 40, 120, 120, 0x44cc66)
      .setAlpha(0);
    this.container.add(this.stimulus);

    // Large tap target covering bottom half
    this.tapTargetCenter = this.createTapArea(width / 2, height - 240, width - 60, 200, 'TAP');
    this.container.add(this.tapTargetCenter);
  }

  private buildAlternationUI(width: number, height: number): void {
    // Left and right targets
    this.stimulus = this.scene.add.ellipse(width / 2, height / 2 - 40, 80, 80, 0x4488ff)
      .setAlpha(0);
    this.container.add(this.stimulus);

    this.tapTargetLeft = this.createTapArea(width / 4, height - 240, 160, 160, 'L');
    this.tapTargetRight = this.createTapArea((width * 3) / 4, height - 240, 160, 160, 'R');
    this.container.add(this.tapTargetLeft);
    this.container.add(this.tapTargetRight);
  }

  private buildRhythmUI(width: number, height: number): void {
    // Beat indicator in center
    this.stimulus = this.scene.add.ellipse(width / 2, height / 2 - 40, 140, 140, 0xffaa33)
      .setAlpha(0.2);
    this.container.add(this.stimulus);

    // Tap area
    this.tapTargetCenter = this.createTapArea(width / 2, height - 240, width - 60, 200, 'TAP WITH THE BEAT');
    this.container.add(this.tapTargetCenter);
  }

  private buildStroopUI(width: number, height: number): void {
    // Word stimulus (colored text showing a color name)
    this.stimulus = this.scene.add.text(width / 2, height / 2 - 80, '', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0) as unknown as Phaser.GameObjects.Text;
    this.container.add(this.stimulus as unknown as Phaser.GameObjects.GameObject);

    // Color response buttons
    const btnY = height - 260;
    const btnSpacing = 160;
    const startX = width / 2 - (btnSpacing * 1.5);

    for (let i = 0; i < STROOP_COLORS.length; i++) {
      const color = STROOP_COLORS[i];
      const btn = this.createColorButton(startX + i * btnSpacing, btnY, color.name, color.hex);
      this.stroopButtons.push(btn);
      this.container.add(btn);
    }
  }

  private buildGoNoGoUI(width: number, height: number): void {
    // Central stimulus (green circle = go, red circle = no-go)
    this.stimulus = this.scene.add.ellipse(width / 2, height / 2 - 40, 120, 120, 0x44cc66)
      .setAlpha(0);
    this.container.add(this.stimulus);

    // Tap target
    this.tapTargetCenter = this.createTapArea(width / 2, height - 240, width - 60, 200, 'TAP for GO');
    this.container.add(this.tapTargetCenter);
  }

  // --- Stimulus Presentation ---

  private presentStimulus(): void {
    if (this.currentTrialIndex >= this.targetCount) {
      this.completeTask();
      return;
    }

    this.trialCounter.setText(`${this.currentTrialIndex + 1} / ${this.targetCount}`);
    this.awaitingResponse = true;
    this.stimulusShownAt = Date.now();

    switch (this.stimulusType) {
      case 'simple':
      case 'anticipation':
        this.presentSimple();
        break;
      case 'alternation':
        this.presentAlternation();
        break;
      case 'rhythm':
        this.presentRhythm();
        break;
      case 'stroop':
        this.presentStroop();
        break;
      case 'go_no_go':
        this.presentGoNoGo();
        break;
    }
  }

  private presentSimple(): void {
    (this.stimulus as Phaser.GameObjects.Ellipse).setAlpha(1);

    // Hide after stimulus duration, then wait gap before next
    const hideTimer = this.scene.time.delayedCall(this.stimulusDurationMs, () => {
      this.recordNonResponse();
      (this.stimulus as Phaser.GameObjects.Ellipse).setAlpha(0);
      this.scheduleNext();
    });
    this.timers.push(hideTimer);
  }

  private presentAlternation(): void {
    // Show indicator on expected side
    const { width } = this.scene.scale;
    const targetX = this.expectedSide === 'left' ? width / 4 : (width * 3) / 4;
    (this.stimulus as Phaser.GameObjects.Ellipse).setX(targetX).setAlpha(1);

    const hideTimer = this.scene.time.delayedCall(this.stimulusDurationMs, () => {
      this.recordNonResponse();
      (this.stimulus as Phaser.GameObjects.Ellipse).setAlpha(0);
      this.scheduleNext();
    });
    this.timers.push(hideTimer);
  }

  private presentRhythm(): void {
    // Flash the beat indicator
    this.scene.tweens.add({
      targets: this.stimulus,
      alpha: 1,
      duration: 80,
      yoyo: true,
      hold: 60,
      onComplete: () => {
        (this.stimulus as Phaser.GameObjects.Ellipse).setAlpha(0.2);
      },
    });

    // Wait for tap within a window around the beat
    const beatTimer = this.scene.time.delayedCall(this.beatIntervalMs, () => {
      this.recordNonResponse();
      this.scheduleNext();
    });
    this.timers.push(beatTimer);
  }

  private presentStroop(): void {
    // Pick a random word and a DIFFERENT random color for the ink
    const wordIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    let colorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    // 50% congruent, 50% incongruent
    const congruent = Math.random() < 0.5;
    if (congruent) {
      colorIndex = wordIndex;
    } else {
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
      }
    }

    const word = STROOP_COLORS[wordIndex].name;
    const inkColor = STROOP_COLORS[colorIndex];
    this.currentStroopColor = inkColor.name;

    const textStimulus = this.stimulus as unknown as Phaser.GameObjects.Text;
    textStimulus.setText(word);
    textStimulus.setColor(inkColor.css);
    textStimulus.setAlpha(1);

    // Auto-advance after timeout
    const timeoutTimer = this.scene.time.delayedCall(3000, () => {
      this.recordNonResponse();
      textStimulus.setAlpha(0);
      this.scheduleNext();
    });
    this.timers.push(timeoutTimer);
  }

  private presentGoNoGo(): void {
    this.currentIsGo = Math.random() < this.goRatio;
    const ellipse = this.stimulus as Phaser.GameObjects.Ellipse;
    ellipse.setFillStyle(this.currentIsGo ? 0x44cc66 : 0xcc4444);
    ellipse.setAlpha(1);

    const hideTimer = this.scene.time.delayedCall(this.stimulusDurationMs, () => {
      // If no-go trial and player correctly inhibited, that's a correct response
      if (!this.currentIsGo && this.awaitingResponse) {
        this.trialData.push({
          stimulusType: this.stimulusType,
          stimulusShownAt: this.stimulusShownAt,
          responseAt: null,
          responseTimeMs: null,
          correct: true, // Correct inhibition
          isGoTrial: false,
          inhibited: true,
        });
        this.awaitingResponse = false;
        this.currentTrialIndex++;
      } else {
        this.recordNonResponse();
      }
      ellipse.setAlpha(0);
      this.scheduleNext();
    });
    this.timers.push(hideTimer);
  }

  // --- Response Handling ---

  private onTap(side?: 'left' | 'right'): void {
    if (!this.awaitingResponse) return;
    this.awaitingResponse = false;

    const now = Date.now();
    const rt = now - this.stimulusShownAt;
    let correct = true;

    if (this.stimulusType === 'alternation') {
      correct = side === this.expectedSide;
      this.expectedSide = this.expectedSide === 'left' ? 'right' : 'left';
    } else if (this.stimulusType === 'go_no_go') {
      correct = this.currentIsGo; // Tapping on go = correct, tapping on no-go = incorrect
    } else if (this.stimulusType === 'rhythm') {
      // For rhythm, correctness is about timing accuracy relative to beat
      // Within 25% of beat interval is "on beat"
      const tolerance = this.beatIntervalMs * 0.25;
      correct = rt <= tolerance;
    }

    this.trialData.push({
      stimulusType: this.stimulusType,
      stimulusShownAt: this.stimulusShownAt,
      responseAt: now,
      responseTimeMs: rt,
      correct,
      isGoTrial: this.stimulusType === 'go_no_go' ? this.currentIsGo : undefined,
      inhibited: false,
      side,
    });

    this.currentTrialIndex++;
    // Hide stimulus
    if (this.stimulus instanceof Phaser.GameObjects.Ellipse) {
      this.stimulus.setAlpha(0);
    }
  }

  private onStroopResponse(colorName: string): void {
    if (!this.awaitingResponse) return;
    this.awaitingResponse = false;

    const now = Date.now();
    const rt = now - this.stimulusShownAt;
    const correct = colorName === this.currentStroopColor;

    this.trialData.push({
      stimulusType: 'stroop',
      stimulusShownAt: this.stimulusShownAt,
      responseAt: now,
      responseTimeMs: rt,
      correct,
      stroopCongruent: (this.stimulus as unknown as Phaser.GameObjects.Text).text === this.currentStroopColor,
    });

    (this.stimulus as unknown as Phaser.GameObjects.Text).setAlpha(0);
    this.currentTrialIndex++;
    this.scheduleNext();
  }

  private recordNonResponse(): void {
    if (!this.awaitingResponse) return;
    this.awaitingResponse = false;

    // For go trials or simple RT, not responding is a miss
    const isMiss = this.stimulusType !== 'go_no_go' || this.currentIsGo;

    this.trialData.push({
      stimulusType: this.stimulusType,
      stimulusShownAt: this.stimulusShownAt,
      responseAt: null,
      responseTimeMs: null,
      correct: !isMiss,
      isGoTrial: this.stimulusType === 'go_no_go' ? this.currentIsGo : undefined,
      inhibited: this.stimulusType === 'go_no_go' && !this.currentIsGo ? true : undefined,
    });

    this.currentTrialIndex++;
  }

  private scheduleNext(): void {
    if (this.currentTrialIndex >= this.targetCount) {
      this.completeTask();
      return;
    }

    const gap = this.stimulusType === 'rhythm'
      ? this.beatIntervalMs
      : this.minGap + Math.random() * (this.maxGap - this.minGap);

    const nextTimer = this.scene.time.delayedCall(gap, () => this.presentStimulus());
    this.timers.push(nextTimer);
  }

  // --- Completion ---

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      dimensions.accuracy = trial.correct ? 1.0 : 0.0;

      if (trial.responseTimeMs !== null) {
        // Normalize RT: 150ms = 1.0 (human floor), 2000ms = 0.0
        dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 150) / 1850));
      }

      return {
        taskId: this.task.id,
        timestamp: trial.stimulusShownAt,
        dimensions,
        rawResponse: {
          stimulusType: trial.stimulusType,
          responseTimeMs: trial.responseTimeMs,
          correct: trial.correct,
          isGoTrial: trial.isGoTrial,
          inhibited: trial.inhibited,
          side: trial.side,
          stroopCongruent: trial.stroopCongruent,
        },
        durationMs: trial.responseTimeMs ?? this.stimulusDurationMs,
      };
    });

    // Compute consistency across trials
    const rts = this.trialData
      .filter(t => t.responseTimeMs !== null && t.correct)
      .map(t => t.responseTimeMs!);

    if (rts.length > 1) {
      const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
      const variance = rts.reduce((sum, rt) => sum + (rt - mean) ** 2, 0) / rts.length;
      const cv = Math.sqrt(variance) / mean;
      const consistencyScore = Math.max(0, Math.min(1, 1 - (cv - 0.1) / 0.7));

      for (const r of results) {
        (r.dimensions as Record<string, number>).consistency = consistencyScore;
      }
    }

    this.onComplete(results);
  }

  // --- UI Helpers ---

  private createTapArea(x: number, y: number, w: number, h: number, label: string): Phaser.GameObjects.Container {
    const area = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, w, h, 0x1b2740, 0.6)
      .setStrokeStyle(1, 0x2a3b5e, 0.5)
      .setOrigin(0.5);
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#667788',
    }).setOrigin(0.5);
    area.add([bg, text]);
    area.setSize(w, h);
    area.setInteractive({ useHandCursor: true });

    area.on('pointerdown', () => {
      bg.setFillStyle(0x2a3b5e, 0.8);
      if (this.stimulusType === 'alternation') {
        this.onTap(x < this.scene.scale.width / 2 ? 'left' : 'right');
      } else {
        this.onTap();
      }
    });
    area.on('pointerup', () => bg.setFillStyle(0x1b2740, 0.6));
    area.on('pointerupoutside', () => bg.setFillStyle(0x1b2740, 0.6));

    return area;
  }

  private createColorButton(x: number, y: number, name: string, color: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 130, 56, color, 0.8)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setOrigin(0.5);
    const text = this.scene.add.text(0, 0, name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.add([bg, text]);
    btn.setSize(130, 56);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      bg.setScale(0.95);
      this.onStroopResponse(name);
    });
    btn.on('pointerup', () => bg.setScale(1));
    btn.on('pointerupoutside', () => bg.setScale(1));

    return btn;
  }

  private getInstruction(): string {
    switch (this.stimulusType) {
      case 'simple': return 'Tap as fast as you can when the circle appears';
      case 'alternation': return 'Tap the correct side when the circle appears';
      case 'rhythm': return 'Tap along with the beat';
      case 'anticipation': return 'Tap just BEFORE you think the circle will appear';
      case 'stroop': return 'Tap the INK COLOR of the word, not what it says';
      case 'go_no_go': return 'Tap for GREEN circles, do NOT tap for RED';
      default: return 'Respond when the stimulus appears';
    }
  }
}
