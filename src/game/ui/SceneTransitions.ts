import Phaser from 'phaser';

/**
 * Reusable scene transition effects.
 * All transitions use camera fade to prevent canvas flicker.
 */

const FADE_DURATION = 350;
const FADE_COLOR = 0x05070b; // match game background

/**
 * Fade out the current scene, then start the target scene.
 * The target scene should call `fadeIn()` in its `create()`.
 */
export function fadeToScene(
  currentScene: Phaser.Scene,
  targetSceneKey: string,
  data?: Record<string, unknown>,
  duration: number = FADE_DURATION,
): void {
  const cam = currentScene.cameras.main;
  cam.fadeOut(duration, (FADE_COLOR >> 16) & 0xff, (FADE_COLOR >> 8) & 0xff, FADE_COLOR & 0xff);
  cam.once('camerafadeoutcomplete', () => {
    currentScene.scene.start(targetSceneKey, data);
  });
}

/**
 * Fade in the current scene's camera.
 * Call this at the start of `create()` after building the scene.
 */
export function fadeIn(scene: Phaser.Scene, duration: number = FADE_DURATION): void {
  const cam = scene.cameras.main;
  cam.fadeIn(duration, 0, 0, 0);
}

/**
 * Create a loading spinner overlay (pulsing dots).
 * Returns a container that should be destroyed when loading completes.
 */
export function createLoadingIndicator(
  scene: Phaser.Scene,
  x: number,
  y: number,
  message: string = 'Thinking',
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y).setDepth(200);

  // Background pill
  const bgW = 320;
  const bgH = 72;
  const bg = scene.add.rectangle(0, 0, bgW, bgH, 0x0d1520, 0.95)
    .setStrokeStyle(1, 0x2a6f8a, 0.5).setOrigin(0.5);
  container.add(bg);

  // Text
  const text = scene.add.text(-40, 0, message, {
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    fontSize: '22px',
    color: '#8899aa',
  }).setOrigin(0, 0.5);
  container.add(text);

  // Animated dots
  const dotBaseX = text.x + text.width + 12;
  const dots: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < 3; i++) {
    const dot = scene.add.circle(dotBaseX + i * 18, 0, 5, 0x4cc9f0, 0.3).setOrigin(0.5);
    container.add(dot);
    dots.push(dot);

    // Staggered pulse animation
    scene.tweens.add({
      targets: dot,
      alpha: { from: 0.2, to: 1 },
      scaleX: { from: 0.8, to: 1.3 },
      scaleY: { from: 0.8, to: 1.3 },
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: i * 200,
    });
  }

  // Subtle breathing glow on the background
  scene.tweens.add({
    targets: bg,
    alpha: { from: 0.9, to: 1 },
    duration: 1500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  // Entrance animation
  container.setScale(0.9).setAlpha(0);
  scene.tweens.add({
    targets: container,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut',
  });

  return container;
}
