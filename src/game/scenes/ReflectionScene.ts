/**
 * ReflectionScene — Language-Reflective encounters.
 * Shows a reflective prompt and pre-set response options (MVP).
 */
import Phaser from 'phaser';
import { SceneKeys } from '../keys.js';
import type { EncounterSpec } from '@core/domain/Encounter.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { processOutcome, type PlayerResponse } from '@core/engines/ConsequenceEngine.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';

export class ReflectionScene extends Phaser.Scene {
  private encounter!: EncounterSpec;
  private promptIndex = 0;
  private prompts: string[] = [];
  private followUps: string[] = [];
  private engagementCount = 0;

  constructor() {
    super({ key: SceneKeys.Reflection });
  }

  create(data: { encounter: EncounterSpec }): void {
    this.encounter = data.encounter;
    this.engagementCount = 0;
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

    // Back button
    this.add.text(60, height - 50, '← Back', {
      fontSize: '16px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setInteractive().on('pointerdown', () => this.scene.start(SceneKeys.World));
  }

  private onResponse(_response: string): void {
    this.promptIndex++;
    this.engagementCount++;

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

    // Build a PlayerResponse based on engagement depth
    const maxFollowUps = this.followUps.length + 1; // +1 for the initial prompt
    const engagementRatio = this.engagementCount / Math.max(1, maxFollowUps);
    // Higher engagement signals integrative orientation
    const orientation = engagementRatio >= 0.8 ? 'IntegratingLower' as const
      : engagementRatio >= 0.5 ? 'Homeostatic' as const
      : 'ReachingHigher' as const;

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection: 'Sovereign',
      driveDirectionality: {
        Agency: 'HealthyBalanced',
        Communion: 'HealthyBalanced',
        Eros: 'HealthyBalanced',
        Agape: 'HealthyBalanced',
      },
      stageOrientation: orientation,
      sourceOfNourishment: 'HigherRealm',
      shadowSurfaced: null,
      shadowResolvedId: null,
      narrativeSummary: `Reflected on ${this.encounter.narrative.theme} (engagement: ${this.engagementCount}/${maxFollowUps})`,
    };

    const scheduled: ScheduledEncounter = {
      id: this.encounter.id,
      moduleRef: this.encounter.id,
      modality: this.encounter.modality ?? 'LanguageReflective',
      targetLines: [...this.encounter.lines],
      stage: this.encounter.stage,
      holonSource: this.encounter.id,
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'cooldown',
      priority: 1,
      driveTarget: null,
      executionMode: 'capacity',
    };
    const record: ConsequenceRecord = processOutcome(scheduled, response, Date.now());

    this.time.delayedCall(2000, () => {
      this.events.emit('encounter_done', { record });
      this.scene.start(SceneKeys.World);
    });
  }
}
