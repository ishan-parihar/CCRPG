import Phaser from 'phaser';
import { GameEvents, SceneKeys } from '../keys.js';
import {
  generateNBackSequence,
  nBackDamageMultiplier,
  scoreNBack,
  type NBackTrial,
  type NBackResult,
} from '@core/usecases/NBackTask.js';
import {
  generateStroopTrial,
  scoreStroop,
  STROOP_PALETTE,
  type StroopColor,
  type StroopTrial,
} from '@core/usecases/StroopTask.js';
import type {
  NBackRequestPayload,
  NBackResolvedPayload,
  StroopRequestPayload,
  StroopResolvedPayload,
} from '../events.js';

/**
 * UIOverlayScene — runs in parallel above EncounterScene. Owns all
 * cognitive-task UI (N-back rune sequence, Stroop word/ink panel).
 *
 * Per the blueprint, communication is via decoupled event emitters:
 * EncounterScene tells us "open this task"; we tell EncounterScene "here is
 * the result". This scene knows nothing about encounter math — it just
 * presents stimuli, captures input, scores trials, and reports back.
 */
export class UIOverlayScene extends Phaser.Scene {
  // Shared dimmer used for both task types.
  private dimmer!: Phaser.GameObjects.Rectangle;
  // Reusable container holding the active task's UI.
  private panel: Phaser.GameObjects.Container | null = null;

  // N-back state.
  private nbTrials: NBackTrial[] = [];
  private nbResponses: boolean[] = [];
  private nbIndex = 0;
  private nbConfig: NBackRequestPayload | null = null;
  private nbStimulusObj: Phaser.GameObjects.Container | null = null;
  private nbStimulusTimer?: Phaser.Time.TimerEvent;
  private nbInterTimer?: Phaser.Time.TimerEvent;
  /**
   * Latched response for the *current* trial. Reset between trials so
   * a single tap counts and double-taps don't double-score.
   */
  private nbResponded = false;

