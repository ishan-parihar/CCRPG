/**
 * DOMOverlay — Accessibility layer that creates a DOM structure
 * parallel to the canvas for screen readers, focus management,
 * and high-contrast mode.
 * Spec: UNIFIED-IMPLEMENTATION-PLAN §5.2
 */

export interface OverlayElement {
  readonly id: string;
  readonly role: string;
  readonly label: string;
  readonly tabIndex?: number;
  readonly live?: 'polite' | 'assertive' | 'off';
}

export class DOMOverlay {
  private container: HTMLElement;
  private elements: Map<string, HTMLElement> = new Map();
  private highContrast = false;
  private extendedTime = false;

  constructor(parentId: string = 'game-container') {
    this.container = document.createElement('div');
    this.container.id = 'a11y-overlay';
    this.container.setAttribute('role', 'application');
    this.container.setAttribute('aria-label', 'CCRPG Game');
    // Styles are in public/style.css (#a11y-overlay)
    const parent = document.getElementById(parentId) ?? document.body;
    parent.appendChild(this.container);
  }

  /** Add or update an accessible element in the overlay. */
  announce(element: OverlayElement): void {
    let el = this.elements.get(element.id);
    if (!el) {
      el = document.createElement('div');
      el.id = `a11y-${element.id}`;
      this.container.appendChild(el);
      this.elements.set(element.id, el);
    }
    el.setAttribute('role', element.role);
    el.setAttribute('aria-label', element.label);
    if (element.tabIndex !== undefined) {
      el.tabIndex = element.tabIndex;
      el.classList.add('a11y-focusable');
    }
    if (element.live) {
      el.setAttribute('aria-live', element.live);
    }
    // Screen-reader only styling (visually hidden but accessible)
    el.classList.add('a11y-sr-only');
  }

  /** Announce a live message to screen readers. */
  liveAnnounce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.textContent = message;
    el.classList.add('a11y-sr-only');
    this.container.appendChild(el);
    // Remove after announcement is processed
    setTimeout(() => el.remove(), 3000);
  }

  /** Remove an element from the overlay. */
  remove(id: string): void {
    const el = this.elements.get(id);
    if (el) {
      el.remove();
      this.elements.delete(id);
    }
  }

  /** Clear all overlay elements. */
  clear(): void {
    this.elements.forEach(el => el.remove());
    this.elements.clear();
  }

  /** Toggle high-contrast mode. */
  setHighContrast(enabled: boolean): void {
    this.highContrast = enabled;
    document.body.classList.toggle('a11y-high-contrast', enabled);
  }

  /** Toggle extended-time mode for timed tasks. */
  setExtendedTime(enabled: boolean): void {
    this.extendedTime = enabled;
  }

  /** Get the time multiplier for timed tasks. */
  getTimeMultiplier(): number {
    return this.extendedTime ? 2.5 : 1.0;
  }

  isHighContrast(): boolean { return this.highContrast; }
  isExtendedTime(): boolean { return this.extendedTime; }

  /** Set focus to a specific element. */
  focusElement(id: string): void {
    const el = this.elements.get(id);
    if (el && el.tabIndex !== undefined) {
      el.focus();
    }
  }

  destroy(): void {
    this.container.remove();
    this.elements.clear();
  }
}
