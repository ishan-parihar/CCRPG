import { DriveRegistry } from '../index.js';

export function register(): void {
  DriveRegistry.register('Communion', {
    drive: 'Communion',
    description: 'Connection, belonging, integration.',
  });
}
