/**
 * DilemmaRenderer - Renders moral/ethical dilemma scenarios.
 *
 * This renderer serves the Moral developmental line exclusively. It presents
 * ethical scenarios calibrated to the player's current stage and collects both
 * the choice made and the reasoning behind it (for LLM scoring of depth/coherence).
 *
 * Domain context by stage:
 * - Red: self-interest vs other (Kohlberg Stage 1, egocentric)
 * - Amber: rule-following vs compassion (conventional morality)
 * - Orange: principle vs law (post-conventional, rights-based)
 * - Green: multi-stakeholder, no right answer (care ethics)
 * - Turquoise: systemic impact, long-term consequences
 * - White: paradox dilemmas, action-from-being
 *
 * The renderer does NOT score the response or determine stage -- that happens
 * in the core scoring engine. It purely collects:
 * - Which choice was selected
 * - Response time for the choice
 * - Optional text justification (for LLM follow-up scoring)
 *
 * Parameters from task.parameters:
 *   dilemmaType: string - category of dilemma (e.g. 'self-interest-vs-other', 'rule-vs-compassion')
 *   choices: number | string[] - number of choices to present or explicit choice texts
 *   scenarioCount?: number - how many scenarios to present sequentially
 *   followUpPrompt?: string - optional justification question after choice
 *   scenario?: string - explicit scenario text (if not generated)
 *   soloMode?: boolean - agency probe flag
 *   complexity?: string - 'low' | 'medium' | 'high'
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

// Default choice labels when only a number is specified
const DEFAULT_CHOICES: Record<string, string[]> = {
  'self-interest-vs-other': [
    'Act in your own interest',
    'Help the other person',
    'Find a compromise',
  ],
  'rule-vs-compassion': [
    'Follow the rule as stated',
    'Break the rule to help',
    'Report the situation and wait',
  ],
  'principle-vs-law': [
    'Uphold the principle, break the law',
    'Follow the law, sacrifice the principle',
    'Seek a legal path to the principle',
  ],
  'multi-stakeholder': [
    'Prioritize the most vulnerable',
    'Maximize total wellbeing',
    'Protect individual rights',
    'Defer to community consensus',
  ],
  'ambiguous-self-interest': [
    'Choose the uncertain path that might benefit you',
    'Choose the safe path that benefits another',
    'Refuse to choose until more information',
  ],
};

// Default scenario descriptions by dilemma type
const DEFAULT_SCENARIOS: Record<string, string> = {
  'self-interest-vs-other': 'You find a valuable item that belongs to someone else. No one would know if you kept it. What do you do?',
  'rule-vs-compassion': 'A friend has broken a clear rule, but breaking it prevented harm to an innocent person. Authority asks you what happened.',
  'principle-vs-law': 'A law requires you to act against what you believe is fundamentally right. Others are watching your decision.',
  'multi-stakeholder': 'A decision affects multiple groups differently. Each group has legitimate needs, and resources are limited.',
  'ambiguous-self-interest': 'The outcome of your choice is uncertain. One path risks your resources for a chance at greater gain. Another path is safe but leaves another in need.',
  'simple-fairness': 'Two people want the same thing. Only one can have it. You decide who gets it.',
};

interface DilemmaTrialData {
  readonly scenarioIndex: number;
  readonly choiceIndex: number;
  readonly choiceText: string;
  readonly responseTimeMs: number;
  readonly justification: string | null;
  readonly justificationTimeMs: number | null;
  readonly timestamp: number;
}

export class DilemmaRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private dilemmaType: string;
  private choices: string[];
  private scenarioCount: number;
  private followUpPrompt: string | null;
  private scenarioText: string;

  // State
  private trialData: DilemmaTrialData[] = [];
  private currentScenario = 0;
  private scenarioStartTime = 0;
  private waitingForJustification = false;
  private currentChoiceIndex = -1;
  private currentChoiceText = '';

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private scenarioDisplay!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private justificationPrompt!: Phaser.GameObjects.Text;
  private justificationInput!: Phaser.GameObjects.Text;
  private submitButton!: Phaser.GameObjects.Container;
  private inputText = '';

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.dilemmaType = (params.dilemmaType as string) ?? 'self-interest-vs-other';
    this.scenarioCount = (params.scenarioCount as number) ?? 1;
    this.followUpPrompt = (params.followUpPrompt as string) ?? null;
    this.scenarioText = (params.scenario as string) ?? DEFAULT_SCENARIOS[this.dilemmaType] ?? DEFAULT_SCENARIOS['self-interest-vs-other'];

    // Resolve choices
    const choicesParam = params.choices;
    if (Array.isArray(choicesParam)) {
      this.choices = choicesParam as string[];
    } else {
      const numChoices = (choicesParam as number) ?? 3;
      const defaults = DEFAULT_CHOICES[this.dilemmaType] ?? DEFAULT_CHOICES['self-interest-vs-other'];
      this.choices = defaults.slice(0, numChoices);
    }
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentScenario = 0;
    this.trialData = [];

    // Scenario text display (upper portion)
    this.scenarioDisplay = this.scene.add.text(width / 2, 200, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#dddde8',
      align: 'center',
      wordWrap: { width: width - 80 },
      lineSpacing: 6,
    }).setOrigin(0.5, 0);
    this.container.add(this.scenarioDisplay);

    // Justification prompt (hidden initially)
    this.justificationPrompt = this.scene.add.text(width / 2, 200, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#aabbcc',
      align: 'center',
      wordWrap: { width: width - 80 },
      lineSpacing: 4,
    }).setOrigin(0.5, 0).setAlpha(0);
    this.container.add(this.justificationPrompt);

    // Text input display for justification
    this.justificationInput = this.scene.add.text(width / 2, 340, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#e7eaf2',
      wordWrap: { width: width - 100 },
      lineSpacing: 4,
      backgroundColor: '#0d1520',
      padding: { x: 16, y: 12 },
    }).setOrigin(0.5, 0).setAlpha(0);
    this.container.add(this.justificationInput);

    // Submit button for justification (hidden initially)
    this.submitButton = this.createButton(width / 2, height - 180, 'Submit', () => this.onSubmitJustification());
    this.submitButton.setAlpha(0);
    this.container.add(this.submitButton);

    this.presentScenario();
  }

  destroy(): void {
    // Remove keyboard listener if active
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    this.container.destroy(true);
  }

  private presentScenario(): void {
    this.scenarioDisplay.setText(this.scenarioText);
    this.scenarioDisplay.setAlpha(1);
    this.scenarioStartTime = Date.now();
    this.waitingForJustification = false;

    // Clear old choice buttons
    for (const btn of this.choiceButtons) btn.destroy(true);
    this.choiceButtons = [];

    // Create choice buttons
    const { width, height } = this.scene.scale;
    const startY = height / 2 + 40;
    const spacing = 70;

    for (let i = 0; i < this.choices.length; i++) {
      const btn = this.createChoiceButton(
        width / 2,
        startY + i * spacing,
        this.choices[i],
        i,
      );
      this.choiceButtons.push(btn);
      this.container.add(btn);
    }
  }

  private onChoiceSelected(index: number): void {
    if (this.waitingForJustification) return;

    const responseTime = Date.now() - this.scenarioStartTime;
    this.currentChoiceIndex = index;
    this.currentChoiceText = this.choices[index];

    // Highlight selected choice, dim others
    for (let i = 0; i < this.choiceButtons.length; i++) {
      const btn = this.choiceButtons[i];
      if (i === index) {
        btn.setAlpha(1);
      } else {
        btn.setAlpha(0.3);
      }
    }

    if (this.followUpPrompt) {
      // Show justification phase after brief pause
      this.scene.time.delayedCall(400, () => this.showJustification(responseTime));
    } else {
      // Record trial and move on
      this.trialData.push({
        scenarioIndex: this.currentScenario,
        choiceIndex: index,
        choiceText: this.currentChoiceText,
        responseTimeMs: responseTime,
        justification: null,
        justificationTimeMs: null,
        timestamp: this.scenarioStartTime,
      });
      this.currentScenario++;
      this.advanceOrComplete();
    }
  }

  private showJustification(choiceResponseTime: number): void {
    this.waitingForJustification = true;
    const justStartTime = Date.now();

    // Hide scenario and choices
    this.scenarioDisplay.setAlpha(0);
    for (const btn of this.choiceButtons) btn.setAlpha(0);

    // Show justification UI
    const prompt = this.followUpPrompt ?? 'Why did you make that choice?';
    this.justificationPrompt.setText(prompt);
    this.justificationPrompt.setAlpha(1);
    this.justificationInput.setAlpha(1);
    this.submitButton.setAlpha(1);
    this.inputText = '';
    this.justificationInput.setText('Type your reasoning...');
    this.justificationInput.setColor('#667788');

    // Enable keyboard input
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        if (!this.waitingForJustification) return;

        if (event.key === 'Backspace') {
          this.inputText = this.inputText.slice(0, -1);
        } else if (event.key === 'Enter') {
          this.onSubmitJustification();
          return;
        } else if (event.key.length === 1) {
          this.inputText += event.key;
        }

        if (this.inputText.length > 0) {
          this.justificationInput.setText(this.inputText);
          this.justificationInput.setColor('#e7eaf2');
        } else {
          this.justificationInput.setText('Type your reasoning...');
          this.justificationInput.setColor('#667788');
        }
      });
    }

    // Store the choice timing for when justification completes
    (this as unknown as Record<string, unknown>)._choiceResponseTime = choiceResponseTime;
    (this as unknown as Record<string, unknown>)._justStartTime = justStartTime;
  }

  private onSubmitJustification(): void {
    if (!this.waitingForJustification) return;
    this.waitingForJustification = false;

    const choiceResponseTime = (this as unknown as Record<string, unknown>)._choiceResponseTime as number;
    const justStartTime = (this as unknown as Record<string, unknown>)._justStartTime as number;
    const justificationTime = Date.now() - justStartTime;

    // Remove keyboard listener
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }

    this.trialData.push({
      scenarioIndex: this.currentScenario,
      choiceIndex: this.currentChoiceIndex,
      choiceText: this.currentChoiceText,
      responseTimeMs: choiceResponseTime,
      justification: this.inputText || null,
      justificationTimeMs: justificationTime,
      timestamp: this.scenarioStartTime,
    });

    // Hide justification UI
    this.justificationPrompt.setAlpha(0);
    this.justificationInput.setAlpha(0);
    this.submitButton.setAlpha(0);

    this.currentScenario++;
    this.advanceOrComplete();
  }

  private advanceOrComplete(): void {
    if (this.currentScenario < this.scenarioCount) {
      // Brief transition, then next scenario
      this.scene.time.delayedCall(300, () => this.presentScenario());
    } else {
      this.completeTask();
    }
  }

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      // For dilemmas, we don't score "accuracy" in the traditional sense.
      // Depth is measured by whether justification was provided and its length
      if (trial.justification) {
        const wordCount = trial.justification.trim().split(/\s+/).length;
        // Depth proxy: more elaboration = more depth (normalized, 5 words = 0.3, 50+ = 1.0)
        dimensions.depth = Math.min(1.0, Math.max(0.1, (wordCount - 2) / 48));
        // Coherence proxy: response time for justification indicates deliberation
        // Too fast (<3s) might be shallow, 8-30s is thoughtful
        if (trial.justificationTimeMs !== null) {
          const seconds = trial.justificationTimeMs / 1000;
          dimensions.coherence = Math.min(1.0, Math.max(0.2, seconds / 20));
        }
      } else {
        // Choice-only: base depth on response time (very fast = impulsive, moderate = considered)
        const rtSeconds = trial.responseTimeMs / 1000;
        dimensions.depth = Math.min(1.0, Math.max(0.1, rtSeconds / 15));
      }

      // Response time as dimension
      dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 1000) / 29000));

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          choiceIndex: trial.choiceIndex,
          choiceText: trial.choiceText,
          justification: trial.justification,
          responseTimeMs: trial.responseTimeMs,
          justificationTimeMs: trial.justificationTimeMs,
          dilemmaType: this.dilemmaType,
          scenarioIndex: trial.scenarioIndex,
        },
        durationMs: trial.responseTimeMs + (trial.justificationTimeMs ?? 0),
      };
    });

    this.onComplete(results);
  }

  // --- UI Helpers ---

  private createChoiceButton(x: number, y: number, text: string, index: number): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const btnWidth = width - 80;
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, btnWidth, 56, 0x1b2740)
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
    btn.setSize(btnWidth, 56);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => bg.setFillStyle(0x2a3b5e));
    btn.on('pointerout', () => bg.setFillStyle(0x1b2740));
    btn.on('pointerdown', () => this.onChoiceSelected(index));

    return btn;
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
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
    btn.on('pointerdown', () => onClick());

    return btn;
  }
}
