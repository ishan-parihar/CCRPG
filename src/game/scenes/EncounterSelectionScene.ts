/**
 * EncounterSelectionScene — presents 2-5 encounter options.
 * Implements non-coercion principle (foundations/24 §4).
 * Player can select an encounter or decline (which is recorded as avoidance data).
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { EventBus } from '@core/events/EventBus.js';
import { fadeIn, fadeToScene } from '../ui/SceneTransitions.js';

export interface EncounterSelectionData {
  readonly encounters: readonly ScheduledEncounter[];
}

export class EncounterSelectionScene extends Phaser.Scene {
  private encounters: readonly ScheduledEncounter[] = [];
  private cards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: SceneKeys.EncounterSelection });
  }

  create(data: EncounterSelectionData): void {
    this.encounters = data.encounters;
    this.cards = [];
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(0x05070b);
    fadeIn(this, 400);

    // Title
    this.add.text(width / 2, 40, 'Choose Your Path', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      color: '#c8d6e5',
    }).setOrigin(0.5);

    // Render encounter cards
    const cardWidth = Math.min(280, (width - 60) / Math.min(this.encounters.length, 3));
    const startX = width / 2 - ((Math.min(this.encounters.length, 3) - 1) * (cardWidth + 16)) / 2;

    this.encounters.forEach((enc, i) => {
      const x = startX + i * (cardWidth + 16);
      const y = height / 2 - 40;
      const card = this.createCard(enc, x, y, cardWidth, i);
      this.cards.push(card);
    });

    // Decline button
    const declineBtn = this.add.text(width / 2, height - 60, 'Not now...', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      color: '#667788',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    declineBtn.on('pointerover', () => declineBtn.setColor('#aabbcc'));
    declineBtn.on('pointerout', () => declineBtn.setColor('#667788'));
    declineBtn.on('pointerdown', () => this.onDecline());
  }

  private createCard(enc: ScheduledEncounter, x: number, y: number, w: number, idx: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, w, 200, 0x1a2233, 0.9)
      .setStrokeStyle(1, 0x334455)
      .setInteractive({ useHandCursor: true });
    container.add(bg);

    // Tier label
    const tier = idx === 0 ? 'Primary' : idx < 3 ? 'Secondary' : 'Ambient';
    const tierColor = idx === 0 ? '#4cc9f0' : idx < 3 ? '#8899aa' : '#556677';
    container.add(this.add.text(0, -80, tier, {
      fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: tierColor,
    }).setOrigin(0.5));

    // T-3.4 (Veil compliance): replace `${line} • ${stage}` with a qualitative
    // felt-sense label derived from the modality + execution mode. The line and
    // stage are encounter-routing metadata and should never reach the player.
    const modalityLabels: Record<string, string> = {
      Deterministic: 'Ancient Shrine',
      Strategic: 'War-Table',
      Embodied: 'War-Drums',
      ScenarioChoice: 'A Stranger',
      LanguageReflective: 'Campfire',
      SocialCooperative: 'Scouts',
      ImmersiveRPG: 'A Shimmering',
    };
    const encounterLabel = modalityLabels[enc.modality] ?? 'An Encounter';
    container.add(this.add.text(0, -55, encounterLabel, {
      fontFamily: 'system-ui, sans-serif', fontSize: '21px', color: '#c8d6e5',
    }).setOrigin(0.5));

    // Qualitative mode hint (no modality taxonomy name)
    const modeHint = enc.executionMode === 'shadow' ? 'Something stirs beneath' : 'A challenge awaits';
    container.add(this.add.text(0, -30, modeHint, {
      fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#667788',
    }).setOrigin(0.5));

    // Mode indicator
    const modeLabel = enc.executionMode === 'shadow' ? '🌑 Shadow Work' : '⚔️ Encounter';
    container.add(this.add.text(0, 10, modeLabel, {
      fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#aabbcc',
    }).setOrigin(0.5));

    // Click handler
    bg.on('pointerdown', () => this.onSelect(enc));
    bg.on('pointerover', () => bg.setFillStyle(0x223344, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1a2233, 0.9));

    return container;
  }

  private onSelect(enc: ScheduledEncounter): void {
    fadeToScene(this, SceneKeys.Encounter, { encounter: enc } as Record<string, unknown>);
  }

  private onDecline(): void {
    // Record avoidance for all presented encounters
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;
    if (eventBus) {
      for (const enc of this.encounters) {
        eventBus.emit('encounter_declined', {
          encounterId: enc.id,
          moduleRef: enc.moduleRef,
          line: enc.targetLines[0],
          stage: enc.stage,
        });
      }
    }
    fadeToScene(this, SceneKeys.World);
  }
}
