/**
 * Svelte accessibility store — single source of truth.
 *
 * Pure-Svelte frontend: no Phaser layer to mirror. This store IS the
 * accessibility system. A11yApplier.svelte syncs it to data-* attributes
 * on <html>, which capabilities.css consumes for adaptive styling.
 *
 * Persists to localStorage (browser) or no-op (SSR).
 */

import { writable } from 'svelte/store';
import { createDefaultSettings, type AccessibilitySettings } from '$core/accessibility/AccessibilitySettings.js';

const STORAGE_KEY = 'ccrpg:accessibility';

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
