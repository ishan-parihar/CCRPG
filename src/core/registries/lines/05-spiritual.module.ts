import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Spiritual', {
    line: 'Spiritual',
    quadrant: 'UL',
    taskSlugs: ['breath_rhythm'],
    description: 'Ultimate concern, value-priority, state-shifting.',
  });
}
