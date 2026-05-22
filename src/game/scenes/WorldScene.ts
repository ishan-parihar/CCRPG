/**
 * WorldScene — the Red-layer overworld.
 * Renders volcanic badlands, places encounter nodes from the scheduler,
 * and allows player movement with arrow keys/pointer-drag.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys, TextureKeys } from '../keys.js';
import type { Significator } from '@core/domain/Significator.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { Modality } from '@core/domain/enums.js';
import { scheduleNext, type WorldState } from '@core/engines/EncounterScheduler.js';
import type { SessionContext } from '@core/engines/PriorityComputation.js';
import { EcologicalTracker } from '../systems/EcologicalTracker.js';

const MODALITY_THEME: Record<Modality, { color: number; label: string }> = {
  Deterministic: { color: 0xffaa00, label: 'Ancient Shrine' },
  LanguageReflective: { color: 0xff5522, label: 'Campfire' },
  ScenarioChoice: { color: 0x333344, label: 'Stranger' },
  Embodied: { color: 0x886644, label: 'War-drums' },
  Strategic: { color: 0x556655, label: 'War-table' },
  SocialCooperative: { color: 0x44aa88, label: 'Scouts' },
  ImmersiveRPG: { color: 0x222244, label: 'Shimmer' },
};

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private companion!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isDragging = false;
  private dragTarget = { x: 0, y: 0 };
  private ecological = new EcologicalTracker();
  private ecoTimer = 0;

  constructor() {
    super({ key: SceneKeys.World });
  }

  create(data?: { consequenceText?: string }): void {
    const { width, height } = this.scale;
    this.drawBadlands();
    this.drawAtmosphere();

    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState | undefined;

    // Player avatar
    this.player = this.add.image(width / 2, height / 2, TextureKeys.HeroIdle)
      .setOrigin(0.5, 1).setDepth(10);

    // Companion
    this.companion = this.add.rectangle(
      this.player.x - 40, this.player.y - 10, 24, 32, 0x44aacc
    ).setDepth(9);

    // Ecological tracker
    this.ecological.reset();
    this.registry.set(RegistryKeys.Ecological, this.ecological);

    // Movement
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.isDragging = true; this.dragTarget.x = p.x; this.dragTarget.y = p.y; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.isDragging && p.isDown) { this.dragTarget.x = p.x; this.dragTarget.y = p.y; } });
    this.input.on('pointerup', () => { this.isDragging = false; });

    // Schedule encounters and place nodes
    this.placeEncounterNodes(sig, world);

    // Minimal HUD (Veil: no stage label)
    this.add.rectangle(width / 2, 16, width, 32, 0x000000, 0.6).setDepth(90);
    this.add.text(10, 6, sig?.id ?? 'Wanderer', {
      fontSize: '14px', color: '#cccccc', fontFamily: 'monospace',
    }).setDepth(100);

    // Journal & Settings
    this.add.text(width - 60, 20, '[Journal]', {
      fontSize: '16px', color: '#88ccff', fontFamily: 'monospace',
    }).setInteractive().setDepth(100)
      .on('pointerdown', () => this.scene.start(SceneKeys.Journal));

    this.add.text(width - 140, 20, '⚙️', {
      fontSize: '18px', color: '#cccccc', fontFamily: 'monospace',
    }).setInteractive().setDepth(100)
      .on('pointerdown', () => this.scene.start(SceneKeys.Settings));

    // Consequence narration
    if (data?.consequenceText) {
      const txt = this.add.text(width / 2, height * 0.75, data.consequenceText, {
        fontSize: '15px', color: '#aaccee', fontFamily: 'serif', fontStyle: 'italic',
      }).setOrigin(0.5).setAlpha(0).setDepth(100);
      this.tweens.add({
        targets: txt, alpha: 0.9, duration: 600, ease: 'Sine.easeIn',
        onComplete: () => {
          this.time.delayedCall(2500, () => {
            this.tweens.add({ targets: txt, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
          });
        },
      });
    }
  }

  override update(): void {
    const speed = 3;
    if (this.cursors) {
      if (this.cursors.left.isDown) this.player.x -= speed;
      if (this.cursors.right.isDown) this.player.x += speed;
      if (this.cursors.up.isDown) this.player.y -= speed;
      if (this.cursors.down.isDown) this.player.y += speed;
    }
    if (this.isDragging) {
      const dx = this.dragTarget.x - this.player.x;
      const dy = this.dragTarget.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) { this.player.x += (dx / dist) * speed; this.player.y += (dy / dist) * speed; }
    }
    const { width, height } = this.scale;
    this.player.x = Phaser.Math.Clamp(this.player.x, 40, width - 40);
    this.player.y = Phaser.Math.Clamp(this.player.y, 100, height - 40);

    // Companion follows
    this.companion.x += (this.player.x - 40 - this.companion.x) * 0.05;
    this.companion.y += (this.player.y - 10 - this.companion.y) * 0.05;

    // Record position every 500ms
    this.ecoTimer += this.game.loop.delta;
    if (this.ecoTimer >= 500) {
      this.ecoTimer = 0;
      this.ecological.recordPosition(this.player.x, this.player.y);
    }
  }

  private placeEncounterNodes(sig: Significator | undefined, world: WorldState | undefined): void {
    if (!sig || !world) return;

    const session: SessionContext = {
      encountersSoFar: sig.totalEncounters,
      sessionDurationMs: 0,
      targetSessionLength: 10,
      recentLines: [],
    };
    const encounters = scheduleNext(sig, world, session, Date.now(), 5);

    if (encounters.length === 0) {
      this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, 'The world is quiet...', {
        fontSize: '14px', color: '#555555', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(5).setAlpha(0.7);
      return;
    }

    const { width, height } = this.scale;
    encounters.forEach((enc, i) => {
      const angle = (i / encounters.length) * Math.PI * 2 + 0.3;
      const radius = Math.min(width, height) * 0.28;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius * 0.6;
      this.createEncounterNode(cx, cy, enc);
    });
    this.ecological.recordEncounterAvailable(encounters.length);
  }

  private createEncounterNode(x: number, y: number, enc: ScheduledEncounter): void {
    const theme = MODALITY_THEME[enc.modality];
    let marker: Phaser.GameObjects.Shape;

    switch (enc.modality) {
      case 'Strategic':
        marker = this.add.rectangle(x, y, 28, 18, theme.color, 0.7);
        break;
      case 'SocialCooperative': {
        // Cluster of small circles
        const c = this.add.circle(x, y, 6, theme.color, 0.7);
        this.add.circle(x - 10, y + 6, 5, theme.color, 0.5);
        this.add.circle(x + 10, y + 6, 5, theme.color, 0.5);
        marker = c;
        break;
      }
      default:
        marker = this.add.circle(x, y, 14, theme.color, enc.modality === 'ImmersiveRPG' ? 0.3 : 0.7);
    }

    marker.setDepth(5).setInteractive(
      new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains
    );
    marker.on('pointerdown', () => {
      this.ecological.recordEncounterApproached(enc.modality);
      this.scene.start(SceneKeys.Encounter, { encounter: enc });
    });

    // Label
    this.add.text(x, y + 20, theme.label, {
      fontSize: '10px', color: '#999999', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    // Subtle animation
    this.tweens.add({
      targets: marker,
      alpha: enc.modality === 'ImmersiveRPG' ? { from: 0.2, to: 0.4 } : { from: 0.6, to: 1 },
      scaleX: enc.modality === 'Embodied' ? 1.15 : 1.05,
      scaleY: enc.modality === 'Embodied' ? 1.15 : 1.05,
      duration: enc.modality === 'LanguageReflective' ? 400 : 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawBadlands(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    // Deep volcanic background
    g.fillStyle(0x1a0a0a);
    g.fillRect(0, 0, width, height);

    // Layered volcanic rock strata
    g.fillStyle(0x2a0505, 0.5);
    g.fillRect(0, height * 0.7, width, height * 0.3);
    g.fillStyle(0x1a0a0a, 0.7);
    g.fillRect(0, height * 0.85, width, height * 0.15);

    // Lava rivers (animated via multiple lines)
    g.lineStyle(3, 0xff3300, 0.25);
    for (let i = 0; i < 5; i++) {
      const x = (i + 0.5) * (width / 5);
      g.beginPath();
      g.moveTo(x, height * 0.6 + Math.random() * 40);
      g.lineTo(x + (Math.random() - 0.5) * 60, height * 0.75);
      g.lineTo(x + (Math.random() - 0.5) * 80, height);
      g.strokePath();
    }

    // Rocky formations
    g.fillStyle(0x2a1515, 0.7);
    g.fillRect(30, 120, 90, 55);
    g.fillRect(width - 140, 180, 110, 60);
    g.fillRect(180, height - 280, 70, 90);
    g.fillRect(width - 220, height - 320, 55, 70);

    // Distant fortress silhouettes
    g.fillStyle(0x1a0f0f, 0.8);
    g.fillRect(width / 2 - 110, 35, 220, 45);
    g.fillRect(width / 2 - 90, 20, 30, 60);
    g.fillRect(width / 2 + 60, 15, 30, 65);
    g.fillRect(width / 2 - 40, 25, 80, 10);

    // Weapon-racks / shields (environmental detail)
    g.lineStyle(1, 0xcc8844, 0.4);
    g.strokeRect(100, height - 150, 12, 30);
    g.strokeRect(108, height - 155, 4, 35);
    g.strokeRect(width - 100, height - 180, 12, 30);
    // Shield shapes
    g.lineStyle(1, 0xcc8844, 0.3);
    g.strokeCircle(260, height - 200, 10);
    g.strokeCircle(width - 180, 260, 8);

    // Lava cracks across terrain
    g.lineStyle(1, 0xff3300, 0.2);
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      g.lineBetween(x, y, x + (Math.random() - 0.5) * 100, y + Math.random() * 60);
    }
  }

  private drawAtmosphere(): void {
    const { width, height } = this.scale;

    // Vignette (darker edges)
    const vignette = this.add.graphics().setDepth(2);
    vignette.fillStyle(0x000000, 0.4);
    vignette.fillRect(0, 0, width, 40);
    vignette.fillRect(0, height - 30, width, 30);
    vignette.fillStyle(0x000000, 0.25);
    vignette.fillRect(0, 0, 30, height);
    vignette.fillRect(width - 30, 0, 30, height);

    // Ember/ash particles — 18 tweened circles
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * width;
      const y = height * 0.4 + Math.random() * height * 0.6;
      const size = 2 + Math.random() * 2;
      const color = Math.random() > 0.5 ? 0xff3300 : 0xcc8844;
      const ember = this.add.circle(x, y, size, color, 0.3 + Math.random() * 0.3).setDepth(3);

      this.tweens.add({
        targets: ember,
        y: y - 80 - Math.random() * 120,
        alpha: 0,
        duration: 3000 + Math.random() * 4000,
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => {
          ember.x = Math.random() * width;
          ember.y = height * 0.4 + Math.random() * height * 0.6;
          ember.alpha = 0.3 + Math.random() * 0.3;
        },
      });
    }
  }
}
