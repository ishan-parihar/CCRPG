/**
 * ConsequenceParser - extracts structured consequence data from LLM JSON output.
 * Per foundations/22 section 7.
 * NEVER throws; always returns gracefully.
 */
import type { ScheduledEncounter } from '../../core/domain/EncounterSpecNew.js';

export interface ParsedConsequence {
  readonly affectedHolons: readonly { readonly holonId: string; readonly field: string; readonly delta: number }[];
  readonly polarityDirection: 'sto' | 'sts' | 'neutral';
  readonly polarityMagnitude: number;
  readonly shadowSignal: { readonly quadrant: string; readonly line: string; readonly intensity: number } | null;
  readonly narrativeSummary: string;
}

export function parseConsequence(
  llmOutput: string,
  _encounterSpec: ScheduledEncounter,
): { readonly success: boolean; readonly record: ParsedConsequence | null; readonly errors: readonly string[] } {
  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(llmOutput);
  } catch {
    return { success: false, record: null, errors: ['Invalid JSON'] };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, record: null, errors: ['Invalid JSON: not an object'] };
  }

  const obj = parsed as Record<string, unknown>;
  const errors: string[] = [];

  // Step 2: Validate required fields
  if (!Array.isArray(obj['affectedHolons'])) {
    errors.push('Missing required field: affectedHolons');
  }

  const validDirections = ['sto', 'sts', 'neutral'];
  if (typeof obj['polarityDirection'] !== 'string' || !validDirections.includes(obj['polarityDirection'])) {
    errors.push('Invalid or missing polarityDirection: must be "sto", "sts", or "neutral"');
  }

  if (typeof obj['narrativeSummary'] !== 'string' || obj['narrativeSummary'].length === 0) {
    errors.push('Missing required field: narrativeSummary');
  }

  // Step 3: Validate affectedHolons deltas
  if (Array.isArray(obj['affectedHolons'])) {
    const holons = obj['affectedHolons'] as unknown[];
    for (let i = 0; i < holons.length; i++) {
      const holon = holons[i] as Record<string, unknown>;
      if (typeof holon !== 'object' || holon === null) {
        errors.push(`affectedHolons[${i}]: not an object`);
        continue;
      }
      if (typeof holon['holonId'] !== 'string') {
        errors.push(`affectedHolons[${i}]: missing holonId`);
      }
      if (typeof holon['field'] !== 'string') {
        errors.push(`affectedHolons[${i}]: missing field`);
      }
      if (typeof holon['delta'] !== 'number') {
        errors.push(`affectedHolons[${i}]: missing or non-numeric delta`);
      } else if (holon['delta'] < -0.3 || holon['delta'] > 0.3) {
        errors.push(`affectedHolons[${i}]: delta ${holon['delta']} outside allowed range [-0.3, 0.3]`);
      }
    }
  }

  // Step 4: Validate polarityMagnitude if present
  if (obj['polarityMagnitude'] !== undefined) {
    if (typeof obj['polarityMagnitude'] !== 'number') {
      errors.push('polarityMagnitude must be a number');
    } else if (obj['polarityMagnitude'] < 0 || obj['polarityMagnitude'] > 1) {
      errors.push(`polarityMagnitude ${obj['polarityMagnitude']} outside allowed range [0, 1]`);
    }
  }

  // Step 5: Validate shadowSignal if present
  if (obj['shadowSignal'] !== undefined && obj['shadowSignal'] !== null) {
    const shadow = obj['shadowSignal'] as Record<string, unknown>;
    if (typeof shadow !== 'object' || shadow === null) {
      errors.push('shadowSignal must be an object or null');
    } else {
      if (typeof shadow['intensity'] === 'number') {
        if (shadow['intensity'] < 0 || shadow['intensity'] > 1) {
          errors.push(`shadowSignal.intensity ${shadow['intensity']} outside allowed range [0, 1]`);
        }
      }
    }
  }

  // Return errors if any found
  if (errors.length > 0) {
    return { success: false, record: null, errors };
  }

  // Build validated record
  const affectedHolons = (obj['affectedHolons'] as Array<Record<string, unknown>>).map((h) => ({
    holonId: h['holonId'] as string,
    field: h['field'] as string,
    delta: h['delta'] as number,
  }));

  const shadowSignalRaw = obj['shadowSignal'] as Record<string, unknown> | null | undefined;
  const shadowSignal = shadowSignalRaw
    ? {
        quadrant: (shadowSignalRaw['quadrant'] as string) ?? '',
        line: (shadowSignalRaw['line'] as string) ?? '',
        intensity: (shadowSignalRaw['intensity'] as number) ?? 0,
      }
    : null;

  const record: ParsedConsequence = {
    affectedHolons,
    polarityDirection: obj['polarityDirection'] as 'sto' | 'sts' | 'neutral',
    polarityMagnitude: (obj['polarityMagnitude'] as number) ?? 0,
    shadowSignal,
    narrativeSummary: obj['narrativeSummary'] as string,
  };

  return { success: true, record, errors: [] };
}
