/**
 * DevelopmentalNeedsDetector — derives DevelopmentalNeed[] from a Significator.
 *
 * Extracted from GameLoop so the unified profile tools and any other consumer
 * can ask "what developmental needs should curriculum content address?"
 * without re-implementing the rule.
 *
 * Three sources of need (in priority order):
 *   1. theta_decay       — lines with no encounter in >7 days
 *   2. drive_rebalance   — drives with fixation risk > 0.6 (mapped to a line)
 *   3. shadow_surface    — lines with ≥ 2 unresolved shadow entries
 *
 * Returns the top 3 needs, sorted by urgency descending.
 */
import type { Significator } from '../domain/Significator.js';
import type { DevelopmentalNeed } from './CurriculumBridge.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function detectDevelopmentalNeeds(sig: Significator): readonly DevelopmentalNeed[] {
  const needs: DevelopmentalNeed[] = [];
  const now = Date.now();

  // 1. Theta decay: lines with stale encounters (no encounter in >7 days)
  const lineUrgencies = new Map<string, number>();
  for (const [key, ts] of Object.entries(sig.theta.lastEncounter)) {
    if (now - ts > SEVEN_DAYS && ts > 0) {
      const [line] = key.split(':');
      if (line) {
        const staleness = Math.min(1, (now - ts) / (30 * SEVEN_DAYS));
        lineUrgencies.set(line, Math.max(lineUrgencies.get(line) ?? 0, 0.5 + staleness * 0.3));
      }
    }
  }
  for (const [line, urgency] of lineUrgencies) {
    needs.push({ type: 'theta_decay', line, urgency });
  }

  // 2. Drive imbalance: drives with high fixation risk
  const driveToLine: Record<string, string> = {
    Agency: 'Cognitive',
    Communion: 'Interpersonal',
    Eros: 'Emotional',
    Agape: 'Spiritual',
  };
  const driveLineUrgencies = new Map<string, number>();
  for (const [drive, risk] of Object.entries(sig.drives.fixationRisk)) {
    if (risk > 0.6) {
      const line = driveToLine[drive];
      if (line) {
        driveLineUrgencies.set(line, Math.max(driveLineUrgencies.get(line) ?? 0, risk));
      }
    }
  }
  for (const [line, urgency] of driveLineUrgencies) {
    needs.push({ type: 'drive_rebalance', line, urgency });
  }

  // 3. Shadow surfacing: lines with unresolved shadows
  const lineShadowCounts = new Map<string, number>();
  for (const entry of sig.shadows.entries) {
    if (entry.resolvedAt === null) {
      lineShadowCounts.set(entry.line, (lineShadowCounts.get(entry.line) ?? 0) + 1);
    }
  }
  const shadowLineUrgencies = new Map<string, number>();
  for (const [line, count] of lineShadowCounts) {
    if (count >= 2) {
      shadowLineUrgencies.set(line, Math.min(1, 0.6 + count * 0.05));
    }
  }
  for (const [line, urgency] of shadowLineUrgencies) {
    needs.push({ type: 'shadow_surface', line, urgency });
  }

  return needs.sort((a, b) => b.urgency - a.urgency).slice(0, 3);
}
