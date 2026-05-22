/**
 * CompositeOnboarding -- Binary-search onboarding orchestrator.
 * Spec: STAGE-ASSESSMENT-ARCHITECTURE Part VI.
 *
 * For each developmental line, performs a binary-search through stages
 * to find the player's altitude (highest stage consistently passed).
 * Results are assembled into an initial Significator.
 *
 * This orchestrator is UI-agnostic: it delegates rendering to a `runModule`
 * callback provided by the AssessmentScene. It lives in src/game/ (not core)
 * because it coordinates the full onboarding flow including session splitting.
 */
import type { Line } from '../../core/domain/Line.js';
import type { Stage } from '../../core/domain/Stage.js';
import type { Significator } from '../../core/domain/Significator.js';
import type { StageAssessment, AssessmentResult } from '../../core/assessments/types.js';
import type { ModuleRegistry } from '../../core/assessments/registry.js';
import { createSignificator } from '../../core/domain/Significator.js';
import { ALL_LINES } from '../../core/domain/Line.js';
import { ALL_STAGES } from '../../core/domain/Stage.js';
import { stageOrdinal } from '../../core/domain/Stage.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface OnboardingConfig {
  /** Split onboarding into sessions */
  sessionSplit: 'full' | 'three-session' | 'quick-calibration';
  /** For three-session mode: which session number (1, 2, or 3) */
  currentSession?: number;
  /** Confidence threshold for convergence (default 0.6) */
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: OnboardingConfig = {
  sessionSplit: 'full',
  confidenceThreshold: 0.6,
};

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface LineAssessmentResult {
  readonly line: Line;
  readonly altitude: Stage;
  readonly confidence: number;
  readonly assessmentsRun: number;
}

export interface OnboardingResult {
  readonly lineResults: LineAssessmentResult[];
  readonly significator: Significator;
  readonly sessionsCompleted: number;
}

// ---------------------------------------------------------------------------
// Multi-session persistence
// ---------------------------------------------------------------------------

export interface OnboardingProgress {
  readonly completedLines: readonly Line[];
  readonly results: Record<string, { altitude: Stage; assessmentsRun: number }>;
  readonly sessionNumber: number;
}

// ---------------------------------------------------------------------------
// Session splitting constants
// ---------------------------------------------------------------------------

/**
 * Three-session split groups lines by developmental family:
 * Session 1: Somatic, Cognitive, Emotional (body-mind-heart foundation)
 * Session 2: Moral, Intrapersonal, Spiritual (values-self-transcendence)
 * Session 3: Willpower, Interpersonal (agency-communion)
 */
const THREE_SESSION_SPLITS: Record<number, Line[]> = {
  1: ['Somatic', 'Cognitive', 'Emotional'],
  2: ['Moral', 'Intrapersonal', 'Spiritual'],
  3: ['Willpower', 'Interpersonal'],
};

// Maximum assessments per line before forced convergence
const MAX_ASSESSMENTS_PER_LINE = 4;

/**
 * Seed initial drive weights from onboarding results.
 * More lines assessed = slight Communion bias (breadth); fewer = Agency bias (depth).
 * Real drive profiling happens during gameplay.
 */
export function seedDriveWeights(lineResults: LineAssessmentResult[]): Record<string, number> {
  const n = lineResults.length;
  const breadthSignal = n / ALL_LINES.length; // 0-1
  return {
    Agency: 0.1 * (1 - breadthSignal),
    Communion: 0.1 * breadthSignal,
    Eros: 0.05,
    Agape: 0.05,
  };
}

// Starting stage for quick-calibration (Amber = ordinal 3, better midpoint)
const START_STAGE_ORDINAL = Math.floor(ALL_STAGES.length / 2); // 4 (Orange) - used only for quick-calibration

// ---------------------------------------------------------------------------
// CompositeOnboarding class
// ---------------------------------------------------------------------------

export class CompositeOnboarding {
  private readonly registry: ModuleRegistry;
  private readonly config: OnboardingConfig;

