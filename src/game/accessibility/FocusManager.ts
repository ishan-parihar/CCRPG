/**
 * FocusManager — manages keyboard focus within game scenes.
 * Provides tab-order navigation and focus trapping for modals.
 */
export class FocusManager {
  private focusableElements: string[] = [];
  private currentIndex = 0;
  private trapped = false;

  /** Register focusable elements in tab order. */
  setFocusOrder(elementIds: string[]): void {
    this.focusableElements = elementIds;
    this.currentIndex = 0;
  }

  /** Move focus to next element. Returns the element ID to focus. */
  next(): string | null {
    if (this.focusableElements.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    return this.focusableElements[this.currentIndex];
  }

  /** Move focus to previous element. */
  previous(): string | null {
    if (this.focusableElements.length === 0) return null;
    this.currentIndex = (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    return this.focusableElements[this.currentIndex];
  }

  /** Get current focused element ID. */
  current(): string | null {
    return this.focusableElements[this.currentIndex] ?? null;
  }

  /** Trap focus within current element set (for modals/dialogs). */
  trapFocus(): void { this.trapped = true; }

  /** Release focus trap. */
  releaseFocus(): void { this.trapped = false; }

  isFocusTrapped(): boolean { return this.trapped; }

  clear(): void {
    this.focusableElements = [];
    this.currentIndex = 0;
    this.trapped = false;
  }
}
