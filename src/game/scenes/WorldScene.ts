/**
 * WorldScene — the Red-layer overworld.
 * Renders a volcanic badlands environment, places NPC markers from
 * HolonRegistry, and allows player movement with arrow keys/pointer-drag.
 */
import Phaser from 'phaser';
import { SceneKeys, RegistryKeys, TextureKeys } from '../keys.js';
import type { Significator } from '@core/domain/Significator.js';
import type { Holon } from '@core/domain/Holon.js';
import type { EncounterSpec } from '@core/domain/Encounter.js';

interface WorldState {
  readonly holons: readonly Holon[];
  readonly recentEncounterIds: readonly string[];
  readonly cooldowns: Readonly<Record<string, number>>;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private companion!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private npcMarkers: Phaser.GameObjects.Container[] = [];
  private isDragging = false;
  private dragTarget = { x: 0, y: 0 };

  constructor() {
    super({ key: SceneKeys.World });
  }

  create(): void {
    const { width, height } = this.scale;

    this.drawBadlands();

    const sig = this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    const worldState = this.registry.get(RegistryKeys.WorldState) as WorldState | undefined;

    // Player avatar
    this.player = this.add.image(width / 2, height / 2, TextureKeys.HeroIdle)
      .setOrigin(0.5, 1)
      .setDepth(10);

    // Companion ally follows player
    this.companion = this.add.rectangle(
      this.player.x - 40, this.player.y - 10,
      24, 32, 0x44aacc
    ).setDepth(9);

    // Setup movement
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Pointer-drag movement
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragTarget.x = pointer.x;
      this.dragTarget.y = pointer.y;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.isDown) {
        this.dragTarget.x = pointer.x;
        this.dragTarget.y = pointer.y;
      }
    });
    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Place NPC markers from world holons
    this.placeNPCs(worldState);

    // Mini-HUD at top
    this.drawHUD(sig);

    // Journal button
    this.add.text(width - 60, 20, '[Journal]', {
      fontSize: '16px', color: '#88ccff', fontFamily: 'monospace',
    }).setInteractive().setDepth(100)
      .on('pointerdown', () => this.scene.start(SceneKeys.Journal));
  }

  override update(_time: number, _delta: number): void {
    const speed = 3;

    // Arrow key movement
    if (this.cursors) {
      if (this.cursors.left.isDown) this.player.x -= speed;
      if (this.cursors.right.isDown) this.player.x += speed;
      if (this.cursors.up.isDown) this.player.y -= speed;
      if (this.cursors.down.isDown) this.player.y += speed;
    }

    // Pointer-drag movement
    if (this.isDragging) {
      const dx = this.dragTarget.x - this.player.x;
      const dy = this.dragTarget.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        this.player.x += (dx / dist) * speed;
        this.player.y += (dy / dist) * speed;
      }
    }

    // Clamp to bounds
    const { width, height } = this.scale;
    this.player.x = Phaser.Math.Clamp(this.player.x, 40, width - 40);
    this.player.y = Phaser.Math.Clamp(this.player.y, 100, height - 40);

    // Companion follows
    const cdx = this.player.x - 40 - this.companion.x;
    const cdy = this.player.y - 10 - this.companion.y;
    this.companion.x += cdx * 0.05;
    this.companion.y += cdy * 0.05;
  }

  private drawBadlands(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    // Background - dark volcanic terrain
    g.fillStyle(0x1a0a0a);
    g.fillRect(0, 0, width, height);

    // Lava cracks
    g.lineStyle(2, 0xff3300, 0.3);
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      g.lineBetween(x, y, x + (Math.random() - 0.5) * 120, y + Math.random() * 80);
    }

    // Rocky formations (dark rectangles)
    g.fillStyle(0x2a1515, 0.6);
    g.fillRect(50, 100, 80, 60);
    g.fillRect(width - 150, 200, 100, 50);
    g.fillRect(200, height - 300, 60, 80);

    // Fortress outlines in distance
    g.lineStyle(1, 0x553333, 0.4);
    g.strokeRect(width / 2 - 100, 50, 200, 40);
    g.strokeRect(width / 2 - 80, 30, 160, 20);
  }

  private placeNPCs(worldState: WorldState | undefined): void {
    if (!worldState) return;
    const { width, height } = this.scale;

    // Filter to NPCs from the world state
    const npcs = worldState.holons.filter(h => h.kind === 'NPC' && h.active);

    npcs.forEach((holon, i) => {
      // Distribute NPCs across the map
      const angle = (i / npcs.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius * 0.6;

      const container = this.add.container(cx, cy).setDepth(5);

      // NPC marker (colored circle)
      const color = holon.narrativeRole === 'main-boss' ? 0xff2222 :
                    holon.narrativeRole === 'ally-companion' ? 0x22aaff : 0xcc8844;
      const marker = this.add.circle(0, 0, 16, color, 0.8);
      container.add(marker);

      // Name label
      const label = this.add.text(0, 22, holon.name, {
        fontSize: '11px', color: '#cccccc', fontFamily: 'monospace',
      }).setOrigin(0.5);
      container.add(label);

      // Make interactive
      marker.setInteractive(new Phaser.Geom.Circle(0, 0, 16), Phaser.Geom.Circle.Contains);
      marker.on('pointerdown', () => this.interactWithNPC(holon));

      this.npcMarkers.push(container);
    });
  }

  private interactWithNPC(holon: Holon): void {
    // Create a minimal encounter spec from the holon for routing
    const encounter: EncounterSpec = {
      id: `encounter-${holon.id}`,
      lines: [holon.line],
      stage: holon.stage,
      quadrants: ['UL'],
      role: holon.narrativeRole === 'main-boss' ? 'main' : 'side',
      ray: 'Red',
      modality: 'ImmersiveRPG',
      taskBinds: [{ taskSlug: 'n_back', line: holon.line }],
      narrative: {
        theme: `Encounter with ${holon.name}`,
        allyBeats: ['Your companion watches closely.'],
        codexEntry: `Met ${holon.name} in the volcanic badlands.`,
      },
      enemy: {
        name: holon.name,
        stats: {
          maxHp: 100,
          maxMana: 40,
          agility: 50,
          attack: 15,
          defense: 10,
          precision: 80,
          magic: 12,
          luck: 5,
        },
      },
    };

    this.scene.start(SceneKeys.Encounter, { encounter });
  }

  private drawHUD(sig: Significator | undefined): void {
    const { width } = this.scale;
    // HUD background
    this.add.rectangle(width / 2, 16, width, 32, 0x000000, 0.6).setDepth(90);

    const name = sig ? sig.id : 'Wanderer';
    const stage = sig ? sig.currentStage : 'Unknown';
    this.add.text(10, 6, `${name} | Stage: ${stage}`, {
      fontSize: '14px', color: '#cccccc', fontFamily: 'monospace',
    }).setDepth(100);
  }
}
