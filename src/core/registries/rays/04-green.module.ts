import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Green', {
    ray: 'Green',
    paletteAnchor: '#52d273',
    audioMode: 'ionian',
    harvestRole: 'heart',
  });
}
