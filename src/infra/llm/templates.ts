/**
 * Shared LLM system-prompt templates — the prompt-level supplements
 * for the modality opener, module summary, and 4-option composer
 * paths added during HARDCODE-AUDIT v1.
 *
 * These templates are *additions* to the existing buildContext() output,
 * not replacements. The orchestrator pre-composes:
 *
 *   [buildContext systemPrompt]
 *   + [assessmentContext, if any]
 *   + [this template]
 *   + [continuityContext, if any]
 *
 * The LLM fills the template; we never tokenize template output ourselves.
 *
 * Each template is a function that takes whatever structured data the
 * caller already has (line / stage / modality / module / result) and
 * returns a single prose prompt. Keeping them as pure functions makes
 * them testable in isolation.
 *
 * VeilFilter will run across the final LLM output (server-side, end of
 * stream). Templates are written in the Veil register themselves so
 * their phrasing already conforms — but VeilFilter still runs, since
 * it also catches LLM drift.
 */

import type { Modality } from '../../core/domain/enums.js';
import type { Line } from '../../core/domain/Line.js';
import type { Stage } from '../../core/domain/Stage.js';
import type { DepthRubric, DepthLevel, CurriculumTaskType } from '../../core/curriculum/types.js';
import { ALL_DEPTH_LEVELS, depthOrdinal } from '../../core/curriculum/types.js';

/**
 * Modality opener template.
 *
 * The orchestrator calls this when it has decided on a (line, stage,
 * modality) tuple but has not yet produced the encounter's opening
 * narrative line. The LLM is asked to deliver that opening in 1–2
 * sentences in the Veil register, with the holon name and role
 * already established.
 *
 * Used by AgenticOrchestrator.runFallback as the LLM-driven source
 * for `narrativeIntro` (replacing the static "firelight/war-table"
 * literals).
 */
export function modalityOpenerTemplate(input: {
  readonly line: Line;
  readonly stage: Stage;
  readonly modality: Modality;
  readonly holonName: string;
  readonly holonRole: string;
}): string {
  return `You are composing a single opening line for a CCRPG encounter.

LINE OF INQUIRY: ${input.line}
STAGE: ${input.stage}
MODALITY: ${input.modality}
HOLON: ${input.holonName}, a ${input.holonRole}

VOICE: Veil register. Poetic, brief, second-person present tense.
Avoid clinical language. Use mythic/archetypal framings. Below is
not a list of banned words — it's a list of words that break register:
'analysis', 'assessment', 'diagnostic', 'metric', 'optimization', 'trigger'.

LENGTH: 1–2 sentences (15–35 words). One breath.

SHAPE: Set the scene so the player feels WHO is here and WHAT medium
they are meeting. Do not ask a question — the question comes from the
fallback prompt right after this line.

CONSTRAINT: Do not name the line, stage, or modality aloud. The player
must experience the encounter, not be briefed on it.`;
}

/**
 * Module summary template.
 *
 * The engine calls this AFTER an encounter has resolved to compose the
 * 2–3 sentence narrative summary the player reads in their journal.
 *
 * Replaces the buildModuleSummary Math.random()-picked openings and
 * closings in AgenticOrchestrator.
 */
export function moduleSummaryTemplate(input: {
  readonly line: Line;
  readonly stage: Stage;
  readonly modality: Modality;
  readonly passed: boolean;
  readonly taskLabel: string;
  readonly polarityDirection: 'sto' | 'sts' | 'neutral';
  readonly integrationShift: string | null;
}): string {
  const verdict = input.passed ? 'passed' : 'was held back by';
  const polarityHint =
    input.polarityDirection === 'sto'
      ? 'service-to-other polarity'
      : input.polarityDirection === 'sts'
        ? 'service-to-self polarity (tension to integrate)'
        : 'balanced polarity';

  return `You are composing the post-encounter narrative summary a player
reads in their journal.

LINE: ${input.line}
STAGE: ${input.stage}
MODALITY: ${input.modality}
VERDICT: The player ${verdict} ${input.taskLabel}.
${input.integrationShift ? `INTEGRATION: ${input.integrationShift}` : ''}
POLARITY NOTED: ${polarityHint}

VOICE: Veil register. Continue the encounter's own voice — not a recap.
Use second person ('you'). Reference ${input.line.toLowerCase()} dimension
without naming it.

LENGTH: 2 sentences (40–80 words). Must include ONE concrete image
drawn from the encounter. Must NOT include raw state numbers, line
names, or stage names.

OPEN with: what just happened.
CLOSE with: what it shifted in the player.

CONSTRAINT: Do not start with 'You...', 'The player...', 'This encounter...'.
The reader already knows all of that. Begin with the moment.`;
}

