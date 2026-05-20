/**
 * PatternRenderer - Renders interpersonal pattern-prediction and cooperative tasks.
 *
 * This renderer serves the Interpersonal developmental line and cognitive planning
 * tasks. It presents NPC behaviour sequences and asks the player to predict what
 * comes next, or to synchronize/cooperate with an NPC's timing.
 *
 * Domain context by stage:
 * - Infrared: Minimal (object permanence tracking)
 * - Magenta: Simple imitation of NPC actions
 * - Red: Predict simple repeating 3-element NPC patterns
 * - Amber: Predict NPC behaviour based on role/rules (longer patterns)
 * - Orange: False-belief / theory-of-mind pattern tasks
 * - Green: Cooperative synchronization, mutual adaptation
 * - Turquoise: Recursive ToM - predict what NPC predicts about you
 * - White: Emergent synchrony without explicit communication
 *
 * Also handles cognitive planning tasks (Tower of London style):
 * - Pattern completion (A-B-A-?)
 * - Multi-step prediction
 *
 * Parameters from task.parameters:
 *   patternLength?: number - length of the repeating pattern
 *   repetitions?: number - how many times pattern shown before prediction
 *   predictionPoint?: string | number - when to ask for prediction ('next')
 *   npcAdaptive?: boolean - does NPC change pattern based on player responses
 *   hintsEnabled?: boolean - whether to show hints
 *   partnerMode?: boolean - cooperative task
 *   npcBehaviour?: string - type of NPC ('repeating-pattern', 'cooperative', etc.)
 *   objectCount?: number - for object tracking
 *   hideDurationMs?: number - for object permanence tasks
 *   trials?: number - number of prediction rounds
 *   disks?: number - for planning tasks (Tower of London)
 *   maxMoves?: number - for planning tasks
 *   attempts?: number - for planning tasks
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

// Visual symbols for NPC actions
const ACTION_SYMBOLS = ['\u25CF', '\u25A0', '\u25B2', '\u2666', '\u2605', '\u2764'];
const ACTION_COLORS = [0x4488ff, 0xff4488, 0x44cc66, 0xffaa33, 0xaa44ff, 0xff6644];

interface PatternTrialData {
  readonly trialIndex: number;
  readonly pattern: string[];
  readonly expectedNext: string;
  readonly playerResponse: string;
  readonly correct: boolean;
  readonly responseTimeMs: number;
  readonly timestamp: number;
}

export class PatternRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private patternLength: number;
  private repetitions: number;
  private totalTrials: number;
  private npcAdaptive: boolean;
  private isCooperative: boolean;

  // State
  private trialData: PatternTrialData[] = [];
  private currentTrial = 0;
  private currentPattern: string[] = [];
  private displayIndex = 0;
  private awaitingResponse = false;
  private predictionStartTime = 0;
  private adaptationLevel = 0; // For adaptive NPC, increases complexity

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private npcArea!: Phaser.GameObjects.Container;
  private sequenceDisplay: Phaser.GameObjects.Text[] = [];
  private responseButtons: Phaser.GameObjects.Container[] = [];
  private instructionText!: Phaser.GameObjects.Text;
  private trialCounter!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private npcLabel!: Phaser.GameObjects.Text;
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
    this.patternLength = (params.patternLength as number) ?? 3;
    this.repetitions = (params.repetitions as number) ?? 3;
    this.totalTrials = (params.trials as number) ?? (params.attempts as number) ?? 4;
    this.npcAdaptive = (params.npcAdaptive as boolean) ?? false;
    this.isCooperative = task.type === 'cooperation' || task.type === 'imitation' ||
      (params.npcBehaviour as string) === 'cooperative';
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentTrial = 0;
    this.trialData = [];
    this.adaptationLevel = 0;

    // NPC identity
    this.npcLabel = this.scene.add.text(width / 2, 90, this.isCooperative ? 'Partner' : 'NPC', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#4488ff',
    }).setOrigin(0.5);
    this.container.add(this.npcLabel);

    // Trial counter
    this.trialCounter = this.scene.add.text(width / 2, 120, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#667788',
    }).setOrigin(0.5);
    this.container.add(this.trialCounter);

    // Instruction
    const instruction = this.isCooperative
      ? 'Watch and synchronize with the pattern'
      : 'Watch the pattern, then predict what comes next';
    this.instructionText = this.scene.add.text(width / 2, 160, instruction, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#8899aa',
      align: 'center',
      wordWrap: { width: width - 60 },
    }).setOrigin(0.5);
    this.container.add(this.instructionText);

    // NPC action display area (sequence of symbols)
    this.npcArea = this.scene.add.container(width / 2, height / 2 - 100);
    this.container.add(this.npcArea);

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height / 2 + 20, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#44cc66',
    }).setOrigin(0.5).setAlpha(0);
    this.container.add(this.feedbackText);

    this.startPredictionRound();
  }

  destroy(): void {
    for (const timer of this.timers) timer.destroy();
    this.timers = [];
    this.container.destroy(true);
  }

  private startPredictionRound(): void {
    if (this.currentTrial >= this.totalTrials) {
      this.completeTask();
      return;
    }

    this.trialCounter.setText(`Round ${this.currentTrial + 1} of ${this.totalTrials}`);

    // Generate pattern (with potential adaptation)
    this.currentPattern = this.generatePattern();
    this.displayIndex = 0;
    this.awaitingResponse = false;

    // Clear previous display
    for (const text of this.sequenceDisplay) text.destroy();
    this.sequenceDisplay = [];
    for (const btn of this.responseButtons) btn.destroy(true);
    this.responseButtons = [];

    // Play the sequence
    this.playSequence();
  }

  private generatePattern(): string[] {
    const effectiveLength = this.patternLength + this.adaptationLevel;
    const pattern: string[] = [];
    const symbolCount = Math.min(effectiveLength + 1, ACTION_SYMBOLS.length);

    // Generate a repeating pattern of length N
    for (let i = 0; i < effectiveLength; i++) {
      pattern.push(ACTION_SYMBOLS[i % symbolCount]);
    }

    return pattern;
  }

  private playSequence(): void {
    const { width } = this.scene.scale;
    const totalToShow = this.currentPattern.length * this.repetitions;
    const fullSequence: string[] = [];
    for (let r = 0; r < this.repetitions; r++) {
      fullSequence.push(...this.currentPattern);
    }

    this.displayIndex = 0;
    const showInterval = 700; // ms between each symbol display

    const displayTimer = this.scene.time.addEvent({
      delay: showInterval,
      repeat: totalToShow - 1,
      callback: () => {
        this.showSymbolInSequence(fullSequence[this.displayIndex], this.displayIndex, totalToShow);
        this.displayIndex++;

        if (this.displayIndex >= totalToShow) {
          // Sequence complete, ask for prediction
          const askTimer = this.scene.time.delayedCall(600, () => this.askPrediction());
          this.timers.push(askTimer);
        }
      },
    });
    this.timers.push(displayTimer);
  }

  private showSymbolInSequence(symbol: string, index: number, total: number): void {
    const { width } = this.scene.scale;

    // Show current symbol prominently in center
    // Also show recent history as smaller symbols to the left
    for (const text of this.sequenceDisplay) text.destroy();
    this.sequenceDisplay = [];

    // Show last few symbols as history
    const historyCount = Math.min(index + 1, this.patternLength + 2);
    const startIdx = Math.max(0, index - historyCount + 1);
    const spacing = 50;
    const startX = -(historyCount - 1) * spacing / 2;

    for (let i = startIdx; i <= index; i++) {
      const sequenceSymbols = this.getFullSequence();
      const sym = sequenceSymbols[i];
      const relPos = i - startIdx;
      const isCurrent = i === index;

      const text = this.scene.add.text(startX + relPos * spacing, 0, sym, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: isCurrent ? '40px' : '24px',
        color: isCurrent ? '#ffffff' : '#667788',
      }).setOrigin(0.5);

      this.npcArea.add(text);
      this.sequenceDisplay.push(text);
    }
  }

  private askPrediction(): void {
    this.awaitingResponse = true;
    this.predictionStartTime = Date.now();

    const { width, height } = this.scene.scale;

    // Show "What comes next?" prompt
    const promptText = this.scene.add.text(0, 60, '?', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '48px',
      color: '#ffaa33',
    }).setOrigin(0.5);
    this.npcArea.add(promptText);
    this.sequenceDisplay.push(promptText);

    // Show response buttons with the possible symbols
    const uniqueSymbols = [...new Set(this.currentPattern)];
    // Add one wrong option
    const wrongSymbol = ACTION_SYMBOLS.find(s => !uniqueSymbols.includes(s)) ?? ACTION_SYMBOLS[5];
    const allOptions = [...uniqueSymbols, wrongSymbol];

    // Shuffle options
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    const buttonY = height / 2 + 80;
    const buttonSpacing = 100;
    const startX = width / 2 - ((allOptions.length - 1) * buttonSpacing) / 2;

    for (let i = 0; i < allOptions.length; i++) {
      const btn = this.createSymbolButton(startX + i * buttonSpacing, buttonY, allOptions[i]);
      this.responseButtons.push(btn);
      this.container.add(btn);
    }
  }

  private onPrediction(symbol: string): void {
    if (!this.awaitingResponse) return;
    this.awaitingResponse = false;

    const responseTime = Date.now() - this.predictionStartTime;
    const expectedNext = this.currentPattern[0]; // After repetitions, next is pattern[0] again
    const correct = symbol === expectedNext;

    // Show feedback
    this.feedbackText.setText(correct ? 'Correct!' : `Expected: ${expectedNext}`);
    this.feedbackText.setColor(correct ? '#44cc66' : '#ff6644');
    this.feedbackText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 800,
      delay: 400,
    });

    this.trialData.push({
      trialIndex: this.currentTrial,
      pattern: [...this.currentPattern],
      expectedNext,
      playerResponse: symbol,
      correct,
      responseTimeMs: responseTime,
      timestamp: this.predictionStartTime,
    });

    // For adaptive NPC: if player gets correct, increase difficulty
    if (this.npcAdaptive && correct) {
      this.adaptationLevel++;
    }

    this.currentTrial++;

    // Brief pause, then next round
    const nextTimer = this.scene.time.delayedCall(1000, () => this.startPredictionRound());
    this.timers.push(nextTimer);
  }

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      // Accuracy: correct prediction
      dimensions.accuracy = trial.correct ? 1.0 : 0.0;

      // Response time: normalized (faster = higher, 500ms = 1.0, 5000ms = 0.0)
      dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 500) / 4500));

      // Transfer: for adaptive patterns, later trials with new patterns measure transfer
      if (this.npcAdaptive && trial.trialIndex > 0) {
        dimensions.transfer = trial.correct ? 1.0 : 0.3;
      }

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          pattern: trial.pattern,
          expectedNext: trial.expectedNext,
          playerResponse: trial.playerResponse,
          correct: trial.correct,
          responseTimeMs: trial.responseTimeMs,
          patternLength: trial.pattern.length,
          adaptationLevel: this.npcAdaptive ? trial.trialIndex : 0,
        },
        durationMs: trial.responseTimeMs,
      };
    });

    // Compute overall consistency across trials
    const correctTrials = this.trialData.filter(t => t.correct);
    if (correctTrials.length > 1) {
      const rts = correctTrials.map(t => t.responseTimeMs);
      const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
      const variance = rts.reduce((sum, rt) => sum + (rt - mean) ** 2, 0) / rts.length;
      const cv = Math.sqrt(variance) / mean;
      const consistencyScore = Math.max(0, Math.min(1, 1 - cv));

      for (const r of results) {
        (r.dimensions as Record<string, number>).consistency = consistencyScore;
      }
    }

    this.onComplete(results);
  }

  private getFullSequence(): string[] {
    const full: string[] = [];
    for (let r = 0; r < this.repetitions; r++) {
      full.push(...this.currentPattern);
    }
    return full;
  }

  // --- UI Helpers ---

  private createSymbolButton(x: number, y: number, symbol: string): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const symbolIndex = ACTION_SYMBOLS.indexOf(symbol);
    const color = symbolIndex >= 0 ? ACTION_COLORS[symbolIndex] : 0x4488ff;

    const bg = this.scene.add.ellipse(0, 0, 70, 70, 0x1b2740)
      .setStrokeStyle(2, color, 0.7);
    const label = this.scene.add.text(0, 0, symbol, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(70, 70);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      bg.setScale(0.9);
      this.onPrediction(symbol);
    });
    btn.on('pointerup', () => bg.setScale(1));
    btn.on('pointerupoutside', () => bg.setScale(1));

    return btn;
  }
}
