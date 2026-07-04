/**
 * Red stage narrative beats — dialogue, codex entries, stage rites.
 */
import { NarrativeRegistry } from '../index.js';

export function register(): void {
  NarrativeRegistry.register('red-intro', {
    beatId: 'red-intro',
    stage: 'Red',
    text: 'You awaken in a world ruled by will alone. Here, power is the only currency — and you must learn to wield it without being consumed.',
  });
  NarrativeRegistry.register('red-midpoint', {
    beatId: 'red-midpoint',
    stage: 'Red',
    text: 'The arena roars. You have proven your strength — but strength alone will not carry you beyond this place.',
  });
  NarrativeRegistry.register('red-climax', {
    beatId: 'red-climax',
    stage: 'Red',
    text: 'The Tyrant falls. Not because you were stronger, but because you were more than strength. The gate to Amber opens.',
  });
  NarrativeRegistry.register('red-codex-will', {
    beatId: 'red-codex-will',
    stage: 'Red',
    text: 'Will is the engine of the self. At Red, it burns unchecked — a fire that lights the way but also consumes. Mastery is learning when NOT to act.',
  });
}
