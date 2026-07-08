/**
 * Svelte-layer accessibility store.
 *
 * Mirrors the Phaser-layer AccessibilityManager + AccessibilityStore
 * so Svelte routes can read and write accessibility settings without
 * importing Phaser. Persists to localStorage (browser) or no-op (SSR).
 *
 * Settings are the same shape as core/accessibility/AccessibilitySettings.ts
 * — the Svelte and Phaser layers stay in sync via the shared
 * AccessibilityStore persistence (both read/write the same localStorage key).
 */

import { writable } from 'svelte/store';
import { createDefaultSettings, type AccessibilitySettings } from '$core/accessibility/AccessibilitySettings.js';

const STORAGE_KEY = 'ccrpg:accessibility'; // MUST match Phaser-layer AccessibilityStore

// Use typeof window check instead of $app/environment for testability.
// In SvelteKit, $app/environment.browser works, but in vitest with jsdom
// the virtual module may not resolve correctly. typeof window is reliable
// in both SSR (undefined) and jsdom (defined).
const isBrowser = typeof window !== 'undefined';

function loadSettings(): AccessibilitySettings {
  if (!isBrowser) return createDefaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSettings();
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return { ...createDefaultSettings(), ...parsed };
  } catch {
    return createDefaultSettings();
  }
}

function persistSettings(settings: AccessibilitySettings): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be full or disabled — best-effort.
  }
}

export const accessibilityStore = writable<AccessibilitySettings>(loadSettings());

// Persist on every change.
accessibilityStore.subscribe((settings) => {
  persistSettings(settings);
});

/** Update a subset of settings. */
export function updateAccessibility(partial: Partial<AccessibilitySettings>): void {
  accessibilityStore.update((s) => ({ ...s, ...partial }));
}

/** Reset to defaults. */
export function resetAccessibility(): void {
  accessibilityStore.set(createDefaultSettings());
}
