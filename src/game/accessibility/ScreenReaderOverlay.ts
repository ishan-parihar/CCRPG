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
  Object.assign(politeRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });
  document.body.appendChild(politeRegion);

  const assertiveRegion = document.createElement('div');
  assertiveRegion.setAttribute('aria-live', 'assertive');
  assertiveRegion.setAttribute('aria-atomic', 'true');
  assertiveRegion.setAttribute('role', 'alert');
  Object.assign(assertiveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });
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
