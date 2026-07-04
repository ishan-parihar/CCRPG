import { DriveRegistry } from '../index.js';

export function register(): void {
  DriveRegistry.register('Agape', {
    drive: 'Agape',
    description: 'Descent, embrace, reaching downward to include.',
  });
}
