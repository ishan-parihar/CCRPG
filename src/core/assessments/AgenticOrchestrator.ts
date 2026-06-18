import type { AssessmentResult, ShadowAssessmentResult, MeasureDimension, StageAssessment } from './types.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { Drive } from '../domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection } from '../domain/enums.js';
import { buildContext } from '../../infra/llm/ContextPipeline.js';
import { queryLLMWithTools } from '../../infra/llm/LLMClient.js';
import { getFallback } from '../../infra/llm/FallbackProvider.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '../engines/ConsequenceEngine.js';
import { accumulateTension, tryTriggerMacroEvent, type PESTLETension } from '../engines/MacroCatalystEngine.js';
import type { AgentMessage, AskUserQuestionParams, AskUserQuestionResult } from './agentTypes.js';

const PESTLE_DIMS: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];

export interface AgenticUIHandler {
  askUser(params: AskUserQuestionParams): Promise<AskUserQuestionResult>;
}

export interface OrchestratorResult {
  readonly updatedSig: Significator;
  readonly updatedWorld: WorldState;
  readonly finalResult: AssessmentResult | ShadowAssessmentResult;
  readonly consequenceRecord: ConsequenceRecord;
  readonly narrativeSummary: string;
  readonly messages: readonly AgentMessage[];
}

export const ASK_USER_QUESTION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'ask_user_question',
    description: 'Ask the user one or more multiple-choice questions (MCQs). IMPORTANT: Always start with a narrative introduction that sets the scene — describe who is speaking, what the environment looks like, and what is happening. Then present the question. Always include 3-4 MCQ options AND set allowWriteIn=true so the user can write their own response as a 5th option. The question field should contain the full narrative + question text.',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string', description: 'The main prompt or dialogue text from the NPC.' },
              header: { type: 'string', description: 'Short label (max 12 chars) shown as the tab title.' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: 'Concise option text (1-5 words).' },
                    description: { type: 'string', description: 'Developmental or choice description.' },
                    preview: { type: 'string', description: 'Optional markdown, code, or ASCII art preview.' }
                  },
                  required: ['label', 'description']
                }
              },
              multiSelect: { type: 'boolean', description: 'True for checkbox toggles, false for single radio button choice.' },
              allowWriteIn: { type: 'boolean', description: 'True to present a text box for the 5th option write-in.' }
            },
            required: ['question', 'header', 'options', 'multiSelect']
          }
        }
      },
      required: ['questions']
    }
  }
};

export const COMPLETE_ENCOUNTER_TOOL = {
  type: 'function' as const,
  function: {
    name: 'complete_encounter',
    description: 'Concludes the encounter. Evaluates the player based on their choices and responses, delivering scores, feedback, polarity direction, and shadow signals.',
    parameters: {
      type: 'object',
      properties: {
        passed: { type: 'boolean', description: 'Whether the player successfully demonstrated or integrated the capacity.' },
        scores: {
          type: 'object',
          description: 'Scores (0.0 to 1.0) on the relevant developmental dimensions measured by the task trials.',
          properties: {
            accuracy: { type: 'number' },
            response_time: { type: 'number' },
            consistency: { type: 'number' },
            depth: { type: 'number' },
            self_correction: { type: 'number' },
            complexity_handled: { type: 'number' },
            transfer: { type: 'number' },
            metacognition: { type: 'number' },
            coherence: { type: 'number' },
            integration: { type: 'number' }
          }
        },
        feedback: { type: 'string', description: 'Supportive developmental feedback explaining what their responses indicate about their drive-health or stage expression.' },
        polarityDirection: { type: 'string', enum: ['sto', 'sts', 'neutral'], description: 'The polarity direction indicated by the player\'s choices.' },
        driveScores: {
          type: 'object',
          description: 'REQUIRED: Per-drive health scores (0.0 to 1.0) for all 4 drives. 0.0 = severe pathology, 0.5 = baseline/neutral, 1.0 = exceptional integration. Score each independently based on evidence from the player responses.',
          properties: {
            agency: { type: 'number', description: 'Agency health: self-direction, initiative, boundary-setting, decisive action.' },
            communion: { type: 'number', description: 'Communion health: empathy, connection, belonging, collaborative capacity.' },
            eros: { type: 'number', description: 'Eros health: aspiration, growth-seeking, reaching toward higher capacity.' },
            agape: { type: 'number', description: 'Agape health: compassion, integration of lower stages, returning to include.' }
          },
          required: ['agency', 'communion', 'eros', 'agape']
        },
        driveSignals: {
          type: 'object',
          description: 'REQUIRED: Per-drive pathology signal for all 4 drives. Use HealthyBalanced for healthy drives, or the specific pathology observed (DarkAddicted, DarkAverted, GoldenAddicted, GoldenAverted).',
          properties: {
            agency: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            communion: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            eros: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            agape: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] }
          }
        },
        shadowSignal: {
          type: 'object',
          description: 'Optional shadow signal surfaced during this encounter.',
          properties: {
            quadrant: { type: 'string', enum: ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'] },
            intensity: { type: 'number', description: 'Intensity score (0.0 to 1.0) of the shadow expression.' }
          },
          required: ['quadrant', 'intensity']
        },
        narrativeSummary: { type: 'string', description: 'Immersive, third-person narrative summary of what occurred in the story world, omitting technical developer terms.' }
      },
      required: ['passed', 'feedback', 'polarityDirection', 'narrativeSummary']
    }
  }
};