  constructor(registry: ModuleRegistry, config?: Partial<OnboardingConfig>) {
    this.registry = registry;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the lines to assess for the current session.
   * Depends on the session split mode and current session number.
   */
  getLinesForSession(): Line[] {
    switch (this.config.sessionSplit) {
      case 'full':
        return [...ALL_LINES];

      case 'three-session': {
        const session = this.config.currentSession ?? 1;
        return THREE_SESSION_SPLITS[session] ?? [...ALL_LINES];
      }

      case 'quick-calibration':
        return [...ALL_LINES];
    }
  }

  /**
   * Run binary search for one line. Returns the found altitude.
   *
   * Algorithm (true binary search):
   * 1. Start at midpoint of full range [0, 7]
   * 2. Run the module at that stage in 'calibration' mode
   * 3. If passed (confidence >= threshold): set low = current+1, search higher
   * 4. If failed: set high = current-1, search lower
   * 5. Converge when low > high or MAX_ASSESSMENTS reached
   * 6. Return highest stage passed
   */
  async assessLine(
    line: Line,
    runModule: (module: StageAssessment) => Promise<AssessmentResult>,
  ): Promise<LineAssessmentResult> {
    // Quick-calibration: single assessment at starting stage, no binary search
    if (this.config.sessionSplit === 'quick-calibration') {
      return this.quickCalibrateLine(line, runModule);
    }

    let low = 0;
    let high = ALL_STAGES.length - 1; // 7
    let highestPassed: number | null = null;
    let assessments = 0;
    let lastConfidence = 0;

    // Start at midpoint of full range
    let current = Math.floor((low + high) / 2); // ordinal 3 (Amber)

    while (assessments < MAX_ASSESSMENTS_PER_LINE && low <= high) {
      const module = this.registry.get(line, ALL_STAGES[current]!);
      if (!module) {
        break;
      }

      const result = await runModule(module);
      assessments++;
      lastConfidence = result.confidence;

      if (result.passed && result.confidence >= this.config.confidenceThreshold) {
        highestPassed = current;
        low = current + 1; // search higher
      } else {
        high = current - 1; // search lower
      }

      // Next midpoint
      current = Math.floor((low + high) / 2);
    }

    const finalOrdinal = highestPassed ?? 0;
    const altitude = ALL_STAGES[finalOrdinal]!;
    const confidence = highestPassed !== null ? lastConfidence : 0;

    return { line, altitude, confidence, assessmentsRun: assessments };
  }

  /**
   * Run full onboarding for all lines in the current session.
   * Returns results and a freshly created Significator with discovered altitudes.
   */
  async runOnboarding(
    runModule: (module: StageAssessment) => Promise<AssessmentResult>,
  ): Promise<OnboardingResult> {
    const lines = this.getLinesForSession();
    const lineResults: LineAssessmentResult[] = [];

    for (const line of lines) {
      const result = await this.assessLine(line, runModule);
      lineResults.push(result);
    }

    // Build altitudes map. Lines not assessed default to Infrared.
    const altitudes = {} as Record<Line, Stage>;
    for (const l of ALL_LINES) {
      altitudes[l] = 'Infrared';
    }
    for (const result of lineResults) {
      altitudes[result.line] = result.altitude;
    }

    // Determine centre of gravity (most common altitude)
    const ordinals = ALL_LINES.map(l => stageOrdinal(altitudes[l]));
    const meanOrdinal = Math.round(ordinals.reduce((a, b) => a + b, 0) / ordinals.length);
    const currentStage = ALL_STAGES[meanOrdinal] ?? 'Infrared';

    // Create the initial Significator from onboarding results
    const significator = createSignificator('player', altitudes, currentStage);

    // Determine sessions completed based on split mode
    const sessionsCompleted = this.config.sessionSplit === 'three-session'
      ? (this.config.currentSession ?? 1)
      : 1;

    return { lineResults, significator, sessionsCompleted };
  }

  /**
   * Serialize current onboarding progress for cross-session persistence.
   */
  serializeProgress(lineResults: LineAssessmentResult[]): OnboardingProgress {
    const results: Record<string, { altitude: Stage; assessmentsRun: number }> = {};
    for (const r of lineResults) {
      results[r.line] = { altitude: r.altitude, assessmentsRun: r.assessmentsRun };
    }
    return {
      completedLines: lineResults.map(r => r.line),
      results,
      sessionNumber: this.config.currentSession ?? 1,
    };
  }

  /**
   * Resume onboarding from persisted progress.
   */
  static resumeFrom(progress: OnboardingProgress, registry: ModuleRegistry): CompositeOnboarding {
    return new CompositeOnboarding(registry, {
      sessionSplit: 'three-session',
      currentSession: progress.sessionNumber + 1,
    });
  }

  /**
   * Quick calibration: single pass/fail at Red for each line.
   * No binary search, just one assessment to get a rough estimate.
   */
  private async quickCalibrateLine(
    line: Line,
    runModule: (module: StageAssessment) => Promise<AssessmentResult>,
  ): Promise<LineAssessmentResult> {
    const module = this.registry.get(line, ALL_STAGES[START_STAGE_ORDINAL]!);
    if (!module) {
      return { line, altitude: 'Infrared', confidence: 0, assessmentsRun: 0 };
    }

    const result = await runModule(module);
    const passed = result.passed && result.confidence >= this.config.confidenceThreshold;

    return {
      line,
      altitude: passed ? ALL_STAGES[START_STAGE_ORDINAL]! : ALL_STAGES[START_STAGE_ORDINAL - 1]!,
      confidence: result.confidence,
      assessmentsRun: 1,
    };
  }
}
