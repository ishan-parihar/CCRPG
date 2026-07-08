/**
 * gameStore — Svelte 5 runes-based store mirroring Significator + WorldState.
 *
 * Hydrated from SaveRepository on boot (client-only). Updated by
 * phaserEventAdapter when Phaser emits events.
 *
 * This is the single source of truth for the Svelte shell. Phaser
 * reads/writes its own state via the registry; this store is the
 * React/Svelte-side mirror that the DOM shell renders from.
 */

import { writable } from 'svelte/store';
import type { Significator } from '$core/domain/Significator.js';

// Phase 1: minimal store. Phase 2 will add WorldState + derived views.
// Using Svelte's writable store (not runes) for cross-component simplicity.

interface GameState {
  readonly significator: Significator | null;
  readonly currentStage: string;
  readonly isLoaded: boolean;
  readonly lastEncounterId: string | null;
}

const initialState: GameState = {
  significator: null,
  currentStage: 'Red', // default — Phase 2 reads from sig.currentStage
  isLoaded: false,
  lastEncounterId: null,
};

export const gameStore = writable<GameState>(initialState);

/** Update the Significator (called by phaserEventAdapter on encounter_completed). */
export function setSignificator(sig: Significator | null): void {
  gameStore.update((s) => ({
    ...s,
    significator: sig,
    currentStage: sig?.currentStage ?? 'Red',
    isLoaded: sig !== null,
  }));
}

/** Mark that the game has loaded (called by PhaserGameClient on mount). */
export function markLoaded(): void {
  gameStore.update((s) => ({ ...s, isLoaded: true }));
}

/** Set the last encounter ID (called when an encounter starts). */
export function setLastEncounter(id: string | null): void {
  gameStore.update((s) => ({ ...s, lastEncounterId: id }));
}
