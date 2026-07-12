/**
 * toastStore — Svelte store for transient toast notifications.
 * Mounted in +layout.svelte via <Toaster />.
 */
import { writable } from 'svelte/store';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  readonly duration: number;
}

export const toastStore = writable<Toast[]>([]);

let toastCounter = 0;

export function showToast(
  message: string,
  variant: ToastVariant = 'default',
  duration = 4000,
): void {
  const id = `toast-${++toastCounter}`;
  toastStore.update((t) => [...t, { id, message, variant, duration }]);
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
}

export function dismissToast(id: string): void {
  toastStore.update((t) => t.filter((x) => x.id !== id));
}
