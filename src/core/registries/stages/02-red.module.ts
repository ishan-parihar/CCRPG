import { StageRegistry } from '../index.js';

export function register(): void {
  StageRegistry.register('Red', {
    stage: 'Red',
    ray: 'Yellow',
    description: 'Ego, will, dominance. The first fully-playable stage.',
    stub: false,
  });
}