  // Stroop state.
  private stroopTrial: StroopTrial | null = null;
  private stroopStartedAt = 0;
  private stroopTimeoutTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: SceneKeys.UIOverlay });
  }

  create(): void {
    const { width, height } = this.scale;
    this.dimmer = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.55)
      .setOrigin(0)
      .setVisible(false)
      .setInteractive(); // swallow taps when active

    this.events.on(GameEvents.RequestNBack, this.startNBack, this);
    this.events.on(GameEvents.RequestStroop, this.startStroop, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(GameEvents.RequestNBack, this.startNBack, this);
      this.events.off(GameEvents.RequestStroop, this.startStroop, this);
      this.clearNBackTimers();
      this.clearStroopTimers();
    });
  }

  // ─── N-back ─────────────────────────────────────────────────────────
  private startNBack(payload: NBackRequestPayload): void {
    this.nbConfig = payload;
    this.nbTrials = generateNBackSequence({
      n: payload.n,
      trials: payload.trials,
      alphabetSize: 5,
    });
    this.nbResponses = new Array<boolean>(payload.trials).fill(false);
    this.nbIndex = 0;
    this.nbResponded = false;

    this.openPanel();
    this.drawNBackUI(payload);
    this.runNBackTrial();
  }

  private drawNBackUI(payload: NBackRequestPayload): void {
    if (!this.panel) return;
    const { width } = this.scale;

    const heading = this.add
      .text(0, -260, `${payload.spellName}  ·  ${payload.n}-back`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#9bd9ff',
      })
      .setOrigin(0.5);
    const sub = this.add
      .text(
        0,
        -220,
        `Tap MATCH if the rune equals the one ${payload.n} step${payload.n > 1 ? 's' : ''} back.`,
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          color: '#a8b3c7',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    // Stimulus pad.
    const pad = this.add
      .rectangle(0, 0, 260, 260, 0x0c1322, 1)
      .setStrokeStyle(2, payload.tint, 0.85);

    // Trial counter text.
    const trialText = this.add
      .text(0, 160, `1 / ${payload.trials}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#6c7794',
      })
      .setOrigin(0.5)
      .setName('nb-trial-counter');

    this.panel.add([heading, sub, pad, trialText]);

    // MATCH button.
    const btnW = width - 80;
    const btnH = 90;
    const matchBg = this.add
      .rectangle(0, 280, btnW, btnH, 0x223a5e, 1)
      .setStrokeStyle(2, payload.tint, 0.85);
    const matchLabel = this.add
      .text(0, 280, 'MATCH', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '34px',
        color: '#e7eaf2',
      })
      .setOrigin(0.5);
    const btnContainer = this.add.container(0, 0, [matchBg, matchLabel]);
    btnContainer.setSize(btnW, btnH);
    btnContainer.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, 280 - btnH / 2, btnW, btnH),
      Phaser.Geom.Rectangle.Contains,
    );
    btnContainer.on('pointerdown', () => {
      matchBg.setScale(0.98);
      matchLabel.setScale(0.98);
      this.onNBackMatchPressed();
    });
    btnContainer.on('pointerup', () => {
      matchBg.setScale(1);
      matchLabel.setScale(1);
    });
    btnContainer.on('pointerupoutside', () => {
      matchBg.setScale(1);
      matchLabel.setScale(1);
    });
    this.panel.add(btnContainer);
  }

  private runNBackTrial(): void {
    if (!this.nbConfig || !this.panel) return;
    if (this.nbIndex >= this.nbTrials.length) {
      this.finishNBack();
      return;
    }

    const trial = this.nbTrials[this.nbIndex]!;
    this.nbResponded = false;

    // Update trial counter.
    const counter = this.panel.getByName(
      'nb-trial-counter',
    ) as Phaser.GameObjects.Text | undefined;
    counter?.setText(`${this.nbIndex + 1} / ${this.nbTrials.length}`);

    // Render the rune for this trial.
    this.nbStimulusObj?.destroy();
    this.nbStimulusObj = this.makeRune(trial.stimulus, this.nbConfig.tint);
    this.panel.add(this.nbStimulusObj);

    // Schedule stimulus offset → blank → next trial.
    this.clearNBackTimers();
    this.nbStimulusTimer = this.time.delayedCall(
      this.nbConfig.stimulusDurationMs,
      () => {
        // Hide stimulus during inter-stimulus interval.
        this.nbStimulusObj?.setVisible(false);
        this.nbInterTimer = this.time.delayedCall(
          this.nbConfig!.interStimulusMs,
          () => {
            // Record response for current trial then advance.
            this.nbResponses[this.nbIndex] = this.nbResponded;
            this.nbIndex++;
            this.runNBackTrial();
          },
        );
      },
    );
  }

  private onNBackMatchPressed(): void {
    if (this.nbResponded) return;
    this.nbResponded = true;
    // Visual ack.
    this.nbStimulusObj?.setAlpha(0.6);
    this.tweens.add({
      targets: this.nbStimulusObj,
      scale: 1.1,
      duration: 90,
      yoyo: true,
    });
  }

  private finishNBack(): void {
    if (!this.nbConfig) return;
    this.clearNBackTimers();
    const score: NBackResult = scoreNBack(this.nbTrials, this.nbResponses);
    const damageMultiplier = nBackDamageMultiplier(score);
    const payload: NBackResolvedPayload = {
      spellId: this.nbConfig.spellId,
      score,
      damageMultiplier,
    };
    const config = this.nbConfig;
    this.nbConfig = null;

    // Quick result flash before closing the panel.
    this.flashNBackResult(score, () => {
      void config;
      this.closePanel();
      this.events.emit(GameEvents.ResolvedNBack, payload);
    });
  }

  private flashNBackResult(score: NBackResult, onDone: () => void): void {
    if (!this.panel) {
      onDone();
      return;
    }
    const text = this.add
      .text(
        0,
        0,
        `${Math.round(score.accuracy * 100)}%\n${score.hits}/${score.hits + score.misses} hits`,
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '40px',
          color: '#9bd9ff',
          align: 'center',
        },
      )
      .setOrigin(0.5);
    this.panel.add(text);
    this.time.delayedCall(700, onDone);
  }

  private clearNBackTimers(): void {
    this.nbStimulusTimer?.remove(false);
    this.nbInterTimer?.remove(false);
    this.nbStimulusTimer = undefined;
    this.nbInterTimer = undefined;
  }

  /** Build a small visual "rune" from primitives — no atlas required. */
  private makeRune(stimulus: number, tint: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const bg = this.add
      .rectangle(0, 0, 220, 220, 0x000000, 0)
      .setStrokeStyle(2, tint, 0.4);
    c.add(bg);

    // Five distinct shapes, one per stimulus index.
    switch (stimulus % 5) {
      case 0: {
        const t = this.add.triangle(0, 0, -80, 80, 80, 80, 0, -80, tint);
        c.add(t);
        break;
      }
      case 1: {
        const r = this.add.rectangle(0, 0, 130, 130, tint).setAngle(45);
        c.add(r);
        break;
      }
      case 2: {
        const circ = this.add.circle(0, 0, 70, tint);
        const ring = this.add.circle(0, 0, 90, tint, 0).setStrokeStyle(4, tint, 1);
        c.add([circ, ring]);
        break;
      }
      case 3: {
        const star = this.add.star(0, 0, 5, 50, 90, tint);
        c.add(star);
        break;
      }
      default: {
        const hex = this.add.polygon(
          0,
          0,
          [0, -80, 70, -40, 70, 40, 0, 80, -70, 40, -70, -40],
          tint,
        );
        c.add(hex);
        break;
      }
    }
    return c;
  }

  // ─── Stroop ────────────────────────────────────────────────────────
  private startStroop(payload: StroopRequestPayload): void {
    this.stroopTrial = generateStroopTrial();
    this.stroopStartedAt = this.time.now;
    this.openPanel();
    this.drawStroopUI(this.stroopTrial);

    this.clearStroopTimers();
    this.stroopTimeoutTimer = this.time.delayedCall(payload.windowMs, () =>
      this.resolveStroop(null),
    );
  }

  private drawStroopUI(trial: StroopTrial): void {
    if (!this.panel) return;
    const { width } = this.scale;

    const heading = this.add
      .text(0, -260, 'Defend!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '32px',
        color: '#ff8c9d',
      })
      .setOrigin(0.5);
    const sub = this.add
      .text(0, -220, 'Tap the INK color, not the word.', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#a8b3c7',
      })
      .setOrigin(0.5);

    const word = this.add
      .text(0, -40, trial.word.toUpperCase(), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '120px',
        fontStyle: 'bold',
        color: hex(STROOP_PALETTE[trial.ink]),
      })
      .setOrigin(0.5);
    this.panel.add([heading, sub, word]);

    // Color buttons row.
    const colors: StroopColor[] = ['red', 'green', 'blue', 'yellow'];
    const gap = 12;
    const btnW = (width - 80 - gap * 3) / 4;
    const btnH = 110;
    const totalW = btnW * 4 + gap * 3;
    let bx = -totalW / 2 + btnW / 2;
    const y = 200;
    for (const color of colors) {
      const tint = STROOP_PALETTE[color];
      const bg = this.add
        .rectangle(bx, y, btnW, btnH, tint, 1)
        .setStrokeStyle(3, 0xffffff, 0.8);
      const container = this.add.container(0, 0, [bg]);
      container.setSize(btnW, btnH);
      container.setInteractive(
        new Phaser.Geom.Rectangle(bx - btnW / 2, y - btnH / 2, btnW, btnH),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on('pointerdown', () => {
        bg.setScale(0.95);
        this.resolveStroop(color);
      });
      this.panel.add(container);
      bx += btnW + gap;
    }
  }

  private resolveStroop(chosen: StroopColor | null): void {
    if (!this.stroopTrial) return;
    this.clearStroopTimers();
    const reactionMs = this.time.now - this.stroopStartedAt;
    const outcome = scoreStroop(this.stroopTrial, { chosen, reactionMs });
    const payload: StroopResolvedPayload = {
      outcome,
      damageMultiplier: outcome.damageMultiplier,
      quality: outcome.quality,
    };
    this.stroopTrial = null;

    this.flashStroopResult(outcome.quality, () => {
      this.closePanel();
      this.events.emit(GameEvents.ResolvedStroop, payload);
    });
  }

  private flashStroopResult(
    quality: StroopResolvedPayload['quality'],
    onDone: () => void,
  ): void {
    if (!this.panel) {
      onDone();
      return;
    }
    const label =
      quality === 'perfect-parry'
        ? 'PERFECT PARRY'
        : quality === 'block'
          ? 'BLOCK'
          : 'FAIL';
    const color =
      quality === 'perfect-parry'
        ? '#52d273'
        : quality === 'block'
          ? '#9bd9ff'
          : '#ff4d6d';
    const t = this.add
      .text(0, -120, label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.panel.add(t);
    this.time.delayedCall(450, onDone);
  }

  private clearStroopTimers(): void {
    this.stroopTimeoutTimer?.remove(false);
    this.stroopTimeoutTimer = undefined;
  }

  // ─── Panel helpers ─────────────────────────────────────────────────
  private openPanel(): void {
    this.dimmer.setVisible(true);
    this.closePanel(false);
    const { width, height } = this.scale;
    this.panel = this.add.container(width / 2, height / 2);
  }

  private closePanel(hideDimmer: boolean = true): void {
    this.panel?.destroy(true);
    this.panel = null;
    this.nbStimulusObj = null;
    if (hideDimmer) this.dimmer.setVisible(false);
  }
}

function hex(rgb: number): string {
  return `#${rgb.toString(16).padStart(6, '0')}`;
}
