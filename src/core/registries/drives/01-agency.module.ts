import { DriveRegistry } from '../index.js';

export function register(): void {
  DriveRegistry.register('Agency', {
    drive: 'Agency',
    description: 'Self-assertion, autonomy, differentiation.',
  });
}
