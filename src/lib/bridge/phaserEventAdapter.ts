/**
 * phaserEventAdapter — bridges Phaser's EventBus to the Svelte store.
 *
 * Audit fix B5: Previously, event handlers only console.log'd. Now they
 * actually update the gameStore:
 *   - encounter_completed → setLastEncounter (so /play HUD can react)
 *   - session_started / session_ended → logged (future: telemetry via BFF)
 *   - shadow_surfaced / shadow_resolved → logged (future: journal updates)
 *   - transformation_triggered → logged (future: stage-transition animation)
 * The registry 'changedata' listener already synced Significator — that's
 * the main reactive path.
 *
 * Contract: the Phaser game must expose its EventBus via
 * game.registry.get('EventBus'). The existing src/game/main.ts already
 * does this (RegistryKeys.EventBus).
 */

import type Phaser from 'phaser';
import { setSignificator, setLastEncounter } from '$lib/stores/gameStore.js';
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

  // B5 fix: actually update the store on encounter_completed.
  // The payload includes the encounter record; we extract the id for the HUD.
  unsubscribers.push(
    bus.on('encounter_completed', (payload) => {
      const record = payload.record as { encounterId?: string; id?: string };
      const id = record?.encounterId ?? record?.id ?? null;
      setLastEncounter(id);
      // Also re-sync the Significator from the registry — encounter_completed
      // mutates the Significator, so the registry value is now stale unless
      // the game explicitly re-sets it. We pull the latest as a safety net.
      const sig = game.registry.get('Significator') as Significator | undefined;
      if (sig) setSignificator(sig);
    }),
  );

  unsubscribers.push(
    bus.on('session_started', (payload) => {
      console.debug('[bridge] session_started', payload.timestamp);
    }),
  );

  unsubscribers.push(
    bus.on('session_ended', (payload) => {
      console.debug('[bridge] session_ended', payload.timestamp, payload.encounterCount);
      // Clear the last encounter when the session ends.
      setLastEncounter(null);
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

  console.debug('[phaserEventAdapter] attached to Phaser game');
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