/**
 * Response-options composer template.
 *
 * Replaces the four canonical "Reflect deeply / Respond instinctively /
 * Sit with it / Challenge the premise" options in AgenticOrchestrator.
 *
 * Asks the LLM to compose exactly FOUR response-approach labels that
 * span a meaningful decision space at the (line, stage, modality).
 * The contract: ARRAY OF EXACTLY 4 STRINGS. The answer-key contract
 * with --answer relies on a stable 4-index; do not emit 3 or 5.
 */
export function responseOptionsTemplate(input: {
  readonly line: Line;
  readonly stage: Stage;
  readonly modality: Modality;
  readonly encounterPrompt: string;
}): string {
  return `You are composing the four OPTIONAL response approaches a
player may take to the following encounter prompt.

ENCOUNTER PROMPT:
"""
${input.encounterPrompt}
"""

LINE: ${input.line}
STAGE: ${input.stage}
MODALITY: ${input.modality}

VOICE: Veil register. Brief, evocative, second-person imperative.

LENGTH: EXACTLY 4 options. Each option is a verb phrase of 2–6 words
('Trust the first impulse'). Do NOT number them. Do NOT explain them.
Do NOT add a header or trailing prose.

SPREAD: The four options must span the response space:
  (1) an action-taking approach
  (2) a reflective / contemplative approach
  (3) a relational / communion approach
  (4) an integrative / meta approach
Calibrate the verbs to the (line, stage, modality). A Green-stage
Emotional encounter calls for different verbs than a Red-stage
Cognitive encounter.

OUTPUT FORMAT: Valid JSON array of exactly 4 strings. Example shape:
["verb phrase one", "verb phrase two", "verb phrase three", "verb phrase four"]

NO prose before or after the JSON. NO markdown code fences.`;
}

/**
 * Rubric-scoring template — Phase 1C.
 *
 * When a curriculum encounter has a depthRubric with an llmRubric field,
 * this template is used to evaluate the player's open-ended response
 * against the rubric's canDo/cannotDo items at each depth level.
 *
 * The LLM returns a structured evaluation that feeds into
 * RubricEvaluationInput.llmEvaluation, enabling the multi-dimensional
 * rubric scoring in classifyDepth().
 *
 * Used by the CurriculumAssessmentAgent (or AgenticOrchestrator)
 * after an open-ended curriculum encounter resolves.
 */
export function rubricScoringTemplate(input: {
  readonly conceptId: string;
  readonly conceptName: string;
  readonly playerResponse: string;
  readonly targetDepth: DepthLevel;
  readonly rubric: DepthRubric;
  readonly taskType: CurriculumTaskType;
}): string {
  // Build the rubric levels section — include canDo/cannotDo for each level
  // from the target depth down to memorized (the levels the student might be at)
  const targetOrdinal = depthOrdinal(input.targetDepth);
  const relevantLevels = ALL_DEPTH_LEVELS.slice(1, targetOrdinal + 1); // skip 'absent'

  const rubricSection = relevantLevels.map(level => {
    const entry = input.rubric.levels[level as keyof typeof input.rubric.levels];
    if (!entry) return '';
    const canDoStr = entry.canDo.length > 0
      ? `  Can do: ${entry.canDo.join('; ')}`
      : '  Can do: (none specified)';
    const cannotDoStr = entry.cannotDo.length > 0
      ? `  Cannot do: ${entry.cannotDo.join('; ')}`
      : '  Cannot do: (none specified)';
    return `\nLEVEL: ${level.toUpperCase()}\n${canDoStr}\n${cannotDoStr}`;
  }).join('\n');

  return `You are evaluating a player's response against a curriculum rubric.

CONCEPT: ${input.conceptName} (${input.conceptId})
TASK TYPE: ${input.taskType}
TARGET DEPTH: ${input.targetDepth}

PLAYER'S RESPONSE:
"""
${input.playerResponse}
"""

RUBRIC LEVELS (from shallowest to deepest):
${rubricSection}

EVALUATION INSTRUCTIONS:
1. Read the player's response carefully.
2. For each rubric level, determine which canDo items the response demonstrates
   and which cannotDo items it exhibits.
3. Assign a score from 0.0 to 1.0 representing how well the response
   demonstrates mastery at the TARGET DEPTH level.
4. Provide a brief rationale.

OUTPUT FORMAT (strict JSON, no prose, no fences):
{
  "score": <number 0.0-1.0>,
  "rationale": "<1-2 sentences explaining the score>",
  "matchedCanDo": ["<canDo item 1>", "<canDo item 2>"],
  "matchedCannotDo": ["<cannotDo item 1>"],
  "suggestedDepth": "<memorized|comprehended|applied|analyzed|evaluated|transformed>",
  "confidence": <number 0.0-1.0>
}

Reject any output that does not match this shape exactly.`;
}

