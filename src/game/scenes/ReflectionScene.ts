/**
 * ReflectionScene — Language-Reflective encounters.
 * Shows a reflective prompt and pre-set response options (MVP).
 */
import Phaser from 'phaser';
import { SceneKeys } from '../keys.js';
import type { EncounterSpec } from '@core/domain/Encounter.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';

export class ReflectionScene extends Phaser.Scene {
  private encounter!: EncounterSpec;
  private promptIndex = 0;
  private prompts: string[] = [];
  private followUps: string[] = [];

  constructor() {
    super({ key: SceneKeys.Reflection });
  }

  create(data: { encounter: EncounterSpec }): void {
    this.encounter = data.encounter;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    // Get reflective content from FallbackProvider
    const line = this.encounter.lines[0] ?? 'Cognitive';
    const fallback = getFallback('LanguageReflective', line, this.encounter.stage);

    this.prompts = [fallback.prompt ?? 'What moved you to act?'];
    this.followUps = [...(fallback.followUps ?? ['Say more about that.'])];
    this.promptIndex = 0;

    this.showPrompt(width, height);
  }

  private showPrompt(width: number, height: number): void {
    // Clear previous content
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    const currentPrompt = this.prompts[this.promptIndex] ?? this.followUps[this.promptIndex - 1] ?? 'Reflect.';

    // Title
    this.add.text(width / 2, 80, 'Reflection', {
      fontSize: '28px', color: '#aaccff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Prompt text
    this.add.text(width / 2, height / 2 - 100, currentPrompt, {
      fontSize: '22px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Pre-set response options (MVP - no free text input)
    const responses = [
      'It felt necessary.',
      'I was driven by instinct.',
      'I chose deliberately.',
    ];

    responses.forEach((resp, i) => {
      const btn = this.add.text(width / 2, height / 2 + 40 + i * 60, `[ ${resp} ]`, {
        fontSize: '18px', color: '#88ccff', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 100 },
      }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.onResponse(resp))
        .on('pointerover', () => btn.setColor('#aaeeff'))
        .on('pointerout', () => btn.setColor('#88ccff'));
    });
  }

  private onResponse(_response: string): void {
    this.promptIndex++;

    if (this.promptIndex <= this.followUps.length) {
      // Show follow-up
      const { width, height } = this.scale;
      this.showPrompt(width, height);
    } else {
      // Complete
      this.completeReflection();
    }
  }

  private completeReflection(): void {
    const { width, height } = this.scale;
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    this.add.text(width / 2, height / 2, 'Your reflection has been witnessed.', {
      fontSize: '20px', color: '#88cc88', fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.events.emit('encounter_done', { record: undefined });
    });
  }
}
