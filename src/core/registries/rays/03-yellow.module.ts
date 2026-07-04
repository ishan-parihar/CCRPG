import { RayRegistry } from '../index.js';

export function register(): void {
  RayRegistry.register('Yellow', {
    ray: 'Yellow',
    paletteAnchor: '#ffd166',
    audioMode: 'lydian',
    harvestRole: 'will',
  });
}
