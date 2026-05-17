import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Blue', {
    ray: 'Blue',
    paletteAnchor: '#4cc9f0',
    audioMode: 'mixolydian',
    harvestRole: 'co-creator-in',
  });
}
