import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Indigo', {
    ray: 'Indigo',
    paletteAnchor: '#7b2cbf',
    audioMode: 'aeolian',
    harvestRole: 'gateway',
  });
}
