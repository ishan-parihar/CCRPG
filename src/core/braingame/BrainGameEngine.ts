/**
 * BrainGameEngine — pure trial-loop state machine.
 * Spec: docs/brain-game-upgrade/03-target-architecture.md §3.2.
 *
 * The engine NEVER touches the DOM/terminal/persistence directly:
 * - Presentation flows through GameUiPort (adapter implements).
 * - TrialRecords flow to an injected sink (TrialRecordStore in prod, arrays in tests).
 * - Difficulty adjustments flow through an injected hook (AdaptiveDifficultyService).
 *
 * An LLM call must never sit inside this loop — reaction-time integrity beats
 * agentic granularity (docs/brain-game-upgrade/04 §1 design rule).
 */
import type {
  CollectedResponse,
  GameSummary,
  NumericParams,
  ParadigmDefinition,
  ParadigmState,
  Rng,
  TrialPlan,
  TrialRecord,
} from './types.js';
import { clampParams, fnvHash } from './types.js';
import { TrialClock } from './TrialClock.js';

/** Adapter boundary: terminal today, WebUI later. */
export interface GameUiPort {
  /** Show static text between trials. */
  show(lines: readonly string[]): Promise<void>;
  /**
   * Render the preamble (if any), wait preambleMs, render the stimulus, then
   * open the response window and collect input. Latency clock starts at
   * stimulus-render completion; the port owns all timing measurement.
   */
  runTrial(plan: TrialPlan): Promise<CollectedResponse>;
  /** Called when the player aborts mid-trial (SIGINT). */
  onAbort(cb: () => void): void;
}

export interface EngineOptions {
  readonly paradigm: ParadigmDefinition;
  /** Initial difficulty params; clamped to the paradigm's space. */
  readonly params?: NumericParams;
  readonly trialCount?: number;
  readonly rng?: Rng;
  readonly clock?: TrialClock;
  readonly ui: GameUiPort;
  /** Receives every completed trial (persist + adapt). */
  readonly sink?: (record: TrialRecord) => void;
  /** Called after each trial with the params used — returns adjusted params for the NEXT trial. */
  readonly adjustDifficulty?: (params: NumericParams, correct: boolean) => NumericParams;
}

export class BrainGameEngine {
  private state: ParadigmState;
  private params: NumericParams;
  private trialsCompleted = 0;
  private records: TrialRecord[] = [];
  private accuracies: number[] = [];
  private latenciesNs: bigint[] = [];
  private aborted = false;

  constructor(private readonly opts: EngineOptions) {
    const p = opts.paradigm;
    const seed = Math.floor(Math.random() * 0xffffffff);
    this.params = clampParams(p.paramSpace, opts.params ?? {});
    this.rng = opts.rng ?? (() => Math.random());
    this.clock = opts.clock ?? new TrialClock();
    this.sessionId = `bg-${Date.now().toString(36)}-${seed.toString(36)}`;
    this.paramsHash = fnvHash(`${p.id}|${JSON.stringify(this.params)}`);
    this.state = p.init(this.params, this.rng);
  }

  private readonly rng: Rng;
  private readonly clock: TrialClock;
  private readonly sessionId: string;
  private readonly paramsHash: string;

  public getSessionId(): string {
    return this.sessionId;
  }

  public markAborted(): void {
    this.aborted = true;
  }

  /** Serializable snapshot for pause/resume. */
  public snapshot(): { state: ParadigmState; params: NumericParams; trialsCompleted: number } {
    return { state: this.state, params: this.params, trialsCompleted: this.trialsCompleted };
  }

