import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Interpersonal', {
    line: 'Interpersonal',
    quadrant: 'LL',
    taskSlugs: ['stroop'],
    description: 'Attunement, co-regulation, conflict resolution.',
  });
}
