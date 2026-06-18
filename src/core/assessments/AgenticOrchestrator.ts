import type { AssessmentResult, ShadowAssessmentResult, MeasureDimension, StageAssessment, AssessmentTask, TaskType, TrialResult } from './types.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { Drive } from '../domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection, Modality } from '../domain/enums.js';
import { buildContext } from '../../infra/llm/ContextPipeline.js';
import { queryLLMWithTools } from '../../infra/llm/LLMClient.js';
import { getFallback } from '../../infra/llm/FallbackProvider.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '../engines/ConsequenceEngine.js';
import { accumulateTension, tryTriggerMacroEvent, type PESTLETension } from '../engines/MacroCatalystEngine.js';
import type { AgentMessage, AskUserQuestionParams, AskUserQuestionResult } from './agentTypes.js';
import { getRenderer } from './cli/TaskRenderers.js';

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
  private noLlm: boolean;
  private forceShadow: string | undefined;
  private _currentRendererEvaluate: ((answer: string, startMs: number, endMs: number) => any) | null = null;
  private _currentTaskStartTime: number = 0;

  constructor(params: {
    encounter: ScheduledEncounter;
    significator: Significator;
    world: WorldState;
    history: ConsequenceRecord[];
    conceptIndex: any;
    uiHandler: AgenticUIHandler;
    initialMessages?: readonly AgentMessage[];
    module?: StageAssessment;
    noLlm?: boolean;
    forceShadow?: string;
  }) {
    this.encounter = params.encounter;
    this.significator = params.significator;
    this.world = params.world;
    this.history = params.history;
    this.conceptIndex = params.conceptIndex;
    this.uiHandler = params.uiHandler;
    this.module = params.module;
    this.messages = params.initialMessages ? [...params.initialMessages] : [];
    this.noLlm = params.noLlm ?? false;
    this.forceShadow = params.forceShadow;
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

    // If noLlm flag is set, skip LLM entirely and go directly to fallback
    if (this.noLlm) {
      return this.runFallback(line, stage, now);
    }

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
      if (loopCount === 1 && res.content && res.content.trim().startsWith('{"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
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
   * Fallback mode: use module content when available, FallbackProvider otherwise.
   * When a module is available, presents real assessment tasks (n-back, dilemmas,
   * emotion identification, etc.) as narrative challenges and evaluates responses
   * using the module's drive probes. Also detects shadow patterns and computes
   * altitude shifts from consistent healthy patterns.
   */
  private async runFallback(line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    // CHECK: If we have an assessment module, use it for a real assessment
    if (this.module) {
      return this.runModuleAssessment(line, stage, now);
    }

    // Original generic fallback when no module is available
    const fallback = getFallback(this.encounter.modality, line, stage);
    const holon = this.world.holons.find(h => h.id === this.encounter.holonSource);
    const holonName = holon?.name ?? 'A presence';
    const holonRole = holon?.narrativeRole ?? 'guide';
    const encounterModality = this.encounter.modality;

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
      default:
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

    const fullPrompt = `${narrativeIntro}\n\n${questionText}`;

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

    const evaluated = this.evaluateFallbackResponse(narrativeSummary);

    const fallbackParams = {
      passed: evaluated.passed,
      feedback: evaluated.feedback,
      polarityDirection: evaluated.polarityDirection,
      driveScores: evaluated.driveScores,
      driveSignals: evaluated.driveSignals,
      narrativeSummary: typeof narrativeSummary === 'string' ? narrativeSummary : 'The player engaged with the encounter.',
    };

    const finalResult = this.createAssessmentResult(evaluated.passed, {}, evaluated.driveScores);
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
    };
  }

  /**
   * Module-aware fallback: uses the assessment module's tasks, drive probes,
   * and scoring rubric to present a real developmental assessment even without the LLM.
   * Selects a task matching the encounter modality, presents it as a narrative challenge,
   * evaluates the response against drive probes, detects shadow patterns,
   * and computes altitude progression.
   */
  private async runModuleAssessment(_line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    const module = this.module!;
    const holon = this.world.holons.find(h => h.id === this.encounter.holonSource);
    const holonName = holon?.name ?? 'A presence';
    const currentModality = this.encounter.modality;

    // 1. Select the best task from the module based on modality
    const task = this.selectTaskForModality(module, currentModality);

    // 2. Present the task as a narrative challenge via uiHandler
    const askResult = await this.presentModuleTask(module, task, currentModality, holonName);
    const answer = askResult.answers[0];
    const rawLabel = answer?.selectedLabels[0] ?? '';
    const writeIn = answer?.writeInValue;
    const playerResponseText = writeIn ?? rawLabel;

    // 3. Evaluate using the TaskRenderer's evaluate() if available (produces TrialResult with timing/accuracy)
    //    Fall back to drive-probe evaluation if no renderer evaluate is available
    const endTimeMs = Date.now();
    let evaluation: ReturnType<typeof this['evaluateViaDriveProbes']>;
    let trialResult: TrialResult | null = null;

    if (this._currentRendererEvaluate) {
      // Use the TaskRenderer's evaluate function for real scoring
      trialResult = this._currentRendererEvaluate(playerResponseText, this._currentTaskStartTime, endTimeMs);

      // Derive drive scores from the trial's dimension scores
      const avgDimension = trialResult ? (
        Object.values(trialResult.dimensions)
          .filter((v): v is number => v !== undefined)
          .reduce((a, b) => a + b, 0) /
        Math.max(1, Object.values(trialResult.dimensions).filter(v => v !== undefined).length)
      ) : 0.5;

      // Map trial accuracy to drive scores: high accuracy = healthy drives
      const baseScore = Math.min(1, Math.max(0, avgDimension));
      evaluation = {
        passed: baseScore >= (module.scoringRubric.passThreshold ?? 0.5),
        polarityDirection: 'neutral' as const,
        driveScores: { agency: baseScore, communion: baseScore, eros: baseScore, agape: baseScore },
        driveSignals: {
          agency: 'HealthyBalanced', communion: 'HealthyBalanced',
          eros: 'HealthyBalanced', agape: 'HealthyBalanced',
        },
        feedback: `Trial scored: accuracy=${(trialResult!.dimensions.accuracy ?? 0.5).toFixed(2)}, response_time=${(trialResult!.dimensions.response_time ?? 0.5).toFixed(2)}, avg=${avgDimension.toFixed(2)}`,
      };
    } else {
      // Fallback: keyword-based evaluation
      evaluation = this.evaluateViaDriveProbes(module, playerResponseText);
    }

    // 4. Detect shadow surfacing from response pattern (with optional forceShadow override)
    const validQuadrants = ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'] as const;
    const forcedQuadrant = this.forceShadow && validQuadrants.includes(this.forceShadow as any)
      ? this.forceShadow as ShadowQuadrant
      : null;
    const shadowSignal = forcedQuadrant
      ? { quadrant: forcedQuadrant, intensity: 0.7 }
      : this.detectShadowFromResponse(playerResponseText, module, currentModality);

    // 5. Build a rich narrative summary from the module context
    const narrativeSummary = this.buildModuleNarrative(module, playerResponseText, evaluation.passed, currentModality, holonName);

    // 6. Check for altitude shift: only when ALL drives HealthyBalanced AND passed
    const altitudeShift = this.computeAltitudeShift(evaluation.driveSignals, module, stage, evaluation.passed);

    const finalResult = this.createAssessmentResult(evaluation.passed, {}, evaluation.driveScores);

    // Build outcome with altitude shift support
    const energeticDirection: EnergeticDirection = evaluation.polarityDirection === 'sto' ? 'Radiative'
      : evaluation.polarityDirection === 'sts' ? 'Absorptive' : 'Diffuse';

    const SIGNAL_MAP: Record<string, DriveDirectionality> = {
      'HealthyBalanced': 'HealthyBalanced',
      'DarkAddicted': 'DarkAddicted',
      'DarkAverted': 'DarkAverted',
      'GoldenAddicted': 'GoldenAddicted',
      'GoldenAverted': 'GoldenAverted',
    };

    const baseDir: DriveDirectionality = evaluation.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality: Record<Drive, DriveDirectionality> = {
      Agency: SIGNAL_MAP[evaluation.driveSignals.agency] ?? baseDir,
      Communion: SIGNAL_MAP[evaluation.driveSignals.communion] ?? baseDir,
      Eros: SIGNAL_MAP[evaluation.driveSignals.eros] ?? baseDir,
      Agape: SIGNAL_MAP[evaluation.driveSignals.agape] ?? baseDir,
    };

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality: driveDirectionality as Record<Drive, DriveDirectionality>,
      stageOrientation: evaluation.polarityDirection === 'sto' ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: evaluation.polarityDirection === 'sto' ? 'HigherRealm'
        : (evaluation.polarityDirection === 'sts' ? 'LowerRealm' : 'Ambivalent'),
      shadowSurfaced: shadowSignal?.quadrant ?? null,
      shadowResolvedId: null,
      narrativeSummary,
    };

    const record = processOutcome(this.encounter, response, now);

    // Override altitudeShift on the record if computed
    const updatedRecord: ConsequenceRecord = {
      ...record,
      altitudeShift: altitudeShift ?? null,
    };

    // Apply consequences — shadow entries will be created if shadowSurfaced is set
    const updated = applyConsequences(this.significator, this.world, updatedRecord, this.encounter);

    // Apply altitude shift if computed
    let finalSig = updated.sig;
    if (altitudeShift) {
      const currentOrd = stageOrdinal(altitudeShift.to);
      const ALL_STAGES: readonly Stage[] = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'];
      if (currentOrd < ALL_STAGES.length - 1) {
        const nextStage = ALL_STAGES[currentOrd + 1]!;
        finalSig = {
          ...finalSig,
          altitudes: { ...finalSig.altitudes, [altitudeShift.line]: nextStage },
        };
        // Update currentStage if all lines are at least at nextStage
        const allAtNext = Object.values(finalSig.altitudes).every(
          a => stageOrdinal(a) >= stageOrdinal(nextStage),
        );
        if (allAtNext) {
          finalSig = { ...finalSig, currentStage: nextStage };
        }
      }
    }

    // PESTLE accumulation
    const PESTLE_DIMS_ARRAY: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];
    const dim = PESTLE_DIMS_ARRAY[Math.floor(Math.random() * PESTLE_DIMS_ARRAY.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );
    const activeEvents = (updated.world as any).activeMacroEvents ?? [];
    const macroEvent = tryTriggerMacroEvent(newTension, activeEvents, finalSig.currentStage, now);
    const newActiveEvents = macroEvent ? [...activeEvents, macroEvent] : activeEvents;
    const updatedWorld = { ...updated.world, pestleTension: newTension, activeMacroEvents: newActiveEvents } as WorldState;

    return {
      updatedSig: finalSig,
      updatedWorld,
      finalResult,
      consequenceRecord: updatedRecord,
      narrativeSummary,
      messages: this.messages,
    };
  }

  /**
   * Select the best assessment task from the module based on encounter modality.
   */
  private selectTaskForModality(module: StageAssessment, modality: Modality): AssessmentTask {
    // Preferred task types for each modality
    const modalityTaskMap: Record<string, readonly TaskType[]> = {
      Deterministic: ['n_back', 'stroop', 'go_no_go', 'hold', 'reaction_time', 'rhythm'],
      LanguageReflective: ['llm_dialogue', 'self_report', 'emotion_identification'],
      ScenarioChoice: ['dilemma', 'scenario'],
      Embodied: ['hold', 'rhythm', 'imitation'],
      Strategic: ['pattern_prediction', 'value_ranking'],
      SocialCooperative: ['cooperation', 'dilemma', 'emotion_identification'],
      ImmersiveRPG: ['scenario', 'llm_dialogue', 'emotion_identification'],
    };

    const preferredTypes = modalityTaskMap[modality] ?? ['n_back', 'scenario'];

    // Find the first task whose type matches a preferred type
    for (const prefType of preferredTypes) {
      const match = module.tasks.find(t => t.type === prefType);
      if (match) return match;
    }

    // Fallback: use the first task from the module
    return module.tasks[0] ?? {
      id: 'fallback-task',
      type: 'scenario',
      description: `A ${module.line} ${module.stage} challenge presents itself.`,
      parameters: {},
      measures: ['accuracy', 'depth'],
    };
  }

  /**
   * Present a module task as a narrative challenge via the UI handler.
   * Translates the assessment task type to CLI-friendly MCQ options.
   */
  private async presentModuleTask(
    module: StageAssessment,
    task: AssessmentTask,
    _modality: Modality,
    holonName: string,
  ): Promise<AskUserQuestionResult> {
    // Use TaskRenderers to get a real assessment prompt with task-specific options
    // and a response evaluator that captures TrialResult data (timing, accuracy)
    const renderer = getRenderer(task);

    // Store the renderer's evaluate function so runModuleAssessment can use it
    this._currentRendererEvaluate = renderer.evaluate;
    this._currentTaskStartTime = Date.now();

    // Prepend holon-narrative framing to the question
    // Preserve the task-type header from the renderer (e.g. 'N-Back(2)', 'Dilemma')
    const enrichedPrompt: AskUserQuestionParams = {
      questions: renderer.prompt.questions.map(q => ({
        ...q,
        question: `${holonName} presents a challenge.\n\n${q.question}`,
        header: q.header, // Keep the renderer's meaningful header
      })),
    };

    return this.uiHandler.askUser(enrichedPrompt);
  }

  /**
   * Evaluate the player's response using the module's drive probes.
   * Determines which drive was selected by option label keywords and scores accordingly.
   */
  private evaluateViaDriveProbes(
    module: StageAssessment,
    responseText: string,
  ): {
    passed: boolean;
    polarityDirection: 'sto' | 'sts' | 'neutral';
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    feedback: string;
  } {
    const lower = responseText.toLowerCase();

    // Determine which drive the player expressed based on option label keywords
    // The options presented are: 'act with agency', 'seek connection', 'reach higher', 'return to foundation'
    const selectedDrive: 'agency' | 'communion' | 'eros' | 'agape' | null =
      lower.includes('agency') ? 'agency' :
      lower.includes('connection') ? 'communion' :
      lower.includes('higher') ? 'eros' :
      lower.includes('foundation') ? 'agape' :
      null;

    // Score drives: the selected drive gets 0.8 (healthy), others get 0.5 (neutral baseline)
    // Unless the response contains shadow keywords
    const hasShadowAddiction = lower.includes('attack') || lower.includes('dominate') || lower.includes('crush') || lower.includes('enslave') || lower.includes('destroy');
    const hasShadowAversion = lower.includes('refuse') || lower.includes('cannot') || lower.includes('withdraw') || lower.includes('resist') || lower.includes('flee');
    const hasGoldenAddiction = lower.includes('transcend') || lower.includes('bypass') || lower.includes('enlighten') || lower.includes('skip');
    const hasGoldenAllergy = lower.includes('stay') || lower.includes('safe') || lower.includes('comfortable') || lower.includes('never change');

    function scoreDrive(drive: 'agency' | 'communion' | 'eros' | 'agape'): { signal: string; score: number } {
      if (selectedDrive === drive) {
        // The selected drive: check for shadow signals
        if (hasShadowAddiction && (drive === 'agency' || drive === 'eros')) {
          return { signal: 'DarkAddicted', score: 0.3 };
        }
        if (hasShadowAversion && (drive === 'communion' || drive === 'agape')) {
          return { signal: 'DarkAverted', score: 0.3 };
        }
        if (hasGoldenAddiction && drive === 'eros') {
          return { signal: 'GoldenAddicted', score: 0.3 };
        }
        if (hasGoldenAllergy && drive === 'agape') {
          return { signal: 'GoldenAverted', score: 0.3 };
        }
        return { signal: 'HealthyBalanced', score: 0.8 };
      }
      // Non-selected drives: baseline neutral
      // BUT: if selectedDrive is null (write-in that doesn't match any option label),
      // AND the text contains shadow keywords, apply shadow signal to prevent false altitude shifts
      if (selectedDrive === null) {
        if (hasShadowAddiction && (drive === 'agency' || drive === 'eros')) {
          return { signal: 'DarkAddicted', score: 0.3 };
        }
        if (hasShadowAversion && (drive === 'communion' || drive === 'agape')) {
          return { signal: 'DarkAverted', score: 0.3 };
        }
        if (hasGoldenAddiction && drive === 'eros') {
          return { signal: 'GoldenAddicted', score: 0.3 };
        }
        if (hasGoldenAllergy && drive === 'agape') {
          return { signal: 'GoldenAverted', score: 0.3 };
        }
      }
      return { signal: 'HealthyBalanced', score: 0.5 };
    }

    const agencyResult = scoreDrive('agency');
    const communionResult = scoreDrive('communion');
    const erosResult = scoreDrive('eros');
    const agapeResult = scoreDrive('agape');

    const agencyScore = agencyResult.score;
    const communionScore = communionResult.score;
    const erosScore = erosResult.score;
    const agapeScore = agapeResult.score;

    // STS: agency+eros dominate communion+agape
    // STO: communion+agape dominate
    // Neutral: balanced
    const selfDominant = agencyScore + erosScore;
    const otherDominant = communionScore + agapeScore;
    let polarityDirection: 'sto' | 'sts' | 'neutral';
    if (selfDominant > otherDominant + 0.3) polarityDirection = 'sts';
    else if (otherDominant > selfDominant + 0.3) polarityDirection = 'sto';
    else polarityDirection = 'neutral';

    // Determine pass/fail from rubric threshold
    // If write-in is present, boost scores based on semantic depth heuristics
    const wordCount = lower.split(/\s+/).filter(w => w.length > 0).length;
    const uniqueWords = new Set(lower.split(/\s+/).filter(w => w.length > 0)).size;
    const conceptDensity = wordCount > 0 ? uniqueWords / wordCount : 0;

    // Compute semantic depth bonus from write-in quality
    // Length bonus: responses >20 words get depth bonus
    const lengthBonus = wordCount > 20 ? Math.min(0.15, wordCount * 0.003) : 0;
    // Concept density bonus: >60% unique words indicates conceptual richness
    const densityBonus = conceptDensity > 0.6 ? 0.1 : (conceptDensity > 0.4 ? 0.05 : 0);
    // Shadow awareness bonus: acknowledging shadow patterns indicates integration
    const shadowAware = lower.includes('shadow') || lower.includes('pattern') || lower.includes('growth') || lower.includes('heal');
    const awarenessBonus = shadowAware ? 0.1 : 0;
    const semanticBonus = lengthBonus + densityBonus + awarenessBonus;

    // Apply semantic bonus to all scores (caps at 1.0)
    const adjustedAgencyScore = Math.min(1.0, agencyScore + (selectedDrive === 'agency' ? semanticBonus : 0));
    const adjustedCommunionScore = Math.min(1.0, communionScore + (selectedDrive === 'communion' ? semanticBonus : 0));
    const adjustedErosScore = Math.min(1.0, erosScore + (selectedDrive === 'eros' ? semanticBonus : 0));
    const adjustedAgapeScore = Math.min(1.0, agapeScore + (selectedDrive === 'agape' ? semanticBonus : 0));

    const avgScore = (adjustedAgencyScore + adjustedCommunionScore + adjustedErosScore + adjustedAgapeScore) / 4;
    const passThreshold = module.scoringRubric.passThreshold ?? 0.5;
    const passed = avgScore >= passThreshold;

    // Build feedback with depth-adjusted scores
    const depthNote = semanticBonus > 0
      ? ` (${wordCount} words, ${(conceptDensity * 100).toFixed(0)}% unique, +${(semanticBonus * 100).toFixed(0)}% depth)`
      : '';
    const feedback = passed
      ? `Your response demonstrated balanced engagement with the ${module.line} ${module.stage} challenge. Agency: ${(adjustedAgencyScore * 100).toFixed(0)}%, Communion: ${(adjustedCommunionScore * 100).toFixed(0)}%, Eros: ${(adjustedErosScore * 100).toFixed(0)}%, Agape: ${(adjustedAgapeScore * 100).toFixed(0)}%.${depthNote}`
      : `The challenge revealed areas for growth. Your ${module.line} ${module.stage} response showed room for deeper integration.`;

    return {
      passed,
      polarityDirection,
      driveScores: { agency: adjustedAgencyScore, communion: adjustedCommunionScore, eros: adjustedErosScore, agape: adjustedAgapeScore },
      driveSignals: {
        agency: agencyResult.signal,
        communion: communionResult.signal,
        eros: erosResult.signal,
        agape: agapeResult.signal,
      },
      feedback,
    };
  }

  /**
   * Detect shadow surfacing from response patterns.
   * Uses keyword heuristics aligned with the 4-quadrant shadow model.
   */
  private detectShadowFromResponse(
    responseText: string,
    _module: StageAssessment,
    _modality: Modality,
  ): { quadrant: ShadowQuadrant; intensity: number } | null {
    const lower = responseText.toLowerCase().trim();

    // Dark-Addiction: Clings to lower-stage expression
    if (lower.includes('attack') || lower.includes('dominate') || lower.includes('crush') ||
        lower.includes('enslave') || lower.includes('destroy')) {
      return { quadrant: 'DarkAddiction' as ShadowQuadrant, intensity: Math.min(1, 0.4 + Math.random() * 0.3) };
    }

    // Dark-Allergy: Rejects/avoids lower-stage expression
    if (lower.includes('withdraw') || lower.includes('resist') || lower.includes('refuse') ||
        lower.includes('decline') || lower.includes('flee')) {
      return { quadrant: 'DarkAllergy' as ShadowQuadrant, intensity: Math.min(1, 0.3 + Math.random() * 0.2) };
    }

    // Golden-Addiction: Bypasses toward higher without integration
    if (lower.includes('bypass') || lower.includes('transcend') || lower.includes('skip') ||
        lower.includes('enlighten') || (lower.includes('higher') && lower.includes('ignore'))) {
      return { quadrant: 'GoldenAddiction' as ShadowQuadrant, intensity: Math.min(1, 0.5 + Math.random() * 0.3) };
    }

    // Golden-Allergy: Refuses the call to grow
    if (lower.includes('stay') || lower.includes('safe') || lower.includes('comfortable') ||
        lower.includes('static') || lower.includes('never change')) {
      return { quadrant: 'GoldenAllergy' as ShadowQuadrant, intensity: Math.min(1, 0.3 + Math.random() * 0.3) };
    }

    return null;
  }

  /**
   * Compute an altitude shift signal when the player demonstrates consistent
   * HealthyBalanced drive patterns across ALL 4 drives (selected drive must score
   * healthy, not shadow).
   * Returns a ConsequenceRecord-compatible object or null if no shift is warranted.
   */
  private computeAltitudeShift(
    driveSignals: { agency: string; communion: string; eros: string; agape: string },
    module: StageAssessment,
    currentEncounterStage: Stage,
    passed: boolean,
  ): { line: Line; from: Stage; to: Stage } | null {
    // ALL 4 drives must be HealthyBalanced for an altitude shift
    // (non-selected drives get 0.5/HealthyBalanced by default, but if shadow
    //  was expressed, the selected drive will be non-HealthyBalanced)
    // AND the encounter must have passed the module's passThreshold
    if (!passed) return null;

    const allHealthy = [
      driveSignals.agency,
      driveSignals.communion,
      driveSignals.eros,
      driveSignals.agape,
    ].every(s => s === 'HealthyBalanced');

    if (allHealthy) {
      return { line: module.line, from: currentEncounterStage, to: currentEncounterStage };
    }

    return null;
  }

  /**
   * Build a rich narrative summary from the module context and player choice.
   */
  private buildModuleNarrative(
    module: StageAssessment,
    responseText: string,
    passed: boolean,
    modality: Modality,
    holonName: string,
  ): string {
    const outcome = passed ? 'navigated successfully' : 'faced difficulty with';
    const modalityDesc: Record<string, string> = {
      Deterministic: 'a focused mental trial',
      LanguageReflective: 'a moment of deep reflection',
      ScenarioChoice: 'a moral crossroads',
      Embodied: 'a somatic awareness exercise',
      Strategic: 'a tactical assessment',
      SocialCooperative: 'a relational challenge',
      ImmersiveRPG: 'a narrative encounter',
    };

    return `${holonName} guided you through ${modalityDesc[modality] ?? 'an assessment'} at the ${module.stage} stage of ${module.line} development. You ${outcome} the challenge of ${module.tasks[0]?.description ?? 'developmental growth'}. Your response: "${responseText.slice(0, 100)}". The ${module.line} ${module.stage} module registers your engagement.`;
  }

  private evaluateFallbackResponse(selectedLabel: string): {
    passed: boolean;
    polarityDirection: 'sto' | 'sts' | 'neutral';
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    feedback: string;
  } {
    const lower = selectedLabel.toLowerCase();
    
    // Check passed first (false if contains withdraw, resist, decline, sit with it)
    const passed = !['withdraw', 'resist', 'decline', 'sit with it'].some(kw => lower.includes(kw));

    const defaultSignals = {
      agency: 'HealthyBalanced',
      communion: 'HealthyBalanced',
      eros: 'HealthyBalanced',
      agape: 'HealthyBalanced'
    };

    // 1. STS mapping
    const stsKeywords = ['attack', 'betray', 'raid', 'dominate', 'strike', 'profit', 'sell', 'enforce', 'deceive', 'obey'];
    if (stsKeywords.some(kw => lower.includes(kw))) {
      const isAverted = ['betray', 'raid', 'deceive'].some(kw => lower.includes(kw));
      return {
        passed,
        polarityDirection: 'sts',
        driveScores: { agency: 0.8, communion: 0.3, eros: 0.8, agape: 0.3 },
        driveSignals: {
          ...defaultSignals,
          ...(isAverted ? { communion: 'DarkAverted', agape: 'DarkAverted' } : {})
        },
        feedback: isAverted
          ? 'Your response prioritized self-protection and tactical advantage, showing highly active Agency but potential shadow aversion toward Communion.'
          : 'Your response prioritized self-interest, power, or direct force, favoring Agency/Eros over Communion/Agape.'
      };
    }

    // 2. STO mapping
    const stoKeywords = ['alliance', 'negotiate', 'trust', 'share', 'mercy', 'compassion', 'reflect deeply', 'refuse', 'reform', 'breathe'];
    if (stoKeywords.some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'sto',
        driveScores: { agency: 0.5, communion: 0.8, eros: 0.5, agape: 0.8 },
        driveSignals: defaultSignals,
        feedback: 'Your response prioritized cooperation, empathy, and collective service, showing strong Communion and Agape alignment.'
      };
    }

    // 3. Neutral / Withdrawal mapping
    // case 3.1: withdraw / resist / sit with it / decline
    if (['withdraw', 'resist', 'sit with it', 'decline'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.4, communion: 0.5, eros: 0.3, agape: 0.5 },
        driveSignals: {
          ...defaultSignals,
          eros: 'DarkAverted'
        },
        feedback: 'Your choice to withdraw or resist shows a homeostatic focus, maintaining the boundary but delaying growth.'
      };
    }

    // case 3.2: verify / fortify / stay / hybrid / observe
    if (['verify', 'fortify', 'stay', 'hybrid', 'observe'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.6, communion: 0.6, eros: 0.4, agape: 0.5 },
        driveSignals: defaultSignals,
        feedback: 'Your response showed a balanced, cautious approach, securing current foundations before acting.'
      };
    }

    // case 3.3: respond instinctively / challenge / press forward / engage
    if (['respond instinctively', 'challenge', 'press forward', 'engage'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.7, communion: 0.4, eros: 0.7, agape: 0.4 },
        driveSignals: defaultSignals,
        feedback: 'Your response was active and assertive, pushing forward with strong Eros and Agency.'
      };
    }

    // Default
    return {
      passed,
      polarityDirection: 'neutral',
      driveScores: { agency: 0.6, communion: 0.6, eros: 0.6, agape: 0.6 },
      driveSignals: defaultSignals,
      feedback: 'Completed the challenge via fallback choices.'
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
