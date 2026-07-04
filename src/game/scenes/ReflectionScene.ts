/**
 * ReflectionScene — Language-Reflective encounters.
 * Shows a reflective prompt and pre-set response options (MVP).
 *
 * T-0.6 (HS-08 fix): now calls applyConsequences to update the Significator
 * (was only calling processOutcome, leaving Significator unchanged).
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '@core/engines/ConsequenceEngine.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { Significator } from '@core/domain/Significator.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import { getFallback } from '@infra/llm/FallbackProvider.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export class ReflectionScene extends Phaser.Scene {
  private encounter!: ScheduledEncounter;
  private promptIndex = 0;
  private prompts: string[] = [];
  private followUps: string[] = [];
  private engagementCount = 0;
  private selectedResponses: string[] = [];

  constructor() {
    super({ key: SceneKeys.Reflection });
  }

  create(data: { encounter: ScheduledEncounter }): void {
    this.encounter = data.encounter;
    this.engagementCount = 0;
    this.selectedResponses = [];
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    fadeIn(this, 400);

    // Get reflective content from FallbackProvider (with altitude-conditional reframe)
    const line = (this.encounter.targetLines[0] ?? 'Cognitive') as Line;
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const playerStage = sig?.currentStage ?? this.encounter.stage;
    const fallback = getFallback('LanguageReflective', line, this.encounter.stage as Stage, playerStage as Stage);

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
    this.add.text(width / 2, height / 2 - 140, currentPrompt, {
      fontSize: '22px', color: '#e8e8ff', fontFamily: 'monospace',
      align: 'center', wordWrap: { width: width - 80 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Context-aware response options based on encounter and prompt
    const responses = this.getContextualResponses();

    responses.forEach((resp, i) => {
      const btn = this.add.text(width / 2, height / 2 + 10 + i * 60, `[ ${resp} ]`, {
        fontSize: '18px', color: '#88ccff', fontFamily: 'monospace',
        align: 'center', wordWrap: { width: width - 100 },
      }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.onResponse(resp))
        .on('pointerover', () => btn.setColor('#aaeeff'))
        .on('pointerout', () => btn.setColor('#88ccff'));
    });

    // Back button
    this.add.text(60, height - 50, '← Back', {
      fontSize: '24px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setInteractive().on('pointerdown', () => fadeToScene(this, SceneKeys.World));
  }

  /** Generate context-aware response options based on the encounter modality, line, and stage */
  private getContextualResponses(): string[] {
    const line = this.encounter.targetLines[0] ?? 'Cognitive';
    const stage = this.encounter.stage;
    const promptIdx = this.promptIndex;

    // Stage-specific emotional registers
    const stageResponses: Record<string, string[][]> = {
      Red: [
        ['I felt the fire of it.', 'Fear held me back.', 'I acted without thinking.'],
        ['It was survival.', 'I wanted power.', 'Something deeper called.'],
        ['The rage was real.', 'I chose restraint.', 'I saw another way.'],
      ],
      Amber: [
        ['Duty demanded it.', 'I trusted the tradition.', 'It felt wrong but necessary.'],
        ['The code guided me.', 'I questioned the rule.', 'Belonging mattered more.'],
        ['Honor was at stake.', 'I followed the path.', 'I broke from the order.'],
      ],
      Orange: [
        ['Logic pointed the way.', 'Ambition drove me.', 'I calculated the cost.'],
        ['Innovation felt right.', 'The old way failed.', 'Progress demanded sacrifice.'],
        ['I saw the opportunity.', 'Efficiency was key.', 'Something was lost in the gain.'],
      ],
    };

    const lineResponses: Record<string, string[]> = {
      Cognitive: ['My mind saw the pattern.', 'I thought through it carefully.', 'Intuition spoke first.'],
      Emotional: ['The feeling was overwhelming.', 'I chose from the heart.', 'I tried to stay centered.'],
      Moral: ['It was the right thing.', 'I wrestled with the choice.', 'Principle guided me.'],
      Intrapersonal: ['I knew myself in that moment.', 'Fear surfaced.', 'I faced what I avoid.'],
      Spiritual: ['Something larger moved through me.', 'I surrendered to it.', 'I sought meaning.'],
      Somatic: ['My body knew before I did.', 'The rhythm carried me.', 'I felt it in my bones.'],
      Willpower: ['I refused to yield.', 'Discipline held me.', 'The will was tested.'],
      Interpersonal: ['I reached toward them.', 'Distance felt safer.', 'Trust was the question.'],
    };

    // Cycle through response sets based on prompt index
    const setIdx = promptIdx % 3;
    if (stageResponses[stage]?.[setIdx]) {
      return stageResponses[stage][setIdx];
    }
    // Fallback to line-specific responses
    const lineKey = line as string;
    const base = lineResponses[lineKey] ?? ['I engaged with it.', 'I stepped back.', 'Something shifted.'];
    // Rotate through the base responses
    return [
      base[setIdx % base.length],
      base[(setIdx + 1) % base.length],
      base[(setIdx + 2) % base.length],
    ];
  }

  private onResponse(response: string): void {
    this.promptIndex++;
    this.engagementCount++;
    this.selectedResponses.push(response);

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
      narrativeSummary: this.selectedResponses.length > 0
        ? `Reflected on ${this.encounter.moduleRef}: "${this.selectedResponses[this.selectedResponses.length - 1]}" (${this.engagementCount}/${maxFollowUps} engagements)`
        : `Reflected on ${this.encounter.moduleRef} (${this.engagementCount}/${maxFollowUps} engagements)`,
    };

    const record: ConsequenceRecord = processOutcome(this.encounter, response, Date.now());

    // T-0.6 (HS-08 fix): apply consequences to update the Significator.
    // Without this, Reflection encounters don't update altitudes/drives/shadows/polarity.
    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState | undefined;
    if (sig && world) {
      const { sig: newSig, world: newWorld } = applyConsequences(sig, world, record, this.encounter);
      this.registry.set(RegistryKeys.Significator, newSig);
      this.registry.set(RegistryKeys.WorldState, newWorld);
    }

    // P0-4: Store the PlayerResponse + encounter so WorldScene can call
    // applyResponseOnly() when the player returns. Without this, UserMatrixModel
    // + transformation state are never updated in the Phaser Reflection flow.
    this.registry.set(RegistryKeys.LastPlayerResponse, response);
    this.registry.set(RegistryKeys.LastEncounter, this.encounter);

    this.time.delayedCall(2000, () => {
      this.events.emit('encounter_done', { record });
      fadeToScene(this, SceneKeys.World);
    });
  }
}
