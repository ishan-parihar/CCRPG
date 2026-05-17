import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Amber', {
    stage: 'Amber',
    ray: 'Green',
    description: 'Belonging, rule-and-role.',
    stub: true,
  });
}
