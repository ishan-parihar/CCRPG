import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Green', {
    stage: 'Green',
    ray: 'Blue',
    description: 'Sensitivity, plurality, inclusion.',
    stub: true,
  });
}