const TOOLS = [ASK_USER_QUESTION_TOOL, COMPLETE_ENCOUNTER_TOOL];

export class AgenticOrchestrator {
  private encounter: ScheduledEncounter;
  private significator: Significator;
  private world: WorldState;
  private history: ConsequenceRecord[];
  private conceptIndex: any;
  private uiHandler: AgenticUIHandler;
  private module: StageAssessment | undefined;
  private messages: AgentMessage[] = [];

  constructor(params: {
    encounter: ScheduledEncounter;
    significator: Significator;
    world: WorldState;
    history: ConsequenceRecord[];
    conceptIndex: any;
    uiHandler: AgenticUIHandler;
    initialMessages?: readonly AgentMessage[];
    module?: StageAssessment;
  }) {
    this.encounter = params.encounter;
    this.significator = params.significator;
    this.world = params.world;
    this.history = params.history;
    this.conceptIndex = params.conceptIndex;
    this.uiHandler = params.uiHandler;
    this.module = params.module;
    this.messages = params.initialMessages ? [...params.initialMessages] : [];
  }

  public async run(): Promise<OrchestratorResult> {
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];
    const now = Date.now();

    // 1. Build context system prompt
    const contextInput = {
      encounter: this.encounter,
      significator: this.significator,
      holonRegistry: { holons: this.world.holons },
      conceptIndex: this.conceptIndex,
      recentConsequences: this.history,
      sessionContext: { energy: 'high' as const },
    };
    const context = buildContext(contextInput);

    // Build assessment module context for the LLM
    const assessmentContext = this.module ? this.buildAssessmentContext(this.module) : '';

    const systemPrompt = `${context.systemPrompt}${assessmentContext}
[AGENT RULES]
1. You are the Agentic Game Master driving this developmental encounter.
2. Present the encounter situationally and narratively. If you need to present stimuli, choices, or ask questions, ALWAYS call the 'ask_user_question' tool. Do not ask questions in raw text responses.
3. Keep the flow interactive, building upon prior answers.
4. This encounter has a budget of 2 exchanges. After the player has responded to 2 questions, you MUST call 'complete_encounter'. Do NOT generate more than 2 ask_user_question calls.
5. When calling 'complete_encounter', evaluate the player per the DRIVE PROBES section. Score each drive independently. Provide driveScores (0.0-1.0 per drive) and driveSignals (pathology enum per drive).`;

    if (this.messages.length === 0) {
      this.messages.push({
        role: 'user',
        content: `Start the encounter: ${this.encounter.id} (${line} - ${stage}). Introduce the scene and ask the first question.`
      });
    }

    let loopCount = 0;
    const maxLoops = 10; // Safety guard
    let askCount = 0; // Track ask_user_question calls for budget enforcement