/**
 * Build a rubric scoring prompt from a player response and rubric.
 * Convenience wrapper around rubricScoringTemplate for callers
 * that already have the structured data.
 */
export function buildRubricScoringPrompt(input: {
  readonly conceptId: string;
  readonly conceptName: string;
  readonly playerResponse: string;
  readonly targetDepth: DepthLevel;
  readonly rubric: DepthRubric;
  readonly taskType: CurriculumTaskType;
}): string {
  return rubricScoringTemplate(input);
}

/**
 * Parse the LLM's rubric scoring response into a structured evaluation.
 * Returns null if the response cannot be parsed.
 */
export function parseRubricScoringResponse(response: string): {
  readonly score: number;
  readonly rationale: string;
  readonly matchedCanDo: readonly string[];
  readonly matchedCannotDo: readonly string[];
} | null {
  try {
    // Strip markdown code fences if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as {
      score?: number;
      rationale?: string;
      matchedCanDo?: string[];
      matchedCannotDo?: string[];
    };

    if (typeof parsed.score !== 'number') return null;

    return {
      score: Math.max(0, Math.min(1, parsed.score)),
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
      matchedCanDo: Array.isArray(parsed.matchedCanDo) ? parsed.matchedCanDo : [],
      matchedCannotDo: Array.isArray(parsed.matchedCannotDo) ? parsed.matchedCannotDo : [],
    };
  } catch {
    return null;
  }
}

/**
 * Calibration probe template — used by the Background-Agentic
 * CalibrationAgent during onboarding to compose a single AgenticProbe.
 *
 * Invariant (BACKGROUND-AGENTIC-ARCHITECTURE Decision 7): the LLM MUST
 * emit a JSON object with EXACTLY 4 options and a freeInputPlaceholder.
 * Each option must carry a polarity from
 * {action, reflective, communion, integrative}. The server-side
 * assertAgenticProbe validator rejects malformed output.
 *
 * The Loom snapshot is appended to the user-message side so the model
 * can see recent game events and free-inputs. This is the mechan- ism
 * by which identical player inputs at different Loom states produce
 * different next probes — Decision 6.
 */
export function calibrationProbeTemplate(input: {
  readonly loomEventsJson: string;
  readonly loomInputsJson: string;
  readonly calibrationConfidence: number;
}): string {
  return `You are composing the NEXT onboarding probe for a CCRPG player.

You see the recent context the DirectorAgent has accumulated below. Use
it to drive the trajectory. Two identical inputs with different Loom
snapshots MUST lead you to compose different next probes.

RECENT GAME EVENTS (most recent first, max 5):
${input.loomEventsJson}

RECENT PLAYER FREE INPUTS (most recent first, max 3):
${input.loomInputsJson}

CALIBRATION CONFIDENCE (0..1, current):
${input.calibrationConfidence.toFixed(2)}

SHAPE: One short narrative prompt in the Veil register. Then EXACTLY
four labelled options, each tagged with a polarity from:
  - action      : external change, agency, force
  - reflective  : internal processing, witnessing, delay
  - communion   : connection, impact-on-others, empathy
  - integrative : synthesis, transcendence, paradox-holding

The four polarities must be present in some order; do not duplicate any.
The SPREAD of polarities is diagnostic; choose which quadrant the player
is currently under-explored in and bring it forward.

A freeInputPlaceholder for the +1 free-text field. A short "intent"
(one sentence, why this question now) and a "trajectory" (one sentence,
where this leads). A signalWeight in [0,1] for how much answering this
moves calibration forward.

OUTPUT FORMAT (strict JSON object, no prose, no fences):
{
  "id": "<short unique id>",
  "prompt": "<narrative framing, 1-3 sentences>",
  "options": [
    {"label": "<verb phrase>", "polarity": "action|reflective|communion|integrative"},
    {"label": "<verb phrase>", "polarity": "action|reflective|communion|integrative"},
    {"label": "<verb phrase>", "polarity": "action|reflective|communion|integrative"},
    {"label": "<verb phrase>", "polarity": "action|reflective|communion|integrative"}
  ],
  "freeInputPlaceholder": "<short prompt>",
  "metadata": {
    "intent": "<one sentence>",
    "trajectory": "<one sentence>",
    "signalWeight": <number 0..1>
  }
}

Reject any output that does not match this shape exactly: 4 options,
each with one polarity from the allowed set, exactly one freeInputPlaceholder.`;
}
