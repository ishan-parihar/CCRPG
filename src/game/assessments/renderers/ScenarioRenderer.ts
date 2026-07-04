/**
 * ScenarioRenderer - Renders intrapersonal, spiritual, and self-report tasks.
 *
 * This renderer handles the narrative/reflective assessment modalities used by:
 * - Intrapersonal line: self-knowledge, metacognition, identity coherence
 * - Spiritual line: wonder, meaning, non-attachment, witness perspective
 * - Value ranking tasks (all lines at Amber+)
 * - Self-report baseline tasks (minimal stages)
 *
 * The renderer adapts its presentation based on responseType:
 * - 'text' / 'single-word': Free-form text input (for depth/coherence scoring)
 * - 'choice' / 'choice-plus-text': Multiple option buttons, optionally followed by text
 * - 'ranking': Drag/tap reorder interface for value prioritization
 *
 * Domain context:
 * - Infrared: Single-word responses to minimal prompts ("Are you here?")
 * - Magenta: "What do you want?" with simple vocabulary
 * - Red: Power/ego identity scenarios
 * - Amber: Role-based identity, predict own behaviour
 * - Orange: Self-assessment accuracy, bias detection
 * - Green: Internal contradictions, parts-language
 * - Turquoise: Witness perspective, dis-identification
 * - White: Describe-self-without-roles, radical non-identification
 *
 * Parameters from task.parameters:
 *   scenarioType?: string - type of scenario (e.g., 'wonder-stimulus', 'identity', 'values')
 *   responseType: 'text' | 'single-word' | 'choice' | 'choice-plus-text' | 'ranking'
 *   prompts?: string[] - one or more prompts to present
 *   prompt?: string - single prompt (alternative to prompts array)
 *   options?: string[] - choices for 'choice' or items for 'ranking'
 *   trials?: number - how many prompts to present
 *   soloMode?: boolean - agency drive probe flag
 *   npcBehaviour?: string - for interpersonal coordination scenarios
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

interface ScenarioTrialData {
  readonly promptIndex: number;
  readonly promptText: string;
  readonly response: string | string[]; // text or ranking order
  readonly responseTimeMs: number;
  readonly timestamp: number;
}

export class ScenarioRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private responseType: string;
  private prompts: string[];
  private options: string[];
  private currentPromptIndex = 0;

  // State
  private trialData: ScenarioTrialData[] = [];
  private promptStartTime = 0;
  private inputText = '';
  private rankingOrder: string[] = [];

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private promptDisplay!: Phaser.GameObjects.Text;
  private inputDisplay!: Phaser.GameObjects.Text;
  private submitButton!: Phaser.GameObjects.Container;
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private rankingItems: Phaser.GameObjects.Container[] = [];
  private charCounter!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.responseType = (params.responseType as string) ?? 'text';

    // Resolve prompts
    if (params.prompts && Array.isArray(params.prompts)) {
      this.prompts = params.prompts as string[];
    } else if (params.prompt) {
      this.prompts = [params.prompt as string];
    } else {
      this.prompts = [task.description];
    }

    // Resolve options for choice/ranking
    this.options = (params.options as string[]) ?? [];
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentPromptIndex = 0;
    this.trialData = [];

    // Prompt display
    this.promptDisplay = this.scene.add.text(width / 2, 180, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#dddde8',
      align: 'center',
      wordWrap: { width: width - 80 },
      lineSpacing: 8,
    }).setOrigin(0.5, 0);
    this.container.add(this.promptDisplay);

    // Text input area (for text/single-word response types)
    this.inputDisplay = this.scene.add.text(width / 2, height / 2 + 20, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#e7eaf2',
      wordWrap: { width: width - 100 },
      lineSpacing: 4,
      backgroundColor: '#0d1520',
      padding: { x: 16, y: 12 },
    }).setOrigin(0.5, 0).setAlpha(0);
    this.container.add(this.inputDisplay);

    // Character counter
    this.charCounter = this.scene.add.text(width - 50, height / 2 + 10, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#556677',
    }).setOrigin(1, 0).setAlpha(0);
    this.container.add(this.charCounter);

    // Submit button
    this.submitButton = this.createButton(width / 2, height - 180, 'Continue');
    this.submitButton.setAlpha(0);
    this.container.add(this.submitButton);

    this.presentPrompt();
  }

  destroy(): void {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    this.container.destroy(true);
  }

  private presentPrompt(): void {
    if (this.currentPromptIndex >= this.prompts.length) {
      this.completeTask();
      return;
    }

    // Clear previous UI elements
    for (const btn of this.choiceButtons) btn.destroy(true);
    this.choiceButtons = [];
    for (const item of this.rankingItems) item.destroy(true);
    this.rankingItems = [];

    const promptText = this.prompts[this.currentPromptIndex];
    this.promptDisplay.setText(promptText);
    this.promptStartTime = Date.now();
    this.inputText = '';

    switch (this.responseType) {
      case 'text':
      case 'single-word':
      case 'choice-plus-text':
        this.showTextInput();
        break;
      case 'choice':
        this.showChoices();
        break;
      case 'ranking':
        this.showRanking();
        break;
      default:
        this.showTextInput();
        break;
    }
  }

  private showTextInput(): void {
    const placeholder = this.responseType === 'single-word'
      ? 'Type a word...'
      : 'Type your response...';

    this.inputDisplay.setText(placeholder);
    this.inputDisplay.setColor('#667788');
    this.inputDisplay.setAlpha(1);
    this.charCounter.setAlpha(1);
    this.submitButton.setAlpha(1);

    const maxLength = this.responseType === 'single-word' ? 30 : 500;
    this.charCounter.setText(`0/${maxLength}`);

    // Enable keyboard input
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
      this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Backspace') {
          this.inputText = this.inputText.slice(0, -1);
        } else if (event.key === 'Enter' && this.inputText.length > 0) {
          this.submitTextResponse();
          return;
        } else if (event.key.length === 1 && this.inputText.length < maxLength) {
          // For single-word, block spaces
          if (this.responseType === 'single-word' && event.key === ' ') return;
          this.inputText += event.key;
        }

        this.updateInputDisplay(placeholder, maxLength);
      });
    }
  }

  private updateInputDisplay(placeholder: string, maxLength: number): void {
    if (this.inputText.length > 0) {
      this.inputDisplay.setText(this.inputText);
      this.inputDisplay.setColor('#e7eaf2');
    } else {
      this.inputDisplay.setText(placeholder);
      this.inputDisplay.setColor('#667788');
    }
    this.charCounter.setText(`${this.inputText.length}/${maxLength}`);
  }

  private submitTextResponse(): void {
    if (this.inputText.length === 0) return;

    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }

    const responseTime = Date.now() - this.promptStartTime;
    this.trialData.push({
      promptIndex: this.currentPromptIndex,
      promptText: this.prompts[this.currentPromptIndex],
      response: this.inputText,
      responseTimeMs: responseTime,
      timestamp: this.promptStartTime,
    });

    this.inputDisplay.setAlpha(0);
    this.charCounter.setAlpha(0);
    this.submitButton.setAlpha(0);

    this.currentPromptIndex++;
    this.scene.time.delayedCall(200, () => this.presentPrompt());
  }

  private showChoices(): void {
    const { width, height } = this.scene.scale;
    const startY = height / 2 - 20;
    const spacing = 64;

    for (let i = 0; i < this.options.length; i++) {
      const btn = this.createChoiceButton(width / 2, startY + i * spacing, this.options[i], i);
      this.choiceButtons.push(btn);
      this.container.add(btn);
    }
  }

  private onChoiceSelected(index: number): void {
    const responseTime = Date.now() - this.promptStartTime;

    this.trialData.push({
      promptIndex: this.currentPromptIndex,
      promptText: this.prompts[this.currentPromptIndex],
      response: this.options[index],
      responseTimeMs: responseTime,
      timestamp: this.promptStartTime,
    });

    // If choice-plus-text, transition to text input
    if (this.responseType === 'choice-plus-text') {
      for (const btn of this.choiceButtons) btn.setAlpha(0);
      this.promptDisplay.setText('Why did you choose that?');
      this.promptStartTime = Date.now();
      this.showTextInput();
      return;
    }

    this.currentPromptIndex++;
    this.scene.time.delayedCall(200, () => this.presentPrompt());
  }

  private showRanking(): void {
    this.rankingOrder = [...this.options];
    this.submitButton.setAlpha(1);

    this.renderRankingList();
  }

  private renderRankingList(): void {
    // Clear existing
    for (const item of this.rankingItems) item.destroy(true);
    this.rankingItems = [];

    const { width, height } = this.scene.scale;
    const startY = height / 2 - 80;
    const spacing = 56;

    for (let i = 0; i < this.rankingOrder.length; i++) {
      const item = this.createRankingItem(width / 2, startY + i * spacing, this.rankingOrder[i], i);
      this.rankingItems.push(item);
      this.container.add(item);
    }
  }

  private onRankingSwap(index: number): void {
    // Tap to move item up by one position
    if (index <= 0) return;
    const temp = this.rankingOrder[index];
    this.rankingOrder[index] = this.rankingOrder[index - 1];
    this.rankingOrder[index - 1] = temp;
    this.renderRankingList();
  }

  private submitRanking(): void {
    const responseTime = Date.now() - this.promptStartTime;

    this.trialData.push({
      promptIndex: this.currentPromptIndex,
      promptText: this.prompts[this.currentPromptIndex],
      response: [...this.rankingOrder],
      responseTimeMs: responseTime,
      timestamp: this.promptStartTime,
    });

    this.submitButton.setAlpha(0);
    this.currentPromptIndex++;
    this.scene.time.delayedCall(200, () => this.presentPrompt());
  }

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      if (typeof trial.response === 'string') {
        const wordCount = trial.response.trim().split(/\s+/).length;

        // Depth: based on elaboration length (single-word responses get lower depth ceiling)
        if (this.responseType === 'single-word') {
          // For single-word: any response = baseline depth, longer word = slightly more
          dimensions.depth = Math.min(0.5, 0.2 + trial.response.length * 0.03);
        } else {
          // For text: word count maps to depth (5 words = 0.3, 30+ = 0.9)
          dimensions.depth = Math.min(1.0, Math.max(0.1, (wordCount - 2) / 30));
        }

        // Coherence: proxy from response time (too fast = shallow, moderate = reflective)
        const rtSeconds = trial.responseTimeMs / 1000;
        dimensions.coherence = Math.min(1.0, Math.max(0.1, rtSeconds / 20));

        // Metacognition: for intrapersonal tasks, indicated by self-referential markers
        // (This is a structural placeholder - real scoring uses LLM in the scoring layer)
        if (this.task.measures.includes('metacognition')) {
          dimensions.metacognition = Math.min(1.0, Math.max(0.1, (wordCount - 3) / 25));
        }
      } else {
        // Ranking: depth indicated by how much reordering was done (engagement)
        dimensions.depth = 0.5; // Baseline for engaging with ranking
        dimensions.coherence = Math.min(1.0, trial.responseTimeMs / 15000);
      }

      // Accuracy: for self-report, merely responding counts
      if (this.task.measures.includes('accuracy')) {
        dimensions.accuracy = 1.0; // Provided a response
      }

      // Response time
      dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 2000) / 28000));

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          promptText: trial.promptText,
          response: trial.response,
          responseType: this.responseType,
          responseTimeMs: trial.responseTimeMs,
        },
        durationMs: trial.responseTimeMs,
      };
    });

    this.onComplete(results);
  }

  // --- UI Helpers ---

  private createButton(x: number, y: number, label: string): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 180, 50, 0x1b2740)
      .setStrokeStyle(2, 0x4cc9f0, 0.7)
      .setOrigin(0.5);
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#e7eaf2',
    }).setOrigin(0.5);
    btn.add([bg, text]);
    btn.setSize(180, 50);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => bg.setFillStyle(0x2a3b5e));
    btn.on('pointerout', () => bg.setFillStyle(0x1b2740));
    btn.on('pointerdown', () => {
      if (this.responseType === 'ranking') {
        this.submitRanking();
      } else {
        this.submitTextResponse();
      }
    });

    return btn;
  }

  private createChoiceButton(x: number, y: number, text: string, index: number): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const btnWidth = width - 80;
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, btnWidth, 52, 0x1b2740)
      .setStrokeStyle(1, 0x4cc9f0, 0.4)
      .setOrigin(0.5);
    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#e7eaf2',
      wordWrap: { width: btnWidth - 32 },
      align: 'center',
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(btnWidth, 52);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => bg.setFillStyle(0x2a3b5e));
    btn.on('pointerout', () => bg.setFillStyle(0x1b2740));
    btn.on('pointerdown', () => this.onChoiceSelected(index));

    return btn;
  }

  private createRankingItem(x: number, y: number, text: string, index: number): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const itemWidth = width - 100;
    const item = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, itemWidth, 48, 0x141e2e)
      .setStrokeStyle(1, 0x2a3b5e, 0.6)
      .setOrigin(0.5);

    const rank = this.scene.add.text(-itemWidth / 2 + 20, 0, `${index + 1}.`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#4cc9f0',
    }).setOrigin(0, 0.5);

    const label = this.scene.add.text(-itemWidth / 2 + 50, 0, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#e7eaf2',
      wordWrap: { width: itemWidth - 100 },
    }).setOrigin(0, 0.5);

    // Up arrow for reordering (tap to move up)
    const upArrow = this.scene.add.text(itemWidth / 2 - 30, 0, '\u25B2', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: index > 0 ? '#4cc9f0' : '#333344',
    }).setOrigin(0.5);

    item.add([bg, rank, label, upArrow]);
    item.setSize(itemWidth, 48);
    item.setInteractive({ useHandCursor: true });

    if (index > 0) {
      item.on('pointerdown', () => this.onRankingSwap(index));
    }

    return item;
  }
}
