/**
 * gameStore — Svelte 5 runes-based store mirroring Significator + WorldState.
 *
 * Hydrated from SaveRepository on boot (client-only). Updated by the
 * Svelte gameplay engine when encounters complete.
 *
 * This is the single source of truth for the Svelte shell. The Svelte
 * gameplay routes (src/routes/play/*) read and write this store directly;
 * there is no parallel Phaser registry.
 */

import { writable } from 'svelte/store';
import type { Significator } from '$core/domain/Significator.js';

interface GameState {
  readonly significator: Significator | null;
  readonly currentStage: string;
  readonly isLoaded: boolean;
  readonly lastEncounterId: string | null;
}

const initialState: GameState = {
  significator: null,
  currentStage: 'Red',
  isLoaded: false,
  lastEncounterId: null,
};

export const gameStore = writable<GameState>(initialState);

/** Update the Significator (called by the gameplay engine on encounter_completed). */
export function setSignificator(sig: Significator | null): void {
  gameStore.update((s) => ({
    ...s,
    significator: sig,
    currentStage: sig?.currentStage ?? 'Red',
    isLoaded: sig !== null,
  }));
}

/** Mark that the game has loaded. */
export function markLoaded(): void {
  gameStore.update((s) => ({ ...s, isLoaded: true }));
}

/** Set the last encounter ID (called when an encounter starts). */
export function setLastEncounter(id: string | null): void {
  gameStore.update((s) => ({ ...s, lastEncounterId: id }));
}
