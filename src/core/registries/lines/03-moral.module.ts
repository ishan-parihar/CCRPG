import { LineRegistry } from '../index.js';

export function register(): void {
  LineRegistry.register('Moral', {
    line: 'Moral',
    quadrant: 'LL',
    taskSlugs: ['dilemma_choice'],
    description: 'Moral reasoning, ethical discernment.',
  });
}
