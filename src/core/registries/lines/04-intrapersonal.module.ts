import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Intrapersonal', {
    line: 'Intrapersonal',
    quadrant: 'UL',
    taskSlugs: ['go_no_go'],
    description: 'Self-awareness, introspection, meta-cognition.',
  });
}
