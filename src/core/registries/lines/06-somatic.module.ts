import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Somatic', {
    line: 'Somatic',
    quadrant: 'UR',
    taskSlugs: ['reaction_time', 'held_input'],
    description: 'Body awareness, rhythm, motor control.',
  });
}
