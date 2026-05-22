import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import { ALL_LINES } from '@core/domain/Line.js';
import { ALL_STAGES, stageOrdinal } from '@core/domain/Stage.js';
import { STAGE_RAY_MAP } from '@core/domain/Ray.js';
import type { Significator } from '@core/domain/Significator.js';

/** Ray → hex colour for tinting spokes. */
const RAY_COLORS: Record<string, number> = {
  Red: 0xff4d6d,
  Orange: 0xff8c42,
  Yellow: 0xffd700,
  Green: 0x4ecdc4,
  Blue: 0x4a90d9,
  Indigo: 0x7b68ee,
  Violet: 0xba55d3,
};

/**
 * RadialChartScene — displays the player's 8-line developmental profile
 * as a radar/spider chart with 8 spokes (one per line) and 8 concentric
 * rings (one per stage). Each spoke is tinted by the ray of the player's
 * current altitude on that line.
 */
export class RadialChartScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.RadialChart });
  }

  create(data?: { profile?: Significator }): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x080c18);

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;
    const rings = ALL_STAGES.length; // 8
    const spokes = ALL_LINES.length; // 8
    const angleStep = (Math.PI * 2) / spokes;

    const graphics = this.add.graphics();

    // Draw concentric rings
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * maxRadius;
      graphics.lineStyle(1, 0x333355, 0.4);
      graphics.strokeCircle(cx, cy, radius);
    }

    // Draw spoke lines and labels
    for (let s = 0; s < spokes; s++) {
      const angle = s * angleStep - Math.PI / 2;
      const ex = cx + Math.cos(angle) * maxRadius;
      const ey = cy + Math.sin(angle) * maxRadius;
      graphics.lineStyle(1, 0x444466, 0.5);
      graphics.lineBetween(cx, cy, ex, ey);

      // Label
      const lx = cx + Math.cos(angle) * (maxRadius + 30);
      const ly = cy + Math.sin(angle) * (maxRadius + 30);
      this.add.text(lx, ly, ALL_LINES[s]!.slice(0, 4), {
        fontSize: '12px', color: '#8888aa', fontFamily: 'monospace',
      }).setOrigin(0.5);
    }

    // Draw player profile polygon
    const profile = data?.profile ?? this.registry.get(RegistryKeys.Significator) as Significator | undefined;
    if (profile) {
      const points: { x: number; y: number }[] = [];
      for (let s = 0; s < spokes; s++) {
        const line = ALL_LINES[s]!;
        const altitude = profile.altitudes[line];
        const ordinal = stageOrdinal(altitude) + 1; // 1-based
        const radius = (ordinal / rings) * maxRadius;
        const angle = s * angleStep - Math.PI / 2;
        points.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }

      // Fill polygon
      graphics.fillStyle(0x4488ff, 0.2);
      graphics.beginPath();
      graphics.moveTo(points[0]!.x, points[0]!.y);
      for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i]!.x, points[i]!.y);
      }
      graphics.closePath();
      graphics.fillPath();

      // Draw ray-tinted dots at each spoke
      for (let s = 0; s < spokes; s++) {
        const line = ALL_LINES[s]!;
        const altitude = profile.altitudes[line];
        const ray = STAGE_RAY_MAP[altitude];
        const color = RAY_COLORS[ray] ?? 0xffffff;
        this.add.circle(points[s]!.x, points[s]!.y, 6, color, 1.0);
      }
    }

    // Title
    this.add.text(cx, 40, 'Developmental Profile', {
      fontSize: '22px', color: '#c8c8e8', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Back button
    this.add.text(60, height - 50, '← Back', {
      fontSize: '18px', color: '#aaaacc', fontFamily: 'monospace',
    }).setInteractive().on('pointerdown', () => {
      this.scene.start(SceneKeys.MainMenu);
    });
  }
}
