import Phaser from 'phaser';
import type { AskUserQuestionParams, AskUserQuestionResult, MCQOption, UserAnswer } from '@core/assessments/agentTypes.js';

/**
 * LLMDialogueRenderer — Premium game-quality encounter UI.
 *
 * Layout (1080×1920 portrait):
 * ┌─────────────────────────────┐ y=0
 * │  [Header bar]               │ 72px
 * ├─────────────────────────────┤
 * │  [Narrative bubble]         │ auto-height
 * │                             │
 * │  ─── separator line ───     │
 * │                             │
 * │  [A] Option 1               │ 96px each
 * │  [B] Option 2               │
 * │  [C] Option 3               │
 * │  [D] Option 4               │
 * │  [✎] Write your own         │ 84px
 * │  [  textarea (inline)  ]    │ 200px (when active)
 * │                             │
 * ├─────────────────────────────┤
 * │  [Submit button]            │ 84px (fixed at bottom)
 * └─────────────────────────────┘
 */

// ── Theme ─────────────────────────────────────────────────────────────
const C = {
  bg: 0x05070b,
  bgGradTop: 0x060913,
  bgGradBot: 0x0a1020,
  cardBg: 0x0d1520,
  bubbleBg: 0x121e30,
  accent: 0x4cc9f0,
  accentDim: 0x2a6f8a,
  accentGreen: 0x44cc88,
  textMain: '#e7eaf2',
  textMuted: '#667788',
  textAccent: '#4cc9f0',
  textGreen: '#44cc88',
  btnNormal: 0x142035,
  btnHover: 0x1e304f,
  btnSelected: 0x1a3a6a,
  btnWriteNormal: 0x142020,
  btnWriteActive: 0x1a3a2a,
  borderNormal: 0x2a3b5e,
  borderSelected: 0x4cc9f0,
  borderGreen: 0x44cc88,
  separator: 0x2a3b5e,
};

// ── Layout constants (1080×1920) ───────────────────────────────────────
const PAD = 30;
const HEADER_H = 72;
const OPTION_H = 96;
const OPTION_GAP = 14;
const WRITE_BTN_H = 84;
const WRITE_AREA_H = 200;
const SUBMIT_H = 84;
const SUBMIT_BOTTOM_PAD = 36;
const SEPARATOR_GAP = 24;
const BUBBLE_TOP_PAD = 18;
const BUBBLE_BOTTOM_PAD = 24;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

// ── Animation ─────────────────────────────────────────────────────────
const EASE_SHOW = 'Cubic.easeOut';
const EASE_TAP = 'Quad.easeOut';
const OPTION_STAGGER_MS = 60;
const OPTION_SHOW_DURATION = 350;

export class LLMDialogueRenderer {
  private scene: Phaser.Scene;
  private params: AskUserQuestionParams;
  private onComplete: (result: AskUserQuestionResult) => void;

  // State
  private activeQuestionIndex = 0;
  private answers: Map<number, UserAnswer> = new Map();
  private inputTexts: Map<number, string> = new Map();
  private writeInActive: Map<number, boolean> = new Map();

  // UI layers
  private container!: Phaser.GameObjects.Container;
  private scrollContainer!: Phaser.GameObjects.Container;
  private fixedContainer!: Phaser.GameObjects.Container;

  // Scroll state
  private scrollY = 0;
  private maxScrollY = 0;
  private dragStartY = 0;
  private dragStartScrollY = 0;
  // DOM input
  private domInput?: HTMLTextAreaElement;
  private domInputWrapper?: HTMLDivElement;
  private writeInLocalY = 0; // local Y of the textarea within scrollContainer

