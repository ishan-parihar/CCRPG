export interface ScreenReaderOverlay {
  announce: (text: string) => void;
  announceAssertive: (text: string) => void;
  destroy: () => void;
}

export function createScreenReaderOverlay(): ScreenReaderOverlay {
  const politeRegion = document.createElement('div');
  politeRegion.setAttribute('aria-live', 'polite');
  politeRegion.setAttribute('aria-atomic', 'true');
  politeRegion.setAttribute('role', 'status');
  politeRegion.className = 'a11y-sr-only';
  document.body.appendChild(politeRegion);

  const assertiveRegion = document.createElement('div');
  assertiveRegion.setAttribute('aria-live', 'assertive');
  assertiveRegion.setAttribute('aria-atomic', 'true');
  assertiveRegion.setAttribute('role', 'alert');
  assertiveRegion.className = 'a11y-sr-only';
  document.body.appendChild(assertiveRegion);

  return {
    announce(text: string): void {
      politeRegion.textContent = text;
    },
    announceAssertive(text: string): void {
      assertiveRegion.textContent = text;
    },
    destroy(): void {
      politeRegion.remove();
      assertiveRegion.remove();
    },
  };
}
