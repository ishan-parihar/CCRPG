import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * NativeBridge — encapsulates all Capacitor-only behaviour (hardware
 * back button, app exit, status bar, etc.) behind a small, testable API.
 *
 * On the web this is a no-op so the same code path runs everywhere.
 */
export type BackButtonHandler = () => boolean | Promise<boolean>;

export class NativeBridge {
  private backHandler: BackButtonHandler | null = null;
  private listenerAttached = false;

  get isNative(): boolean {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  /**
   * Register a handler for the Android hardware back button.
   * Return true from the handler if the press was consumed (default
   * behaviour suppressed). Return false to fall back to history/exit.
   */
  async registerBackHandler(handler: BackButtonHandler): Promise<void> {
    this.backHandler = handler;
    if (!this.isNative || this.listenerAttached) return;
    this.listenerAttached = true;
    await CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      const handled = this.backHandler ? await this.backHandler() : false;
      if (handled) return;
      if (canGoBack) {
        window.history.back();
      } else {
        // Last-resort exit. Per blueprint, the handler should usually
        // intercept first to summon a pause modal instead.
        await CapacitorApp.exitApp();
      }
    });
  }

  unregisterBackHandler(): void {
    this.backHandler = null;
  }
}
