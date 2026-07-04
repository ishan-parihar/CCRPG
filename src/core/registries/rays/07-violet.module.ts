import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Violet', {
    ray: 'Violet',
    paletteAnchor: '#e0aaff',
    audioMode: 'locrian',
    harvestRole: 'integration',
  });
}
