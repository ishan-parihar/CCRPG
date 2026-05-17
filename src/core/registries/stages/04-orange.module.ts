import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Orange', {
    stage: 'Orange',
    ray: 'Blue',
    description: 'Reason, achievement, science.',
    stub: true,
  });
}
