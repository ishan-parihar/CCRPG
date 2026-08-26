/**
 * Paradigm registry — id → definition lookup.
 * Adding a game requires zero core changes: register here, done.
 */
import type { ParadigmDefinition } from './types.js';
import { NBackParadigm } from './paradigms/nback.js';
import { ReactionTimeParadigm } from './paradigms/reactionTime.js';
import { PatternPredictionParadigm } from './paradigms/patternPrediction.js';
import { GoNoGoParadigm } from './paradigms/goNoGo.js';
import { StroopParadigm } from './paradigms/stroop.js';

const PARADIGMS: readonly ParadigmDefinition[] = [
  NBackParadigm,
  StroopParadigm,
  GoNoGoParadigm,
  ReactionTimeParadigm,
  PatternPredictionParadigm,
];

const BY_ID = new Map<string, ParadigmDefinition>(PARADIGMS.map((p) => [p.id, p]));

export function getParadigm(id: string): ParadigmDefinition | undefined {
  return BY_ID.get(id);
}

export function allParadigms(): readonly ParadigmDefinition[] {
  return PARADIGMS;
}
