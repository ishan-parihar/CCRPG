import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Willpower', {
    line: 'Willpower',
    quadrant: 'UR',
    taskSlugs: ['simon'],
    description: 'Goal-locking, sustained effort, fatigue resistance.',
  });
}
