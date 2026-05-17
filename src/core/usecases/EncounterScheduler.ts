/**
 * EncounterScheduler — computes the horizon line and suggests next encounters.
 * Per lines/00 §3.2: identifies weakest line, avoids overuse, surfaces shadows.
 */
import type { Line } from '../domain/Line.js';
import type { PlayerProfile } from '../domain/PlayerProfile.js';
import { ALL_LINES } from '../domain/Line.js';
import { stageOrdinal } from '../domain/Stage.js';

export interface EncounterSuggestion {
  readonly line: Line;
  readonly reason: 'horizon' | 'shadow' | 'variety';
}

/**
 * Get the horizon line (lowest altitude line).
 */
export function getHorizonLine(profile: PlayerProfile): Line {
  let minOrd = 8;
  let horizon: Line = 'Cognitive';
  for (const line of ALL_LINES) {
    const ord = stageOrdinal(profile.altitudes[line]);
    if (ord < minOrd) {
      minOrd = ord;
      horizon = line;
    }
  }
  return horizon;
}

/**
 * Suggest the next encounter line based on profile state.
 * Priority: shadow > horizon > variety (avoid overuse).
 */
export function suggestNextEncounter(
  profile: PlayerProfile,
  recentLines: readonly Line[],
): EncounterSuggestion {
  // 1. If there's an unresolved shadow, surface it
  if (profile.shadows.length > 0) {
    const shadowLine = profile.shadows[0]!.line;
    // Only suggest if not overused (not 3× in a row)
    const last3 = recentLines.slice(-3);
    if (!last3.every(l => l === shadowLine)) {
      return { line: shadowLine, reason: 'shadow' };
    }
  }

  // 2. Suggest the horizon line (weakest)
  const horizon = getHorizonLine(profile);
  const last3 = recentLines.slice(-3);
  if (!last3.every(l => l === horizon)) {
    return { line: horizon, reason: 'horizon' };
  }

  // 3. Variety: pick the least-recently-used line
  for (const line of ALL_LINES) {
    if (!recentLines.includes(line)) {
      return { line, reason: 'variety' };
    }
  }

  // Fallback: pick the line least represented in recent history
  const counts = new Map<Line, number>();
  for (const line of ALL_LINES) counts.set(line, 0);
  for (const l of recentLines) counts.set(l, (counts.get(l) ?? 0) + 1);
  let minCount = Infinity;
  let pick: Line = 'Cognitive';
  for (const [line, count] of counts) {
    if (count < minCount) { minCount = count; pick = line; }
  }
  return { line: pick, reason: 'variety' };
}
