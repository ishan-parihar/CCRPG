import type { TelemetryEvent } from './TelemetryEvent.js';

export interface DevelopmentalReport {
  readonly generatedAt: number;
  readonly summary: string;
  readonly themes: readonly string[];
  readonly growthAreas: readonly string[];
  readonly patterns: readonly string[];
}

export function generateReport(events: readonly TelemetryEvent[]): DevelopmentalReport {
  const generatedAt = Date.now();

  if (events.length === 0) {
    return {
      generatedAt,
      summary: 'Your journey is just beginning. Each choice you make will reveal new facets of your character.',
      themes: [],
      growthAreas: [],
      patterns: [],
    };
  }

  const themes: string[] = [];
  const growthAreas: string[] = [];
  const patterns: string[] = [];

  const encounterCount = events.filter(e => e.type === 'encounter_completed').length;
  const shadowSurfaced = events.filter(e => e.type === 'shadow_surfaced').length;
  const shadowResolved = events.filter(e => e.type === 'shadow_resolved').length;
  const transformations = events.filter(e => e.type === 'transformation_triggered').length;

  // Build qualitative themes
  if (encounterCount > 0) {
    themes.push('You engaged with meaningful encounters that challenged your perspective.');
  }
  if (shadowSurfaced > 0) {
    themes.push('Hidden aspects of yourself came to light through your choices.');
  }
  if (transformations > 0) {
    themes.push('Moments of genuine change emerged from your experiences.');
  }

  // Build growth areas
  if (shadowSurfaced > shadowResolved) {
    growthAreas.push('There are inner tensions still waiting for your attention and care.');
  }
  if (encounterCount > 0 && transformations === 0) {
    growthAreas.push('Deeper engagement with difficult choices may open new paths forward.');
  }
  if (shadowResolved > 0) {
    growthAreas.push('You have shown a capacity for integrating challenging aspects of yourself.');
  }

  // Build patterns
  if (encounterCount >= 3) {
    patterns.push('You showed growing capacity for navigating complex decisions.');
  }
  if (shadowResolved > 0 && shadowSurfaced > 0) {
    patterns.push('A willingness to face and work through inner conflicts is emerging.');
  }
  if (transformations >= 2) {
    patterns.push('Your journey shows a recurring openness to genuine change.');
  }

  const summaryParts: string[] = [];
  if (encounterCount > 0) {
    summaryParts.push('You navigated meaningful challenges');
  }
  if (shadowResolved > 0) {
    summaryParts.push('faced hidden aspects of yourself');
  }
  if (transformations > 0) {
    summaryParts.push('experienced moments of authentic transformation');
  }

  const summary = summaryParts.length > 0
    ? summaryParts.join(', ') + '.'
    : 'Your journey continues to unfold with each choice you make.';

  return {
    generatedAt,
    summary,
    themes,
    growthAreas,
    patterns,
  };
}
