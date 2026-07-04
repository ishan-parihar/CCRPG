import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Magenta', {
    stage: 'Magenta',
    ray: 'Orange',
    description: 'Symbol, fantasy, magical agency.',
    stub: true,
  });
}
