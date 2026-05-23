/**
 * LLMDialogueRenderer - Renders open-ended LLM-scored dialogue tasks.
 *
 * This renderer handles tasks that require free-form text responses which will
 * later be scored by an LLM in the infrastructure layer. It does NOT call the
 * LLM directly -- it purely collects the player's textual response.
 *
 * Used across multiple developmental lines for depth/coherence/integration:
 * - Moral line: Justify moral choices, explain reasoning
 * - Intrapersonal line: Self-reflection, metacognitive narration
 * - Spiritual line: Articulate meaning, describe witness experience
 * - Cognitive line: Explain strategy, describe thinking process
 * - Emotional line: Describe emotional experience to NPC
 *
 * Domain context:
 * - At lower stages (Infrared-Magenta): very short responses (single word to sentence)
 * - At Red: power-based justifications, simple self-expression
 * - At Amber: rule-following explanations, role-based answers
 * - At Orange: analytical responses, strategy articulation
 * - At Green: multi-perspective, both/and responses
 * - At Turquoise+: paradox tolerance, systems language, witness perspective
 *
 * The prompt is presented as NPC dialogue or reflective question.
 * The scoring rubric (stored in module.scoringRubric.llmRubric) guides later LLM scoring
 * but is NOT shown to the player.
 *
 * Parameters from task.parameters:
 *   prompt: string - the question or NPC dialogue to respond to
 *   rubric?: string - scoring rubric (stored in rawResponse for later LLM use)
 *   maxResponseLength?: number - character limit for response
 *   timeoutMs?: number - optional countdown timer
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';
import { evaluateResponse } from '@infra/llm/LLMClient.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';
import { scoreResponse } from '@infra/llm/contracts/LanguageReflective.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';

const LLM_RUBRIC = 'Score 0-1 based on depth of self-reflection, specificity of insight, and developmental awareness. Higher scores for responses that show genuine introspection rather than surface-level answers.';

export class LLMDialogueRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private prompt: string;
  private rubric: string;
  private maxResponseLength: number;
  private timeoutMs: number | null;
  private stage: Stage;

  // Hybrid MCQ parameters
  private options: string[] = [];
  private selectedOptions: Set<string> = new Set();
  private isMultiSelect = false;

  // State
  private inputText = '';
  private startTime = 0;
  private timedOut = false;

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private promptBubble!: Phaser.GameObjects.Container;
  private inputArea!: Phaser.GameObjects.Text;
  private charCounter!: Phaser.GameObjects.Text;
  private submitButton!: Phaser.GameObjects.Container;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private countdownEvent: Phaser.Time.TimerEvent | null = null;
  private optionButtons: Phaser.GameObjects.Container[] = [];

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
    moduleRubric?: string,
    stage?: Stage,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.prompt = (params.prompt as string) ?? task.description;
    this.rubric = moduleRubric ?? (params.rubric as string) ?? '';
    this.maxResponseLength = (params.maxResponseLength as number) ?? 500;
    this.timeoutMs = (params.timeoutMs as number) ?? null;
    this.stage = stage ?? (params.stage as Stage) ?? 'Red';
    this.options = (params.options as string[]) ?? [];
    this.isMultiSelect = (params.isMultiSelect as boolean) ?? false;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.startTime = Date.now();
    this.inputText = '';
    this.timedOut = false;
    this.selectedOptions.clear();
    this.optionButtons = [];

    // Get adaptive prompt from FallbackProvider if no explicit prompt
    if (!this.task.parameters.prompt) {
      const line = (this.task.parameters.line as Line) ?? 'Intrapersonal';
      const stage = (this.task.parameters.stage as Stage) ?? 'Red';
      const fallback = getFallback('LanguageReflective', line, stage);
      if (fallback.prompt) this.prompt = fallback.prompt;
    }

    // NPC dialogue bubble at top
    this.promptBubble = this.createDialogueBubble(width / 2, 160, this.prompt);
    this.container.add(this.promptBubble);

    // NPC indicator
    const npcIcon = this.scene.add.ellipse(80, 100, 40, 40, 0x2244aa, 0.6)
      .setStrokeStyle(2, 0x4488ff, 0.6);
    this.container.add(npcIcon);
    const npcLabel = this.scene.add.text(80, 100, 'NPC', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#4488ff',
    }).setOrigin(0.5);
    this.container.add(npcLabel);

    // Calculate dynamic layout coordinates
    let inputBgY = height / 2 + 60;
    let inputAreaY = height / 2 - 20;
    let charCounterY = height / 2 + 150;
    let submitBtnY = height - 160;

    if (this.options.length > 0) {
      const promptHeight = (this.promptBubble.list[0] as Phaser.GameObjects.Rectangle).height;
      let nextY = 160 + promptHeight + 24;

      this.options.forEach((optText, idx) => {
        const optBtn = this.createOptionButton(width / 2, nextY, optText, idx);
        this.container.add(optBtn);
        this.optionButtons.push(optBtn);
        nextY += optBtn.height + 12;
      });

      inputBgY = nextY + 100;
      inputAreaY = nextY + 20;
      charCounterY = nextY + 190;
      submitBtnY = nextY + 260;
    }

    // Text input area
    const inputBg = this.scene.add.rectangle(width / 2, inputBgY, width - 60, 200, 0x0d1520)
      .setStrokeStyle(1, 0x2a3b5e, 0.6)
      .setOrigin(0.5);
    this.container.add(inputBg);

    this.inputArea = this.scene.add.text(50, inputAreaY, 'Type your response...', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#667788',
      wordWrap: { width: width - 100 },
      lineSpacing: 6,
    }).setOrigin(0, 0);
    this.container.add(this.inputArea);

    // Character counter
    this.charCounter = this.scene.add.text(width - 50, charCounterY, `0/${this.maxResponseLength}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#556677',
    }).setOrigin(1, 0.5);
    this.container.add(this.charCounter);

    // Timer (if timeout enabled)
    this.timerText = this.scene.add.text(width - 40, 90, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff8844',
    }).setOrigin(1, 0.5);
    this.container.add(this.timerText);

    if (this.timeoutMs) {
      this.startCountdown();
    }

    // Submit button
    this.submitButton = this.createSubmitButton(width / 2, submitBtnY);
    this.container.add(this.submitButton);

    // Enable keyboard input
    this.setupKeyboardInput();
  }

  destroy(): void {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.countdownEvent) this.countdownEvent.destroy();
    this.container.destroy(true);
  }

  private setupKeyboardInput(): void {
    if (!this.scene.input.keyboard) return;

    this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (this.timedOut) return;

      if (event.key === 'Backspace') {
        this.inputText = this.inputText.slice(0, -1);
      } else if (event.key === 'Enter' && event.shiftKey) {
        if (this.inputText.length < this.maxResponseLength) {
          this.inputText += '\n';
        }
      } else if (event.key === 'Enter') {
        if (this.inputText.length > 0) {
          this.submitResponse();
          return;
        }
      } else if (event.key.length === 1 && this.inputText.length < this.maxResponseLength) {
        this.inputText += event.key;
      }

      this.updateInputDisplay();
    });
  }

  private updateInputDisplay(): void {
    if (this.inputText.length > 0) {
      this.inputArea.setText(this.inputText);
      this.inputArea.setColor('#e7eaf2');
    } else {
      this.inputArea.setText('Type your response...');
      this.inputArea.setColor('#667788');
    }

    const remaining = this.maxResponseLength - this.inputText.length;
    this.charCounter.setText(`${this.inputText.length}/${this.maxResponseLength}`);
    this.charCounter.setColor(remaining < 50 ? '#ff8844' : '#556677');
  }

  private startCountdown(): void {
    if (!this.timeoutMs) return;

    let remaining = this.timeoutMs;
    this.timerText.setText(this.formatTime(remaining));

    this.countdownEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        remaining -= 1000;
        if (remaining <= 0) {
          this.onTimeout();
        } else {
          this.timerText.setText(this.formatTime(remaining));
          if (remaining <= 10000) {
            this.timerText.setColor('#ff4444');
          }
        }
      },
    });
  }

  private onTimeout(): void {
    this.timedOut = true;
    if (this.countdownEvent) {
      this.countdownEvent.destroy();
      this.countdownEvent = null;
    }
    this.timerText.setText('Time!');
    this.submitResponse();
  }

  private submitResponse(): void {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    if (this.countdownEvent) {
      this.countdownEvent.destroy();
      this.countdownEvent = null;
    }

    const responseTime = Date.now() - this.startTime;
    const responseText = this.inputText.trim();

    this.scoreThenComplete(responseText, responseTime);
  }

  private async scoreThenComplete(responseText: string, responseTime: number): Promise<void> {
    const dimensions: Partial<Record<MeasureDimension, number>> = {};

    if (responseText.length > 0) {
      const evaluation = await evaluateResponse(this.prompt, this.rubric || LLM_RUBRIC, responseText);

      let score: number;
      let inferredStage: Stage | undefined;
      let confidence: number | undefined;

      if (evaluation.score === 0.5 && evaluation.feedback === 'LLM unavailable') {
        const heuristic = scoreResponse(responseText, this.stage);
        score = heuristic.score;
      } else {
        score = evaluation.score;
        inferredStage = evaluation.inferredStage;
        confidence = evaluation.confidence;
      }

      dimensions.depth = score;
      dimensions.coherence = score;
      dimensions.integration = score;
      dimensions.response_time = Math.max(0, Math.min(1, responseTime / 60000));

      const trial: TrialResult = {
        taskId: this.task.id,
        timestamp: this.startTime,
        dimensions,
        rawResponse: {
          text: responseText,
          prompt: this.prompt,
          rubric: this.rubric,
          responseTimeMs: responseTime,
          timedOut: this.timedOut,
          wordCount: responseText.split(/\s+/).filter(w => w.length > 0).length,
          charCount: responseText.length,
          inferredStage,
          confidence,
        },
        durationMs: responseTime,
      };

      this.onComplete([trial]);
    } else {
      dimensions.depth = 0;
      dimensions.coherence = 0;
      dimensions.integration = 0;
      dimensions.response_time = 0;

      const trial: TrialResult = {
        taskId: this.task.id,
        timestamp: this.startTime,
        dimensions,
        rawResponse: {
          text: '',
          prompt: this.prompt,
          rubric: this.rubric,
          responseTimeMs: responseTime,
          timedOut: this.timedOut,
          wordCount: 0,
          charCount: 0,
        },
        durationMs: responseTime,
      };

      this.onComplete([trial]);
    }
  }

  private createOptionButton(x: number, y: number, optionText: string, idx: number): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const btnWidth = width - 100;
    const btn = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, btnWidth, 48, 0x142035)
      .setStrokeStyle(1, 0x2a3b5e, 0.6)
      .setOrigin(0.5);

    const label = this.scene.add.text(0, 0, optionText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#aabbcc',
      wordWrap: { width: btnWidth - 40 },
      align: 'center',
    }).setOrigin(0.5);

    if (label.height > 30) {
      bg.setSize(btnWidth, label.height + 20);
    }

    btn.add([bg, label]);
    btn.setSize(btnWidth, bg.height);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      if (!this.selectedOptions.has(optionText)) {
        bg.setFillStyle(0x1e304f);
      }
    });

    btn.on('pointerout', () => {
      if (!this.selectedOptions.has(optionText)) {
        bg.setFillStyle(0x142035);
        bg.setStrokeStyle(1, 0x2a3b5e, 0.6);
      }
    });

    btn.on('pointerdown', () => {
      this.toggleOption(optionText, bg, label);
    });

    return btn;
  }

  private toggleOption(optionText: string, bg: Phaser.GameObjects.Rectangle, label: Phaser.GameObjects.Text): void {
    if (this.isMultiSelect) {
      if (this.selectedOptions.has(optionText)) {
        this.selectedOptions.delete(optionText);
        bg.setFillStyle(0x142035);
        bg.setStrokeStyle(1, 0x2a3b5e, 0.6);
        label.setColor('#aabbcc');
      } else {
        this.selectedOptions.add(optionText);
        bg.setFillStyle(0x2a4ba3);
        bg.setStrokeStyle(2, 0x4cc9f0, 0.9);
        label.setColor('#ffffff');
      }
      this.inputText = Array.from(this.selectedOptions).join('\n');
    } else {
      this.selectedOptions.clear();
      this.optionButtons.forEach((otherBtn) => {
        const otherBg = otherBtn.list[0] as Phaser.GameObjects.Rectangle;
        const otherLabel = otherBtn.list[1] as Phaser.GameObjects.Text;
        otherBg.setFillStyle(0x142035);
        otherBg.setStrokeStyle(1, 0x2a3b5e, 0.6);
        otherLabel.setColor('#aabbcc');
      });

      this.selectedOptions.add(optionText);
      bg.setFillStyle(0x2a4ba3);
      bg.setStrokeStyle(2, 0x4cc9f0, 0.9);
      label.setColor('#ffffff');
      this.inputText = optionText;
    }

    this.updateInputDisplay();
  }

  // --- UI Helpers ---

  private createDialogueBubble(x: number, y: number, text: string): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const bubbleWidth = width - 100;
    const bubble = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, bubbleWidth, 0, 0x1a2a40, 0.9)
      .setStrokeStyle(1, 0x3a5a7a, 0.6)
      .setOrigin(0.5, 0);

    const dialogueText = this.scene.add.text(0, 16, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#dddde8',
      wordWrap: { width: bubbleWidth - 40 },
      lineSpacing: 6,
      align: 'center',
    }).setOrigin(0.5, 0);

    const textHeight = dialogueText.height + 32;
    bg.setSize(bubbleWidth, textHeight);

    bubble.add([bg, dialogueText]);
    return bubble;
  }

  private createSubmitButton(x: number, y: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 200, 52, 0x1b2740)
      .setStrokeStyle(2, 0x4cc9f0, 0.7)
      .setOrigin(0.5);
    const label = this.scene.add.text(0, 0, 'Submit Response', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#e7eaf2',
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(200, 52);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => bg.setFillStyle(0x2a3b5e));
    btn.on('pointerout', () => bg.setFillStyle(0x1b2740));
    btn.on('pointerdown', () => {
      if (this.inputText.length > 0) {
        this.submitResponse();
      }
    });

    return btn;
  }

  private formatTime(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }
}
