import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Turquoise', {
    stage: 'Turquoise',
    ray: 'Indigo',
    description: 'Vision-logic, holism.',
    stub: true,
  });
}
