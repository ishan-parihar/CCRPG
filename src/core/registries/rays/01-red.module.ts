import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Red', {
    ray: 'Red',
    paletteAnchor: '#ff4d6d',
    audioMode: 'phrygian',
    harvestRole: 'foundation',
  });
}
