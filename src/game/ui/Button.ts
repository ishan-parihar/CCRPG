import Phaser from 'phaser';

/**
 * Lightweight button factory built from primitives — works on touch and
 * mouse, no DOM, no plugin dependency.
 */
export interface ButtonOpts {
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly fill?: number;
  readonly hoverFill?: number;
  readonly textColor?: string;
  readonly fontSize?: number;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  opts: ButtonOpts,
): Phaser.GameObjects.Container {
  const fill = opts.fill ?? 0x1b2740;
  const hover = opts.hoverFill ?? 0x2a3b5e;
  const tx = opts.textColor ?? '#e7eaf2';

  const container = scene.add.container(x, y);
  const bg = scene.add
    .rectangle(0, 0, opts.width, opts.height, fill, 1)
    .setStrokeStyle(2, 0x4cc9f0, 0.6)
    .setOrigin(0.5);
  const label = scene.add
    .text(0, 0, opts.label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: `${opts.fontSize ?? 22}px`,
      color: tx,
    })
    .setOrigin(0.5);
  container.add([bg, label]);
  container.setSize(opts.width, opts.height);
  container.setInteractive({ useHandCursor: true });

  if (opts.disabled) {
    bg.setAlpha(0.4);
    label.setAlpha(0.6);
    return container;
  }

  container.on('pointerover', () => bg.setFillStyle(hover, 1));
  container.on('pointerout', () => bg.setFillStyle(fill, 1));
  container.on('pointerdown', () => {
    bg.setScale(0.98);
    label.setScale(0.98);
  });
  container.on('pointerup', () => {
    bg.setScale(1);
    label.setScale(1);
    opts.onClick();
  });
  container.on('pointerupoutside', () => {
    bg.setScale(1);
    label.setScale(1);
  });
  return container;
}
