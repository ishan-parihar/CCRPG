import Phaser from 'phaser';
import type { AskUserQuestionParams, AskUserQuestionResult, MCQOption, UserAnswer } from '@core/assessments/agentTypes.js';

export class LLMDialogueRenderer {
  private scene: Phaser.Scene;
  private params: AskUserQuestionParams;
  private onComplete: (result: AskUserQuestionResult) => void;

  // Active state
  private activeQuestionIndex = 0;
  private answers: Map<number, UserAnswer> = new Map();
  private inputTexts: Map<number, string> = new Map(); // Store write-in values per question index

  // UI elements container
  private container!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabContainer!: Phaser.GameObjects.Container;

  // Question UI elements (recreated when switching questions)
  private promptBubble!: Phaser.GameObjects.Container;
  private inputBg?: Phaser.GameObjects.Rectangle;
  private inputArea?: Phaser.GameObjects.Text;
  private charCounter?: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private submitButton!: Phaser.GameObjects.Container;

  // Theme Colors
  private colors = {
    bg: 0x05070b,
    cardBg: 0x0d1520,
    bubbleBg: 0x1a2a40,
    accent: 0x4cc9f0,
    accentGlow: 0x4488ff,
    textMuted: '#667788',
    textMain: '#e7eaf2',
    buttonNormal: 0x142035,
    buttonSelected: 0x2a4ba3,
    buttonHover: 0x1e304f,
    borderNormal: 0x2a3b5e,
    borderSelected: 0x4cc9f0,
  };

  constructor(
    scene: Phaser.Scene,
    params: AskUserQuestionParams,
    onComplete: (result: AskUserQuestionResult) => void
  ) {
    this.scene = scene;
    this.params = params;
    this.onComplete = onComplete;

    // Initialize answer map
    this.params.questions.forEach((_, idx) => {
      this.answers.set(idx, { selectedLabels: [] });
      this.inputTexts.set(idx, '');
    });
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);

    // Dynamic background overlay for premium feel
    const bgGlow = this.scene.add.graphics();
    bgGlow.fillGradientStyle(0x060913, 0x060913, 0x0a1020, 0x0a1020, 1);
    bgGlow.fillRect(0, 0, width, height);
    this.container.add(bgGlow);

    // Tab Headers (rendered once if multiple questions exist)
    this.tabContainer = this.scene.add.container(0, 0);
    this.container.add(this.tabContainer);
    if (this.params.questions.length > 1) {
      this.renderTabs();
    }

    // Main Question Content Container
    this.contentContainer = this.scene.add.container(0, 0);
    this.container.add(this.contentContainer);

    // Render active question
    this.renderActiveQuestion();

    // Render global submit button
    const submitY = height - 70;
    this.submitButton = this.createSubmitButton(width / 2, submitY);
    this.container.add(this.submitButton);