    while (loopCount < maxLoops) {
      loopCount++;

      // Request next turn from LLM
      const res = await queryLLMWithTools(systemPrompt, this.messages, TOOLS);

      // Detect LLM unavailability on first call — switch to fallback
      if (loopCount === 1 && res.content && res.content.includes('"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
        return this.runFallback(line, stage, now);
      }

      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: res.content,
        toolCalls: res.toolCalls,
      };
      this.messages.push(assistantMsg);

      if (res.toolCalls && res.toolCalls.length > 0) {
        // Execute tool calls
        for (const tc of res.toolCalls) {
          if (tc.function.name === 'ask_user_question') {
            askCount++;
            const params = JSON.parse(tc.function.arguments) as AskUserQuestionParams;
            
            // Present to UI (Phaser or CLI)
            const result = await this.uiHandler.askUser(params);

            // Record tool response
            this.messages.push({
              role: 'tool',
              content: JSON.stringify(result),
              toolCallId: tc.id,
              name: 'ask_user_question'
            });

            // Budget enforcement: after 2 exchanges, force complete_encounter
            if (askCount >= 2 && !res.toolCalls.some(t => t.function.name === 'complete_encounter')) {
              this.messages.push({
                role: 'user',
                content: 'The encounter budget of 2 exchanges is exhausted. You MUST now call complete_encounter with your evaluation of the player. Do NOT ask another question.'
              });
            }
          } else if (tc.function.name === 'complete_encounter') {
            const params = JSON.parse(tc.function.arguments) as {
              passed: boolean;
              scores?: Partial<Record<MeasureDimension, number>>;
              driveScores: { agency: number; communion: number; eros: number; agape: number };
              driveSignals: { agency: string; communion: string; eros: string; agape: string };
              feedback: string;
              polarityDirection: 'sto' | 'sts' | 'neutral';
              shadowSignal?: {
                quadrant: ShadowQuadrant;
                intensity: number;
              };
              narrativeSummary: string;
            };

            // Process completion with per-drive scores
            const finalResult = this.createAssessmentResult(params.passed, params.scores || {}, params.driveScores);
            const outcome = this.finalizeEncounter(params, now);

            return {
              ...outcome,
              finalResult,
              messages: this.messages,
            };
          }
        }
      } else {
        // Fallback: If assistant didn't call any tools, prompt it to proceed
        this.messages.push({
          role: 'user',
          content: 'Continue with the encounter. If the encounter is complete, call complete_encounter. Otherwise, call ask_user_question.'
        });
      }
    }

