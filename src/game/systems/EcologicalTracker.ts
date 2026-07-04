/**
 * EcologicalTracker — lightweight behavioural signal collector.
 * Tracks player movement and encounter engagement in WorldScene
 * to derive drive/shadow signals without explicit assessment.
 */

export interface BehaviourSignal {
  readonly explorationBreadth: number;
  readonly approachRate: number;
  readonly avoidancePatterns: readonly string[];
  readonly dwellTime: number;
  readonly movementEntropy: number;
}

const TOTAL_CELLS = 144; // 9x16 grid for 720x1280

export class EcologicalTracker {
  private positions: { x: number; y: number; t: number }[] = [];
  private encountersAvailable = 0;
  private encountersApproached = 0;
  private avoidedModalities: string[] = [];
  private visitedCells = new Set<string>();
  private gridSize = 80;

  recordPosition(x: number, y: number): void {
    this.positions.push({ x, y, t: Date.now() });
    this.visitedCells.add(`${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`);
  }

  recordEncounterAvailable(count: number): void {
    this.encountersAvailable = count;
  }

  recordEncounterApproached(modality: string): void {
    this.encountersApproached++;
    void modality; // tracked implicitly via avoidance
  }

  recordEncounterAvoided(modality: string): void {
    this.avoidedModalities.push(modality);
  }

  getSignals(): BehaviourSignal {
    const explorationBreadth = this.visitedCells.size / TOTAL_CELLS;
    const approachRate = this.encountersApproached / Math.max(1, this.encountersAvailable);

    // Modalities avoided 3+ times
    const counts: Record<string, number> = {};
    for (const m of this.avoidedModalities) counts[m] = (counts[m] ?? 0) + 1;
    const avoidancePatterns = Object.entries(counts)
      .filter(([, c]) => c >= 3)
      .map(([m]) => m);

    // Average time gap between position records
    let dwellTime = 0;
    if (this.positions.length > 1) {
      let totalGap = 0;
      for (let i = 1; i < this.positions.length; i++) {
        totalGap += this.positions[i].t - this.positions[i - 1].t;
      }
      dwellTime = totalGap / (this.positions.length - 1);
    }

    // Movement entropy: ratio of direction changes to total moves
    let movementEntropy = 0;
    if (this.positions.length > 2) {
      let dirChanges = 0;
      for (let i = 2; i < this.positions.length; i++) {
        const dx1 = this.positions[i - 1].x - this.positions[i - 2].x;
        const dy1 = this.positions[i - 1].y - this.positions[i - 2].y;
        const dx2 = this.positions[i].x - this.positions[i - 1].x;
        const dy2 = this.positions[i].y - this.positions[i - 1].y;
        // Direction changed if dot product is negative
        if (dx1 * dx2 + dy1 * dy2 < 0) dirChanges++;
      }
      movementEntropy = dirChanges / (this.positions.length - 2);
    }

    return { explorationBreadth, approachRate, avoidancePatterns, dwellTime, movementEntropy };
  }

  reset(): void {
    this.positions = [];
    this.encountersAvailable = 0;
    this.encountersApproached = 0;
    this.avoidedModalities = [];
    this.visitedCells.clear();
  }
}
