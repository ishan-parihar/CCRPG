import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('White', {
    stage: 'White',
    ray: 'Violet',
    description: 'Non-dual, harvest.',
    stub: true,
  });
}