    // Set up global keyboard listener for write-in fields
    this.setupKeyboardInput();
  }

  destroy(): void {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    this.container.destroy(true);
  }

  private renderTabs(): void {
    this.tabContainer.removeAll(true);
    const { width } = this.scene.scale;
    const questions = this.params.questions;
    const tabWidth = (width - 40) / questions.length;
    const startX = 20 + tabWidth / 2;
    const y = 50;

    questions.forEach((q, idx) => {
      const isActive = idx === this.activeQuestionIndex;
      const x = startX + idx * tabWidth;

      const tab = this.scene.add.container(x, y);
      const bg = this.scene.add.rectangle(
        0,
        0,
        tabWidth - 6,
        36,
        isActive ? this.colors.buttonSelected : this.colors.buttonNormal,
        isActive ? 0.9 : 0.6
      )
        .setStrokeStyle(1.5, isActive ? this.colors.borderSelected : this.colors.borderNormal, isActive ? 0.9 : 0.6)
        .setOrigin(0.5);

      const label = this.scene.add.text(0, 0, q.header, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: isActive ? 'bold' : 'normal',
        color: isActive ? '#ffffff' : '#aabbcc',
      }).setOrigin(0.5);

      tab.add([bg, label]);
      tab.setSize(tabWidth - 6, 36);
      tab.setInteractive({ useHandCursor: true });

      tab.on('pointerdown', () => {
        if (this.activeQuestionIndex !== idx) {
          this.switchQuestion(idx);
        }
      });

      this.tabContainer.add(tab);
    });
  }

  private switchQuestion(index: number): void {
    this.activeQuestionIndex = index;
    if (this.params.questions.length > 1) {
      this.renderTabs();
    }
    this.renderActiveQuestion();
  }

  private renderActiveQuestion(): void {
    this.contentContainer.removeAll(true);
    this.optionButtons = [];

    const { width } = this.scene.scale;
    const q = this.params.questions[this.activeQuestionIndex]!;

    // 1. Dialogue/NPC prompt bubble
    const bubbleY = this.params.questions.length > 1 ? 110 : 60;
    this.promptBubble = this.createDialogueBubble(width / 2, bubbleY, q.question);
    this.contentContainer.add(this.promptBubble);

    // Calculate prompt bubble height dynamically
    const bubbleBg = this.promptBubble.list[0] as Phaser.GameObjects.Rectangle;
    const bubbleHeight = bubbleBg.height;
    let nextY = bubbleY + bubbleHeight + 20;

    // 2. Options list
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt, idx) => {
        const isSelected = this.isOptionSelected(opt.label);
        const optBtn = this.createOptionButton(width / 2, nextY, opt, idx, isSelected);
        this.contentContainer.add(optBtn);
        this.optionButtons.push(optBtn);
        nextY += optBtn.height + 12;
      });
    }

    // 3. Write-in text area (if enabled or no options exist)
    const showWriteIn = q.allowWriteIn || !q.options || q.options.length === 0;
    if (showWriteIn) {
      nextY += 10;
      const textVal = this.inputTexts.get(this.activeQuestionIndex) || '';
      
      const inputBgY = nextY + 60;
      const inputAreaY = nextY + 12;
      const charCounterY = nextY + 110;

      this.inputBg = this.scene.add.rectangle(width / 2, inputBgY, width - 40, 110, this.colors.cardBg)
        .setStrokeStyle(1, this.colors.borderNormal, 0.6)
        .setOrigin(0.5);
      this.contentContainer.add(this.inputBg);

      this.inputArea = this.scene.add.text(40, inputAreaY, textVal || 'Type a custom response...', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: textVal ? this.colors.textMain : this.colors.textMuted,
        wordWrap: { width: width - 80 },
        lineSpacing: 4,
      }).setOrigin(0, 0);
      this.contentContainer.add(this.inputArea);

      this.charCounter = this.scene.add.text(width - 40, charCounterY, `${textVal.length}/500`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#556677',
      }).setOrigin(1, 0.5);
      this.contentContainer.add(this.charCounter);
    } else {
      this.inputBg = undefined;
      this.inputArea = undefined;
      this.charCounter = undefined;
    }
  }

  private createDialogueBubble(x: number, y: number, text: string): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const bubbleWidth = width - 40;
    const bubble = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, bubbleWidth, 0, this.colors.bubbleBg, 0.95)
      .setStrokeStyle(1, 0x3a5a7a, 0.6)
      .setOrigin(0.5, 0);

    // Decorative HSL indicator border on the left edge
    const accentLine = this.scene.add.rectangle(-bubbleWidth / 2 + 3, 0, 4, 0, this.colors.accent, 1)
      .setOrigin(0.5, 0);

    const dialogueText = this.scene.add.text(0, 16, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: this.colors.textMain,
      wordWrap: { width: bubbleWidth - 40 },
      lineSpacing: 5,
      align: 'center',
    }).setOrigin(0.5, 0);

    const textHeight = dialogueText.height + 32;
    bg.setSize(bubbleWidth, textHeight);
    accentLine.setSize(4, textHeight);

    bubble.add([bg, accentLine, dialogueText]);
    return bubble;
  }

  private createOptionButton(
    x: number,
    y: number,
    opt: MCQOption,
    _idx: number,
    isSelected: boolean
  ): Phaser.GameObjects.Container {
    const { width } = this.scene.scale;
    const btnWidth = width - 40;
    const btn = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(
      0,
      0,
      btnWidth,
      56,
      isSelected ? this.colors.buttonSelected : this.colors.buttonNormal,
      isSelected ? 0.9 : 0.6
    )
      .setStrokeStyle(1.5, isSelected ? this.colors.borderSelected : this.colors.borderNormal, isSelected ? 0.9 : 0.6)
      .setOrigin(0.5);

    const label = this.scene.add.text(-btnWidth / 2 + 20, -14, opt.label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: isSelected ? '#ffffff' : '#aabbcc',
    }).setOrigin(0, 0.5);

    const desc = this.scene.add.text(-btnWidth / 2 + 20, 10, opt.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: isSelected ? '#ccdbff' : '#7788aa',
      wordWrap: { width: btnWidth - 40 },
    }).setOrigin(0, 0.5);

    btn.add([bg, label, desc]);
    btn.setSize(btnWidth, 56);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      if (!this.isOptionSelected(opt.label)) {
        bg.setFillStyle(this.colors.buttonHover);
      }
    });

    btn.on('pointerout', () => {
      if (!this.isOptionSelected(opt.label)) {
        bg.setFillStyle(this.colors.buttonNormal);
        bg.setStrokeStyle(1.5, this.colors.borderNormal, 0.6);
      }
    });

    btn.on('pointerdown', () => {
      this.toggleOption(opt.label);
    });

    return btn;
  }

  private isOptionSelected(label: string): boolean {
    const ans = this.answers.get(this.activeQuestionIndex);
    return ans ? ans.selectedLabels.includes(label) : false;
  }

  private toggleOption(label: string): void {
    const q = this.params.questions[this.activeQuestionIndex]!;
    const ans = this.answers.get(this.activeQuestionIndex) || { selectedLabels: [] };

    let selected = [...ans.selectedLabels];

    if (q.multiSelect) {
      if (selected.includes(label)) {
        selected = selected.filter(l => l !== label);
      } else {
        selected.push(label);
      }
    } else {
      selected = [label];
    }

    this.answers.set(this.activeQuestionIndex, {
      selectedLabels: selected,
      writeInValue: this.inputTexts.get(this.activeQuestionIndex) || undefined,
    });

    // Re-render question to update highlights
    this.renderActiveQuestion();
  }

  private setupKeyboardInput(): void {
    if (!this.scene.input.keyboard) return;

    this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      const q = this.params.questions[this.activeQuestionIndex]!;
      const showWriteIn = q.allowWriteIn || !q.options || q.options.length === 0;
      if (!showWriteIn || !this.inputArea) return;

      let val = this.inputTexts.get(this.activeQuestionIndex) || '';

      if (event.key === 'Backspace') {
        val = val.slice(0, -1);
      } else if (event.key === 'Enter' && event.shiftKey) {
        if (val.length < 500) {
          val += '\n';
        }
      } else if (event.key.length === 1 && val.length < 500) {
        val += event.key;
      }

      this.inputTexts.set(this.activeQuestionIndex, val);

      // Update answer map with latest text value
      const ans = this.answers.get(this.activeQuestionIndex) || { selectedLabels: [] };
      this.answers.set(this.activeQuestionIndex, {
        ...ans,
        writeInValue: val.trim() || undefined,
      });

      // Update input area display
      this.inputArea.setText(val || 'Type a custom response...');
      this.inputArea.setColor(val ? this.colors.textMain : this.colors.textMuted);
      if (this.charCounter) {
        this.charCounter.setText(`${val.length}/500`);
      }
    });
  }

  private createSubmitButton(x: number, y: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 240, 48, this.colors.buttonNormal)
      .setStrokeStyle(1.5, this.colors.accent, 0.7)
      .setOrigin(0.5);

    const label = this.scene.add.text(0, 0, 'Submit Response', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: this.colors.textMain,
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(240, 48);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.setFillStyle(this.colors.buttonHover);
    });

    btn.on('pointerout', () => {
      bg.setFillStyle(this.colors.buttonNormal);
    });

    btn.on('pointerdown', () => {
      this.submitAllAnswers();
    });

    return btn;
  }

  private submitAllAnswers(): void {
    // Validate that all questions are answered
    for (let i = 0; i < this.params.questions.length; i++) {
      const q = this.params.questions[i]!;
      const ans = this.answers.get(i);
      const textVal = this.inputTexts.get(i) || '';

      const needsOptions = q.options && q.options.length > 0 && !q.allowWriteIn;
      if (needsOptions && (!ans || ans.selectedLabels.length === 0)) {
        // Highlight unanswered question/tab
        this.switchQuestion(i);
        this.camerasFlashAccent();
        return;
      }

      const needsTextOnly = (!q.options || q.options.length === 0);
      if (needsTextOnly && textVal.trim().length === 0) {
        this.switchQuestion(i);
        this.camerasFlashAccent();
        return;
      }
    }

    // Assemble final output
    const aggregatedAnswers: UserAnswer[] = [];
    for (let i = 0; i < this.params.questions.length; i++) {
      const ans = this.answers.get(i) || { selectedLabels: [] };
      aggregatedAnswers.push(ans);
    }

    // Terminate keyboard listeners and return
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }

    this.onComplete({
      answers: aggregatedAnswers,
    });
  }

  private camerasFlashAccent(): void {
    this.scene.cameras.main.flash(200, 200, 50, 50);
  }
}
