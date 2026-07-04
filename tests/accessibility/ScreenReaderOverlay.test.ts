/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createScreenReaderOverlay } from '../../src/game/accessibility/ScreenReaderOverlay.js';
import type { ScreenReaderOverlay } from '../../src/game/accessibility/ScreenReaderOverlay.js';

describe('ScreenReaderOverlay', () => {
  let overlay: ScreenReaderOverlay;

  beforeEach(() => {
    overlay = createScreenReaderOverlay();
  });

  afterEach(() => {
    overlay.destroy();
  });

  it('creates aria-live polite region in the DOM', () => {
    const polite = document.querySelector('[aria-live="polite"]');
    expect(polite).not.toBeNull();
  });

  it('creates aria-live assertive region in the DOM', () => {
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(assertive).not.toBeNull();
  });

  it('announce updates polite region text content', () => {
    overlay.announce('Battle started');
    const polite = document.querySelector('[aria-live="polite"]');
    expect(polite!.textContent).toBe('Battle started');
  });

  it('announceAssertive updates assertive region text content', () => {
    overlay.announceAssertive('Critical hit!');
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(assertive!.textContent).toBe('Critical hit!');
  });

  it('destroy removes regions from DOM', () => {
    overlay.destroy();
    const polite = document.querySelector('[aria-live="polite"]');
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(polite).toBeNull();
    expect(assertive).toBeNull();
  });

  it('polite region is visually hidden via CSS class', () => {
    const polite = document.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(polite.classList.contains('a11y-sr-only')).toBe(true);
  });
});
