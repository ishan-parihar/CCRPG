/**
 * phaserEventAdapter — bridges Phaser's EventBus to the Svelte store.
 *
 * Phaser emits events (encounter_completed, shadow_surfaced, etc.) on
 * its internal EventBus. This adapter subscribes to those events and
 * forwards them to the gameStore, so Svelte components reactively
 * update when the game state changes.
 *
 * Contract: the Phaser game must expose its EventBus via
 * game.registry.get('EventBus'). The existing src/game/main.ts already
 * does this (RegistryKeys.EventBus).
 *
 * The EventBus uses typed events (GameEventType) and returns unsubscribe
 * functions from on(). We collect these unsubscribe functions and call
 * them on detach.
 */

import type Phaser from 'phaser';
import { setSignificator } from '$lib/stores/gameStore.js';
import type { EventBus } from '$core/events/EventBus.js';
import type { Significator } from '$core/domain/Significator.js';

let attachedGame: Phaser.Game | null = null;
const unsubscribers: Array<() => void> = [];
let registryListenerAttached = false;

/**
 * Attach the adapter to a running Phaser game.
 * Safe to call multiple times — detaches from the previous game first.
 */
export function attachPhaserBridge(game: Phaser.Game): void {
  // Detach from previous game if any.
  detachPhaserBridge();

  attachedGame = game;
  const bus = game.registry.get('EventBus') as EventBus | undefined;
  if (!bus) {
    console.warn('[phaserEventAdapter] No EventBus found in Phaser registry');
    return;
  }

  // Subscribe to events using the typed API.
  // Each on() call returns an unsubscribe function.
  unsubscribers.push(
    bus.on('encounter_completed', (payload) => {
      console.log('[bridge] encounter_completed', payload.record);
    }),
  );

  unsubscribers.push(
    bus.on('session_started', (payload) => {
      console.log('[bridge] session_started', payload.timestamp);
    }),
  );

  unsubscribers.push(
    bus.on('session_ended', (payload) => {
      console.log('[bridge] session_ended', payload.timestamp, payload.encounterCount);
    }),
  );

  // Sync the Significator from Phaser's registry to the Svelte store.
  const sig = game.registry.get('Significator') as Significator | undefined;
  if (sig) setSignificator(sig);

  // Listen for registry changes (Phaser fires 'changedata' when registry values are set).
  game.registry.events.on('changedata', (key: string, value: unknown) => {
    if (key === 'Significator') {
      setSignificator(value as Significator);
    }
  });
  registryListenerAttached = true;

  console.log('[phaserEventAdapter] attached to Phaser game');
}

/** Detach from the current Phaser game. Safe to call when no game is attached. */
export function detachPhaserBridge(): void {
  // Call all unsubscribe functions.
  for (const unsub of unsubscribers) {
    try {
      unsub();
    } catch (err) {
      console.warn('[phaserEventAdapter] error unsubscribing:', err);
    }
  }
  unsubscribers.length = 0;

  // Remove registry listener.
  if (attachedGame && registryListenerAttached) {
    try {
      attachedGame.registry.events.removeAllListeners('changedata');
    } catch (err) {
      console.warn('[phaserEventAdapter] error removing registry listener:', err);
    }
    registryListenerAttached = false;
  }

  attachedGame = null;
}
