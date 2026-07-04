import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Orange', {
    ray: 'Orange',
    paletteAnchor: '#ff8c42',
    audioMode: 'dorian',
    harvestRole: 'identity',
  });
}
