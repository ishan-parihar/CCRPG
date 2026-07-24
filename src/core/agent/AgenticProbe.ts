/**
 * AgenticProbe — the 4+1 questionnaire contract.
 *
 * Every questionnaire surface in Mysterium must produce an AgenticProbe:
 *   4 mcq options, each labelled and tagged with a polarity, plus 1 free-input.
 *
 * The four polarities represent a *quadrant of orientation* the agent uses to
 * map where the player is currently standing in dialectical space:
 *   - action      : external change, agency, force
 *   - reflective  : internal processing, witnessing, delay
 *   - communion   : connection, impact-on-others, empathy
 *   - integrative : synthesis, transcendence, paradox-holding
 *
 * `metadata.signalWeight` (0..1) is the calibration / trajectory progress
 * contributed by *answering this probe*. The CalibrationAgent uses this to
 * decide when signal is sufficient and the loop can end.
 *
 * This contract is the bridge between the Background-Agentic runtime and the
 * client UI (LLMDialogueRunner, AgentRunner). Both trust this shape exactly.
 */

export type ProbePolarity = 'action' | 'reflective' | 'communion' | 'integrative';

export const PROBE_POLARITIES: readonly ProbePolarity[] = [
  'action',
  'reflective',
  'communion',
  'integrative',
] as const;

export interface AgenticProbeOption {
  /** Display label. Non-empty. */
  readonly label: string;
  /** Which dialectical quadrant this option represents. */
  readonly polarity: ProbePolarity;
}

export interface AgenticProbeMetadata {
  /** Why the agent is asking this. Diagnostic, in human words. */
  readonly intent: string;
  /** Where this leads. The trajectory the agent intends. */
  readonly trajectory: string;
  /** 0..1: how much calibration signal this question contributes once answered. */
  readonly signalWeight: number;
}

export interface AgenticProbe {
  /** Stable ULID-like id; emitted by the agent so the client can correlate. */
  readonly id: string;
  /** Narrative framing (Veil register preserved by output VeilFilter). */
  readonly prompt: string;
  /** Exactly 4 options, in a tuple of fixed length. */
  readonly options: readonly [
    AgenticProbeOption,
    AgenticProbeOption,
    AgenticProbeOption,
    AgenticProbeOption,
  ];
  /** Placeholder text for the +1 free-input. */
  readonly freeInputPlaceholder: string;
  readonly metadata: AgenticProbeMetadata;
}

/** A response to an AgenticProbe: selected polarity + free-text. */
export interface AgenticProbeResponse {
  readonly probeId: string;
  readonly selectedPolarity: ProbePolarity;
  /** Selected option index 0..3 (parity with label). */
  readonly selectedIndex: 0 | 1 | 2 | 3;
  readonly freeInput: string;
  /** Optional ms-since-prompt (used by the hold-probe path). */
  readonly responseTimeMs?: number;
}
