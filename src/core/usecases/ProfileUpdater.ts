import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import { LINE_QUADRANT } from '../domain/Line.js';

const QUADRANT_TO_DRIVE: Record<string, Drive> = {
  UR: 'Agency',
  UL: 'Eros',
  LL: 'Communion',
  LR: 'Agape',
};

export function driveForLine(line: Line): Drive {
  return QUADRANT_TO_DRIVE[LINE_QUADRANT[line]] ?? 'Agency';
}
