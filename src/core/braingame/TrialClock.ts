/**
 * TrialClock — high-resolution monotonic timing for trial loops.
 *
 * Reference rule (docs/brain-game-upgrade/01 §R6): never Date.now() inside a
 * trial loop. We use process.hrtime.bigint() where available and fall back to
 * performance.now()-based ms for environments without hrtime (jsdom tests).
 * A one-time input-latency offset (measured during calibration) is subtracted
 * when converting to adjusted latency.
 */

type HrtimeFn = () => bigint;

function resolveHrtime(): HrtimeFn {
  const proc = process as unknown as { hrtime?: { bigint?: () => bigint } };
  if (proc.hrtime?.bigint) return proc.hrtime.bigint.bind(process.hrtime);
  const perf = globalThis.performance;
  if (perf?.now) {
    return () => BigInt(Math.round(perf.now() * 1e6));
  }
  return () => BigInt(Date.now()) * 1_000_000n;
}

export class TrialClock {
  private readonly now: HrtimeFn;
  /** Terminal input/render latency in ms, measured during calibration. */
  public calibrationOffsetMs = 0;

  constructor(now?: HrtimeFn) {
    this.now = now ?? resolveHrtime();
  }

  /** Monotonic nanoseconds since an arbitrary fixed point. */
  public ns(): bigint {
    return this.now();
  }

  /** Milliseconds between two ns samples. */
  public static msBetween(startNs: bigint, endNs: bigint): number {
    return Number(endNs - startNs) / 1e6;
  }

  /**
   * Adjust a raw ns latency by the calibration offset.
   * Never returns less than ~5 ms — a human cannot respond faster, and
   * clamping keeps degenerate offsets from producing negative RTs.
   */
  public adjustedMs(latencyNs: bigint | null): number | null {
    if (latencyNs === null) return null;
    const raw = TrialClock.msBetween(0n, latencyNs);
    return Math.max(5, raw - this.calibrationOffsetMs);
  }
}
