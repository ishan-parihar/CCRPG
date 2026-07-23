/**
 * assertAgenticProbe — server-side validator for the 4+1 contract.
 *
 * Throws AgenticProbeValidationError on any contract violation. Returns a
 * strictly-typed AgenticProbe on success. This is the single point of
 * enforcement: any boundary that ingests LLM JSON (BFF route, DirectorAgent
 * receive-frame) MUST route parsed JSON through this validator before it is
 * allowed to leave the trust boundary.
 *
 * Why: the Background-Agentic architecture depends on every probe carrying
 * exactly 4 polarities; the LLM cannot be trusted implicitly and we have
 * learned (HARDCODE-AUDIT) that loose parsing allows malformed probes to
 * leak onto the wire. Soft parsing (silently trimming to 4) is forbidden.
 */

import {
  type AgenticProbe,
  type AgenticProbeOption,
  type AgenticProbeMetadata,
  type ProbePolarity,
  PROBE_POLARITIES,
} from './AgenticProbe.js';

const POLARITY_SET: ReadonlySet<ProbePolarity> = new Set(PROBE_POLARITIES);

export class AgenticProbeValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(`[AgenticProbe:${code}] ${message}`);
    this.code = code;
    this.name = 'AgenticProbeValidationError';
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asNonEmptyString(v: unknown, path: string): string {
  if (typeof v !== 'string') {
    throw new AgenticProbeValidationError('TYPE', `${path} must be a string, got ${typeof v}`);
  }
  if (v.trim().length === 0) {
    throw new AgenticProbeValidationError('EMPTY', `${path} must be a non-empty string`);
  }
  return v;
}

function asBoundedNumber(v: unknown, path: string, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new AgenticProbeValidationError('TYPE', `${path} must be a finite number`);
  }
  if (v < min || v > max) {
    throw new AgenticProbeValidationError('RANGE', `${path} must be in [${min}, ${max}], got ${v}`);
  }
  return v;
}

function asPolarity(v: unknown, path: string): ProbePolarity {
  if (typeof v !== 'string' || !POLARITY_SET.has(v as ProbePolarity)) {
    throw new AgenticProbeValidationError(
      'POLARITY',
      `${path} must be one of ${[...POLARITY_SET].join(', ')}, got ${JSON.stringify(v)}`,
    );
  }
  return v as ProbePolarity;
}

function asOption(v: unknown, path: string): AgenticProbeOption {
  if (!isObject(v)) {
    throw new AgenticProbeValidationError('TYPE', `${path} must be an object`);
  }
  const label = asNonEmptyString(v['label'], `${path}.label`);
  const polarity = asPolarity(v['polarity'], `${path}.polarity`);
  return { label, polarity };
}

function asMetadata(v: unknown, path: string): AgenticProbeMetadata {
  if (!isObject(v)) {
    throw new AgenticProbeValidationError('TYPE', `${path} must be an object`);
  }
  const intent = asNonEmptyString(v['intent'], `${path}.intent`);
  const trajectory = asNonEmptyString(v['trajectory'], `${path}.trajectory`);
  const signalWeight = asBoundedNumber(v['signalWeight'], `${path}.signalWeight`, 0, 1);
  return { intent, trajectory, signalWeight };
}

/**
 * Validate parsed JSON against the 4+1 contract. Returns the strictly-typed
 * shape (with tuple) on success. Throws AgenticProbeValidationError on any
 * structural or domain violation.
 */
export function assertAgenticProbe(parsed: unknown): AgenticProbe {
  if (!isObject(parsed)) {
    throw new AgenticProbeValidationError('ROOT', 'probe must be an object');
  }
  const id = asNonEmptyString(parsed['id'], 'id');
  const prompt = asNonEmptyString(parsed['prompt'], 'prompt');

  const rawOptions = parsed['options'];
  if (!Array.isArray(rawOptions)) {
    throw new AgenticProbeValidationError('OPTIONS_TYPE', 'options must be an array');
  }
  if (rawOptions.length !== 4) {
    throw new AgenticProbeValidationError(
      'OPTIONS_COUNT',
      `options must be exactly 4 (got ${rawOptions.length})`,
    );
  }
  const opt0 = asOption(rawOptions[0], 'options[0]');
  const opt1 = asOption(rawOptions[1], 'options[1]');
  const opt2 = asOption(rawOptions[2], 'options[2]');
  const opt3 = asOption(rawOptions[3], 'options[3]');

  const freeInputPlaceholder = asNonEmptyString(
    parsed['freeInputPlaceholder'],
    'freeInputPlaceholder',
  );
  const metadata = asMetadata(parsed['metadata'], 'metadata');

  return {
    id,
    prompt,
    options: [opt0, opt1, opt2, opt3],
    freeInputPlaceholder,
    metadata,
  };
}

/**
 * Type-guard variant — never throws, returns boolean.
 */
export function isAgenticProbe(parsed: unknown): parsed is AgenticProbe {
  try {
    assertAgenticProbe(parsed);
    return true;
  } catch {
    return false;
  }
}
