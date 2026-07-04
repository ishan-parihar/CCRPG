import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Emotional', {
    line: 'Emotional',
    quadrant: 'UL',
    taskSlugs: ['affect_recognition'],
    description: 'Affect regulation, empathy, emotional literacy.',
  });
}
