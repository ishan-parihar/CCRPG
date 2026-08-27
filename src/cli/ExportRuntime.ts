/**
 * ExportRuntime — JSON/CSV export of trial telemetry.
 * Local-only, opt-in. Reads TrialRecordStore via TrainingRuntime's services singleton.
 */
import chalk from 'chalk';
import { Command } from 'commander';
import { allParadigms } from '../core/braingame/registry.js';
import type { TrialRecord } from '../core/braingame/types.js';
import type { SessionRecord } from '../core/braingame/TrialRecordStore.js';

let servicesGetter: (() => Promise<{ trials: { trialsByParadigm(pid: string): Promise<readonly TrialRecord[]>; recentSessions(n: number): Promise<readonly SessionRecord[]> } }>) | null = null;

export function setServicesGetter(fn: typeof servicesGetter): void {
  servicesGetter = fn;
}

function parseIntSafe(v: string): number {
  return Math.abs(parseInt(v, 10));
}

export async function runExportCommand(args: string[]): Promise<number> {
  const parser = new Command();
  parser
    .name('export')
    .option('--format <fmt>', 'json or csv', 'json')
    .option('--paradigm <id>', 'filter to one paradigm')
    .option('--days <n>', 'limit to last N days', parseIntSafe)
    .option('--out <path>', 'write to file instead of stdout');
  parser.exitOverride();
  try { parser.parse(args, { from: 'user' }); } catch { /* help */ }
  const o = parser.opts<{ format?: string; paradigm?: string; days?: number; out?: string }>();
  const format = (o.format ?? 'json').toLowerCase() === 'csv' ? 'csv' : 'json';
  if (!servicesGetter) {
    console.error('Export services not initialized');
    return 1;
  }
  const s = await servicesGetter();
  const paradigms = o.paradigm ? [o.paradigm] : allParadigms().map((p) => p.id);
  const all: TrialRecord[] = [];
  for (const pid of paradigms) {
    const trials = await s.trials.trialsByParadigm(pid);
    all.push(...trials);
  }
  let filtered: readonly TrialRecord[] = all;
  if (typeof o.days === 'number' && o.days > 0) {
    const cutoff = Date.now() - o.days * 86_400_000;
    filtered = all.filter((t) => t.timestamp >= cutoff);
  }
  const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
  const sessions = await s.trials.recentSessions(100);
  let filteredSessions: readonly SessionRecord[] = sessions;
  if (typeof o.days === 'number' && o.days > 0) {
    const cutoff = Date.now() - o.days * 86_400_000;
    filteredSessions = sessions.filter((s0) => s0.startedAt >= cutoff);
  }
  if (o.paradigm) filteredSessions = filteredSessions.filter((s0) => s0.paradigmId === o.paradigm);
  let output: string;
  if (format === 'csv') {
    output = toCsv(sorted, filteredSessions);
  } else {
    output = JSON.stringify({ exportedAt: Date.now(), days: o.days ?? null, paradigm: o.paradigm ?? null, trials: sorted.map(serializeTrialForExport), sessions: filteredSessions }, null, 2);
  }
  if (o.out) {
    const fs = await import('fs');
    const path = await import('path');
    const outPath = path.resolve(o.out);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    await fs.promises.writeFile(outPath, output, 'utf8');
    const plain = !process.stdout.isTTY;
    console.log(plain ? `Exported ${sorted.length} trials to ${outPath}` : `${chalk.green('✓')} Exported ${sorted.length} trials to ${chalk.bold(outPath)}`);
  } else {
    console.log(output);
  }
  return 0;
}

function serializeTrialForExport(t: TrialRecord): Record<string, unknown> {
  return {
    sessionId: t.sessionId,
    paradigmId: t.paradigmId,
    timestamp: t.timestamp,
    trialIndex: t.trialIndex,
    correct: t.correct,
    accuracy: t.accuracy,
    latencyMs: t.adjustedLatencyMs,
    paramsHash: t.paramsHash,
  };
}

function toCsv(trials: readonly TrialRecord[], sessions: readonly SessionRecord[]): string {
  const header = 'sessionId,paradigmId,timestamp,trialIndex,correct,accuracy,latencyMs,paramsHash';
  const rows = trials.map((t) => [t.sessionId, t.paradigmId, String(t.timestamp), String(t.trialIndex), t.correct ? '1' : '0', String(t.accuracy), t.adjustedLatencyMs === null ? '' : String(t.adjustedLatencyMs), t.paramsHash].map(csvEscape).join(','));
  if (sessions.length > 0) {
    const sessHeader = '# sessions: sessionId,paradigmId,startedAt,trialsCompleted,accuracy,rtMedianMs,performance';
    const sessRows = sessions.map((s0) => [s0.sessionId, s0.paradigmId, String(s0.startedAt), String(s0.trialsCompleted), String(s0.accuracy), s0.rtMedianMs === null ? '' : String(s0.rtMedianMs), String(s0.performance)].map(csvEscape).join(','));
    return [header, ...rows, sessHeader, ...sessRows].join('\n');
  }
  return [header, ...rows].join('\n');
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}