  constructor(
    scene: Phaser.Scene,
    params: AskUserQuestionParams,
    onComplete: (result: AskUserQuestionResult) => void
  ) {
    this.scene = scene;
    this.params = params;
    this.onComplete = onComplete;

    this.params.questions.forEach((_, idx) => {
      this.answers.set(idx, { selectedLabels: [] });
      this.inputTexts.set(idx, '');
      this.writeInActive.set(idx, false);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────

  create(): void {
    const { width, height } = this.scene.scale;

    this.container = this.scene.add.container(0, 0).setDepth(100);

    // Gradient background with subtle radial glow
    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(C.bgGradTop, C.bgGradTop, C.bgGradBot, C.bgGradBot, 1);
    bg.fillRect(0, 0, width, height);
    // Subtle center radial glow
    bg.fillStyle(C.accent, 0.02);
    bg.fillCircle(width / 2, height * 0.4, width * 0.6);
    this.container.add(bg);

    // Header bar
    this.renderHeader(width);

    // Scrollable content area
    this.scrollContainer = this.scene.add.container(0, HEADER_H);
    this.container.add(this.scrollContainer);

    // Clip mask
    const maskShape = this.scene.make.graphics({});
    maskShape.fillRect(0, HEADER_H, width, height - HEADER_H - SUBMIT_H - SUBMIT_BOTTOM_PAD - 20);
    this.scrollContainer.setMask(maskShape.createGeometryMask());

    // Fixed submit button
    this.fixedContainer = this.scene.add.container(0, 0).setDepth(101);
    this.container.add(this.fixedContainer);
    this.renderSubmitButton(width, height);

    // Render content
    this.renderActiveQuestion();

    // Scroll handling
    this.setupScroll(width, height);
  }

  destroy(): void {
    this.removeDomInput();
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }
    this.container?.destroy(true);
    this.fixedContainer?.destroy(true);
  }

  // ── Animation helper ────────────────────────────────────────────────

  private fadeIn(obj: Phaser.GameObjects.GameObject & { alpha: number; y?: number }, delay: number, targetY?: number): void {
    obj.alpha = 0;
    if (targetY !== undefined && 'y' in obj) {
      const finalY = targetY;
      (obj as any).y = finalY + 20;
      this.scene.tweens.add({
        targets: obj,
        alpha: 1,
        y: finalY,
        duration: OPTION_SHOW_DURATION,
        delay,
        ease: EASE_SHOW,
      });
    } else {
      this.scene.tweens.add({
        targets: obj,
        alpha: 1,
        duration: OPTION_SHOW_DURATION,
        delay,
        ease: EASE_SHOW,
      });
    }
  }

  // ── Header ──────────────────────────────────────────────────────────

  private renderHeader(width: number): void {
    // Header background with blur effect
    const headerBg = this.scene.add.rectangle(width / 2, HEADER_H / 2, width, HEADER_H, 0x0a0f1a, 0.95)
      .setOrigin(0.5);
    this.container.add(headerBg);

    // Bottom border line
    const headerBorder = this.scene.add.rectangle(width / 2, HEADER_H, width, 1, C.accent, 0.15)
      .setOrigin(0.5);
    this.container.add(headerBorder);

    // Title with icon
    const title = this.scene.add.text(PAD, HEADER_H / 2, '◈  Encounter', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: C.textAccent,
    }).setOrigin(0, 0.5);
    this.container.add(title);

    if (this.params.questions.length > 1) {
      this.renderTabs(width);
    }
  }

  private renderTabs(width: number): void {
    const questions = this.params.questions;
    const tabW = Math.min(80, (width - PAD * 2 - 100) / questions.length);
    const startX = width - PAD - tabW * questions.length;

    questions.forEach((q, idx) => {
      const isActive = idx === this.activeQuestionIndex;
      const x = startX + idx * (tabW + 4) + tabW / 2;
      const tab = this.scene.add.container(x, HEADER_H / 2);

      const bg = this.scene.add.rectangle(0, 0, tabW, 42,
        isActive ? C.btnSelected : C.btnNormal, isActive ? 0.9 : 0.5
      ).setStrokeStyle(1, isActive ? C.borderSelected : C.borderNormal, 0.7).setOrigin(0.5);

      const label = this.scene.add.text(0, 0, q.header ?? `${idx + 1}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: isActive ? C.textMain : C.textMuted,
      }).setOrigin(0.5);

      tab.add([bg, label]);
      tab.setSize(tabW, 42);
      tab.setInteractive({ useHandCursor: true });
      tab.on('pointerdown', () => this.switchQuestion(idx));
      this.container.add(tab);
    });
  }

  // ── Content rendering ───────────────────────────────────────────────

  private renderActiveQuestion(): void {
    this.scrollContainer.removeAll(true);
    this.removeDomInput();
    this.scrollY = 0;
    this.scrollContainer.y = HEADER_H;
    this.writeInLocalY = 0;

    const { width } = this.scene.scale;
    const q = this.params.questions[this.activeQuestionIndex]!;
    const isWriteIn = this.writeInActive.get(this.activeQuestionIndex) || false;
    const contentW = width - PAD * 2;
    let y = 0;
    let animIdx = 0;

    // ── 1. Narrative bubble ───────────────────────────────────────────
    const bubble = this.createNarrativeBubble(PAD, y, contentW, q.question);
    this.scrollContainer.add(bubble);
    this.fadeIn(bubble, 0, y);
    y += bubble.height + SEPARATOR_GAP;

    // ── 2. Separator line ─────────────────────────────────────────────
    const sep = this.scene.add.graphics();
    sep.lineStyle(1, C.separator, 0.4);
    sep.moveTo(PAD + 20, y + SEPARATOR_GAP / 2);
    sep.lineTo(width - PAD - 20, y + SEPARATOR_GAP / 2);
    sep.strokePath();
    this.scrollContainer.add(sep);
    y += SEPARATOR_GAP * 2;

    // ── 3. Section label ──────────────────────────────────────────────
    const sectionLabel = this.scene.add.text(PAD + 4, y, 'CHOOSE YOUR RESPONSE', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: C.textMuted,
      letterSpacing: 2,
    });
    this.scrollContainer.add(sectionLabel);
    this.fadeIn(sectionLabel, 50);
    y += 32;

    // ── 4. MCQ options (always exactly 4) ─────────────────────────────
    const mcqOptions = this.getDisplayOptions(q.options);
    for (let idx = 0; idx < mcqOptions.length; idx++) {
      const opt = mcqOptions[idx]!;
      const isSelected = this.isOptionSelected(opt.label) && !isWriteIn;
      const btn = this.createOptionButton(PAD, y, contentW, opt, isSelected, idx);
      this.scrollContainer.add(btn);
      this.fadeIn(btn, 100 + animIdx * OPTION_STAGGER_MS, y);
      animIdx++;
      y += OPTION_H + OPTION_GAP;
    }

    // ── 5. Write-in button ────────────────────────────────────────────
    if (q.allowWriteIn) {
      y += 4;
      const writeBtn = this.createWriteInButton(PAD, y, contentW, isWriteIn);
      this.scrollContainer.add(writeBtn);
      this.fadeIn(writeBtn, 100 + animIdx * OPTION_STAGGER_MS, y);
      animIdx++;
      y += WRITE_BTN_H + OPTION_GAP;
    }

    // ── 6. Inline write-in area (when active) ─────────────────────────
    if (isWriteIn) {
      y += 6;
      this.writeInLocalY = y;
      const textVal = this.inputTexts.get(this.activeQuestionIndex) || '';

      // Textarea background with accent border
      const textareaBg = this.scene.add.rectangle(PAD + contentW / 2, y + WRITE_AREA_H / 2, contentW, WRITE_AREA_H, C.cardBg, 0.95)
        .setStrokeStyle(1.5, C.accent, 0.6).setOrigin(0.5);
      this.scrollContainer.add(textareaBg);

      // Inner glow line at top
      const innerGlow = this.scene.add.rectangle(PAD + contentW / 2, y + 1, contentW - 4, 2, C.accent, 0.15)
        .setOrigin(0.5, 0);
      this.scrollContainer.add(innerGlow);

      // Placeholder / text display
      const displayText = textVal || 'Type your response here...';
      const textDisplay = this.scene.add.text(PAD + 20, y + 18, displayText, {
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        fontSize: '20px',
        color: textVal ? C.textMain : '#445566',
        wordWrap: { width: contentW - 40 },
        lineSpacing: 8,
      }).setOrigin(0, 0);
      this.scrollContainer.add(textDisplay);

      // Char counter
      const counterColor = textVal.length > 400 ? '#cc6644' : '#445566';
      const counter = this.scene.add.text(width - PAD - 20, y + WRITE_AREA_H - 30, `${textVal.length} / 500`, {
        fontFamily: '"Segoe UI Mono", "SF Mono", monospace',
        fontSize: '15px',
        color: counterColor,
      }).setOrigin(1, 0.5);
      this.scrollContainer.add(counter);

      this.fadeIn(textareaBg, 100 + animIdx * OPTION_STAGGER_MS, y + WRITE_AREA_H / 2);

      y += WRITE_AREA_H + OPTION_GAP;

      // DOM textarea for actual keyboard input
      this.showDomInput(textVal, y);
    }

    // Calculate max scroll
    const visibleH = this.scene.scale.height - HEADER_H - SUBMIT_H - SUBMIT_BOTTOM_PAD - 20;
    this.maxScrollY = Math.max(0, y - visibleH);
  }

  /**
   * Ensure exactly 4 MCQ options are displayed.
   * Filters out synthetic write-in options, then pads to 4 if needed.
   */
  private getDisplayOptions(options: readonly MCQOption[] | undefined): MCQOption[] {
    if (!options || options.length === 0) return [];

    // Filter out any synthetic "Write your own" options from the array
    const filtered = options.filter(o =>
      o.label !== 'Write your own response' &&
      o.label !== 'Write your own' &&
      !o.label.toLowerCase().startsWith('write your own')
    );

    // Take up to 4 options
    const display = filtered.slice(0, 4);

    // Pad to 4 if the LLM didn't provide enough
    const defaults: MCQOption[] = [
      { label: 'Engage directly', description: 'Step forward and face the challenge head-on' },
      { label: 'Observe carefully', description: 'Take a moment to understand the full picture' },
      { label: 'Seek counsel', description: 'Look for wisdom from those around you' },
      { label: 'Trust your instinct', description: 'Let your deeper knowing guide the way' },
    ];

    let defIdx = 0;
    while (display.length < 4 && defIdx < defaults.length) {
      const candidate = defaults[defIdx]!;
      if (!display.some(d => d.label === candidate.label)) {
        display.push(candidate);
      }
      defIdx++;
    }

    return display;
  }

  // ── Narrative bubble ────────────────────────────────────────────────

  private createNarrativeBubble(x: number, y: number, w: number, text: string): Phaser.GameObjects.Container {
    const bubble = this.scene.add.container(x, y);

    // Measure text
    const tempText = this.scene.add.text(0, 0, text, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '22px',
      color: C.textMain,
      wordWrap: { width: w - 56 },
      lineSpacing: 8,
      align: 'left',
    });
    const textH = tempText.height;
    tempText.destroy();

    const totalH = textH + BUBBLE_TOP_PAD + BUBBLE_BOTTOM_PAD;

    // Background
    const bg = this.scene.add.rectangle(w / 2, totalH / 2, w, totalH, C.bubbleBg, 0.95)
      .setStrokeStyle(1, 0x3a5a7a, 0.3).setOrigin(0.5);
    bubble.add(bg);

    // Left accent bar (wider, more prominent)
    const accentBar = this.scene.add.rectangle(4, totalH / 2, 5, totalH - 16, C.accent, 0.9).setOrigin(0, 0.5);
    bubble.add(accentBar);

    // Top accent line
    const topLine = this.scene.add.rectangle(w / 2, 1, w, 1, C.accent, 0.08).setOrigin(0.5, 0);
    bubble.add(topLine);

    // Text
    const dialogue = this.scene.add.text(28, BUBBLE_TOP_PAD, text, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '22px',
      color: C.textMain,
      wordWrap: { width: w - 56 },
      lineSpacing: 8,
      align: 'left',
    }).setOrigin(0, 0);
    bubble.add(dialogue);

    bubble.setSize(w, totalH);
    return bubble;
  }

  // ── Option button ───────────────────────────────────────────────────

  private createOptionButton(x: number, y: number, w: number, opt: MCQOption, isSelected: boolean, letterIdx: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const letter = LETTERS[letterIdx] ?? `${letterIdx + 1}`;

    // Selection glow (behind the card)
    if (isSelected) {
      const glow = this.scene.add.rectangle(w / 2, OPTION_H / 2, w + 8, OPTION_H + 8, C.accent, 0.08)
        .setOrigin(0.5);
      btn.add(glow);
    }

    // Card background
    const bg = this.scene.add.rectangle(w / 2, OPTION_H / 2, w, OPTION_H,
      isSelected ? C.btnSelected : C.btnNormal, isSelected ? 0.95 : 0.7
    ).setStrokeStyle(1.5, isSelected ? C.borderSelected : C.borderNormal, isSelected ? 0.9 : 0.4).setOrigin(0.5);
    btn.add(bg);

    // Left accent bar (colored when selected)
    const accentBar = this.scene.add.rectangle(0, OPTION_H / 2, 4, OPTION_H - 16,
      isSelected ? C.accent : C.borderNormal, isSelected ? 0.9 : 0.3
    ).setOrigin(0, 0.5);
    btn.add(accentBar);

    // Letter badge
    const badgeSize = 36;
    const badgeX = 28 + badgeSize / 2;
    const badgeBg = this.scene.add.circle(badgeX, OPTION_H / 2, badgeSize / 2,
      isSelected ? C.accent : 0x1a2a40, isSelected ? 0.9 : 0.6
    ).setOrigin(0.5);
    btn.add(badgeBg);

    const badgeText = this.scene.add.text(badgeX, OPTION_H / 2, letter, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: isSelected ? '#ffffff' : '#8899aa',
    }).setOrigin(0.5);
    btn.add(badgeText);

    // Label text
    const labelX = 28 + badgeSize + 16;
    const label = this.scene.add.text(labelX, 22, opt.label, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: isSelected ? '#ffffff' : '#c0ccdd',
    }).setOrigin(0, 0);
    btn.add(label);

    // Description text
    const desc = this.scene.add.text(labelX, 52, opt.description, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '16px',
      color: isSelected ? '#99bbdd' : '#667788',
      wordWrap: { width: w - labelX - 60 },
    }).setOrigin(0, 0);
    btn.add(desc);

    // Selection radio indicator
    const radioX = w - 36;
    const radioOuter = this.scene.add.circle(radioX, OPTION_H / 2, 13,
      isSelected ? C.accent : C.borderNormal, isSelected ? 1 : 0.3
    ).setOrigin(0.5);
    btn.add(radioOuter);

    if (isSelected) {
      const radioInner = this.scene.add.circle(radioX, OPTION_H / 2, 6, 0xffffff, 1).setOrigin(0.5);
      btn.add(radioInner);

      // Checkmark icon
      const check = this.scene.add.text(radioX, OPTION_H / 2, '✓', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#1a3a6a',
      }).setOrigin(0.5);
      btn.add(check);
    }

    btn.setSize(w, OPTION_H);
    btn.setInteractive({ useHandCursor: true });

    // Hover / tap interactions
    btn.on('pointerover', () => {
      if (!isSelected) {
        bg.setFillStyle(C.btnHover, 0.85);
        accentBar.setFillStyle(C.accent, 0.4);
      }
    });
    btn.on('pointerout', () => {
      if (!isSelected) {
        bg.setFillStyle(C.btnNormal, 0.7);
        accentBar.setFillStyle(C.borderNormal, 0.3);
      }
    });
    btn.on('pointerdown', () => {
      // Tap scale micro-interaction
      this.scene.tweens.add({
        targets: btn,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 60,
        ease: EASE_TAP,
        yoyo: true,
        onComplete: () => this.toggleOption(opt.label),
      });
    });

    return btn;
  }

  // ── Write-in button ─────────────────────────────────────────────────

  private createWriteInButton(x: number, y: number, w: number, isActive: boolean): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);

    // Background
    const bg = this.scene.add.rectangle(w / 2, WRITE_BTN_H / 2, w, WRITE_BTN_H,
      isActive ? C.btnWriteActive : C.btnWriteNormal, isActive ? 0.95 : 0.7
    ).setStrokeStyle(1.5, isActive ? C.borderGreen : C.borderNormal, isActive ? 0.9 : 0.4).setOrigin(0.5);
    btn.add(bg);

    // Left accent bar (green tint)
    const accentBar = this.scene.add.rectangle(0, WRITE_BTN_H / 2, 4, WRITE_BTN_H - 16,
      isActive ? C.accentGreen : C.borderNormal, isActive ? 0.9 : 0.3
    ).setOrigin(0, 0.5);
    btn.add(accentBar);

    // Pencil icon
    const icon = this.scene.add.text(28, WRITE_BTN_H / 2, '✎', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: isActive ? C.textGreen : '#7788aa',
    }).setOrigin(0, 0.5);
    btn.add(icon);

    // Label
    const label = this.scene.add.text(68, 18, 'Write your own response', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: isActive ? '#ffffff' : '#aabbcc',
    }).setOrigin(0, 0);
    btn.add(label);

    // Description
    const desc = this.scene.add.text(68, 48, 'Express yourself in your own words', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '16px',
      color: isActive ? '#88ddaa' : '#667788',
    }).setOrigin(0, 0);
    btn.add(desc);

    btn.setSize(w, WRITE_BTN_H);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      if (!isActive) {
        bg.setFillStyle(C.btnWriteActive, 0.85);
        accentBar.setFillStyle(C.accentGreen, 0.4);
      }
    });
    btn.on('pointerout', () => {
      if (!isActive) {
        bg.setFillStyle(C.btnWriteNormal, 0.7);
        accentBar.setFillStyle(C.borderNormal, 0.3);
      }
    });
    btn.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: btn,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 60,
        ease: EASE_TAP,
        yoyo: true,
        onComplete: () => this.activateWriteIn(),
      });
    });

    return btn;
  }

  // ── Submit button ───────────────────────────────────────────────────

  private renderSubmitButton(width: number, height: number): void {
    const y = height - SUBMIT_H - SUBMIT_BOTTOM_PAD;

    // Glow behind button
    const glow = this.scene.add.rectangle(width / 2, y + SUBMIT_H / 2, width - PAD * 2 + 12, SUBMIT_H + 12, C.accent, 0.06)
      .setOrigin(0.5);
    this.fixedContainer.add(glow);

    // Button background
    const bg = this.scene.add.rectangle(width / 2, y + SUBMIT_H / 2, width - PAD * 2, SUBMIT_H, C.btnNormal)
      .setStrokeStyle(2, C.accent, 0.7).setOrigin(0.5);
    this.fixedContainer.add(bg);

    // Top inner highlight
    const highlight = this.scene.add.rectangle(width / 2, y + 2, width - PAD * 2 - 4, 1, 0xffffff, 0.06)
      .setOrigin(0.5, 0);
    this.fixedContainer.add(highlight);

    // Label
    const label = this.scene.add.text(width / 2, y + SUBMIT_H / 2, 'Submit Response', {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: C.textMain,
    }).setOrigin(0.5);
    this.fixedContainer.add(label);

    // Breathing glow animation
    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.04, to: 0.1 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(C.btnHover);
      bg.setStrokeStyle(2, C.accent, 1);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(C.btnNormal);
      bg.setStrokeStyle(2, C.accent, 0.7);
    });
    bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: [bg, label],
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 80,
        ease: EASE_TAP,
        yoyo: true,
        onComplete: () => this.submitAllAnswers(),
      });
    });
  }

  // ── Scroll handling ─────────────────────────────────────────────────

  private setupScroll(_width: number, height: number): void {
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      const dy = pointer.y - this.dragStartY;
      if (Math.abs(dy) > 5) {
        this.scrollY = Phaser.Math.Clamp(
          this.dragStartScrollY - dy,
          0,
          this.maxScrollY
        );
        this.scrollContainer.y = HEADER_H - this.scrollY;
        this.updateDomInputPosition();
      }
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > HEADER_H && pointer.y < height - SUBMIT_H - SUBMIT_BOTTOM_PAD) {
        this.dragStartY = pointer.y;
        this.dragStartScrollY = this.scrollY;
      }
    });

    this.scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScrollY);
      this.scrollContainer.y = HEADER_H - this.scrollY;
      this.updateDomInputPosition();
    });
  }

  // ── State management ────────────────────────────────────────────────

  private switchQuestion(index: number): void {
    this.activeQuestionIndex = index;
    this.renderActiveQuestion();
    if (this.container.scene) {
      this.renderHeader(this.scene.scale.width);
    }
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
      if (selected.includes(label)) selected = selected.filter(l => l !== label);
      else selected.push(label);
    } else {
      selected = [label];
    }

    // Deactivate write-in when selecting an MCQ option
    this.writeInActive.set(this.activeQuestionIndex, false);
    this.removeDomInput();

    this.answers.set(this.activeQuestionIndex, { selectedLabels: selected, writeInValue: undefined });
    this.renderActiveQuestion();
  }

  private activateWriteIn(): void {
    this.answers.set(this.activeQuestionIndex, {
      selectedLabels: [],
      writeInValue: this.inputTexts.get(this.activeQuestionIndex) || undefined,
    });
    this.writeInActive.set(this.activeQuestionIndex, true);
    this.renderActiveQuestion();
  }

  // ── DOM input for mobile keyboard ───────────────────────────────────

  private showDomInput(currentValue: string, _contentY: number): void {
    this.removeDomInput();

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / this.scene.scale.width;

    // Position the textarea inline within the scrollable area
    const canvasY = HEADER_H - this.scrollY + this.writeInLocalY + 18;
    const wrapperTop = rect.top + canvasY * scale;
    const wrapperLeft = rect.left + PAD * scale;
    const wrapperWidth = (this.scene.scale.width - PAD * 2) * scale;

    this.domInputWrapper = document.createElement('div');
    this.domInputWrapper.className = 'encounter-writein-wrapper';
    this.domInputWrapper.style.cssText = `
      left: ${wrapperLeft}px;
      top: ${wrapperTop}px;
      width: ${wrapperWidth}px;
    `;

    this.domInput = document.createElement('textarea');
    this.domInput.className = 'encounter-writein-textarea';
    this.domInput.value = currentValue;
    this.domInput.placeholder = 'Type your response here...';
    this.domInput.maxLength = 500;

    const input = this.domInput;
    const wrapper = this.domInputWrapper;

    input.addEventListener('input', () => {
      const val = input.value;
      this.inputTexts.set(this.activeQuestionIndex, val);
      this.answers.set(this.activeQuestionIndex, {
        selectedLabels: [],
        writeInValue: val.trim() || undefined,
      });
    });

    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    setTimeout(() => input.focus(), 150);
  }

  /** Keep the DOM textarea aligned when scrolling */
  private updateDomInputPosition(): void {
    if (!this.domInputWrapper || this.writeInLocalY === 0) return;

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / this.scene.scale.width;

    const canvasY = HEADER_H - this.scrollY + this.writeInLocalY + 18;
    this.domInputWrapper.style.top = `${rect.top + canvasY * scale}px`;
  }

  private removeDomInput(): void {
    if (this.domInputWrapper?.parentNode) {
      this.domInputWrapper.parentNode.removeChild(this.domInputWrapper);
    }
    this.domInputWrapper = undefined;
    this.domInput = undefined;
  }

  // ── Submit ──────────────────────────────────────────────────────────

  private submitAllAnswers(): void {
    for (let i = 0; i < this.params.questions.length; i++) {
      const q = this.params.questions[i]!;
      const ans = this.answers.get(i);
      const textVal = this.inputTexts.get(i) || '';
      const isWriteIn = this.writeInActive.get(i) || false;

      if (isWriteIn) {
        if (textVal.trim().length === 0) {
          this.switchQuestion(i);
          this.camerasFlashAccent();
          return;
        }
      } else if (q.options && q.options.length > 0) {
        if (!ans || ans.selectedLabels.length === 0) {
          this.switchQuestion(i);
          this.camerasFlashAccent();
          return;
        }
      } else {
        if (textVal.trim().length === 0) {
          this.switchQuestion(i);
          this.camerasFlashAccent();
          return;
        }
      }
    }

    const aggregated: UserAnswer[] = [];
    for (let i = 0; i < this.params.questions.length; i++) {
      aggregated.push(this.answers.get(i) || { selectedLabels: [] });
    }

    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.removeAllListeners();
    }

    this.onComplete({ answers: aggregated });
  }

  private camerasFlashAccent(): void {
    this.scene.cameras.main.flash(200, 200, 50, 50);
  }
}
