import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Cognitive', {
    line: 'Cognitive',
    quadrant: 'UR',
    taskSlugs: ['n_back'],
    description: 'Working memory, planning, perspective-taking.',
  });
}