    // Safety fallback termination if we loop too many times
    const fallbackParams = {
      passed: true,
      feedback: 'Encounter completed via timeout.',
      polarityDirection: 'neutral' as const,
      narrativeSummary: `The player successfully navigated the challenge of ${this.encounter.moduleRef}.`,
    };
    const finalResult = this.createAssessmentResult(true, {});
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
    };
  }

  /**
   * Fallback mode: use FallbackProvider content when LLM is unavailable.
   * Presents a single question/scenario via uiHandler, then completes.
   */
  private async runFallback(line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    const fallback = getFallback(this.encounter.modality, line, stage);

    // Look up the holon for narrative context
    const holon = this.world.holons.find(h => h.id === this.encounter.holonSource);
    const holonName = holon?.name ?? 'A presence';
    const holonRole = holon?.narrativeRole ?? 'guide';
    const encounterModality = this.encounter.modality;

    // Build narrative introduction based on modality
    let narrativeIntro: string;
    let questionText: string;
    let options: { label: string; description: string }[] = [];

    switch (encounterModality) {
      case 'LanguageReflective':
        narrativeIntro = `${holonName} sits across from you, their gaze steady. The firelight casts long shadows. They speak:`;
        questionText = fallback.prompt ?? 'What moved you to act?';
        options = [
          { label: 'Reflect deeply', description: 'Consider the question from multiple angles' },
          { label: 'Respond instinctively', description: 'Trust your first impulse' },
          { label: 'Sit with it', description: 'Allow the question to remain open' },
          { label: 'Challenge the premise', description: 'Question the foundation of what was asked' },
        ];
        break;

      case 'ScenarioChoice':
        narrativeIntro = `${holonName} confronts you. The air is tense. A choice must be made.`;
        questionText = fallback.scenario ?? 'A crossroads appears. Each path carries weight.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;

      case 'Strategic':
        narrativeIntro = `The war-table is spread before you. ${holonName} surveys the terrain. Three routes. Limited forces.`;
        questionText = fallback.scenario ?? fallback.prompt ?? 'Resources are limited. The map shows three routes to the objective.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;

      case 'Embodied':
        narrativeIntro = `The war-drums begin. ${holonName} guides you. Your body knows this rhythm.`;
        questionText = fallback.prompt ?? 'Close your eyes. Where do you feel tension in your body right now?';
        options = [
          { label: 'Follow the rhythm', description: 'Let the drum guide your body' },
          { label: 'Resist the beat', description: 'Fight against the pull' },
          { label: 'Breathe into it', description: 'Allow the sensation to move through you' },
          { label: 'Still yourself', description: 'Find the stillness within the movement' },
        ];
        break;

      case 'SocialCooperative':
        narrativeIntro = `${holonName} looks to you. Others wait for direction. The group needs your word.`;
        questionText = fallback.scenario ?? 'The scouts look to you. The path splits — one leads through danger, the other through uncertainty.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;

      case 'ImmersiveRPG':
        narrativeIntro = `The world stretches before you. ${holonName} appears — ${holonRole} of this domain. What calls?`;
        questionText = fallback.prompt ?? 'The world stretches before you. A path winds through unfamiliar terrain. Something waits ahead.';
        options = [
          { label: 'Press forward', description: 'Step into the unknown' },
          { label: 'Survey the area', description: 'Gather information first' },
          { label: 'Seek shelter', description: 'Find safety before advancing' },
          { label: 'Call out', description: 'Announce your presence' },
        ];
        break;

      default: // Deterministic and any future modalities
        narrativeIntro = `${holonName} presents a challenge. The moment demands clarity.`;
        questionText = fallback.prompt ?? fallback.framing ?? 'Focus. The moment demands clarity.';
        options = [
          { label: 'Engage', description: 'Step into the challenge' },
          { label: 'Reflect', description: 'Consider before acting' },
          { label: 'Withdraw', description: 'Step back and reassess' },
          { label: 'Negotiate', description: 'Seek a middle path forward' },
        ];
        break;
    }

    // Ensure at least 4 MCQ options before the write-in option
    const defaultOpts = [
      { label: 'Act decisively', description: 'Take the direct approach' },
      { label: 'Observe first', description: 'Gather more information' },
      { label: 'Seek alliance', description: 'Find strength in others' },
      { label: 'Deceive and maneuver', description: 'Use misdirection to your advantage' },
    ];
    while (options.length < 4) {
      const extra = defaultOpts[options.length];
      if (extra) options.push(extra);
      else break;
    }

    // Combine narrative intro with question
    const fullPrompt = `${narrativeIntro}\n\n${questionText}`;

    // Present to user via uiHandler
    const askParams: AskUserQuestionParams = {
      questions: [{
        question: fullPrompt,
        header: encounterModality,
        options,
        allowWriteIn: true,
        multiSelect: false,
      }],
    };

    const result = await this.uiHandler.askUser(askParams);
    const answer = result.answers[0];
    const narrativeSummary = answer?.writeInValue ?? (answer?.selectedLabels[0] ?? 'The player engaged with the encounter.');

    // Complete with synthetic result
    const fallbackParams = {
      passed: true,
      feedback: 'Encounter completed via fallback content.',
      polarityDirection: 'neutral' as const,
      narrativeSummary: typeof narrativeSummary === 'string' ? narrativeSummary : 'The player engaged with the encounter.',
    };

    const finalResult = this.createAssessmentResult(true, {});
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
    };
  }

  /**
   * Build assessment context section for the LLM system prompt.
   * Injects tasks, drive probes, and scoring rubric from the module.
   */
  private buildAssessmentContext(module: StageAssessment): string {
    const tasks = module.tasks.map((t, i) =>
      `  ${i + 1}. ${t.type}: ${t.description} (measures: ${t.measures.join(', ')})`
    ).join('\n');

    const probes = [
      `  agency: ${module.driveProbes.agency.description}`,
      `  communion: ${module.driveProbes.communion.description}`,
      `  eros: ${module.driveProbes.eros.description}`,
      `  agape: ${module.driveProbes.agape.description}`,
    ].join('\n');

    // Include the LLM rubric as scoring guidance (condensed)
    const rubric = module.scoringRubric.llmRubric
      ? `\n[SCORING RUBRIC] ${module.scoringRubric.llmRubric}`
      : '';

    return `
[ASSESSMENT MODULE] line=${module.line}; stage=${module.stage}
[TASKS - present one as a narrative challenge]
${tasks}
[DRIVE PROBES - evaluate each independently]
${probes}${rubric}
[INSTRUCTION] Weave the TASKS into a narrative encounter. After the player responds, evaluate their response against each DRIVE PROBE. Then call complete_encounter with per-drive scores and signals.`;
  }

  private createAssessmentResult(
    passed: boolean,
    scores: Partial<Record<MeasureDimension, number>>,
    driveScores?: { agency: number; communion: number; eros: number; agape: number },
  ): AssessmentResult {
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];
    const dimensions: Record<MeasureDimension, number> = {
      accuracy: scores.accuracy ?? 0.5,
      response_time: scores.response_time ?? 0.5,
      consistency: scores.consistency ?? 0.5,
      depth: scores.depth ?? 0.5,
      self_correction: scores.self_correction ?? 0.5,
      complexity_handled: scores.complexity_handled ?? 0.5,
      transfer: scores.transfer ?? 0.5,
      metacognition: scores.metacognition ?? 0.5,
      coherence: scores.coherence ?? 0.5,
      integration: scores.integration ?? 0.5,
    };

    // Wire per-drive scores into assessment dimensions so they aren't dead code
    if (driveScores) {
      dimensions.accuracy = driveScores.agency;
      dimensions.depth = driveScores.eros;
      dimensions.coherence = driveScores.communion;
      dimensions.integration = driveScores.agape;
    }

    return {
      line,
      stage,
      passed,
      confidence: 0.8,
      dimensions,
      rawTrials: [],
    };
  }

  private finalizeEncounter(
    params: {
      passed: boolean;
      feedback: string;
      polarityDirection: 'sto' | 'sts' | 'neutral';
      driveScores?: { agency?: number; communion?: number; eros?: number; agape?: number };
      driveSignals?: { agency?: string; communion?: string; eros?: string; agape?: string };
      shadowSignal?: {
        quadrant: ShadowQuadrant;
        intensity: number;
      };
      narrativeSummary: string;
    },
    now: number
  ): Omit<OrchestratorResult, 'finalResult' | 'messages'> {
    let energeticDirection: EnergeticDirection = 'Diffuse';
    if (params.polarityDirection === 'sto') energeticDirection = 'Radiative';
    else if (params.polarityDirection === 'sts') energeticDirection = 'Absorptive';

    // Map LLM-provided drive signals to DriveDirectionality enum.
    // If the LLM provided explicit per-drive signals, use them directly.
    // Otherwise fall back to polarity-based derivation.
    const SIGNAL_MAP: Record<string, DriveDirectionality> = {
      'HealthyBalanced': 'HealthyBalanced',
      'DarkAddicted': 'DarkAddicted',
      'DarkAverted': 'DarkAverted',
      'GoldenAddicted': 'GoldenAddicted',
      'GoldenAverted': 'GoldenAverted',
    };

    const baseDir: DriveDirectionality = params.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality: Record<Drive, DriveDirectionality> = {
      Agency: params.driveSignals?.agency ? (SIGNAL_MAP[params.driveSignals.agency] ?? baseDir) : baseDir,
      Communion: params.driveSignals?.communion ? (SIGNAL_MAP[params.driveSignals.communion] ?? baseDir) : baseDir,
      Eros: params.driveSignals?.eros ? (SIGNAL_MAP[params.driveSignals.eros] ?? baseDir) : (params.polarityDirection === 'sto' ? 'HealthyBalanced' : baseDir),
      Agape: params.driveSignals?.agape ? (SIGNAL_MAP[params.driveSignals.agape] ?? baseDir) : (params.polarityDirection === 'sts' ? 'HealthyBalanced' : baseDir),
    };

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality: driveDirectionality as Record<Drive, DriveDirectionality>,
      stageOrientation: params.polarityDirection === 'sto' ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: params.polarityDirection === 'sto' ? 'HigherRealm' : (params.polarityDirection === 'sts' ? 'LowerRealm' : 'Ambivalent'),
      shadowSurfaced: params.shadowSignal?.quadrant || null,
      shadowResolvedId: null,
      narrativeSummary: params.narrativeSummary,
    };

    const record = processOutcome(this.encounter, response, now);

    // Map affectedHolons if any (we can default to modifying the primary sourcing holon)
    let holonDeltas: ConsequenceRecord['holonDeltas'] = [];
    if (this.encounter.holonSource) {
      const existing = this.world.npcRelationships.find(r => r.holonId === this.encounter.holonSource);
      const oldValue = existing ? existing.strength : 0.5;
      const delta = params.passed ? 0.05 : -0.05;
      const newValue = Math.max(0, Math.min(1, oldValue + delta));
      holonDeltas = [{
        holonId: this.encounter.holonSource,
        field: 'relationshipStrength',
        oldValue,
        newValue,
      }];
    }

    const updatedRecord = {
      ...record,
      holonDeltas,
    };

    // Apply consequences
    const updated = applyConsequences(this.significator, this.world, updatedRecord, this.encounter);

    // Accumulate PESTLE tension
    const dim = PESTLE_DIMS[Math.floor(Math.random() * PESTLE_DIMS.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );

    // Check for macro-event trigger
    const activeEvents = (updated.world as any).activeMacroEvents ?? [];
    const macroEvent = tryTriggerMacroEvent(newTension, activeEvents, updated.sig.currentStage, now);
    const newActiveEvents = macroEvent ? [...activeEvents, macroEvent] : activeEvents;

    const updatedWorld = { ...updated.world, pestleTension: newTension, activeMacroEvents: newActiveEvents } as WorldState;

    return {
      updatedSig: updated.sig,
      updatedWorld,
      consequenceRecord: updatedRecord,
      narrativeSummary: params.narrativeSummary,
    };
  }
}