  public async run(): Promise<GameSummary> {
    const p = this.opts.paradigm;
    const targetTrials = Math.max(1, this.opts.trialCount ?? p.defaultTrials);

    this.opts.ui.onAbort(() => this.markAborted());

    while (!this.aborted && this.trialsCompleted < targetTrials && !p.isComplete(this.state, this.trialsCompleted)) {
      const plan = p.present(this.state, this.trialsCompleted, this.rng);
      const response = await this.opts.ui.runTrial(plan);

      if (this.aborted) break;

      const evaluation = p.evaluate(this.state, plan, response);
      this.state = p.advance(this.state, plan, response);
      this.trialsCompleted++;

      const latencyMsRaw =
        response.latencyNs !== null ? Number(response.latencyNs) / 1e6 : null;
      const record: TrialRecord = {
        sessionId: this.sessionId,
        paradigmId: p.id,
        timestamp: Date.now(),
        trialIndex: this.trialsCompleted - 1,
        params: this.params,
        paramsHash: this.paramsHash,
        correct: evaluation.correct,
        accuracy: evaluation.accuracy,
        latencyScore: evaluation.latencyScore,
        latencyNs: response.latencyNs,
        adjustedLatencyMs:
          latencyMsRaw !== null ? Math.max(5, latencyMsRaw - this.clock.calibrationOffsetMs) : null,
      };
      this.records.push(record);
      this.accuracies.push(evaluation.accuracy);
      if (response.latencyNs !== null) this.latenciesNs.push(response.latencyNs);
      this.opts.sink?.(record);

      if (evaluation.note && !this.aborted) {
        await this.opts.ui.show([evaluation.note]);
      }

      // Difficulty adapts for the NEXT trial based on THIS result — but only
      // when a next trial will actually run (paramsEnd stays honest about
      // the last played difficulty for calibration).
      const hasNext =
        !this.aborted &&
        this.trialsCompleted < targetTrials &&
        !p.isComplete(this.state, this.trialsCompleted);
      if (hasNext && this.opts.adjustDifficulty) {
        this.params = clampParams(
          p.paramSpace,
          this.opts.adjustDifficulty(this.params, evaluation.correct),
        );
      }
    }

    return this.summarize(targetTrials);
  }

  private summarize(targetTrials: number): GameSummary {
    const p = this.opts.paradigm;
    const n = this.records.length || 1;
    const overallAccuracy = this.records.reduce((s, r) => s + r.accuracy, 0) / n;

    // Performance composite: accuracy dominant, timed paradigms blend RT score.
    const latencyScores = this.records.map((r) => r.latencyScore);
    const meanLatency = latencyScores.reduce((s, v) => s + v, 0) / n;
    const performance = p.timed ? overallAccuracy * 0.6 + meanLatency * 0.4 : overallAccuracy;

    const sorted = [...this.latenciesNs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const rtMedianMs =
      sorted.length > 0
        ? Number(sorted[Math.floor(sorted.length / 2)]) / 1e6 - this.clock.calibrationOffsetMs
        : null;

    // Windowed trend: accuracy across quarters of the session.
    const quarter = Math.max(1, Math.ceil(this.records.length / 4));
    const trend: number[] = [];
    for (let i = 0; i < this.records.length; i += quarter) {
      const chunk = this.records.slice(i, i + quarter);
      trend.push(chunk.reduce((s, r) => s + r.accuracy, 0) / chunk.length);
    }

    return {
      sessionId: this.sessionId,
      paradigmId: p.id,
      label: p.label,
      trialsCompleted: this.trialsCompleted,
      aborted: this.aborted,
      accuracyTrend: trend,
      rtMedianMs: rtMedianMs !== null ? Math.max(5, rtMedianMs) : null,
      paramsStart: clampParams(p.paramSpace, this.opts.params ?? {}),
      paramsEnd: this.params,
      overallAccuracy,
      performance,
      feltSenseHint: feltSense(performance, this.trialsCompleted >= targetTrials),
    };
  }
}

/**
 * Veil-safe qualitative phrase derived from performance — the ONLY string
 * from a game summary the agent may quote to the player verbatim.
 */
export function feltSense(performance: number, complete: boolean): string {
  if (!complete) return 'a thread left deliberately unfinished';
  if (performance >= 0.85) return 'luminous clarity — each moment met without strain';
  if (performance >= 0.7) return 'steady focus deepening under gentle pressure';
  if (performance >= 0.55) return 'attention finding its rhythm, occasionally wandering';
  if (performance >= 0.4) return 'the mind stretching toward something just beyond reach';
  return 'a foggy morning — the path will clear as you walk it';
}
